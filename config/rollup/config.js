const fs = require( 'fs' );
const commenting = require( 'commenting' );

export default {
	input: 'src/yuka.js',
	plugins: [ {
		banner() {

			const text = fs.readFileSync( 'LICENSE', 'utf8' );
			return commenting( '@license\n' + text, { extension: '.js' } );

		}
	} ],
	output: [
		{
			format: 'umd',
			name: 'YUKA',
			file: 'build/yuka.js'
		},
		{
			format: 'es',
			file: 'build/yuka.module.js'
		}
	]
};
