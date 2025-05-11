const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  mode: "development",
  entry: "./src/index.js",
  devtool: "inline-source-map",
  target: "electron-renderer",
  module: {
    rules: [
      {
        test: /\.jsx?$/, // ✅ Now handles both .js and .jsx
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              [
                "@babel/preset-env",
                {
                  targets: {
                    esmodules: true,
                  },
                },
              ],
              "@babel/preset-react",
            ],
          },
        },
      },
      {
        test: /\.json$/, // ✅ Now supports JSON files
        type: "json",
      },
      {
        test: /\.css$/, // Handling CSS files
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg)$/i,
        use: [
          {
            loader: "file-loader",
            options: {
              name: "[name].[hash].[ext]", // This will create a hashed filename
              outputPath: "assets/images/", // The output directory for images
            },
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: [".js", ".jsx", ".json"], // ✅ Added .jsx and .json
  },
  output: {
    filename: "app.js",
    path: path.resolve(__dirname, "build", "js"),
    globalObject: "self", // Add this line
  },
};
