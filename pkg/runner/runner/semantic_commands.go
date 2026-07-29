package runner

import (
	"context"
	"crypto/sha256"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"io/fs"
	"os"
	"path/filepath"
	"regexp"
	"runtime"
	"sort"
	"strconv"
	"strings"
	"time"
	"unicode/utf8"

	"github.com/agent-flow/runner/runner/sandbox"
	"github.com/agent-flow/runner/runner/types"
)

var errStopWalk = errors.New("stop walk")

type shellExecInput struct {
	Command    string            `json:"command"`
	Args       []string          `json:"args"`
	WorkingDir string            `json:"workingDir"`
	TimeoutMs  int64             `json:"timeoutMs"`
	Env        map[string]string `json:"env"`
}

type fsReadInput struct {
	Path         string `json:"path"`
	Encoding     string `json:"encoding"`
	MaxBytes     int64  `json:"maxBytes"`
	AllowMissing bool   `json:"allowMissing"`
	ByteOffset   int64  `json:"byteOffset"`
	ByteLength   int64  `json:"byteLength"`
	StartLine    int    `json:"startLine"`
	EndLine      int    `json:"endLine"`
}

type fsStatInput struct {
	Path string `json:"path"`
}

type fsApplyPatchInput struct {
	Path            string  `json:"path"`
	Patch           string  `json:"patch"`
	ExpectedSHA256  string  `json:"expectedSha256"`
	ExpectedContent *string `json:"expectedContent"`
}

type fsGlobInput struct {
	Path       string `json:"path"`
	Pattern    string `json:"pattern"`
	MaxEntries int    `json:"maxEntries"`
}

type fsWriteInput struct {
	Path     string `json:"path"`
	Content  string `json:"content"`
	Encoding string `json:"encoding"`
}

type fsPatchInput struct {
	Path       string `json:"path"`
	Search     string `json:"search"`
	Replace    string `json:"replace"`
	ReplaceAll bool   `json:"replaceAll"`
}

type fsMultiPatchInput struct {
	Path  string        `json:"path"`
	Edits []fsPatchEdit `json:"edits"`
}

type fsPatchEdit struct {
	Search     string `json:"search"`
	Replace    string `json:"replace"`
	ReplaceAll bool   `json:"replaceAll"`
}

type fsListInput struct {
	Path          string `json:"path"`
	Recursive     bool   `json:"recursive"`
	MaxEntries    int    `json:"maxEntries"`
	IncludeHidden bool   `json:"includeHidden"`
}

type fsSearchInput struct {
	Path          string `json:"path"`
	Pattern       string `json:"pattern"`
	Recursive     bool   `json:"recursive"`
	MaxMatches    int    `json:"maxMatches"`
	IncludeHidden bool   `json:"includeHidden"`
}

func (r *ControllerImpl) runSemanticCommand(ctx context.Context, req types.TaskRequest, sink types.EventSink) (bool, error) {
	switch strings.TrimSpace(req.Command) {
	case "shell.exec":
		return true, r.runShellExec(ctx, req, sink)
	case "fs.roots", "fs.read", "fs.stat", "fs.write", "fs.patch", "fs.multiPatch", "fs.applyPatch", "fs.list", "fs.glob", "fs.search":
		return true, r.runSemanticFS(ctx, req, sink)
	case "git.status", "git.diff", "git.show", "git.apply":
		return true, r.runGitCommand(ctx, req, sink)
	default:
		return false, nil
	}
}

