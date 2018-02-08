const webpack = require('webpack')
const path = require('path')

module.exports = {
	devtool: 'cheap-module-source-map',
	entry: './src/vue-collection-cluster.vue',
	output: {
		path: path.resolve(__dirname, './dist/'),
		filename: 'vue-collection-cluster.js',
		library: 'VueCollectionCluster',
		libraryTarget: 'umd',
	},
	resolve: {
		extensions: ['.js', '.vue'],
		alias: {
			'vue$': 'vue/dist/vue.common.js',
		}
	},
	module: {
		loaders: [{
				test: /\.js$/,
				loader: 'babel-loader',
				include: __dirname,
				exclude: /node_modules/
			},
			{
				test: /\.vue$/,
				loader: 'vue-loader',
				include: __dirname,
				exclude: /node_modules/,
			}
		]
	},
	plugins: [
		new webpack.LoaderOptionsPlugin({
			minimize: true
		}),
		new webpack.optimize.UglifyJsPlugin({
			beautify: false,
			comments: false,
			compress: {
				warnings: false
			}
		}),
		new webpack.DefinePlugin({
			'process.env': {
			  NODE_ENV: '"production"'
			}
		}),
	]
}