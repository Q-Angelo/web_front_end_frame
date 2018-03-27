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
