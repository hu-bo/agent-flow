//go:build !windows

package autostart

func installWindows(_ string, _ Options) (string, error) {
	return "", unsupportedError()
}

func uninstallWindows() (string, error) {
	return "", unsupportedError()
}

func windowsScript(_ string, _ Options) string {
	return ""
}