func (r *ControllerImpl) runShellExec(ctx context.Context, req types.TaskRequest, sink types.EventSink) error {
	var input shellExecInput
	_ = decodeInput(req.InputJSON, &input)

	shellReq := req
	shellReq.Command = strings.TrimSpace(input.Command)
	shellReq.Args = append([]string{}, input.Args...)
	if shellReq.Command == "" && len(req.Args) > 0 {
		shellReq.Command = strings.TrimSpace(req.Args[0])
		shellReq.Args = append([]string{}, req.Args[1:]...)
	}
	if shellReq.Command == "" {
		return fmt.Errorf("shell.exec requires input.command or args[0]")
	}

	if strings.TrimSpace(input.WorkingDir) != "" {
		shellReq.WorkingDir = strings.TrimSpace(input.WorkingDir)
	}
	if input.TimeoutMs > 0 {
		shellReq.Timeout = time.Duration(input.TimeoutMs) * time.Millisecond
	}
	shellReq.Env = mergeStringMap(req.Env, input.Env)

	executor, err := r.pickExecutor(shellReq)
	if err != nil {
		return err
	}
	if shellReq.Sandbox.Enabled {
		executor = r.guard.Wrap(executor, shellReq.Sandbox)
	}
	_, runErr := executor.Run(ctx, shellReq, sink)
	return runErr
}

func (r *ControllerImpl) runSemanticFS(_ context.Context, req types.TaskRequest, sink types.EventSink) error {
	if req.Sandbox.Enabled {
		if err := r.guard.Validate(req, req.Sandbox); err != nil {
			return err
		}
		if req.Sandbox.ReadOnly && (req.Command == "fs.write" || req.Command == "fs.patch" || req.Command == "fs.multiPatch" || req.Command == "fs.applyPatch") {
			return fmt.Errorf("%s is not allowed in read-only sandbox", req.Command)
		}
	}

	start := time.Now()
	if err := sink.Emit(types.TaskEvent{
		TaskID:    req.TaskID,
		SessionID: req.SessionID,
		StepID:    req.StepID,
		Type:      types.EventStarted,
		Timestamp: time.Now(),
		Message:   "semantic command started",
	}); err != nil {
		return err
	}

	if err := sink.Emit(types.TaskEvent{
		TaskID:    req.TaskID,
		SessionID: req.SessionID,
		StepID:    req.StepID,
		Type:      types.EventProgress,
		Timestamp: time.Now(),
		Message:   "semantic command running",
		Percent:   30,
	}); err != nil {
		return err
	}

	payload, err := runFSOp(req)
	if err != nil {
		return err
	}
	raw, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	if err := sink.Emit(types.TaskEvent{
		TaskID:    req.TaskID,
		SessionID: req.SessionID,
		StepID:    req.StepID,
		Type:      types.EventResult,
		Timestamp: time.Now(),
		ExitCode:  0,
		Output:    raw,
	}); err != nil {
		return err
	}

	return sink.Emit(types.TaskEvent{
		TaskID:    req.TaskID,
		SessionID: req.SessionID,
		StepID:    req.StepID,
		Type:      types.EventCompleted,
		Timestamp: time.Now(),
		ExitCode:  0,
		Duration:  time.Since(start),
	})
}

func runFSOp(req types.TaskRequest) (map[string]any, error) {
	switch req.Command {
	case "fs.read":
		return fsRead(req)
	case "fs.stat":
		return fsStat(req)
	case "fs.roots":
		return fsRoots()
	case "fs.write":
		return fsWrite(req)
	case "fs.patch":
		return fsPatch(req)
	case "fs.multiPatch":
		return fsMultiPatch(req)
	case "fs.applyPatch":
		return fsApplyPatch(req)
	case "fs.list":
		return fsList(req)
	case "fs.glob":
		return fsGlob(req)
	case "fs.search":
		return fsSearch(req)
	default:
		return nil, fmt.Errorf("unsupported semantic fs command: %s", req.Command)
	}
}

