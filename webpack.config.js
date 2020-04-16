const path = require('path');

module.exports = {
    entry: {
        options: path.join(__dirname, 'src/chrome-options.ts'),
        background: path.join(__dirname, 'src/chrome-background.ts')
    },
    mode: "production",
    module: {
        rules: [
            {
                test: /\.ts$/,
                loader: "awesome-typescript-loader",
                exclude: /node_modules/,
                options: {
                    configFileName: 'tsconfig-build.json'
                },
            },
        ],
    },
    resolve: {
        extensions: ['.ts', '.js'],
    },
    output: {
        path: path.join(__dirname, 'dist/js'),
        filename: '[name].js'
    },
};