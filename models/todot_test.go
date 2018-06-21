package models

import (
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"testing"

	_ "github.com/denisenkom/go-mssqldb"
)

func Test_ScanAllTodos(t *testing.T) {
	err := ScanAllTodos()
	if err != nil {
		t.Errorf("ScanAllTodos: %#v\n", err)
		return
	}
}

func Test_Path(t *testing.T) {
	file, _ := exec.LookPath(os.Args[0])
	path, _ := filepath.Abs(file)
	fmt.Printf("path: " + path)
}

func Test_ScanEvent(t *testing.T) {
	err := ScanEvent(3)
	if err != nil {
		t.Errorf("ScanAllTodos: %#v\n", err)
		return
	}
}

func Test_print(t *testing.T) {
	uploadDir := "C:/tmp/attachments"
	a := fmt.Sprintf("\n%s/at_%d", uploadDir, 2)
	t.Log(a)
}
