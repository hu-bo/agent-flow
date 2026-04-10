package proxy

import "bytes"

// ResponseRecorder captures a copy of the response body for logging.
type ResponseRecorder struct {
	buf bytes.Buffer
}

func (r *ResponseRecorder) Write(p []byte) (int, error) {
	return r.buf.Write(p)
}

func (r *ResponseRecorder) Bytes() []byte {
	return r.buf.Bytes()
}
