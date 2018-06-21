package services

import (
	"fmt"
	"testing"

	"github.com/aliyun/aliyun-oss-go-sdk/oss"

	"xslate/config"
)

func init() {
	appConfig, err := config.LoadConfiguration("../config.json")
	if err != nil {
		fmt.Printf("config error: %v\n", err)
		return
	}

	fmt.Printf("config: %+v\n", appConfig)

	ossClient, err := oss.New(appConfig.AliOss.Endpoint, appConfig.AliOss.KeyID, appConfig.AliOss.KeySecret)
	if err != nil {
		panic(err)
	}

	Setup(ossClient, nil, "")
}

func Test_getFileList(t *testing.T) {
	files, err := GetFileList("YVA03-01-0004")

	if err != nil {
		t.Errorf("err: %s", err)
	}

	for _, v := range files {
		fmt.Println(v)
	}
}
