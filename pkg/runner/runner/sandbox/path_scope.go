package sandbox

import (
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

// ResolveScopedPath resolves links and reparse points in the nearest existing
// ancestor before verifying that candidate remains below base.
func ResolveScopedPath(base, candidate string) (string, error) {
	if strings.TrimSpace(candidate) == "" {
		return "", errors.New("path is required")
	}
	baseResolved, err := resolveExistingPrefix(base)
	if err != nil {
		return "", fmt.Errorf("resolve base path %q: %w", base, err)
	}
	target := candidate
	if !filepath.IsAbs(target) {
		target = filepath.Join(baseResolved, target)
	}
	targetResolved, err := resolveExistingPrefix(target)
	if err != nil {
		return "", fmt.Errorf("resolve target path %q: %w", candidate, err)
	}
	if !pathWithin(baseResolved, targetResolved) {
		return "", fmt.Errorf("path %q resolves outside scoped directory", candidate)
	}
	return targetResolved, nil
}

func resolveExistingPrefix(path string) (string, error) {
	abs, err := filepath.Abs(path)
	if err != nil {
		return "", err
	}
	abs = filepath.Clean(abs)
	current := abs
	missing := make([]string, 0)
	for {
		_, statErr := os.Lstat(current)
		if statErr == nil {
			resolved, evalErr := filepath.EvalSymlinks(current)
			if evalErr != nil {
				return "", evalErr
			}
			for index := len(missing) - 1; index >= 0; index-- {
				resolved = filepath.Join(resolved, missing[index])
			}
			return filepath.Clean(resolved), nil
		}
		if !errors.Is(statErr, os.ErrNotExist) {
			return "", statErr
		}
		parent := filepath.Dir(current)
		if parent == current {
			return "", statErr
		}
		missing = append(missing, filepath.Base(current))
		current = parent
	}
}

func pathWithin(base, target string) bool {
	relative, err := filepath.Rel(base, target)
	if err != nil {
		return false
	}
	return relative == "." || (relative != ".." && !strings.HasPrefix(relative, ".."+string(filepath.Separator)))
}
