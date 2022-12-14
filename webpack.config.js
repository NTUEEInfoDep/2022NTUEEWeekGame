const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const webpack = require('webpack') //to access built-in plugins
// const Dotenv = require("dotenv-webpack");
require('dotenv').config({ path: './.env' })

module.exports = {
  context: path.resolve(__dirname, 'client'),
  entry: {
    bundle: './lib/index.js',
  },
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: '[name].js',
    clean: true,
  },
  resolve: {
    extensions: ['.js'],
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },

  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin()],
  },

  devServer: {
    stats: {
      children: false, // cleaner display on terminal
      maxModules: 0, // cleaner display on terminal
      colors: true,
      hot: true,
    },
  },

  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: './index.html',
    }),
    new CopyWebpackPlugin({
      patterns: [{ from: 'assets', to: 'assets' }],
    }),
    // new Dotenv({
    //   path:
    //     process.env.NODE_ENV === "./.env",
    //   systemvars: true, // 允許讀取 process.env 下的任意系統變量
    // }),
    new webpack.DefinePlugin({
      'process.env': {
        PUBLIC_KEY: JSON.stringify(process.env.PUBLIC_KEY),
      },
    }),
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
      process: 'process/browser',
    }),
  ],
}
