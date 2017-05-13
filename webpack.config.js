const webpack = require("webpack");
const path = require('path');
const jszip = require('jszip');

module.exports = {
    entry: {
        options: path.join(__dirname, 'src/options.ts'),
        background: path.join(__dirname, 'src/background.ts'),
        vendor: ['jszip']
    },
    output: {
        path: path.join(__dirname, 'dist/js'),
        filename: '[name].js'
    },
    module: {
        loaders: [{
            exclude: /node_modules/,
            test: /\.tsx?$/,
            loader: 'ts-loader'
        }]
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js']
    },
    plugins: [
        new webpack.optimize.CommonsChunkPlugin({
            name: 'vendor',
            minChunks: Infinity
        })
    ]
};