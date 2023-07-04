const path = require("path");

const prod = process.env.NODE_ENV === "production";

/**
 * @type {import('@rspack/cli').Configuration}
 */
module.exports = {
  context: __dirname,
  entry: {
    main: "./src/main.tsx",
  },
  output: {
    filename: "[contenthash].js",
    chunkFilename: "[contenthash].chunk.js",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  devtool: prod ? false : "source-map",
  builtins: {
    html: [
      {
        template: "index.html",
        favicon: "favicon.ico",
        minify: true,
      },
    ],
  },
  devServer: {
    historyApiFallback: true,
    proxy: {
      "/api": "http://127.0.0.1:3000",
      "/files": "http://127.0.0.1:3000",
    },
  },
  module: {
    rules: [
      {
        test: /\.less$/,
        use: [
          {
            loader: "less-loader",
            options: {
              sourceMap: true,
            },
          },
        ],
        type: "css",
      },
      {
        test: /\.module.less$/,
        use: [
          {
            loader: "less-loader",
            options: {
              sourceMap: true,
            },
          },
        ],
        type: "css/module",
      },
      {
        test: /\.(png)|(jpe?g)$/,
        type: "asset",
      },
    ],
  },
};
