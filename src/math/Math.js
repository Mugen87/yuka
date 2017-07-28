const _Math = {

	clamp: ( value, min, max ) => {

		return Math.max( min, Math.min( max, value ) );

	},

	randFloat: ( min, max ) => {

		return min + Math.random() * ( max - min );

	}

};

export { _Math };
