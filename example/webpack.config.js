var path = require('path')
var webpack = require('webpack')

module.exports = {
	entry: path.resolve(__dirname, './src/main.js'),
	output: {
		path: path.resolve(__dirname, './dist'),
		publicPath: '/dist/',
		filename: 'build.js'
	},
	resolve: {
		extensions: ['.js', '.vue']
	},
	module: {
		loaders: [{
				test: /\.vue$/,
				loader: 'vue-loader',
				options: {
					hmr: false,
					preserveWhitespace: false,
					optimizeSSR: false,
					hotReload: false,
					loaders: {
						js: {
							loader: 'babel-loader',
							options: {
								highlightCode: false,
							}
						},
					},
				}
		}, {
				test: /\.js$/,
				loader: 'babel-loader',
				exclude: /node_modules/
		}]
	},
	devServer: {
		historyApiFallback: true,
		port: 9000,
		noInfo: true
	},
	devtool: '#inline-source-map'
}

if (process.env.NODE_ENV === 'production') {
	module.exports.devtool = '#source-map'
	// http://vue-loader.vuejs.org/en/workflow/production.html
	module.exports.plugins = (module.exports.plugins || []).concat([
		new webpack.DefinePlugin({
			'process.env': {
				NODE_ENV: '"production"'
			}
		}),
		new webpack.optimize.UglifyJsPlugin({
			compress: {
				warnings: false
			}
		})
	])
}