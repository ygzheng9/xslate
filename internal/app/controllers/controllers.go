package controllers

import (
	"encoding/base64"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"

	"xslate/internal/app/services"
)

const (
	ok   = 0
	err1 = 1
	err2 = 2
	err3 = 3
	err4 = 4
	err5 = 5
	err6 = 6
	err7 = 7
	err8 = 8
	err9 = 9
)

// GeneratePassword 生成密码的密文
func GeneratePassword(c *gin.Context) {
	type paramT struct {
		Plain string `json:"plain" form:"plain"`
	}

	var param paramT
	err := c.BindJSON(&param)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"rtnCode": err1,
			"message": fmt.Sprintf("GeneratePassword error: %+v\n", err),
		})
		return
	}

	// 生成密文, base64编码
	encodeString := base64.StdEncoding.EncodeToString([]byte(param.Plain))
	c.JSON(http.StatusOK, gin.H{
		"rtnCode": ok,
		"value":   encodeString,
	})
}

// Hello 测试
func Hello(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"rtnCode": ok,
		"results": "ready.",
	})
}

// GetFileList 查找文件清单
func GetFileList(c *gin.Context) {
	type paramT struct {
		Product string `json:"product" form:"product"`
	}

	var param paramT
	err := c.BindJSON(&param)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"rtnCode": err1,
			"message": fmt.Sprintf("GetFileList param error: %+v\n", err),
		})
		return
	}

	files, err := services.GetFileList(param.Product)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"rtnCode": err2,
			"message": fmt.Sprintf("GetFileList oss error: %+v\n", err),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"rtnCode": ok,
		"results": files,
	})
}