func fsRoots() (map[string]any, error) {
	roots := make([]map[string]any, 0)
	seen := map[string]bool{}
	appendRoot := func(path string) {
		path = filepath.Clean(strings.TrimSpace(path))
		if path == "" || seen[path] {
			return
		}
		info, err := os.Stat(path)
		if err != nil || !info.IsDir() {
			return
		}
		seen[path] = true
		roots = append(roots, map[string]any{
			"path": path,
			"name": rootDisplayName(path),
			"type": "directory",
		})
	}

	if runtime.GOOS == "windows" {
		for drive := 'A'; drive <= 'Z'; drive++ {
			appendRoot(fmt.Sprintf("%c:\\", drive))
		}
	} else {
		appendRoot("/")
		if home, err := os.UserHomeDir(); err == nil {
			appendRoot(home)
			appendRoot(filepath.Join(home, "workspace"))
			appendRoot(filepath.Join(home, "work"))
			appendRoot(filepath.Join(home, "projects"))
		}
		if cwd, err := os.Getwd(); err == nil {
			appendRoot(cwd)
		}
	}

	sort.Slice(roots, func(i, j int) bool {
		return fmt.Sprint(roots[i]["path"]) < fmt.Sprint(roots[j]["path"])
	})

	return map[string]any{
		"roots": roots,
	}, nil
}

func fsRead(req types.TaskRequest) (map[string]any, error) {
	var input fsReadInput
	_ = decodeInput(req.InputJSON, &input)
	path := coalescePath(input.Path, req.Args)
	if path == "" {
		return nil, fmt.Errorf("fs.read requires path")
	}
	if input.Encoding != "" && !strings.EqualFold(input.Encoding, "utf8") {
		return nil, fmt.Errorf("fs.read only supports utf8 encoding")
	}

	absPath, err := resolveReadScopedPath(req, path)
	if err != nil {
		return nil, err
	}
	file, err := os.Open(absPath)
	if err != nil {
		if input.AllowMissing && errors.Is(err, os.ErrNotExist) {
			return map[string]any{
				"path":    absPath,
				"size":    0,
				"content": "",
				"missing": true,
			}, nil
		}
		return nil, err
	}
	defer file.Close()
	info, err := file.Stat()
	if err != nil {
		return nil, err
	}
	maxBytes := input.MaxBytes
	if maxBytes <= 0 {
		maxBytes = 10 * 1024 * 1024
	}
	offset := input.ByteOffset
	if offset < 0 || offset > info.Size() {
		return nil, fmt.Errorf("byteOffset %d is outside file size %d", offset, info.Size())
	}
	readLength := input.ByteLength
	if readLength <= 0 {
		readLength = info.Size() - offset
	}
	if readLength > maxBytes {
		return nil, fmt.Errorf("requested range exceeds maxBytes (%d > %d)", readLength, maxBytes)
	}
	if _, err := file.Seek(offset, io.SeekStart); err != nil {
		return nil, err
	}
	raw, err := io.ReadAll(io.LimitReader(file, readLength))
	if err != nil {
		return nil, err
	}
	if looksBinary(raw) {
		return nil, fmt.Errorf("fs.read refuses binary content; use an artifact channel for %s", absPath)
	}
	content := string(raw)
	if input.StartLine > 0 || input.EndLine > 0 {
		content, err = selectLineRange(content, input.StartLine, input.EndLine)
		if err != nil {
			return nil, err
		}
	}
	return map[string]any{
		"path":       absPath,
		"size":       info.Size(),
		"content":    content,
		"byteOffset": offset,
		"bytesRead":  len(raw),
	}, nil
}

func fsStat(req types.TaskRequest) (map[string]any, error) {
	var input fsStatInput
	_ = decodeInput(req.InputJSON, &input)
	path := coalescePath(input.Path, req.Args)
	if path == "" {
		return nil, fmt.Errorf("fs.stat requires path")
	}
	absPath, err := resolveReadScopedPath(req, path)
	if err != nil {
		return nil, err
	}
	info, err := os.Stat(absPath)
	if err != nil {
		return nil, err
	}
	result := map[string]any{
		"path": absPath, "name": info.Name(), "type": typeLabel(info), "size": info.Size(),
		"mode": info.Mode().String(), "modifiedAt": info.ModTime().UTC().Format(time.RFC3339Nano),
	}
	if !info.IsDir() && info.Size() <= 10*1024*1024 {
		raw, readErr := os.ReadFile(absPath)
		if readErr == nil {
			hash := sha256.Sum256(raw)
			result["sha256"] = fmt.Sprintf("%x", hash)
			result["binary"] = looksBinary(raw)
		}
	}
	return result, nil
}

