const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const path = require("path");
const webpack = require("webpack");
const child_process = require("child_process");

function git(command) {
  return child_process.execSync(`git ${command}`, { encoding: "utf8" }).trim();
}

const devMode = process.env.NODE_ENV !== "production";

// on production builds only, use robots.txt.production as the robots.txt file.
// This bit of config is used with the CopyWebpackPlugin below.
const robotsTxtForProd =
  process.env.ENVIRONMENT === "production"
    ? [
        {
          from: "public/robots.txt.production",
          to: "robots.txt",
        },
      ]
    : [];

module.exports = {
  entry: ["./src/index.tsx"],
  output: {
    path: path.resolve(__dirname, "./html"),
    filename: "static/[name].[contenthash].js",
    assetModuleFilename: "static/[name].[contenthash][ext][query]",
    clean: true,
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [
          devMode ? "style-loader" : MiniCssExtractPlugin.loader,
          {
            loader: "css-loader",
            options: {
              importLoaders: 1,
            },
          },
        ],
      },
      {
        test: /\.svg$/,
        type: "asset",
        use: "svgo-loader",
      },
      {
        test: /\.ttf$/,
        type: "asset",
      },
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "src/index.html",
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: "public",
          globOptions: {
            ignore: ["**/readme.md", "**/robots.txt.production"],
          },
        },
        ...robotsTxtForProd,
      ],
    }),
    // see https://webpack.js.org/plugins/environment-plugin/
    // the values here are defults if the envvar wasn't set when this build was invoked
    new webpack.EnvironmentPlugin({
      GIT_VERSION: git("describe --always --dirty=-modified"),
      ENVIRONMENT: "local",
    }),
  ].concat(
    devMode
      ? []
      : [
          new MiniCssExtractPlugin({
            filename: "static/[name].[contenthash].css",
          }),
        ]
  ),
  devServer: {
    client: {
      // display compilation error messages on the screen
      overlay: true,
    },
    open: ["/"],
    historyApiFallback: true,
    proxy: {
      "/api": {
        target: "https://subscriptions.bsg.brave.software",
        pathRewrite: { "^/api": "" },
        changeOrigin: true,
      },
    },
  },
  optimization: {
    minimizer: [`...`, new CssMinimizerPlugin()],
  },
};
