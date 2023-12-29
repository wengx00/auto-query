# 自动查询

本项目为使用NodeJS编写的自动成绩查询脚本，适用于华南师范大学教务系统。

正确配置推送Token和账号密码，启动脚本后将在一定阈值（默认为180秒）轮询目标学期的个人期末成绩，如果查询结果与上一次查询结果不同，将产生更新，把结果通过微信推送到绑定者手机上。

脚本只在登录失效时自动重新登录，并不会高频登录校园网导致账号被锁定。（高频登录将使账号被锁定1小时）

**运行环境：Node.js v18.0+**

> Node.js官网：https://nodejs.org/en

macOS下推荐使用`homebrew`安装Node.js，只需执行：

```shell
brew install node@18
brew link --overwrite --force node@18
```


## 一、下载依赖

```shell
npm install -g yarn
yarn install
```

## 二、申请WxPusher Token

脚本会调用WxPusher的API，将更新后的查询结果通过微信推送的方式通知绑定者

> 官方文档：https://wxpusher.zjiecode.com/docs/#/

### 2.1 注册并创建应用

访问：https://wxpusher.zjiecode.com/admin/ ，使用微信扫码登录，在`应用管理` > `应用信息`处，新增（修改）一个应用，保存创建后的**AppToken**

### 2.2 创建主题

在`主题管理`处，新增一个主题，所属应用选择刚才新创建的应用。

创建完成后，保存（复制）生成的TopicId

### 2.3 绑定应用

用希望收到查询结果的微信扫描`应用管理` > `关注应用`的二维码，关注公众号即可。（只要不取消关注，就一直有效）


## 三、更改推送Token和校园网账号密码

1. 进入 `main.ts`

2. 修改配置

    ```typescript
    pushConfig.appToken = 'xxxxxx' // 刚才保存的WxPusher的AppToken
    pushConfig.summary = '推送标题' // 推送标题，可自定义
    pushConfig.topicIds = [10657] // TopicIds，将数字换为上面创建主题后生成的TopicId

    queryRef.current = {
        year: 2023, /* 2023-2024学年 */ 
        term: 3 /* 3 上学期 12 下学期 */
    } // 查询条件

    creeper({
        account: '20212131xxx',
        password: 'xxx'
    }) // 账号密码
    ```

3. 启动

    ```shell
    yarn start
    ```

    启动后自动由`pm2`进程守护方式持续运行，无需保持控制台激活状态。

4. 关闭

    ```shell
    yarn run remove
    ```

5. 查看运行状态

    ```shell
    yarn status
    ```

6. 查看运行日志

    ```shell
    yarn log
    ```

## 四、免责声明

本项目已在Github上开源，安全无后门（可以自行检查源码）。但开发者不为使用者的任何风险负责，包括但不限于账号锁定、信息泄漏等风险。

请使用者自觉遵守法律法规，仅作学习使用，禁止商用或利用脚本做出破坏性行为。

如果觉得不错的话，点点🌟star或者🍴fork吧