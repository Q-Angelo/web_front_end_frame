# 前端项目工程架构

## 目录
- [实例演示](#实例演示)
- [Webapp架构简介](#webapp架构简介)
    - [工程架构目标](#工程架构目标)

- [技术选型](#技术选型)

- [Webpack配置](#webpack配置)
    - [新建.babelrc文件](#新建.babelrc文件)
    - [build目录下新建webpack.config.client.js](#build目录下新建webpack.config.client.js)
    - [build目录下新建webpack.config.server.js](#build目录下新建webpack.config.server.js)

- [Nodejs服务端渲染](#nodejs服务端渲染)
    - [导出需要在服务端渲染的内容](#导出需要在服务端渲染的内容)
    - [对导出需要在服务端渲染的内容进行webpack打包](#对导出需要在服务端渲染的内容进行webpack打包)
    - [NodeJs服务端正式环境渲染](#nodejs服务端正式环境渲染)
    - [NodeJs服务端测试环境渲染代码实现](#nodejs服务端测试环境渲染代码实现)
    - [nodecommon实现服务端热启动](#nodecommon实现服务端热启动)

- [Eslint代码规范](#eslint规范代码)

- [编辑器代码规范.editorconfig](#编辑器代码规范editorconfig)

## 实例演示

#### 技术栈

> React+Mobx+Webpack+NodeJs+Eslint

#### 下载

> git clone git@github.com:Q-Angelo/web_front_end_frame.git
cd web_front_end_frame
npm i

#### 运行

> npm run dev:client 开启测试环境 客户端代码
npm run dev:server 开始测试环境 服务端代码
npm run build 开启正式环境

## webapp架构简介

#### 工程架构目标

> 解放生产力，在开发过程中，主要时间聚焦在业务代码上，可以自动打包，自动更新页面显示，自动处理图片依赖，保证开发和正式环境统一，不用去考虑一些其他的重复性操作、比如目录复制，服务重启，代码修改后浏览器刷新等一些操作。

> 围绕解决方案搭建环境，不同的前端框架需要不同的运行架构，预期可能出现的问题并进规避，比如样式使用css还是less等。

> 保证项目质量，code lint进行代码审查，不同系统环境排除差异(Mac、windows)，git commit进行预处理。

## 技术选型

* 前端框架React.Js
* 数据存储Mobx
> Mobx是flux实现的后起之秀，其以更简单的使用和更少的概念，让flux使用起来变得更加简单。相比Redux有mutation、action、dispatch等概念，Mobx则更符合对一个store增删改查的操作概念。
* 服务端渲染Nodejs

## 项目文件结构
<pre>
├── client                   业务代码目录
  ├── build                  webpack编译文件
  ├── components             定义Redux的各个action
  ├── config                 配置目录
    ├── app.js               应用入口
    ├── app.jsx              声明整个页面上的一些内容
  ├── views                  项目功能模块的页面
  ├── store                  store相关的文件，包括数据获取的封装等。
</pre>

## webpack配置

#### 新建.babelrc文件

安装插件

```bash
npm i babel-preset-es2015 babel-preset-es2015-loose babel-preset-react -D
```

presets代表babel现在所支持的语法

```js
 {
    "presets": [
        ["es2015", { "loose": true}], // loose表示松散的不是非常严格的
        "react"
    ],
    "plugins": [
        "react-hot-loader/babel"
    ]
 }
```

#### build目录下新建webpack.config.client.js

安装插件

```bash
npm i babel-loader -D
npm i babel-core -D
npm i html-webpack-plugin -D
```

使用babel编译为浏览器可以执行的ES5代码,babel-loader需要babel-core做为核心代码

```js
const path = require('path')
const HTMLPlugin = require('html-webpack-plugin')
const webpack = require('webpack')

const isDev = process.env.NODE_ENV === 'development'
const config = {
  entry: {
    app: path.join(__dirname, '../client/app.js')
  },
  output: {
    filename: '[name].[hash].js',
    path: path.join(__dirname, '../dist'),
    publicPath: '/public/'
  },
  extends: ['js', 'jsx'],
  module: {
    rules: [
      {
        enforce: 'pre',
        test: /.(js|jsx)$/,
        loader: 'eslint-loader',
        exclude: [
          path.resolve(__dirname, '../node_modules')
        ]
      },
      {
        test: /.jsx$/,
        loader: 'babel-loader'
      },
      {
        test: /.js$/,
        loader: 'babel-loader',
        exclude: [
          path.join(__dirname, '../node_modules')
        ]
      }
    ]
  },
  plugins: [
    new HTMLPlugin({
      template: path.join(__dirname, '../client/template.html')
    })
  ]
}

if (isDev) {
  config.entry = {
    app: [
      'react-hot-loader/patch',
      path.join(__dirname, '../client/app.js')
    ]
  }

  /**
     * devServer是运行在内存里面，注意如果外面有dist目录，会从外部的dist目录找，这样会导致js文件404加载不了
     */
  config.devServer = {
    host: '0.0.0.0',
    port: '8888',
    contentBase: path.join(__dirname, '../dist'),
    hot: true,
    overlay: { // 编译过程中出现的错误，在网页中进行显示
      errors: true
    },
    publicPath: '/public',
    historyApiFallback: {
      index: '/public/index.html'
    }
  }

  config.plugins.push(new webpack.HotModuleReplacementPlugin())
}

module.exports = config
```

* webpack dev server
是webpack官网开发的能够帮助我们开启一个web服务器，它的文件在编译过程中是存在于内存中的

* Hot module replacement

我们在项目开发中编辑了代码，可以让我们在页面上无刷新的看到效果

#### build目录下新建webpack.config.server.js

这块属于服务端渲染配置，在下面会有介绍 [对导出需要在服务端渲染的内容进行webpack打包](#对导出需要在服务端渲染的内容进行webpack打包)

## nodejs服务端渲染

#### 导出需要在服务端渲染的内容

client目录下新建server-entry.js文件

```js
import React from 'react';
import App from './App.jsx';

export default <App />
```

#### 对导出需要在服务端渲染的内容进行webpack打包

build根目录下新建webpack.config.server.js文件

```js
const path = require('path')

module.exports = {
  target: 'node',
  entry: {
    app: path.join(__dirname, '../client/server-entry.js')
  },
  output: {
    filename: 'server-entry.js',
    path: path.join(__dirname, '../dist'),
    publicPath: '/public',
    libraryTarget: 'commonjs2' // 适用nodejs端
  },
  module: {
    rules: [
      {
        enforce: 'pre',
        test: /.(js|jsx)$/,
        loader: 'eslint-loader',
        exclude: [
          path.resolve(__dirname, '../node_modules')
        ]
      },
      {
        test: /.jsx$/,
        loader: 'babel-loader'
      },
      {
        test: /.js$/,
        loader: 'babel-loader',
        exclude: [
          path.join(__dirname, '../node_modules')
        ]
      }
    ]
  }
}

```

#### nodejs服务端正式环境渲染

server目录下新建app.js

```js
const express = require('express')
const ReactSSR = require('react-dom/server')
const fs = require('fs')
const path = require('path')
const app = express()
const isDev = process.env.NODE_ENV === 'development'

if (!isDev) {
  const serverEntry = require('../dist/server-entry').default
  const template = fs.readFileSync(path.join(__dirname, '../dist/index.html'), 'utf8')

  app.use('/public', express.static(path.join(__dirname, '../dist')))

  app.get('*', (req, res) => {
    const appString = ReactSSR.renderToString(serverEntry)

    res.send(template.replace('<!-- <app> -->', appString))
  })
} else { // develop环境
  const devStatic = require('./util/dev-static')

  devStatic(app)
}

app.listen(3333, () => {
  console.log('server is listening on 3333')
});
```

#### nodejs服务端测试环境渲染代码实现

新建 server/util/dev-static.js

```js
const axios = require('axios')
const path = require('path')
const MemoryFs = require('memory-fs')
const webpack = require('webpack')
const ReactDomServer = require('react-dom/server')
const serverConfig = require('../../build/webpack.config.server')
const proxy = require('http-proxy-middleware')

// 拿到template文件
const getTemplate = () => {
  return new Promise((resolve, reject) => {
    axios.get('http://localhost:8888/public/index.html')
      .then(res => {
        resolve(res.data)
      })
      .catch(reject)
  })
}

/**
 * 获取server端bundle
 * 因为server端bundle是通过webpack.config.server.js配置文件启动webpack之后拿到的 ，而且client更改的任何文件，服务端都需要去实时更新
 * 1. require模块webpack
 * 2. 加载server端webpack.config.server.js配置文件
 * 3. 通过webpack和它的配置启动一个compiler
 * 4. 这个compiler监听它下面所依赖的文件，一旦有变化，重新去打包
 * 5. memory-fs模块从内存里面读写文件
 */

const mfs = new MemoryFs()
const serverCompiler = webpack(serverConfig)

// 设置文件的读写从fs硬盘读写改变为内存mfs读写
serverCompiler.outputFileSystem = mfs // 会将文件写入内存
let serverBundle
serverCompiler.watch({}, (err, stats) => {
  if (err) {
    throw err
  }

  stats = stats.toJson()
  stats.errors.forEach(err => console.error(err))
  stats.warnings.forEach(warn => console.error(warn))

  // 获取bundle路径
  const bundlePath = path.join(
    serverConfig.output.path,
    serverConfig.output.filename
  )

  // 读取bundle, 注意此处读到的是string类型的内容，并不是我们在js里面可以直接使用容模块的内容
  const bundle = mfs.readFileSync(bundlePath, 'utf-8')

  // 通过module.constructor构造方法创建一个新的module
  const Module = module.constructor
  const m = new Module()
  // 用module去解析javascript String的内容，它会给我们去生成一个新的模块
  m._compile(bundle, 'server-entry.js') // 指定一个名字

  serverBundle = m.exports.default
})

module.exports = app => {
  // 都在内存里面没有静态文件夹生成
  app.use('/public', proxy({
    target: 'http://localhost:8888'
  }))

  // 返回服务端渲染结果给浏览器端
  app.get('*', (req, res) => {
    getTemplate().then(template => {
      const content = ReactDomServer.renderToString(serverBundle, 'utf-8')

      res.send(template.replace('<!-- <app> -->', content))
    })
  })
}
```

#### nodecommon实现服务端热启动

安装插件 npm i nodemon -D

根目录下创建nodemon.json配置文件

```js
{
    "restartable": "rs", // 有这个命令nodemon重启服务才会使用这个配置
    // 忽略某些文件的变化
    "ignore": [
        "build",
        "client",
        "node_modules/**/node_modules",
        ".babelrc",
        ".editorconfig",
        ".eslintrc",
        ".gitignore",
        "package-lock.json",
        "package.json",
        "README.md"
    ],
    "env": {
        "NODE_ENV": "development"
    },
    "ext": "js", // 哪些类型的文件变化后会启动
    "verbose": true // 输出相信错误信息
}
```

## eslint规范代码

> eslint是一个随着ECMAScript版本一直更新的Js lint工具，用来规范我们的代码

#### 安装依赖

```
npm i eslint -D
```

```
npm i babel-eslint \
\eslint-config-airbnb \
\eslint-config-standard \
\eslint-loader \
\eslint-plugin-import \
\eslint-plugin-jsx-a11y \
\eslint-plugin-node \
\eslint-plugin-promise \
\eslint-plugin-react \
\eslint-plugin-standard -D
```

#### 项目根目录建立.eslintrc文件

```js
{
  "extends": "standard", // 标准js使用的一些规则
}
```

#### 在客户端建立.eslintrc文件，规范react的jsx语法

```bash  touch ./client/.eslintrc  ```

```js
{
  "parser": "babel-eslint",
  "env": {
    "browser": true,
    "es6": true,
    "node": true
  },
  "parserOptions": {
    "ecmaVersion": 6,
    "sourceType": "module"
  },
  "extends": "airbnb", // 独角兽公司 Airbnb 的前端编码规范
  "rules": {
    "semi": [0]
  }
}
```

#### 在webpack配置中加入规则

```js
{
  modules.exports = {
    ...,
    module: {
      rules: [
        { //需要定义在其他规则之前
          enforce: 'pre',
          test: /.(js|jsx)$/,
          loader: 'eslint-loader',
          exclude: [
              path.resolve(__dirname, '../node_modules')
          ]
        },
        ...
      ]
    }
  }
}
```

#### git commit 之前进行项目eslint审查

安装husky是git的一个钩子代码提交之前会先执行precommit

``` npm i husky -D ```

在package.json的scripts里面使用precommit，precommit里面的命令执行成功，才会进行git commit代码提交

```js
{
  "scripts": {
    "fix": "eslint --fix .",
    "lint": "eslint --ext .js --ext .jsx client/",
    "precommit": "npm run fix && npm run lint"
  },
}

```


## 编辑器代码规范editorconfig

> 用来统一不同的编辑器对文本的格式进行规范

webstorm编辑器已经集成该插件，使用vsCode、sublime等没有集成该插件的编辑器，需要在编辑器里安装该插件，使之生效

#### 项目根目录建立.editorconfig文件

```js
{
  root = true

  [*]
  charset = utf-8
  indent_style = space
  indent_size = 2
  end_of_line = lf // 行尾结束的风格
  insert_final_newline = true // 末尾自动加上空行
  trim_trailing_whitespace = true // 去掉行尾的空格
}
```
