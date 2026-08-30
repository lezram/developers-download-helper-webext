const path = require('path');

module.exports = (env, argv) => ({
    entry: {
        options: path.join(__dirname, 'src/options.ts'),
        background: path.join(__dirname, 'src/background.ts')
    },
    mode: "production",
    // eval based source maps are not allowed by the manifest v3 content security policy
    devtool: argv.mode === "development" ? "source-map" : false,
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
});
