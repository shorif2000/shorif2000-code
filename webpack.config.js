const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
    entry: [
        'babel-polyfill',
        './app/index.js'
    ],
    output: {
        filename: '[name].bundle.js',
        path: __dirname + '/build',
        publicPath: '/'
    },
    module: {
        rules: [
            {
                test: /\.json$/,
                loader: "json-loader"
            },
            {
                test: /\.js[x]?$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
                query: {
                    cacheDirectory: true,
                    presets: [ 'es2015', 'es2016', 'es2017', 'latest', 'stage-0', 'react' ],
                    plugins: [ 'transform-runtime', 'transform-regenerator' ]
                }
            },
            {
                test: /\.css$/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: [
                        { loader: 'css-loader', options: { importLoaders: 1 } },
                        'postcss-loader'
                    ]
                })
            },
            {
                test: /\.(png|jpg|gif)$/,
                loader: "file-loader?name=img/img-[hash:6].[ext]"
            }
        ]
    },
    node: {
        fs: 'empty'
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: __dirname + '/app/index.html',
            filename: 'index.html',
            inject: true,
            hash: true // disable caching
        }),
    /*    new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': JSON.stringify('production')
            }
        }),*/
        new webpack.optimize.UglifyJsPlugin({
            //minimize: true,
            warnings: false,
            uglifyOptions: { compress: { unused: false } }
        }),
        new ExtractTextPlugin("[name].bundle.css")
    ]
};
