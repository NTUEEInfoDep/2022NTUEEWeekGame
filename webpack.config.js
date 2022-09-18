const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require("webpack"); //to access built-in plugins

module.exports = {
  context: path.resolve(__dirname, "client"),
  entry: {
    bundle: "./lib/index.js",
    // game: "./lib/game/DinoGame.js",
  },
  output: {
    path: path.resolve(__dirname, "build"),
    filename: "[name].js",
    clean: true,
  },
  resolve: {
    extensions: [".js"],
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
          },
        },
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      // {
      //   test: /\.(png|svg|jpg|gif)$/,
      //   use: {
      //     loader: "file-loader",
      //     options: {
      //       name: "[path][name].[ext]",
      //     },
      //   },
      // },
      // {
      //   test: /\.(woff|woff2|eot|ttf|otf)$/i,
      //   use: {
      //     loader: "file-loader",
      //     options: {
      //       name: "[path][name].[ext]",
      //     },
      //   },
      // },
      // {
      //   test: /\.(mp3|wav)$/i,
      //   use: {
      //     loader: "file-loader",
      //     options: {
      //       name: "[path][name].[ext]",
      //     },
      //   },
      // },
      // {
      //   test: /\.html$/i,
      //   loader: "html-loader",
      // },
    ],
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
      filename: "index.html",
      template: "./index.html",
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: "assets", to: "assets" },
      ],
    }),
  ],
};
