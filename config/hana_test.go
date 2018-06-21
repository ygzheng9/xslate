package config

import (
	"testing"

	_ "github.com/go-sql-driver/mysql"
)

func Test_ConnectHANA(t *testing.T) {
	connectHANA()
}