func fsWrite(req types.TaskRequest) (map[string]any, error) {
	var input fsWriteInput
	_ = decodeInput(req.InputJSON, &input)
	path := coalescePath(input.Path, req.Args)
	if path == "" {
		return nil, fmt.Errorf("fs.write requires path")
	}
	if input.Encoding != "" && !strings.EqualFold(input.Encoding, "utf8") {
		return nil, fmt.Errorf("fs.write only supports utf8 encoding")
	}

	absPath, err := resolveWriteScopedPath(req, path)
	if err != nil {
		return nil, err
	}
	if err := os.MkdirAll(filepath.Dir(absPath), 0o755); err != nil {
		return nil, err
	}
	if err := atomicWriteFile(absPath, []byte(input.Content), 0o644); err != nil {
		return nil, err
	}
	return map[string]any{
		"path":         absPath,
		"writtenBytes": len(input.Content),
	}, nil
}

func fsPatch(req types.TaskRequest) (map[string]any, error) {
	var input fsPatchInput
	_ = decodeInput(req.InputJSON, &input)
	path := coalescePath(input.Path, req.Args)
	if path == "" {
		return nil, fmt.Errorf("fs.patch requires path")
	}
	if strings.TrimSpace(input.Search) == "" {
		return nil, fmt.Errorf("fs.patch requires non-empty search")
	}

	absPath, err := resolveWriteScopedPath(req, path)
	if err != nil {
		return nil, err
	}
	original, err := os.ReadFile(absPath)
	if err != nil {
		return nil, err
	}
	text := string(original)
	replacedCount := strings.Count(text, input.Search)
	if replacedCount == 0 {
		return nil, fmt.Errorf("fs.patch found no matches")
	}

	limit := 1
	if input.ReplaceAll {
		limit = -1
	}
	updated := strings.Replace(text, input.Search, input.Replace, limit)
	if err := atomicWriteFile(absPath, []byte(updated), fileMode(original, absPath)); err != nil {
		return nil, err
	}

	effectiveReplaced := 1
	if input.ReplaceAll {
		effectiveReplaced = replacedCount
	}
	return map[string]any{
		"path":         absPath,
		"replaced":     effectiveReplaced,
		"previousSize": len(original),
		"newSize":      len(updated),
	}, nil
}

func fsMultiPatch(req types.TaskRequest) (map[string]any, error) {
	var input fsMultiPatchInput
	_ = decodeInput(req.InputJSON, &input)
	path := coalescePath(input.Path, req.Args)
	if path == "" {
		return nil, fmt.Errorf("fs.multiPatch requires path")
	}
	if len(input.Edits) == 0 {
		return nil, fmt.Errorf("fs.multiPatch requires at least one edit")
	}

	absPath, err := resolveWriteScopedPath(req, path)
	if err != nil {
		return nil, err
	}
	original, err := os.ReadFile(absPath)
	if err != nil {
		return nil, err
	}

	text := string(original)
	totalReplaced := 0
	for idx, edit := range input.Edits {
		if strings.TrimSpace(edit.Search) == "" {
			return nil, fmt.Errorf("fs.multiPatch edit %d requires non-empty search", idx)
		}
		replacedCount := strings.Count(text, edit.Search)
		if replacedCount == 0 {
			return nil, fmt.Errorf("fs.multiPatch edit %d found no matches", idx)
		}
		limit := 1
		if edit.ReplaceAll {
			limit = -1
			totalReplaced += replacedCount
		} else {
			totalReplaced++
		}
		text = strings.Replace(text, edit.Search, edit.Replace, limit)
	}

	if err := atomicWriteFile(absPath, []byte(text), fileMode(original, absPath)); err != nil {
		return nil, err
	}
	return map[string]any{
		"path":         absPath,
		"edits":        len(input.Edits),
		"replaced":     totalReplaced,
		"previousSize": len(original),
		"newSize":      len(text),
	}, nil
}

