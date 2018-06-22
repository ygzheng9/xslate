package config

import (
	"database/sql"
	"fmt"
	"log"

	"github.com/SAP/go-hdb/driver"
)

// 连接 HANA 数据库
func connectHANA() {
	appConfig, err := LoadConfiguration("../../../configs/config.json")
	if err != nil {
		fmt.Printf("config error: %v\n", err)
		return
	}

	fmt.Printf("config: %+v\n", appConfig)

	connector := driver.NewBasicAuthConnector(appConfig.Hana.Host, appConfig.Hana.Username, appConfig.Hana.Password)
	connector.SetTimeout(60)
	db := sql.OpenDB(connector)
	defer db.Close()

	if err := db.Ping(); err != nil {
		log.Fatal(err)
	}

	schema := "SAPHCD"
	// table := "TSTC"
	// table := "MARA"

	// table := "DEMO_CDS_AGG"
	table := "DEMO_CDS_AGG"

	sqlCmd := fmt.Sprintf("select count(*) from %s.%s ", schema, table)
	fmt.Printf("sqlCmd: %s\n", sqlCmd)

	i := 0
	if err := db.QueryRow(sqlCmd).Scan(&i); err != nil {
		log.Fatal(err)
	}

	fmt.Printf("row count: %d\n", i)
}
