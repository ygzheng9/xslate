import OSS from "ali-oss";

export const client = new OSS({
  accessKeyId: "LTAIJuSjXPx3B35m",
  accessKeySecret: "5nz7Blk9nIr2R11Tss7FOVU5pk5cPJ",
  region: "oss-cn-shanghai",
  bucket: "ordercommit"
});

// 建立 ali-oss 的客户端，在线商品信息
export const existClient = new OSS.Wrapper({
  accessKeyId: "LTAIJuSjXPx3B35m",
  accessKeySecret: "5nz7Blk9nIr2R11Tss7FOVU5pk5cPJ",
  region: "oss-cn-hangzhou",
  bucket: "mfrwxoss"
});