func fsApplyPatch(req types.TaskRequest) (map[string]any, error) {
	var input fsApplyPatchInput
	if err := decodeInput(req.InputJSON, &input); err != nil {
		return nil, err
	}
	if strings.TrimSpace(input.Path) == "" || strings.TrimSpace(input.Patch) == "" {
		return nil, fmt.Errorf("fs.applyPatch requires path and patch")
	}
	absPath, err := resolveWriteScopedPath(req, input.Path)
	if err != nil {
		return nil, err
	}
	original, err := os.ReadFile(absPath)
	if err != nil {
		return nil, err
	}
	if input.ExpectedContent != nil && string(original) != *input.ExpectedContent {
		return nil, fmt.Errorf("fs.applyPatch expectedContent precondition failed")
	}
	hash := sha256.Sum256(original)
	actualHash := fmt.Sprintf("%x", hash)
	if expected := strings.ToLower(strings.TrimSpace(input.ExpectedSHA256)); expected != "" && expected != actualHash {
		return nil, fmt.Errorf("fs.applyPatch sha256 precondition failed: expected %s, got %s", expected, actualHash)
	}
	updated, hunkCount, err := applyUnifiedPatch(string(original), input.Patch)
	if err != nil {
		return nil, err
	}
	if err := atomicWriteFile(absPath, []byte(updated), fileMode(original, absPath)); err != nil {
		return nil, err
	}
	newHash := sha256.Sum256([]byte(updated))
	return map[string]any{
		"path": absPath, "hunksApplied": hunkCount, "previousSha256": actualHash,
		"sha256": fmt.Sprintf("%x", newHash), "previousSize": len(original), "newSize": len(updated),
	}, nil
}

func fsGlob(req types.TaskRequest) (map[string]any, error) {
	var input fsGlobInput
	_ = decodeInput(req.InputJSON, &input)
	if strings.TrimSpace(input.Pattern) == "" {
		return nil, fmt.Errorf("fs.glob requires pattern")
	}
	root := input.Path
	if strings.TrimSpace(root) == "" {
		root = "."
	}
	absRoot, err := resolveReadScopedPath(req, root)
	if err != nil {
		return nil, err
	}
	limit := input.MaxEntries
	if limit <= 0 {
		limit = 500
	}
	matches := make([]string, 0)
	err = filepath.WalkDir(absRoot, func(path string, entry fs.DirEntry, walkErr error) error {
		if walkErr != nil {
			return walkErr
		}
		if entry.IsDir() && (entry.Name() == ".git" || entry.Name() == "node_modules") {
			return filepath.SkipDir
		}
		if entry.IsDir() {
			return nil
		}
		relative, relErr := filepath.Rel(absRoot, path)
		if relErr != nil {
			return relErr
		}
		matched, matchErr := filepath.Match(input.Pattern, filepath.ToSlash(relative))
		if matchErr != nil {
			return matchErr
		}
		if matched {
			matches = append(matches, path)
		}
		if len(matches) >= limit {
			return errStopWalk
		}
		return nil
	})
	if err != nil && err != errStopWalk {
		return nil, err
	}
	return map[string]any{"path": absRoot, "pattern": input.Pattern, "matches": matches, "total": len(matches)}, nil
}

