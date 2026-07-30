package exec

import (
	"errors"
	"io"
	"sync"
)

const outputChunkSize = 32 * 1024

type outputStream string

const (
	outputStdout outputStream = "stdout"
	outputStderr outputStream = "stderr"
)

type outputChunk struct {
	stream     outputStream
	text       string
	sequence   uint64
	byteOffset uint64
	truncated  bool
}

type outputSummary struct {
	stdout      []string
	stderr      []string
	stdoutBytes uint64
	stderrBytes uint64
	truncated   bool
}

type outputCollector struct {
	mu            sync.Mutex
	maxBytes      uint64
	keptBytes     uint64
	chunkSequence uint64
	stdout        []string
	stderr        []string
	stdoutBytes   uint64
	stderrBytes   uint64
	truncated     bool
}

func newOutputCollector(maxBytes uint64) *outputCollector {
	return &outputCollector{maxBytes: maxBytes}
}

func (c *outputCollector) read(reader io.Reader, stream outputStream, emit func(outputChunk) error) error {
	buffer := make([]byte, outputChunkSize)
	var emitErr error
	for {
		n, err := reader.Read(buffer)
		if n > 0 {
			chunk := c.accept(stream, buffer[:n])
			if (chunk.text != "" || chunk.truncated) && emitErr == nil && emit != nil {
				emitErr = emit(chunk)
			}
		}
		if err != nil {
			if errors.Is(err, io.EOF) {
				return emitErr
			}
			return errors.Join(emitErr, err)
		}
	}
}

func (c *outputCollector) accept(stream outputStream, raw []byte) outputChunk {
	c.mu.Lock()
	defer c.mu.Unlock()

	offset := c.stdoutBytes
	if stream == outputStderr {
		offset = c.stderrBytes
		c.stderrBytes += uint64(len(raw))
	} else {
		c.stdoutBytes += uint64(len(raw))
	}
	remaining := uint64(0)
	if c.keptBytes < c.maxBytes {
		remaining = c.maxBytes - c.keptBytes
	}
	keep := uint64(len(raw))
	truncatedThisChunk := false
	if keep > remaining {
		keep = remaining
		truncatedThisChunk = !c.truncated
		c.truncated = true
	}
	text := string(raw[:keep])
	if text != "" {
		if stream == outputStderr {
			c.stderr = append(c.stderr, text)
		} else {
			c.stdout = append(c.stdout, text)
		}
	}
	c.keptBytes += keep
	c.chunkSequence++
	return outputChunk{stream: stream, text: text, sequence: c.chunkSequence, byteOffset: offset, truncated: truncatedThisChunk}
}

func (c *outputCollector) summary() outputSummary {
	c.mu.Lock()
	defer c.mu.Unlock()
	return outputSummary{
		stdout: append([]string{}, c.stdout...), stderr: append([]string{}, c.stderr...),
		stdoutBytes: c.stdoutBytes, stderrBytes: c.stderrBytes, truncated: c.truncated,
	}
}
