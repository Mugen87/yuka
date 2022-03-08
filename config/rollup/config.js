import path from 'path';
import license from 'rollup-plugin-license';

export default {
	input: 'src/yuka.js',
	plugins: [
		license( {
			banner: {
				content: {
					file: path.join( __dirname, '../../LICENSE' )
				}
			}
		} )
	],
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
