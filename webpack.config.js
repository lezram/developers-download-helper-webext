const path = require('path');

module.exports = {
    entry: {
        options: path.join(__dirname, 'src/options.ts'),
        background: path.join(__dirname, 'src/background.ts')
    },
    mode: "production",
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: [{
                    loader: 'ts-loader',
                    options: {
                        configFile: "tsconfig-build.json"
                    }
                }],
                exclude: /node_modules/,

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
