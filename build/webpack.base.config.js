const path = require("path");
const nodeExternals = require("webpack-node-externals");
const FriendlyErrorsWebpackPlugin = require("friendly-errors-webpack-plugin");
const webpack = require('webpack');

module.exports = env => {
  return {
    target: "node",
    node: {
      __dirname: false,
      __filename: false
    },
    externals: [nodeExternals()],
    resolve: {
      alias: {
        env: path.resolve(__dirname, `../config/env_${env}.json`)
      }
    },
    devtool: "source-map",
    module: {
      rules: [{
          test: /\.js$/,
          exclude: /node_modules/,
          use: ["babel-loader"]
        },
        {
          test: /\.css$/,
          use: ["style-loader", "css-loader"]
        },
        {
          test: /\.(eot|svg|ttf|woff|woff2)$/,
          loader: 'file?name=public/fonts/[name].[ext]'
        }
      ]
    },
    plugins: [
      new FriendlyErrorsWebpackPlugin({
        clearConsole: env === "development"
      })
    ]
  };
};
