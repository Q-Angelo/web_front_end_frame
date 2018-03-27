# 前端项目工程架构(React+Webpack+NodeJs+Eslint)

## 目录
- Webpack常用配置
- NodeJs服务端渲染
- eslint代码规范(#eslint规范代码)

基于react、webpack实现cnode社区

## 项目文件结构
<pre>
├── client                   业务代码目录
  ├── components             定义Redux的各个action
  ├── config                 配置目录
  ├── views                  项目功能模块的页面
  ├── store                  store相关的文件，包括数据获取的封装等。

</pre>

Mobx是flux实现的后起之秀，其以更简单的使用和更少的概念，让flux使用起来变得更加简单。相比Redux有mutation、action、dispatch等概念，Mobx则更符合对一个store增删改查的操作概念。

## webpack常用配置

* webpack dev server
是webpack官网开发的能够帮助我们开启一个web服务器

* Hot module replacement

我们在项目开发中编辑了代码，可以让我们在页面上无刷新的看到效果


## NodeJs服务端测试环境渲染


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


## editorconfig

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
