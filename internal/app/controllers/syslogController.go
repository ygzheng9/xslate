package controllers

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"

	"xslate/internal/app/models"
)

// SyslogGetAll 获取所有日志
func SyslogGetAll(c *gin.Context) {
	items, err := models.SyslogFindAll()
	if err != nil {
		c.JSON(200, gin.H{
			"rtnCode": err1,
			"message": fmt.Sprintf("SyslogGetAll error: %+v\n", err),
		})
		return
	}

	c.JSON(200, gin.H{
		"rtnCode": ok,
		"items":   items,
	})
}

// SyslogFindByParam 根据查询条件查找
func SyslogFindByParam(c *gin.Context) {
	// 解析参数
	type paramT struct {
		Cond  string `json:"cond"`
		Start string `json:"start_dt"`
		End   string `json:"end_dt"`
	}
	param := paramT{}

	// post 过来的 json，绑定到 对象上；
	err := c.BindJSON(&param)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"rtnCode": err1,
			"message": fmt.Sprintf("SyslogFindByParam BindJson error: %+v\n", err),
		})
		return
	}

	items, err := models.SyslogFindByParam(param.Start, param.End, param.Cond)
	if err != nil {
		c.JSON(200, gin.H{
			"rtnCode": err2,
			"message": fmt.Sprintf("SyslogFindByParam error: %+v\n", err),
		})
		return
	}

	c.JSON(200, gin.H{
		"rtnCode": ok,
		"items":   items,
	})
}
