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
  // extends: ['js', 'jsx'],
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
        loader: 'babel-loader' // 编译出来为浏览器可以执行的ES5代码,babel-loader需要babel-core做为核心代码 npm i babel-loader babel-core -D
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
    overlay: {
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
