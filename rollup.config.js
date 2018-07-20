export default {
	input: 'src/yuka.js',
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
