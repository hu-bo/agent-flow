package auth

import "errors"

type Verifier interface {
	Verify(token string) error
}

type StaticTokenVerifier struct {
	token string
}

func NewStaticTokenVerifier(token string) *StaticTokenVerifier {
	return &StaticTokenVerifier{token: token}
}

func (v *StaticTokenVerifier) Verify(token string) error {
	if v.token == "" {
		return nil
	}
	if token != v.token {
		return errors.New("invalid auth token")
	}
	return nil
}
