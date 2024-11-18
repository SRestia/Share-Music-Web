const path = require("path");
const webpack = require("webpack");

// 根据 NODE_ENV 环境变量或默认使用 'development'
const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
    entry: "./src/index.js",
    output: {
        path: path.resolve(__dirname, "./static/js"),
        filename: "[name].js",
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                },
            },
        ],
    },
    optimization: {
        minimize: true,
    },
    plugins: [
        new webpack.DefinePlugin({
            "process.env.NODE_ENV": JSON.stringify(isProduction ? 'production' : 'development'),
        }),
    ],
};
