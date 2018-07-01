package controllers

import (
	"fmt"
	"net/http"
	"time"

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

// SyslogInsert 插入一条记录
func SyslogInsert(c *gin.Context) {
	param := models.Syslog{}

	// post 过来的 json，绑定到 对象上；
	err := c.BindJSON(&param)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"rtnCode": err1,
			"message": fmt.Sprintf("SyslogInsert BindJson error: %+v\n", err),
		})
		return
	}

	// 取得原始的ip，服务器时间
	param.RemoteIP = c.Request.Header.Get("X-Forwarded-For")
	if param.RemoteIP == "" {
		param.RemoteIP = c.Request.RemoteAddr
	}

	param.ServerDT = time.Now().Format("2006-01-02 15:04:05")

	err = models.SyslogInsert(param)
	if err != nil {
		c.JSON(200, gin.H{
			"rtnCode": err2,
			"message": fmt.Sprintf("SyslogInsert error: %+v\n", err),
		})
		return
	}

	c.JSON(200, gin.H{
		"rtnCode": ok,
		"message": "",
	})
}
