## W3C Credential Management API

Credential Management API 是一套给提供给网站用于存储用户登陆信息的 API，简单地说可以作为一种自动账号密码填充的功能：

```javascript
navigator.credentials.store({
  type: 'password',
  id: 'id',
  password: '1234567'
})
```

下一次登录的时候，我们可以通过上一次存储的账号密码直接登录：

```javascript
navigator.credentials
	.get({ password: true })
	.then(credential => {
  	if (!credential) return
  	fetch('/login', {
      method: 'POST',
      body: JSON.stringify({
        username: credential.id,
        password: credential.password
      }).
      credentials: 'include'
    }).then(res => {
      // ....
    })
	})
```

## FIDO2 WebAuthn

那么，WebAuthn 又是干嘛的呢？它是 Credential Management API 的公钥扩展，**FIDO2 无密码输入认证体验的 web 部分标准**，同时也是 W3C 的官方标准。接下来就来简单了解一下 WebAuthn。

## WebAuthn的验证流程

![](https://p1.ssl.qhimg.com/t0190a17bb8c529235e.png)

完整的认证流程采用了一种 挑战-应答 （challenge-response）的模式：

1. 首先客户端要求用户输入用户名发起挑战请求
2. 随后服务器根据用户名对客户端发起挑战
3. 随后客户端进行回应，如果此时服务端验证回应是满足的，那么认证成功

WebAuthn 主要分为四个层面：

* 用户层面：包含输入用户名，以及生物认证等操作
* API层面：创建公钥，产生断言验证
* 协议层面：规定挑战-应答流程，对抗钓鱼，对抗重放攻击等实现
* 硬件层面：在硬件上实现公钥的产生和断言验证的产生的协议： CTAP2

## 使用 WebAuthn 进行用户注册

用户注册主要需要如下的步骤：

* 收集用户的基本信息，如用户名等（不需要设置密码）
* 将信息发给服务端进行验证（如有没有被注册过等）
* 服务端对此向客户端发起挑战
* 客户端生成认证信息并响应给服务端
* 服务端验证客户端的响应，注册完成

### 收集信息并发送给服务端

这个步骤我们只要将信息收集好传送给后端进行验证即可：

```javascript
axios.post('/auth/register', {
  username,
  password
})
```

服务端根据这些信息判断某个用户名是否已经被注册过，这些逻辑就不在这里编写了

### 服务端向客户端发起挑战

要创建认证信息，我们需要调用 credential 的 create 方法，使用公钥的方式(`publicKey`)进行生成，`publicKey` 主要接受以下的参数，这些参数均需要由认证提供方（服务端）进行生成：

```idl
dictionary PublicKeyCredentialCreationOptions {
    required PublicKeyCredentialRpEntity         rp;
    required PublicKeyCredentialUserEntity       user;

    required BufferSource                             challenge;
    required sequence<PublicKeyCredentialParameters>  pubKeyCredParams;

    unsigned long                                timeout;
    sequence<PublicKeyCredentialDescriptor>      excludeCredentials = [];
    AuthenticatorSelectionCriteria               authenticatorSelection;
    AttestationConveyancePreference              attestation = "none";
    AuthenticationExtensionsClientInputs         extensions;
};
```

下面对必填参数进行简单介绍：

* rp: 代表了进行认证方 (Replying Party) 的信息，我们需要提供一个名字(name) 参数即可
* user: 代表了认证方正在进行验证的用户信息，必须携带用户名(name)、显示名称(displayName)以及用户id (Buffer)
* Challenge: 代表了服务端给客户端发送的"挑战"字符串
* pubKeyCredParams: 输入一个数组，对公钥生成算法进行协商，算法选项越往前，代表服务更青睐于这一种生成方式

当注册信息验证没有问题之后，我们就可以开始发起挑战了

```javascript
const crypto = require('crypto')
function requestChallenge({name, displayName, id}) {
  return {
    challenge: crypto.randomBytes(32, (_, buffer) => buffer.toString('hex')),
    rp: {
      name: 'Example Company'
    },
    user: {
      id,
      name,
      displayName
    },
    pubKeyCredParams: [
      { type: 'public-key', alg: -7 }, // COSEAlgorithmIdentifier -7 ES256
      { type: 'public-key', alg: -257 } // COSEAlgorithmIdentifier -257 RS256
    ]
  }
}
```

### 客户端生成认证信息

现在，我们已经拿到了服务端给的挑战信息 ，还需要稍稍处理一下才能直接给到 `create` 方法中，

前面提到 `challenge` 以及 `user.id` 必须是一个 buffer， 但是 JSON 不能传输 buffer， 我们在上面的方法中都已经处理成hex字符串了，所以我们需要将字符串转换回 buffer。

```javascript
axios
  .post('/auth/register', info)
	.then(data => {
  	data.challenge = Buffer.from(data.challenge, 'hex')
  	data.user.id = Buffer.from(data.user.id, 'hex')
  	// 生成
  	navigator.credentials.create({ publicKey: data });
	})
```

如果一切正确，那么浏览器将会弹出认证窗口：

![](https://p5.ssl.qhimg.com/t01df10afb86bb1b09c.png)

浏览器会列出所有支持的认证方式，选择一个你喜欢的认证方式进行认证：

![](https://p0.ssl.qhimg.com/t01e54e7f2881967c48.png)

认证完成之后，我们会从认证器中得到如下的响应 ，将响应发送到到服务端进行验证：

![](https://p5.ssl.qhimg.com/t01827aa2d9784ec9de.png)

// 同样的，buffer 要转换一下

### 服务端对响应进行验证

我们主要对 `attestationObject` 进行验证

```javascript
function verifyAuthnticator(resp) => {
  const att = resp.response.attestationObject
  if (att.fmt === 'fido-u2f') {
    const authData = parseAuthData(att.authData)
    if (!(authData.flags & 0x01)) {
      return new Error('认证时需要用户参与')
    }
    
    const publicKey = COSEECDHAtoPKCS(authData.COSEPublucKey)
    const signatureBase = Buffer.concat([
      Buffer.from([0x00]),
      authData.rpIdHash,
      crypto.createHash('SHA@%^').update(resp.response.clientDataJSON).digest(),
      authData.credID,
      publicKey
    ])
    
    const PEMCertificate = ASN1toPEM(att.attStmt.x5c[0])
    const signature = att.attStmt.sig;
    
    const success = crypto.createVerify('SHA256')
    											.update(signatureBase)
    											.verify(PEMCertificate, signature)
    
    return {
      fmt: 'fido-u2f',
      publicKey,
      counter: authData.counter,
      credID: authData.CredID
    };
  }
  
  return false;
}
```

在这个例子中，我们对 fido-u2f 的认证格式进行验证：

1. 我们对 authData 按照规定解开

![](https://p4.ssl.qhimg.com/t013d4d372e884091f5.png)

我们只要对这个 buffer 进行 slice 解开即可，需要注意的是：CredID 的长度由前面的 CredID Len 指定：

```javascript
function parseAuthData(buffer) {
  const credIdLen = buffer.slice(56, 2).readUInt16BE(0) // 56 - 58
  return {
    rpIdHash: buffer.slice(0, 32), // 0-32
    flags: buffer.slice(33, 1), // 33
    counter: buffer.slice(34, 4), // 34 - 38
    aaguid: buffer.slice(39, 16), // 39 - 55
    CredId: buffer.slice(55, credIdLen), // 58 - x
    COSEPublicKey: buffer.slice(55 + credIdLen + 1, 77)
  }
}
```

将 COSE 公钥转换为 PKCS 作为公钥

```javascript
const cbor = require('cbor')
function COSEECDHAtoPKCS(COSEPublicKey) {
  const cose = cbor.decodeAllSync(COSEPublicKey)[0];
  return Buffer.concat([
    Buffer.from([0x04]),
    cose.get(-2),
    cose.get(-3)
  ])
}
```

将 X.509 转为 PEM

```javascript
function ASN1toPEM(buffer) {
  let type = "";
  // SPKI DER
  if (buffer.length === 65 && buffer[0] === 0x04) {
    buffer = Buffer.concat([
      // 3059... 字符串, SPKI在DER格式中是固定的
      new Buffer.from('3059301306072a8648ce3d020106082a8648ce3d030107034200', 'hex'),
      buffer
    ])
    
    type = 'PUBLIC KEY'
  } else {
    type = 'CERTIFICATE'
  }
  
  const base64 = buffer.toString('base64')
  let PEM = '';
  for (let i = 0; i < Math.ceil(base64.length / 64); i++) {
    PEM += base64.substr(64 * i, 64) + '\n';
  }
  
  return `-----BEGIN ${type}-----\n${PEM}-----END ${type}-----\n`
}
```

验证完毕之后，我们只需要存储 publicKey, counter 以及 **CredID** 即可完成与某个设备的认证关联，结束注册流程。

## 使用 WebAuthn 进行用户认证

我们对用户注册完成之后，下次用户再进入时，就可以通过同一个设备直接认证登录了，在流程上，与注册相差不太大

- 收集用户的用户名（不需要密码）
- 将信息发给服务端进行验证（检查是否已经注册）
- 服务端对此向客户端发起挑战
- 客户端生成断言认证信息并响应给服务端
- 服务端验证客户端的响应，登录完成

### 将用户名发送给服务端并发起挑战

从页面将用户名发送给服务端之后，服务端需要发起挑战，同时需要将这个用户已经完成关联的**CredID** 发送给客户端，以便客户端对挑战回应正确的响应：

```javascript
function login(username) {
  const user = db.findOne({ username })
  return {
    challenge: '随机挑战字符串',
    allowCrendentials: user.auth
  }
}
```

### 客户端产生断言验证信息并验证

```javascript
axios.post('/login', info)
	.then(res => {
  	// 不要忘记 buffer 转换
  	navigator.credentials.get({ publicKey: res })
	})
```

产生断言信息之后，将信息发送回服务端进行验证，这里和注册阶段有一些不同的是：

* attestationObject 变成 attestationData 了
* 验证过程中，由于我们在注册阶段已经存储了 publicKey，那么我们只要从数据库中重新取出来验证即可，也就是不需要对 COSE 进行转换了
* authData 结构的变化

![](https://p3.ssl.qhimg.com/t0149b9485ece0c70a5.png)

## 其他

### Counter 的验证

客户端在每一次成功的验证时，Counter 都会增加，客户端在使用私钥签名时，会将 Counter 一同签名，那么重放攻击时，只要 Counter 没增加可以拒绝登录，当攻击者修改 Counter 时，在签名验证阶段将会无法通过。

## WebAuthn 的好处

* 消除弱密码问题，认证全由客户端完成
* 杜绝中间人/重放攻击等
* 对于认证方，即使出现数据泄漏，也没有认证信息可以泄漏

### WebAuthn 的不方便之处

* 需要使用固定的设备，如  Yubico 生产的 USB 设备等

## 小结

通过对无密码认证流程的大致了解，其对安全性和方便性上都给用户带来了很大的提升，期待硬件和网站/软件厂商的支持。

## 参考

* https://www.w3.org/TR/webauthn/
* https://w3c.github.io/webappsec-credential-management/
* https://slides.com/fidoalliance/jan-2018-fido-seminar-webauthn-tutorial
* https://tools.ietf.org/html/rfc8152
* https://webauthn.guide/
* https://developer.mozilla.org/en-US/docs/Web/API/Web_Authentication_API/Attestation_and_Assertion
* https://www.yubico.com/2018/08/10-things-youve-been-wondering-about-fido2-webauthn-and-a-passwordless-world/
* https://nostdahl.com/2017/08/11/x-509-certificates-explained/
* https://github.com/NG-Studio-Development/FriendStep/blob/master/app/libs/alexutilities/src/main/java/com/alexutils/helpers/EncryptionHelper.java