func fsList(req types.TaskRequest) (map[string]any, error) {
	var input fsListInput
	_ = decodeInput(req.InputJSON, &input)
	path := input.Path
	if strings.TrimSpace(path) == "" {
		path = "."
	}
	maxEntries := input.MaxEntries
	if maxEntries <= 0 {
		maxEntries = 200
	}

	absPath, err := resolveReadScopedPath(req, path)
	if err != nil {
		return nil, err
	}

	entries := make([]map[string]any, 0, maxEntries)
	appendEntry := func(filePath string, info fs.FileInfo) {
		entries = append(entries, map[string]any{
			"path": filePath,
			"name": info.Name(),
			"type": typeLabel(info),
			"size": info.Size(),
		})
	}

	if input.Recursive {
		err = filepath.WalkDir(absPath, func(path string, d fs.DirEntry, walkErr error) error {
			if walkErr != nil {
				return walkErr
			}
			if path == absPath {
				return nil
			}
			name := d.Name()
			if !input.IncludeHidden && isHidden(name) {
				if d.IsDir() {
					return filepath.SkipDir
				}
				return nil
			}
			info, infoErr := d.Info()
			if infoErr != nil {
				return infoErr
			}
			appendEntry(path, info)
			if len(entries) >= maxEntries {
				return errStopWalk
			}
			return nil
		})
		if err != nil && err != errStopWalk {
			return nil, err
		}
	} else {
		dirEntries, readErr := os.ReadDir(absPath)
		if readErr != nil {
			return nil, readErr
		}
		for _, entry := range dirEntries {
			name := entry.Name()
			if !input.IncludeHidden && isHidden(name) {
				continue
			}
			info, infoErr := entry.Info()
			if infoErr != nil {
				return nil, infoErr
			}
			appendEntry(filepath.Join(absPath, name), info)
			if len(entries) >= maxEntries {
				break
			}
		}
	}

	sort.Slice(entries, func(i, j int) bool {
		return fmt.Sprint(entries[i]["path"]) < fmt.Sprint(entries[j]["path"])
	})

	return map[string]any{
		"path":    absPath,
		"entries": entries,
		"total":   len(entries),
	}, nil
}

func fsSearch(req types.TaskRequest) (map[string]any, error) {
	var input fsSearchInput
	_ = decodeInput(req.InputJSON, &input)
	path := input.Path
	if strings.TrimSpace(path) == "" {
		path = "."
	}
	pattern := strings.TrimSpace(input.Pattern)
	if pattern == "" {
		return nil, fmt.Errorf("fs.search requires pattern")
	}
	maxMatches := input.MaxMatches
	if maxMatches <= 0 {
		maxMatches = 100
	}

	absPath, err := resolveReadScopedPath(req, path)
	if err != nil {
		return nil, err
	}

	regex, regexErr := regexp.Compile(pattern)
	useRegex := regexErr == nil
	matches := make([]map[string]any, 0, maxMatches)

	walkErr := filepath.WalkDir(absPath, func(path string, d fs.DirEntry, err error) error {
		if err != nil {
			return err
		}
		name := d.Name()
		if !input.IncludeHidden && isHidden(name) {
			if d.IsDir() {
				return filepath.SkipDir
			}
			return nil
		}
		if d.IsDir() {
			if !input.Recursive && path != absPath {
				return filepath.SkipDir
			}
			return nil
		}
		raw, readErr := os.ReadFile(path)
		if readErr != nil {
			return nil
		}
		lines := strings.Split(string(raw), "\n")
		for idx, line := range lines {
			matched := false
			if useRegex {
				matched = regex.MatchString(line)
			} else {
				matched = strings.Contains(line, pattern)
			}
			if !matched {
				continue
			}
			matches = append(matches, map[string]any{
				"path":    path,
				"line":    idx + 1,
				"content": line,
			})
			if len(matches) >= maxMatches {
				return errStopWalk
			}
		}
		return nil
	})
	if walkErr != nil && walkErr != errStopWalk {
		return nil, walkErr
	}

	return map[string]any{
		"path":      absPath,
		"pattern":   pattern,
		"usedRegex": useRegex,
		"matches":   matches,
		"total":     len(matches),
	}, nil
}

func decodeInput(raw []byte, out any) error {
	if len(raw) == 0 || out == nil {
		return nil
	}
	return json.Unmarshal(raw, out)
}

func baseDir(req types.TaskRequest) string {
	if strings.TrimSpace(req.WorkingDir) != "" {
		return req.WorkingDir
	}
	wd, err := os.Getwd()
	if err != nil {
		return "."
	}
	return wd
}

func resolveScopedPath(base, candidate string) (string, error) {
	return sandbox.ResolveScopedPath(base, candidate)
}

