const mix = require('laravel-mix');

class PackReact {
	/**
     * Register the component.
     *
     * When your component is called, all user parameters
     * will be passed to this method.
     *
     * Ex: register(src, output) {}
     * Ex: mix.yourPlugin('src/path', 'output/path');
     *
     * @param  {*} ...params
     * @return {void}
     *
     */
	register(...packages) {
		this.packages = packages;
	}

	/**
     * The optional name to be used when called by Mix.
     * Defaults to the class name, lowercased.
     *
     * Ex: mix.example();
     *
     * @return {String|Array}
     */
	name() {
		return ['packReact'];
	}

	/**
     * All dependencies that should be installed by Mix.
     *
     * @return {Array}
     */
	dependencies() {
		// Example:
		return ['@ovac4u/babel-preset-react', ...this.packages];
	}

	/**
     * Boot the component. This method is triggered after the
     * user's webpack.mix.js file has executed.
     */
	boot() {
		/**	
         * This will add functionality for reading reading the 
         * REACT_APP_ namespace from the enviroment variables.
         */
		Mix.listen('loading-plugins', plugins => {
			const _ = require('lodash');

			// Retieve the DefinePlugin from the webpack plugins
			let define = _.find(plugins, plugin => {
				return plugin.constructor.name === 'DefinePlugin';
			});

			// Redefine the process.env.* at compile time.
			define.definitions['process.env'] = _.transform(
				{
					// Filter all enviroment variables containing react app.
					..._.pickBy(process.env, (val, key) => /^REACT_APP_/i.test(key))
				},
				// Stringify the values of each result
				(result, value, key) => (result[key] = JSON.stringify(value)) && result,
				// Add all the rest of the initial env variables (MIX).
				define.definitions['process.env']
			);

			//Log the javaescipt env variables to the console.
			console.log(define.definitions['process.env']);
		});
	}

	/**
     * Rules to be merged with the master webpack loaders.
     *
     * @return {Array|Object}
     */
	webpackRules() {
		return {
			test: /\.(jsx|js)$/,
			exclude: new RegExp('/(node_modules/(?!(' + this.packages.join('|') + ')/).*|bower_components)/'),
			use: [
				{
					loader: require.resolve('babel-loader'),
					options: {
						presets: ['@ovac4u/react']
					}
				}
			]
		};
	}

	/**
     * Override the generated webpack configuration.
     *
     * @param  {Object} webpackConfig
     * @return {void}
     */
	webpackConfig(webpackConfig) {
		// Example:
		webpackConfig.resolve.extensions.push('.js', '.jsx');
	}

	/**
     * Babel config to be merged with Mix's defaults.
     *
     * @return {Object}
     */
	babelConfig() {
		return { presets: ['@babel/preset-react'] };
	}
}

mix.extend('packReact', new PackReact());
