package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"os/exec"
	"path/filepath"
)

// App struct
type App struct {
	ctx context.Context
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

func (a *App) CopyToClipboard(text string) bool {
	cmd := exec.Command("pbcopy")
	in, err := cmd.StdinPipe()
	if err != nil {
		log.Fatal(err)
	}

	if err := cmd.Start(); err != nil {
		log.Fatal(err)
	}

	if _, err := in.Write([]byte(text)); err != nil {
		log.Fatal(err)
	}

	if err := in.Close(); err != nil {
		log.Fatal(err)
	}

	if err := cmd.Wait(); err != nil {
		log.Fatal(err)
	}
	return true
}

var fileName = "output.bin"

func (a *App) ImportFile(data string) string {
	defer func() {
		if r := recover(); r != nil {
			errString := fmt.Sprintf("%v", r)
			log.Println("Recovered from error:", errString)
		}
	}()

	execPath, err := os.Executable()
	if err != nil {
		log.Fatal(err)
	}
	execDir := filepath.Dir(execPath)

	fullPath := filepath.Join(execDir, fileName)

	err1 := os.WriteFile(fullPath, []byte(data), 0644)
	if err1 != nil {
		log.Println("Error writing file: ", err)
	}
	return fullPath
}

func (a *App) LoadFile() string {
	defer func() {
		if r := recover(); r != nil {
			errString := fmt.Sprintf("%v", r)
			log.Println("Recovered from error:", errString)
		}
	}()

	execPath, err := os.Executable()
	if err != nil {
		log.Fatal(err)
	}
	execDir := filepath.Dir(execPath)

	fullPath := filepath.Join(execDir, fileName)

	data, err := os.ReadFile(fullPath)
	if err != nil {
		log.Println("Error reading file: ", err)
	}
	return string(data)
}
