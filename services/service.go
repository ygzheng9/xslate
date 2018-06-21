package services

import (
	"xslate/models"

	"github.com/aliyun/aliyun-oss-go-sdk/oss"
	"github.com/jmoiron/sqlx"
)

var ossClient *oss.Client

// Setup 设置参数
func Setup(client *oss.Client, dbConn *sqlx.DB, templDir string) {
	ossClient = client

	models.Setup(dbConn, templDir)
}
