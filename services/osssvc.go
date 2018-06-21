package services

import (
	"github.com/aliyun/aliyun-oss-go-sdk/oss"
)

// GetFileList 根据传入的商品编号，查找图片列表
func GetFileList(product string) ([]string, error) {
	// fmt.Printf("product: %s\n", product)

	result := []string{}
	// 设置 bucket
	bucket, err := ossClient.Bucket("mfrwxoss")
	if err != nil {
		return result, err
	}

	// 根据 product 找到对应的文件名
	prefix := "300Wx300H/" + product
	lsRes, err := bucket.ListObjects(oss.Prefix(prefix))
	if err != nil {
		return result, err
	}

	for _, object := range lsRes.Objects {
		result = append(result, object.Key)
	}

	return result, nil
}
