package runner

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io/fs"
	"os"
	"path/filepath"
	"regexp"
	"sort"
	"strings"
	"time"

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
	Path     string `json:"path"`
	Encoding string `json:"encoding"`
	MaxBytes int64  `json:"maxBytes"`
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
	case "fs.read", "fs.write", "fs.patch", "fs.list", "fs.search":
		return true, r.runSemanticFS(ctx, req, sink)
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
		if req.Sandbox.ReadOnly && (req.Command == "fs.write" || req.Command == "fs.patch") {
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
	case "fs.write":
		return fsWrite(req)
	case "fs.patch":
		return fsPatch(req)
	case "fs.list":
		return fsList(req)
	case "fs.search":
		return fsSearch(req)
	default:
		return nil, fmt.Errorf("unsupported semantic fs command: %s", req.Command)
	}
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

	absPath, err := resolveScopedPath(baseDir(req), path)
	if err != nil {
		return nil, err
	}
	raw, err := os.ReadFile(absPath)
	if err != nil {
		return nil, err
	}
	if input.MaxBytes > 0 && int64(len(raw)) > input.MaxBytes {
		return nil, fmt.Errorf("file exceeds maxBytes (%d > %d)", len(raw), input.MaxBytes)
	}
	return map[string]any{
		"path":    absPath,
		"size":    len(raw),
		"content": string(raw),
	}, nil
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

	absPath, err := resolveScopedPath(baseDir(req), path)
	if err != nil {
		return nil, err
	}
	if err := os.MkdirAll(filepath.Dir(absPath), 0o755); err != nil {
		return nil, err
	}
	if err := os.WriteFile(absPath, []byte(input.Content), 0o644); err != nil {
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

	absPath, err := resolveScopedPath(baseDir(req), path)
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
	if err := os.WriteFile(absPath, []byte(updated), 0o644); err != nil {
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

	absPath, err := resolveScopedPath(baseDir(req), path)
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

	absPath, err := resolveScopedPath(baseDir(req), path)
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
	baseAbs, err := filepath.Abs(base)
	if err != nil {
		return "", fmt.Errorf("resolve base path: %w", err)
	}
	baseAbs = filepath.Clean(baseAbs)
	if strings.TrimSpace(candidate) == "" {
		return "", fmt.Errorf("path is required")
	}

	target := candidate
	if !filepath.IsAbs(candidate) {
		target = filepath.Join(baseAbs, candidate)
	}
	targetAbs, err := filepath.Abs(target)
	if err != nil {
		return "", fmt.Errorf("resolve path: %w", err)
	}
	targetAbs = filepath.Clean(targetAbs)

	rel, err := filepath.Rel(baseAbs, targetAbs)
	if err != nil {
		return "", fmt.Errorf("rel path: %w", err)
	}
	if rel == ".." || strings.HasPrefix(rel, ".."+string(filepath.Separator)) {
		return "", fmt.Errorf("path %q is outside working directory", candidate)
	}
	return targetAbs, nil
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
