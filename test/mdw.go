package main

import (
	"fmt"
	"log"
	"net/http"
	"xslate/services"

	"github.com/davecgh/go-spew/spew"
	jwt "github.com/dgrijalva/jwt-go"
	"github.com/dgrijalva/jwt-go/request"
	"github.com/gin-gonic/gin"
)

// abortRequest 终止当前的 request
func abortRequest(c *gin.Context, msg string) {
	fmt.Println(msg)
	c.JSON(http.StatusUnauthorized, gin.H{
		"message": msg,
	})
	c.Abort()
}

// mwJwt jwt 的 middleware
func mwJwt() gin.HandlerFunc {
	return func(c *gin.Context) {
		// login 直接返回
		if c.Request.URL.Path == "/login" {
			c.Next()
			return
		}

		// 需要验证 token
		token, err := request.ParseFromRequest(c.Request, request.AuthorizationHeaderExtractor, func(token *jwt.Token) (interface{}, error) {
			return []byte(services.SecretKey), nil
		},
			request.WithClaims(&services.CustomClaims{}))

		if err != nil {
			abortRequest(c, "Unauthorized access to this resource")
			return
		}

		if !token.Valid {
			abortRequest(c, "Token is not valid")
			return
		}

		// 提取用户信息，放入 meta-data 中，供后续 controller 使用
		claims, ok := token.Claims.(*services.CustomClaims)
		if !ok {
			abortRequest(c, "Claims is not valid")
			return
		}

		fmt.Printf("Claims: %+v\n", claims)
		c.Set("zUser", claims.Username)
		c.Next()
	}
}

// login 用户校验，通过后，返回 token
func login(c *gin.Context) {
	username, ok := c.GetQuery("username")
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "E1001: bad request",
		})
		return
	}

	password, ok := c.GetQuery("password")
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "E1002: bad request",
		})
		return
	}

	// check username & password
	if username != "admin" || password != "nimda" {
		c.JSON(http.StatusNotAcceptable, gin.H{
			"message": "E1003: failed to login",
		})
		return
	}

	token, err := services.GenToken(username)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "E1005: bad token",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"token": token,
	})
}

// externalAPI 调用外部 api
func externalAPI(c *gin.Context) {
	url := "http://120.27.153.97:8080/Markor/adapters/Setting/setting?limit=1000"
	token := "6EBE1956DD2F75653F97F246CCA45D7EA8DC2AF4"

	client := &http.Client{}
	req, err := http.NewRequest("GET", url, nil)
	req.Header.Add("Authorization", token)
	response, err := client.Do(req)
	if err != nil || response.StatusCode != http.StatusOK {
		c.Status(http.StatusServiceUnavailable)
		return
	}

	// fmt.Printf("res: %+v\n", response)
	spew.Dump(response.Header)
	// spew.Printf("res: %v\n", response)

	reader := response.Body
	contentLength := response.ContentLength
	contentType := response.Header.Get("Content-Type")
	extraHeaders := map[string]string{}

	c.DataFromReader(http.StatusOK, contentLength, contentType, reader, extraHeaders)
}

func main() {
	r := gin.Default()
	r.Use(mwJwt())

	r.GET("/test", func(c *gin.Context) {
		example := c.MustGet("zUser").(string)

		// it would print: "12345"
		log.Println(example)
	})

	r.GET("/login", login)
	r.GET("/products", externalAPI)

	// Listen and serve on 0.0.0.0:8080
	r.Run(":8080")
}
