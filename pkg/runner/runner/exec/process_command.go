package exec

import (
	"context"
	osexec "os/exec"
	"sync"
)

type managedCommand struct {
	Cmd    *osexec.Cmd
	ctx    context.Context
	done   chan struct{}
	close  sync.Once
	handle treeHandle
}

func newManagedCommand(ctx context.Context, name string, args ...string) *managedCommand {
	cmd := osexec.Command(name, args...)
	configureProcessTree(cmd)
	return &managedCommand{Cmd: cmd, ctx: ctx, done: make(chan struct{})}
}

func (c *managedCommand) Start() error {
	if err := c.Cmd.Start(); err != nil {
		return err
	}
	handle, err := attachProcessTree(c.Cmd)
	if err != nil {
		_ = c.Cmd.Process.Kill()
		_, _ = c.Cmd.Process.Wait()
		return err
	}
	c.handle = handle
	go func() {
		select {
		case <-c.ctx.Done():
			_ = killProcessTree(c.Cmd, c.handle)
		case <-c.done:
		}
	}()
	return nil
}

func (c *managedCommand) Wait() error {
	err := c.Cmd.Wait()
	c.close.Do(func() { close(c.done) })
	_ = releaseProcessTree(c.handle)
	return err
}
