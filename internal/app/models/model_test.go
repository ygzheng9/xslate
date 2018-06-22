package models

import (
	"fmt"

	_ "github.com/go-sql-driver/mysql"

	"xslate/internal/pkg/config"
)

func init() {
	appConfig, err := config.LoadConfiguration("../../../configs/config.json")
	if err != nil {
		fmt.Printf("LoadConfiguration failed. %+v\n", err)
		return
	}

	Setup(config.ConnectDB(), appConfig.TemplateDir)

	fmt.Printf("model_test.go init")
}
