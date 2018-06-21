package main

import (
	"fmt"
	"os"
	"path/filepath"

	_ "github.com/go-sql-driver/mysql"
	cors "gopkg.in/gin-contrib/cors.v1"

	"github.com/gin-gonic/gin"

	"xslate/config"
	"xslate/controllers"
	"xslate/models"
	"xslate/services"
)

// 显示程序当前目录
func printPath() {
	ex, err := os.Executable()
	if err != nil {
		panic(err)
	}
	exPath := filepath.Dir(ex)
	fmt.Printf("Path: %s\n", exPath)
}

// 主程序
func main() {
	// 从文件加载配置信息，exe 的相同目录下；
	appConfig, err := config.LoadConfiguration("./config.json")
	if err != nil {
		fmt.Printf("LoadConfiguration failed. %+v\n", err)
		return
	}

	// 初始化 alioss, 数据库连接，邮件模板路径
	services.Setup(config.ConnectAliOss(), config.ConnectDB(), appConfig.TemplateDir)

	if appConfig.Schedule {
		// 开启定时任务
		models.StartNoticeSvc()
		fmt.Println("start notice service.")
	}

	if appConfig.Release {
		// 发布模式
		gin.SetMode(gin.ReleaseMode)
	}

	// 初始化路由
	router := gin.Default()

	if appConfig.Release {
		// 只允许白名单
		config := cors.DefaultConfig()
		config.AllowOrigins = []string{"http://127.0.0.1:8000", "http://localhost:8000"}
		router.Use(cors.New(config))

		fmt.Println("set to release.")
	} else {
		// 开发模式，允许所有
		router.Use(cors.Default())
		fmt.Printf("config: %+v\n", appConfig)
	}

	// 全部使用 api 访问，所以不需要使用 server-side template
	// router.Static("/assets", "./assets")
	// router.StaticFile("/favicon.ico", "./assets/favicon.ico")

	// router.LoadHTMLGlob("./templates/**/*")
	// router.GET("/ecn", func(c *gin.Context) {
	// 	c.HTML(http.StatusOK, "todolist/index.html", gin.H{
	// 		"title": "Posts",
	// 	})
	// })

	// 正式逻辑
	router.GET("/api/hello", controllers.Hello)
	router.POST("/api/getFileList", controllers.GetFileList)

	eventCtrl := controllers.CreateEventController()
	event := router.Group("/api/events")
	{
		event.GET("/", eventCtrl.FindAll)
		event.GET("/:id", eventCtrl.FindByID)
		event.DELETE("/:id", eventCtrl.Delete)
		event.POST("/", eventCtrl.Insert)
		event.PUT("/", eventCtrl.Update)
	}
	router.GET("/api/events_notify/:id", eventCtrl.NotifyOpen)
	router.GET("/api/events_close/:id", controllers.CloseEvent)
	router.POST("/api/events_search", controllers.FindEventByParam)

	todoCtrl := controllers.CreateEventTodoController()
	todo := router.Group("/api/todos")
	{
		todo.GET("/", todoCtrl.FindAll)
		todo.GET("/:id", todoCtrl.FindByID)
		todo.DELETE("/:id", todoCtrl.Delete)
		todo.POST("/", todoCtrl.Insert)
		todo.PUT("/", todoCtrl.Update)
	}
	router.POST("/api/todos_byref", todoCtrl.FindByRef)
	router.POST("/api/todos_mark", todoCtrl.MarkTodo)
	router.POST("/api/todos_upload", todoCtrl.UploadTodos)
	router.POST("/api/todos_search", todoCtrl.FindByParam)

	fdbkCtrl := controllers.CreateFeedbackController()
	feedback := router.Group("/api/feedback")
	{
		feedback.GET("/", fdbkCtrl.FindAll)
		feedback.GET("/:id", fdbkCtrl.FindByID)
		feedback.DELETE("/:id", fdbkCtrl.Delete)
		feedback.POST("/", fdbkCtrl.Insert)
		feedback.PUT("/", fdbkCtrl.Update)
	}
	router.POST("/api/feedback_ref", fdbkCtrl.FindByRef)

	uploadCtrl := controllers.CreateUploadController()
	upload := router.Group("/api/uploads")
	{
		upload.GET("/", uploadCtrl.FindAll)
		upload.GET("/:id", uploadCtrl.FindByID)
		upload.DELETE("/:id", uploadCtrl.Delete)
		upload.POST("/", uploadCtrl.Insert)
		//upload.POST("/", uploadHandler)
		upload.PUT("/", uploadCtrl.Update)
	}
	router.POST("/api/uploads_byref", uploadCtrl.FindByRef)
	router.GET("/api/uploads_download/:id", uploadCtrl.DownloadFile)

	deptCtrl := controllers.CreateDepartmentController()
	department := router.Group("/api/departments")
	{
		department.GET("/", deptCtrl.FindAll)
		department.GET("/:id", deptCtrl.FindByID)
		department.DELETE("/:id", deptCtrl.Delete)
		department.POST("/", deptCtrl.Insert)
		department.PUT("/", deptCtrl.Update)
	}

	router.Run(appConfig.Port)
}
