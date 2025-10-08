const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const isProduction = process.env.NODE_ENV === 'production';
const mode = isProduction ? 'production' : 'development';

module.exports = [
  {
    mode: mode,
    entry: './src/main/main.ts',
    target: 'electron-main',
    module: {
      rules: [
        {
          test: /\.ts$/,
          include: /src/,
          use: [{ loader: 'ts-loader' }]
        },
        {
          test: /\.node$/,
          use: 'node-loader'
        }
      ]
    },
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'main.js'
    },
    plugins: [
      new CopyWebpackPlugin({
        patterns: [
          {
            from: 'node_modules/pdfkit/js/data',
            to: 'data'
          },
          {
            from: 'assets',
            to: 'assets'
          }
        ]
      })
    ],
    resolve: {
      extensions: ['.ts', '.js']
    },
    externals: {
      'sharp': 'commonjs sharp'
    },
    node: {
      __dirname: false,
      __filename: false
    }
  },
  {
    mode: mode,
    entry: './src/main/preload.ts',
    target: 'electron-preload',
    module: {
      rules: [
        {
          test: /\.ts$/,
          include: /src/,
          use: [{ loader: 'ts-loader' }]
        }
      ]
    },
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'preload.js'
    },
    resolve: {
      extensions: ['.ts', '.js']
    }
  },
  {
    mode: mode,
    entry: './src/renderer/index.tsx',
    target: 'electron-renderer',
    devtool: isProduction ? false : 'source-map',
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          include: /src/,
          use: [{ 
            loader: 'ts-loader',
            options: {
              transpileOnly: false,
              compilerOptions: {
                noEmit: false
              }
            }
          }]
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader']
        }
      ]
    },
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'renderer.js'
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './public/index.html'
      }),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: 'public/icon.png',
            to: 'icon.png'
          },
          {
            from: 'assets/globe.svg',
            to: 'globe.svg'
          }
        ]
      })
    ],
    resolve: {
      extensions: ['.tsx', '.ts', '.js']
    },
    cache: false
  }
];
