const path = require('path');
const webpack = require('webpack');
const fs = require('fs');

// webpack.config.js
module.exports = {
  entry: {
    "enhance-npm-community": path.join(__dirname, 'src', 'index.js'),
    "enhance-npm-community.min": path.join(__dirname, 'src', 'index.js'),
  },
  output: {
    path: path.join(__dirname, '/dist'),
    filename: '[name].user.js'
  },
  resolve: {
    extensions: ['.coffee', '.js']
  },
  module: {
    loaders: [
      {
        test: /\.css$/,
        use: [
          {loader: "style-loader"},
          {loader: "css-loader"},
        ],
      },
      {
        test: /\.useable\.css$/,
        use: [
          {
            loader: "style-loader/useable"
          },
          {loader: "css-loader"},
        ],
      },
      {
        test: /\.(jsx|js)?$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel-loader',
        query: {
          presets: [
            ['es2015', {modules: false}],
            'es2016',
            'es2017'
          ],
          plugins: [
            "transform-flow-strip-types",
            "transform-inline-environment-variables",
            "transform-safely",
            "transform-runtime",
            ["transform-strict-mode", {
              "strict": true
            }],
            "babili"
          ],
          "parserOpts": {
            "plugins": ["flow"]
          }
        }
      }
    ]
  },
  plugins: [
    new webpack.LoaderOptionsPlugin({
      minimize: true,
      debug: false
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: {warnings: false},
      sourceMap: false,
      test: /\.min\.user\.js$/
    }),
    new webpack.BannerPlugin({
      banner: `${require('./meta')}
/**
${fs.readFileSync('./LICENSE')}
**/
`,
      entryOnly: true,
      raw: true
    })
  ]
};