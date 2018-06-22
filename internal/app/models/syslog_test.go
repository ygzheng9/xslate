package models

import (
	"fmt"
	"testing"
)

// func TestSyslogInsert(t *testing.T) {
// 	type args struct {
// 		d Syslog
// 	}
// 	tests := []struct {
// 		name    string
// 		args    args
// 		wantErr bool
// 	}{
// 		// TODO: Add test cases.
// 	}
// 	for _, tt := range tests {
// 		t.Run(tt.name, func(t *testing.T) {
// 			if err := SyslogInsert(tt.args.d); (err != nil) != tt.wantErr {
// 				t.Errorf("SyslogInsert() error = %v, wantErr %v", err, tt.wantErr)
// 			}
// 		})
// 	}
// }

func TestSyslogInsert(t *testing.T) {
	one := Syslog{
		Username:  "heidi",
		ServerDT:  "2018-06-21 20:02:19",
		RemoteIP:  "90.37.28.45",
		FuncPoint: "products",
		Param:     "",
	}

	err := SyslogInsert(one)
	if err != nil {
		t.Errorf("%v\n", err)
	}

	all, err := SyslogFindAll()
	if err != nil {
		t.Errorf("%v\n", err)
	}

	for _, a := range all {
		fmt.Printf("%v\n", a)
	}
}
