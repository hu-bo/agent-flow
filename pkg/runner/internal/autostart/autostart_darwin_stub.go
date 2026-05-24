//go:build !darwin

package autostart

func installDarwin(_ string, _ Options) (string, error) {
	return "", unsupportedError()
}

func uninstallDarwin() (string, error) {
	return "", unsupportedError()
}

func darwinPlist(_ string, _ Options) (string, error) {
	return "", unsupportedError()
}
