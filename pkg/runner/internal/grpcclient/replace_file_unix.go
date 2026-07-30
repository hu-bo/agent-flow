//go:build !windows

package grpcclient

import "os"

func replaceFile(source, target string) error {
	return os.Rename(source, target)
}
