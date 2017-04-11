const path = require('path'),
    fs = require('fs'),
    webpack = require('webpack'),
    HtmlWebpackPlugin = require('html-webpack-plugin');
let clientConfig
process.noDeprecation = true
clientConfig = {
    devtool: 'eval-source-map',
    context: path.resolve(__dirname, '.'),
    entry: {
        'whatwg-fetch': 'whatwg-fetch',
        bundle: './src/index.js'
    },
    output: {
        path: path.resolve(__dirname, './public'),
        filename: '[name].[chunkhash:8].js',
        chunkFilename: 'chunk.[name].[chunkhash:8].js',
        publicPath: '/'
    },
    module: {
        rules: [{
            test: /\.js$/,
            exclude: /node_modules/,
            loader: 'babel-loader',
            options: {
                presets: ['es2015', 'stage-0'],
                plugins: ['transform-runtime', 'add-module-exports'],
                cacheDirectory: true
            }
        }, {
            test: /\.css$/,
            use: [
                'style-loader',
                'css-loader'
            ]
        }, {
            test: /\.scss$/,
            use: [
                'style-loader',
                {
                    loader: 'css-loader',
                    options: {
                        modules: true,
                        camelCase: true,
                        importLoaders: 1,
                        localIdentName: '[name]__[local]__[hash:base64:8]'
                    }
                },
                'sass-loader'
            ]
        }, {
            test: /\.(png|jpg|gif|webp|woff|woff2|eot|svg|ttf)$/,
            loader: 'url-loader',
            options: {
                limit: 8192
            }

        }, {
            test: /\.(mp3|mp4|ogg|svg)$/,
            loader: 'file-loader'

        }, {
            test: /\.json$/,
            loader: 'json-loader'
        }, {
            test: /\.html$/,
            loader: 'html-loader',
            options: {
                minimize: false
            }

        }],
    },

    resolve: { extensions: ['.js', '.json', '.scss'] },
    plugins: [
        new webpack.optimize.UglifyJsPlugin({
            compress: { warnings: false },
            comments: false
        }),
        new webpack.DefinePlugin({ 'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV) }),
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: 'index.html',
            //  chunksSortMode: 'none'
        }),
    ],
    devServer: {
        contentBase: path.resolve(__dirname, './public'), //本地服务器所加载的页面所在的目录
        historyApiFallback: true, //不跳转
        inline: true, //实时刷新
        port: 8080,
        //  hot: true  //热加载 在novnc中不可以使用异步（局部）刷新，只能使用浏览器完全刷新
    }
}
module.exports = [clientConfig]