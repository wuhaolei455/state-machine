const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './index.tsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    clean: true,
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    // 允许解析父目录的模块
    modules: ['node_modules', path.resolve(__dirname, '../../')],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              // 允许处理父目录的TypeScript文件
              allowTsInNodeModules: false,
              transpileOnly: true, // 只转译，不进行类型检查（类型检查在IDE中完成）
              configFile: path.resolve(__dirname, 'tsconfig.json'),
              // 忽略 rootDir 检查错误
              ignoreDiagnostics: [6059],
            },
          },
        ],
        // 只排除node_modules，不排除父目录的src
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html',
      filename: 'index.html',
    }),
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    compress: true,
    port: 3000,
    hot: true,
    open: true,
  },
  devtool: 'source-map',
};

