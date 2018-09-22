/**
 * @author Mugen87 / https://github.com/Mugen87
 *
 * Reference: https://github.com/mrdoob/three.js/blob/master/src/math/Math.js
 *
 */

const _Math = {

	clamp: ( value, min, max ) => {

		return Math.max( min, Math.min( max, value ) );

	},

	randFloat: ( min, max ) => {

		return min + Math.random() * ( max - min );

	},

	area( a, b, c ) {

		return ( ( c.x - a.x ) * ( b.z - a.z ) ) - ( ( b.x - a.x ) * ( c.z - a.z ) );

	}

};

export { _Math };
