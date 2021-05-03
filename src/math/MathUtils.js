const lut = new Array();

for ( let i = 0; i < 256; i ++ ) {

	lut[ i ] = ( i < 16 ? '0' : '' ) + ( i ).toString( 16 );

}

/**
* Class with various math helpers.
*
* @author {@link https://github.com/Mugen87|Mugen87}
*/
class MathUtils {

	/**
	* Computes the signed area of a rectangle defined by three points.
	* This method can also be used to calculate the area of a triangle.
	*
	* @param {Vector3} a - The first point in 3D space.
	* @param {Vector3} b - The second point in 3D space.
	* @param {Vector3} c - The third point in 3D space.
	* @return {Number} The signed area.
	*/
	static area( a, b, c ) {

		return ( ( c.x - a.x ) * ( b.z - a.z ) ) - ( ( b.x - a.x ) * ( c.z - a.z ) );

	}

	/**
	* Returns the indices of the maximum values of the given array.
	*
	* @param {Array<Number>} array - The input array.
	* @return {Array<Number>} Array of indices into the array.
	*/
	static argmax( array ) {

		const max = Math.max( ...array );
		const indices = [];

		for ( let i = 0, l = array.length; i < l; i ++ ) {

			if ( array[ i ] === max ) indices.push( i );

		}

		return indices;

	}

	/**
	* Returns a random sample from a given array.
	*
	* @param {Array<Any>} array - The array that is used to generate the random sample.
	* @param {Array<Number>} probabilities - The probabilities associated with each entry. If not given, the sample assumes a uniform distribution over all entries.
	* @return {Any} The random sample value.
	*/
	static choice( array, probabilities = null ) {

		const random = Math.random();

		if ( probabilities === null ) {

			return array[ Math.floor( Math.random() * array.length ) ];

		} else {

			let probability = 0;

			const index = array.map( ( value, index ) => {

				probability += probabilities[ index ];

				return probability;

			} ).findIndex( ( probability ) => probability >= random );

			return array[ index ];

		}

	}

	/**
	* Ensures the given scalar value is within a given min/max range.
	*
	* @param {Number} value - The value to clamp.
	* @param {Number} min - The min value.
	* @param {Number} max - The max value.
	* @return {Number} The clamped value.
	*/
	static clamp( value, min, max ) {

		return Math.max( min, Math.min( max, value ) );

	}

	/**
	* Computes a RFC4122 Version 4 complied Universally Unique Identifier (UUID).
	*
	* @return {String} The UUID.
	*/
	static generateUUID() {

		// https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript/21963136#21963136

		const d0 = Math.random() * 0xffffffff | 0;
		const d1 = Math.random() * 0xffffffff | 0;
		const d2 = Math.random() * 0xffffffff | 0;
		const d3 = Math.random() * 0xffffffff | 0;
		const uuid = lut[ d0 & 0xff ] + lut[ d0 >> 8 & 0xff ] + lut[ d0 >> 16 & 0xff ] + lut[ d0 >> 24 & 0xff ] + '-' +
			lut[ d1 & 0xff ] + lut[ d1 >> 8 & 0xff ] + '-' + lut[ d1 >> 16 & 0x0f | 0x40 ] + lut[ d1 >> 24 & 0xff ] + '-' +
			lut[ d2 & 0x3f | 0x80 ] + lut[ d2 >> 8 & 0xff ] + '-' + lut[ d2 >> 16 & 0xff ] + lut[ d2 >> 24 & 0xff ] +
			lut[ d3 & 0xff ] + lut[ d3 >> 8 & 0xff ] + lut[ d3 >> 16 & 0xff ] + lut[ d3 >> 24 & 0xff ];

		return uuid.toUpperCase();

	}

	/**
	* Computes a random float value within a given min/max range.
	*
	* @param {Number} min - The min value.
	* @param {Number} max - The max value.
	* @return {Number} The random float value.
	*/
	static randFloat( min, max ) {

		return min + Math.random() * ( max - min );

	}

	/**
	* Computes a random integer value within a given min/max range.
	*
	* @param {Number} min - The min value.
	* @param {Number} max - The max value.
	* @return {Number} The random integer value.
	*/
	static randInt( min, max ) {

		return min + Math.floor( Math.random() * ( max - min + 1 ) );

	}

}

export { MathUtils };
