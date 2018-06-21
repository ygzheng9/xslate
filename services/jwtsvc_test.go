package services

import "testing"

func Test_genToken(t *testing.T) {
	GenToken("craig")
}

func Test_decodeJwt(t *testing.T) {
	token := "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImNyYWlnIiwiZXhwIjoxNTI5MjQyNzI1LCJpc3MiOiJ0ZXN0In0.BwDhzwxRYP08g-DR7XX-IBOMSqklMdJVBoJgL2s2aJP_QalJIiPkn3T-XaH4z6ydeS9G-E5fyNIMaYXZtMctvw"
	decodeJwt(token)
}