func resolveReadScopedPath(req types.TaskRequest, candidate string) (string, error) {
	if path, err := resolveScopedPath(baseDir(req), candidate); err == nil {
		return path, nil
	}

	for _, root := range req.Sandbox.AllowedReadPaths {
		if strings.TrimSpace(root) == "" {
			continue
		}
		path, err := resolveScopedPath(root, candidate)
		if err == nil {
			return path, nil
		}
	}

	return resolveScopedPath(baseDir(req), candidate)
}

func resolveWriteScopedPath(req types.TaskRequest, candidate string) (string, error) {
	if len(req.Sandbox.AllowedWritePaths) == 0 {
		return resolveScopedPath(baseDir(req), candidate)
	}

	for _, root := range req.Sandbox.AllowedWritePaths {
		if strings.TrimSpace(root) == "" {
			continue
		}
		path, err := resolveScopedPath(root, candidate)
		if err == nil {
			return path, nil
		}
	}

	return "", fmt.Errorf("path %q is outside writable directories", candidate)
}

func coalescePath(primary string, args []string) string {
	if strings.TrimSpace(primary) != "" {
		return strings.TrimSpace(primary)
	}
	if len(args) == 0 {
		return ""
	}
	return strings.TrimSpace(args[0])
}

func mergeStringMap(base map[string]string, overlay map[string]string) map[string]string {
	if len(base) == 0 && len(overlay) == 0 {
		return map[string]string{}
	}
	out := make(map[string]string, len(base)+len(overlay))
	for key, value := range base {
		out[key] = value
	}
	for key, value := range overlay {
		out[key] = value
	}
	return out
}

func isHidden(name string) bool {
	return strings.HasPrefix(strings.TrimSpace(name), ".")
}

func typeLabel(info fs.FileInfo) string {
	if info.IsDir() {
		return "directory"
	}
	return "file"
}

func rootDisplayName(path string) string {
	clean := filepath.Clean(path)
	if runtime.GOOS == "windows" {
		volume := filepath.VolumeName(clean)
		if volume != "" {
			return volume + "\\"
		}
	}
	if clean == string(filepath.Separator) {
		return clean
	}
	name := filepath.Base(clean)
	if name == "." || name == string(filepath.Separator) {
		return clean
	}
	return name
}

func looksBinary(raw []byte) bool {
	probe := raw
	if len(probe) > 8*1024 {
		probe = probe[:8*1024]
	}
	return bytesContains(probe, 0) || !utf8.Valid(probe)
}

func bytesContains(raw []byte, target byte) bool {
	for _, value := range raw {
		if value == target {
			return true
		}
	}
	return false
}

func selectLineRange(content string, startLine, endLine int) (string, error) {
	if startLine <= 0 {
		startLine = 1
	}
	lines := strings.Split(content, "\n")
	if endLine <= 0 {
		endLine = len(lines)
	}
	if endLine < startLine {
		return "", fmt.Errorf("endLine must be greater than or equal to startLine")
	}
	if startLine > len(lines) {
		return "", fmt.Errorf("startLine %d exceeds line count %d", startLine, len(lines))
	}
	if endLine > len(lines) {
		endLine = len(lines)
	}
	return strings.Join(lines[startLine-1:endLine], "\n"), nil
}

func fileMode(_ []byte, path string) fs.FileMode {
	info, err := os.Stat(path)
	if err != nil {
		return 0o644
	}
	return info.Mode().Perm()
}

func atomicWriteFile(path string, raw []byte, mode fs.FileMode) error {
	directory := filepath.Dir(path)
	temp, err := os.CreateTemp(directory, ".agent-flow-*.tmp")
	if err != nil {
		return err
	}
	tempPath := temp.Name()
	defer os.Remove(tempPath)
	if err = temp.Chmod(mode); err == nil {
		_, err = temp.Write(raw)
	}
	if err == nil {
		err = temp.Sync()
	}
	if closeErr := temp.Close(); err == nil {
		err = closeErr
	}
	if err != nil {
		return err
	}
	return replaceFileAtomic(tempPath, path)
}

var unifiedHunkPattern = regexp.MustCompile(`^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@`)

