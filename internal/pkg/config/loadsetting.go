package config

import (
	"encoding/json"
	"fmt"
	"log"
	"os"

	"github.com/aliyun/aliyun-oss-go-sdk/oss"
	"github.com/jmoiron/sqlx"
)

// AppConfig 程序的配置
type AppConfig struct {
	Port        string `json:"port"`
	Release     bool   `json:"release"`
	Schedule    bool   `json:"schedule"`
	TemplateDir string `json:"templateDir"`
	DB          struct {
		User     string `json:"user"`
		Password string `json:"password"`
		Server   string `json:"server"`
		Schema   string `json:"schema"`
	} `json:"db"`
	AliOss struct {
		KeyID     string `json:"accessKeyId"`
		KeySecret string `json:"accessKeySecret"`
		Endpoint  string `json:"endpoint"`
		Bucket    string `json:"bucket"`
		IsAvl     bool   `json:"available"`
	} `json:"alioss"`
}

const (
	passwordKey = "MYGOD"
)

var appConfig AppConfig

// LoadConfiguration 加载配置文件
func LoadConfiguration(file string) (AppConfig, error) {
	configFile, err := os.Open(file)
	defer configFile.Close()
	if err != nil {
		return appConfig, err
	}
	jsonParser := json.NewDecoder(configFile)
	err = jsonParser.Decode(&appConfig)

	// 文件中存的密文
	// var data []byte
	// data, _ = base64.StdEncoding.DecodeString(appConfig.DB.Password)
	// appConfig.DB.Password = string(data)

	return appConfig, err
}

// ConnectDB 初始化数据库连接
func ConnectDB() *sqlx.DB {
	// 连接数据库
	connStr := fmt.Sprintf("%s:%s@(%s)/%s?parseTime=true",
		appConfig.DB.User, appConfig.DB.Password, appConfig.DB.Server, appConfig.DB.Schema)

	// fmt.Println(connStr)
	db, err := sqlx.Open("mysql", connStr)

	if err != nil {
		panic(err)
	}
	if db == nil {
		log.Printf("db is nil.\n")
	}

	// Test the connection to the database
	err = db.Ping()
	if err != nil {
		panic(err.Error())
	}

	return db
}

// ConnectAliOss 建立到 aliyun oss 的连接
func ConnectAliOss() *oss.Client {
	// 建立连接
	client, err := oss.New("http://oss-cn-hangzhou.aliyuncs.com", "LTAIJuSjXPx3B35m", "5nz7Blk9nIr2R11Tss7FOVU5pk5cPJ")
	if err != nil {
		panic(err)
	}

	return client
}
