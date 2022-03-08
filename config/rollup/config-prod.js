import { terser } from 'rollup-plugin-terser';

export default {
	input: 'src/yuka.js',
	plugins: [ terser() ],
	output: [
		{
			format: 'umd',
			name: 'YUKA',
			file: 'build/yuka.min.js'
		}
	]
};
