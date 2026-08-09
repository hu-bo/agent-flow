package runner

import (
	"encoding/json"
	"os"
	"path/filepath"
	"testing"

	"github.com/agent-flow/runner/runner/types"
)

func TestFsSearchSkipsBinaryAndInvalidUTF8Files(t *testing.T) {
	t.Parallel()

	root := t.TempDir()
	if err := os.WriteFile(filepath.Join(root, "text.txt"), []byte("alpha\nneedle\n"), 0o644); err != nil {
		t.Fatalf("write text file: %v", err)
	}
	if err := os.Mkdir(filepath.Join(root, "__pycache__"), 0o755); err != nil {
		t.Fatalf("mkdir binary dir: %v", err)
	}
	if err := os.WriteFile(filepath.Join(root, "__pycache__", "cache.pyc"), []byte{0x00, 'n', 'e', 'e', 'd', 'l', 'e'}, 0o644); err != nil {
		t.Fatalf("write binary file: %v", err)
	}
	if err := os.WriteFile(filepath.Join(root, "invalid.txt"), []byte{0xff, 0xfe, 'n', 'e', 'e', 'd', 'l', 'e'}, 0o644); err != nil {
		t.Fatalf("write invalid utf8 file: %v", err)
	}

	input, err := json.Marshal(fsSearchInput{
		Path:       ".",
		Pattern:    "needle",
		Recursive:  true,
		MaxMatches: 10,
	})
	if err != nil {
		t.Fatalf("marshal input: %v", err)
	}

	result, err := fsSearch(types.TaskRequest{
		Command:    "fs.search",
		WorkingDir: root,
		InputJSON:  input,
	})
	if err != nil {
		t.Fatalf("fsSearch: %v", err)
	}

	if result["total"] != 1 {
		t.Fatalf("expected one text match, got %#v", result["total"])
	}
	if result["skippedBinary"] != 2 {
		t.Fatalf("expected two skipped unsafe files, got %#v", result["skippedBinary"])
	}
}
