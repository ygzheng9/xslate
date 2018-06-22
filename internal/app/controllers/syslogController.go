package controllers

import (
	"fmt"

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