type unifiedHunk struct {
	oldStart, oldCount int
	newStart, newCount int
	lines              []string
}

func applyUnifiedPatch(original, patch string) (string, int, error) {
	lineEnding := "\n"
	if strings.Contains(original, "\r\n") {
		lineEnding = "\r\n"
	}
	normalizedOriginal := strings.ReplaceAll(original, "\r\n", "\n")
	normalizedPatch := strings.ReplaceAll(patch, "\r\n", "\n")
	hunks, err := parseUnifiedHunks(normalizedPatch)
	if err != nil {
		return "", 0, err
	}
	source := strings.Split(normalizedOriginal, "\n")
	result := make([]string, 0, len(source))
	cursor := 0
	for index, hunk := range hunks {
		target := hunk.oldStart - 1
		if hunk.oldCount == 0 {
			target = hunk.oldStart
		}
		if target < cursor || target > len(source) {
			return "", 0, fmt.Errorf("unified diff hunk %d has invalid old start %d", index+1, hunk.oldStart)
		}
		result = append(result, source[cursor:target]...)
		cursor = target
		oldSeen, newSeen := 0, 0
		for _, line := range hunk.lines {
			if line == `\ No newline at end of file` {
				continue
			}
			if line == "" {
				return "", 0, fmt.Errorf("unified diff hunk %d contains an unprefixed line", index+1)
			}
			switch line[0] {
			case ' ':
				if cursor >= len(source) || source[cursor] != line[1:] {
					return "", 0, fmt.Errorf("unified diff hunk %d context mismatch at source line %d", index+1, cursor+1)
				}
				result = append(result, source[cursor])
				cursor++
				oldSeen++
				newSeen++
			case '-':
				if cursor >= len(source) || source[cursor] != line[1:] {
					return "", 0, fmt.Errorf("unified diff hunk %d removal mismatch at source line %d", index+1, cursor+1)
				}
				cursor++
				oldSeen++
			case '+':
				result = append(result, line[1:])
				newSeen++
			default:
				return "", 0, fmt.Errorf("unified diff hunk %d has invalid prefix %q", index+1, line[0])
			}
		}
		if oldSeen != hunk.oldCount || newSeen != hunk.newCount {
			return "", 0, fmt.Errorf("unified diff hunk %d count mismatch: old %d/%d, new %d/%d", index+1, oldSeen, hunk.oldCount, newSeen, hunk.newCount)
		}
	}
	result = append(result, source[cursor:]...)
	updated := strings.Join(result, "\n")
	if lineEnding == "\r\n" {
		updated = strings.ReplaceAll(updated, "\n", "\r\n")
	}
	return updated, len(hunks), nil
}

func parseUnifiedHunks(patch string) ([]unifiedHunk, error) {
	lines := strings.Split(patch, "\n")
	hunks := make([]unifiedHunk, 0)
	for index := 0; index < len(lines); {
		match := unifiedHunkPattern.FindStringSubmatch(lines[index])
		if match == nil {
			index++
			continue
		}
		hunk := unifiedHunk{
			oldStart: mustAtoi(match[1]), oldCount: optionalCount(match[2]),
			newStart: mustAtoi(match[3]), newCount: optionalCount(match[4]),
		}
		index++
		for index < len(lines) && unifiedHunkPattern.FindStringSubmatch(lines[index]) == nil {
			if strings.HasPrefix(lines[index], "diff --git ") || strings.HasPrefix(lines[index], "--- ") || strings.HasPrefix(lines[index], "+++ ") {
				break
			}
			if index == len(lines)-1 && lines[index] == "" {
				break
			}
			hunk.lines = append(hunk.lines, lines[index])
			index++
		}
		hunks = append(hunks, hunk)
	}
	if len(hunks) == 0 {
		return nil, fmt.Errorf("patch does not contain a unified diff hunk")
	}
	return hunks, nil
}

func optionalCount(value string) int {
	if value == "" {
		return 1
	}
	return mustAtoi(value)
}

func mustAtoi(value string) int {
	parsed, _ := strconv.Atoi(value)
	return parsed
}
