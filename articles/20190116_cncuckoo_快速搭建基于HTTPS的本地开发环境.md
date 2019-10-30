## 快速搭建基于HTTPS的本地开发环境

为什么本地开发要使用HTTPS？

因为有很多Web API必须在HTTPS环境下才可以使用。比如，Clipboard API and events（https://www.w3.org/TR/clipboard-apis）中的`navigator.clipboard`对象是通过扩展`Navigator`接口定义的：

```web-idl
partial interface Navigator {
  [SecureContext, SameObject] readonly attribute Clipboard clipboard;
};
```

在此，`partial`的意思就是扩展`Navigator`接口，给它增加一个`Clipboard`类型的只读成员属性`clipboard`。`[SecureContext, SameObject]`中的两个关键字是“扩展属性”（extended attribute），在这里修饰接口成员`clipboard`。`SecureContext`表示``navigator`只能在“安全上下文”中暴露`clipboard`属性，`SameObject`表示每次访问`navigator.clipboard`必须都返回相同的值。（参见：https://heycam.github.io/webidl/#SecureContext和https://heycam.github.io/webidl/#SameObject。）

关于“安全上下文”，W3C的Secure Contexts文档（https://w3c.github.io/webappsec-secure-contexts/）中有详细解释。根据MDN，全站HTTPS和通过http://localhost交付的网页是安全的。可以通过`window.isSecureContext`属性来检测当前上下文是否安全。

```js
if (window.isSecureContext) {
  navigator.clipboard.writeText('Write this to clipboard!').then(ok => true, err => false)
}
```

另外还有一个重要原因，就是有时候HTTP的本地请求可能会被HTTPS服务器拒绝。

无论如何，我们在开发实践中都有可能碰到将本地Web服务HTTPS化的需求。这时候，我们可以创建自己私钥并签名一个根证书，并在开发环境中配置安装和信任自己的根证书。然后再通过这个根证书和私钥签发相应域名的SSL证书。

好吧，开始干吧。

### 第一步：生成自签名的根SSL证书

首先生成一个RSA-2048加密的私钥，保存为localCA.key。生成过程中，会提示输入密码（pass phrase），以后在使用生成的私钥签发证书时都要输入这个密码。

```
openssl genrsa -des3 -out localCA.key 2048
```

![](https://p0.ssl.qhimg.com/t01aa82be6c317ca934.jpg)

接下来用这个私钥生成一个根SSL证书，保存为localCA.pem。有效期为1825天（5年）。

```
openssl req -x509 -new -nodes -key localCA.key -sha256 -days 1825 -out localCA.pem
```

在此期间，会提示输入：

- Country Name（2字母）：国家/地区
- State or Province Name（全称）：省/市/自治区
- Locality Name：所在地
- Organization Name：组织单位
- Organizational Unit Name：部门
- Common Name：常用名称，根证书的名称

![](https://p3.ssl.qhimg.com/t01bb58c889372060a9.jpg)

### 第二步：配置本地环境信任自签名根证书

打开macOS中的“钥匙串访问”应用：

1. “文件 > 导入项目”，选择localCA.pem，打开（需要输入密码）

   ![](https://p5.ssl.qhimg.com/t0108aa3e49ddf7e2c9.jpg)

2. 双击导入的证书，在“信任”中选择“始终信任”

   ![](https://p0.ssl.qhimg.com/t01aeaced3175696eda.jpg)

3. 退出当前窗口（需要输入密码），“此证书已标记为受所有用户信任”

   ![](https://p0.ssl.qhimg.com/t01678632cead41d975.jpg)

### 第三步：签发域名SSL证书

首先，创建域名SSL证书的私钥，“ext”的意思在这里表示“泛域名”，可以随意命名

```
openssl genrsa -out ext.yourdomain.com.key 2048
```

然后，用这个密钥创建一个CSR（Certificate Signing Request，证书签名请求）文件

```
openssl req -new -key ext.yourdomain.com.key -out ext.yourdomain.com.csr
```

在创建证书之前，还要创建一个配置文件，将其命名为ext.yourdomain.com.ext，包含如下内容：

```
authorityKeyIdentifier=keyid,issuer
basicConstraints=CA:FALSE
keyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
subjectAltName = @alt_names

[alt_names]
DNS.1 = *.yourdomain.com
```

> 注意这里的`*.yourdomain.com`，表示SSL证书可用于泛域名。

最后，为`*.yourdomain.com`域名签发SSL证书

```
openssl x509 -req -in ext.yourdomain.com.csr \
-CA localCA.pem -CAkey localCA.key \
-CAcreateserial -out ext.yourdomain.com.crt \
-days 1825 -sha256 -extfile ext.yourdomain.com.ext
```

把生成的证书和私钥文件复制到相应目录

- ext.yourdomain.com.crt
- ext.yourdomain.com.key

假设使用Webpack的devServer，配置如下：

```JSON
devServer: {
  proxy: {
    '*': 'http://127.0.0.1:9360'
  },
  port: 443,
  https: {
    key: fs.readFileSync(path.join(__dirname, 'ext.yourdomain.com.key')),
    cert: fs.readFileSync(path.join(__dirname, 'ext.yourdomain.com.crt'))
  },
  host: 'dev.yourdomain.com',
  allowedHosts: ['dev.yourdomain.com']
  watchContentBase: true,
  // hot: true
},
```

配置HOST文件：

```
127.0.0.1 dev.yourdomain.com
127.0.0.1 test.yourdomain.com
```

重启服务：

![](https://p3.ssl.qhimg.com/t01c9dd58046060bda8.jpg)

再换一个子域名：

![](https://p0.ssl.qhimg.com/t010bd82e9d4a11ccfc.jpg)

> 注意，`*.yourdomain.com`只限一级泛子域名，即`dev.yourdomain.com`或`test.yourdomain.com`是可以的，而`dev.h5.yourdomain.com`则不可以！（如果有二级泛子域名需求，可以单独生成比如`*.h5.yourdomain.com`这样证书。）

### 参考资料

- https://deliciousbrains.com/ssl-certificate-authority-for-local-https-development/
- https://medium.freecodecamp.org/how-to-get-https-working-on-your-local-development-environment-in-5-minutes-7af615770eec