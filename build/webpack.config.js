const path = require('path');
const HTMLPlugin = require('html-webpack-plugin');

const jsx = {
    test: /.jsx$/,
    loader: 'babel-loader', //编译出来为浏览器可以执行的ES5代码,babel-loader需要babel-core做为核心代码 npm i babel-loader babel-core -D
};

/**
 * 
 */

module.exports = {
    entry: {
        app: path.join(__dirname, '../client/app.js'),
    },
    output: {
        filename: '[name].[hash].js',
        path: path.join(__dirname, '../dist'),
        publicPath: '',
    },
    module: {
        rules: [
            {
                test: /.jsx$/,
                loader: 'babel-loader', //编译出来为浏览器可以执行的ES5代码,babel-loader需要babel-core做为核心代码 npm i babel-loader babel-core -D
            },
            {
                test: /.js$/,
                loader: 'babel-loader',
                exclude: [
                    path.join(__dirname, '../node_modules'),
                ],
            } 
        ]
    },
    plugins: [
        new HTMLPlugin()
    ]
}