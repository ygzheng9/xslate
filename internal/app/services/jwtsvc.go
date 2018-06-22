package services

import (
	"fmt"
	"time"

	jwt "github.com/dgrijalva/jwt-go"
)

// SecretKey jwt secret
const SecretKey = "Your secret key"

// CustomClaims jwt's claims
type CustomClaims struct {
	Username string `json:"username"`
	jwt.StandardClaims
}

// GenToken 生成 token
func GenToken(username string) (string, error) {
	mySigningKey := []byte(SecretKey)

	// Create the Claims
	claims := CustomClaims{
		Username: username,
		StandardClaims: jwt.StandardClaims{
			ExpiresAt: time.Now().Add(time.Hour * time.Duration(2)).Unix(),
			Issuer:    "ibm",
		},
	}

	// 使用 claim 生成 token
	token := jwt.NewWithClaims(jwt.SigningMethodHS512, claims)

	// 使用 key 对 token 进行加密，得到加密后的 字符串
	ss, err := token.SignedString(mySigningKey)
	fmt.Printf("ss: %v \n err: %v\n", ss, err)
	return ss, err
}

func decodeJwt(ss string) {
	// 对加密后的 字符串，进行 解密；
	token, err := jwt.ParseWithClaims(ss, &CustomClaims{}, func(token *jwt.Token) (interface{}, error) {
		// Don't forget to validate the alg is what you expect:
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("Unexpected signing method: %v", token.Header["alg"])
		}

		// hmacSampleSecret is a []byte containing your secret, e.g. []byte("my_secret_key")
		return []byte(SecretKey), nil
	})

	if token.Valid {
		// 强制类型转换
		if claims, ok := token.Claims.(*CustomClaims); ok {
			fmt.Printf("claims: %+v\n", claims)

			return
		}

		fmt.Printf("err: %+v\n", err)
		return
	}

	if ve, ok := err.(*jwt.ValidationError); ok {
		if ve.Errors&jwt.ValidationErrorMalformed != 0 {
			fmt.Println("token 格式错误")
			return
		}

		// token 过期，或者有效期还没有开始
		if ve.Errors&(jwt.ValidationErrorExpired|jwt.ValidationErrorNotValidYet) != 0 {
			// Token is either expired or not active yet
			fmt.Println("Token 已过期 或 未到期")
			return
		}
	}

	fmt.Println("Token 未知错误:", err)
}
