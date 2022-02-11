/**
 * The MIT License
 *
 * Copyright © 2022 Yuka authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

/**
* Class for representing a telegram, an envelope which contains a message
* and certain metadata like sender and receiver. Part of the messaging system
* for game entities.
*
* @author {@link https://github.com/Mugen87|Mugen87}
*/
class Telegram {

	/**
	* Constructs a new telegram object.
	*
	* @param {GameEntity} sender - The sender.
	* @param {GameEntity} receiver - The receiver.
	* @param {String} message - The actual message.
	* @param {Number} delay - A time value in millisecond used to delay the message dispatching.
	* @param {Object} data - An object for custom data.
	*/
	constructor( sender, receiver, message, delay, data ) {

		/**
		* The sender.
		* @type {GameEntity}
		*/
		this.sender = sender;

		/**
		* The receiver.
		* @type {GameEntity}
		*/
		this.receiver = receiver;

		/**
		* The actual message.
		* @type {String}
		*/
		this.message = message;

		/**
		* A time value in millisecond used to delay the message dispatching.
		* @type {Number}
		*/
		this.delay = delay;

		/**
		* An object for custom data.
		* @type {Object}
		*/
		this.data = data;

	}

	/**
	* Transforms this instance into a JSON object.
	*
	* @return {Object} The JSON object.
	*/
	toJSON() {

		return {
			type: this.constructor.name,
			sender: this.sender.uuid,
			receiver: this.receiver.uuid,
			message: this.message,
			delay: this.delay,
			data: this.data
		};

	}

	/**
	* Restores this instance from the given JSON object.
	*
	* @param {Object} json - The JSON object.
	* @return {Telegram} A reference to this telegram.
	*/
	fromJSON( json ) {

		this.sender = json.sender;
		this.receiver = json.receiver;
		this.message = json.message;
		this.delay = json.delay;
		this.data = json.data;

		return this;

	}

	/**
	* Restores UUIDs with references to GameEntity objects.
	*
	* @param {Map<String,GameEntity>} entities - Maps game entities to UUIDs.
	* @return {Telegram} A reference to this telegram.
	*/
	resolveReferences( entities ) {

		this.sender = entities.get( this.sender );
		this.receiver = entities.get( this.receiver );

		return this;

	}

}

/* istanbul ignore next */

/**
* Class with a logger interface. Messages are only logged to console if
* their log level is smaller or equal than the current log level.
*
* @author {@link https://github.com/Mugen87|Mugen87}
*/
class Logger {

	/**
	* Sets the log level for the logger. Allow values are: *LOG*,
	* *WARN*, *ERROR*, *SILENT*. The default level is *WARN*. The constants
	* are accessible over the *Logger.LEVEL* namespace.
	*
	* @param {Number} level - The log level.
	*/
	static setLevel( level ) {

		currentLevel = level;

	}

	/**
	* Logs a message with the level *LOG*.
	*
	* @param {...Any} args - The arguments to log.
	*/
	static log( ...args ) {

		if ( currentLevel <= Logger.LEVEL.LOG ) console.log( ...args );

	}

	/**
	* Logs a message with the level *WARN*.
	*
	* @param {...Any} args - The arguments to log.
	*/
	static warn( ...args ) {

		if ( currentLevel <= Logger.LEVEL.WARN ) console.warn( ...args );

	}

	/**
	* Logs a message with the level *ERROR*.
	*
	* @param {...Any} args - The arguments to log.
	*/
	static error( ...args ) {

		if ( currentLevel <= Logger.LEVEL.ERROR ) console.error( ...args );

	}

}

Logger.LEVEL = Object.freeze( {
	LOG: 0,
	WARN: 1,
	ERROR: 2,
	SILENT: 3
} );

let currentLevel = Logger.LEVEL.WARN;

/**
* This class is the core of the messaging system for game entities and used by the
* {@link EntityManager}. The implementation can directly dispatch messages or use a
* delayed delivery for deferred communication. This can be useful if a game entity
* wants to inform itself about a particular event in the future.
*
* @author {@link https://github.com/Mugen87|Mugen87}
*/
class MessageDispatcher {

	/**
	* Constructs a new message dispatcher.
	*/
	constructor() {

		/**
		* A list of delayed telegrams.
		* @type {Array<Telegram>}
		* @readonly
		*/
		this.delayedTelegrams = new Array();

	}

	/**
	* Delivers the message to the receiver.
	*
	* @param {Telegram} telegram - The telegram to deliver.
	* @return {MessageDispatcher} A reference to this message dispatcher.
	*/
	deliver( telegram ) {

		const receiver = telegram.receiver;

		if ( receiver.handleMessage( telegram ) === false ) {

			Logger.warn( 'YUKA.MessageDispatcher: Message not handled by receiver: %o', receiver );

		}

		return this;

	}

	/**
	* Receives the raw telegram data and decides how to dispatch the telegram (with or without delay).
	*
	* @param {GameEntity} sender - The sender.
	* @param {GameEntity} receiver - The receiver.
	* @param {String} message - The actual message.
	* @param {Number} delay - A time value in millisecond used to delay the message dispatching.
	* @param {Object} data - An object for custom data.
	* @return {MessageDispatcher} A reference to this message dispatcher.
	*/
	dispatch( sender, receiver, message, delay, data ) {

		const telegram = new Telegram( sender, receiver, message, delay, data );

		if ( delay <= 0 ) {

			this.deliver( telegram );

		} else {

			this.delayedTelegrams.push( telegram );

		}

		return this;

	}

	/**
	* Used to process delayed messages.
	*
	* @param {Number} delta - The time delta.
	* @return {MessageDispatcher} A reference to this message dispatcher.
	*/
	dispatchDelayedMessages( delta ) {

		let i = this.delayedTelegrams.length;

		while ( i -- ) {

			const telegram = this.delayedTelegrams[ i ];

			telegram.delay -= delta;

			if ( telegram.delay <= 0 ) {

				this.deliver( telegram );

				this.delayedTelegrams.pop();

			}

		}

		return this;

	}

	/**
	* Clears the internal state of this message dispatcher.
	*
	* @return {MessageDispatcher} A reference to this message dispatcher.
	*/
	clear() {

		this.delayedTelegrams.length = 0;

		return this;

	}

	/**
	* Transforms this instance into a JSON object.
	*
	* @return {Object} The JSON object.
	*/
	toJSON() {

		const data = {
			type: this.constructor.name,
			delayedTelegrams: new Array()
		};

		// delayed telegrams

		for ( let i = 0, l = this.delayedTelegrams.length; i < l; i ++ ) {

			const delayedTelegram = this.delayedTelegrams[ i ];
			data.delayedTelegrams.push( delayedTelegram.toJSON() );

		}

		return data;

	}

	/**
	* Restores this instance from the given JSON object.
	*
	* @param {Object} json - The JSON object.
	* @return {MessageDispatcher} A reference to this message dispatcher.
	*/
	fromJSON( json ) {

		this.clear();

		const telegramsJSON = json.delayedTelegrams;

		for ( let i = 0, l = telegramsJSON.length; i < l; i ++ ) {

			const telegramJSON = telegramsJSON[ i ];
			const telegram = new Telegram().fromJSON( telegramJSON );

			this.delayedTelegrams.push( telegram );

		}

		return this;

	}


	/**
	* Restores UUIDs with references to GameEntity objects.
	*
	* @param {Map<String,GameEntity>} entities - Maps game entities to UUIDs.
	* @return {MessageDispatcher} A reference to this message dispatcher.
	*/
	resolveReferences( entities ) {

		const delayedTelegrams = this.delayedTelegrams;

		for ( let i = 0, l = delayedTelegrams.length; i < l; i ++ ) {

			const delayedTelegram = delayedTelegrams[ i ];
			delayedTelegram.resolveReferences( entities );

		}

		return this;

	}

}

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

/**
* Class representing a 3D vector.
*
* @author {@link https://github.com/Mugen87|Mugen87}
*/
class Vector3 {

	/**
	* Constructs a new 3D vector with the given values.
	*
	* @param {Number} x - The x component.
	* @param {Number} y - The y component.
	* @param {Number} z - The z component.
	*/
	constructor( x = 0, y = 0, z = 0 ) {

		/**
		* The x component.
		* @type {Number}
		*/
		this.x = x;

		/**
		* The y component.
		* @type {Number}
		*/
		this.y = y;

		/**
		* The z component.
		* @type {Number}
		*/
		this.z = z;

	}

	/**
	* Sets the given values to this 3D vector.
	*
	* @param {Number} x - The x component.
	* @param {Number} y - The y component.
	* @param {Number} z - The z component.
	* @return {Vector3} A reference to this vector.
	*/
	set( x, y, z ) {

		this.x = x;
		this.y = y;
		this.z = z;

		return this;

	}

	/**
	* Copies all values from the given 3D vector to this 3D vector.
	*
	* @param {Vector3} v - The vector to copy.
	* @return {Vector3} A reference to this vector.
	*/
	copy( v ) {

		this.x = v.x;
		this.y = v.y;
		this.z = v.z;

		return this;

	}

	/**
	* Creates a new 3D vector and copies all values from this 3D vector.
	*
	* @return {Vector3} A new 3D vector.
	*/
	clone() {

		return new this.constructor().copy( this );

	}

	/**
	* Adds the given 3D vector to this 3D vector.
	*
	* @param {Vector3} v - The vector to add.
	* @return {Vector3} A reference to this vector.
	*/
	add( v ) {

		this.x += v.x;
		this.y += v.y;
		this.z += v.z;

		return this;

	}

	/**
	* Adds the given scalar to this 3D vector.
	*
	* @param {Number} s - The scalar to add.
	* @return {Vector3} A reference to this vector.
	*/
	addScalar( s ) {

		this.x += s;
		this.y += s;
		this.z += s;

		return this;

	}

	/**
	* Adds two given 3D vectors and stores the result in this 3D vector.
	*
	* @param {Vector3} a - The first vector of the operation.
	* @param {Vector3} b - The second vector of the operation.
	* @return {Vector3} A reference to this vector.
	*/
	addVectors( a, b ) {

		this.x = a.x + b.x;
		this.y = a.y + b.y;
		this.z = a.z + b.z;

		return this;

	}

	/**
	* Subtracts the given 3D vector from this 3D vector.
	*
	* @param {Vector3} v - The vector to substract.
	* @return {Vector3} A reference to this vector.
	*/
	sub( v ) {

		this.x -= v.x;
		this.y -= v.y;
		this.z -= v.z;

		return this;

	}

	/**
	* Subtracts the given scalar from this 3D vector.
	*
	* @param {Number} s - The scalar to substract.
	* @return {Vector3} A reference to this vector.
	*/
	subScalar( s ) {

		this.x -= s;
		this.y -= s;
		this.z -= s;

		return this;

	}

	/**
	* Subtracts two given 3D vectors and stores the result in this 3D vector.
	*
	* @param {Vector3} a - The first vector of the operation.
	* @param {Vector3} b - The second vector of the operation.
	* @return {Vector3} A reference to this vector.
	*/
	subVectors( a, b ) {

		this.x = a.x - b.x;
		this.y = a.y - b.y;
		this.z = a.z - b.z;

		return this;

	}

	/**
	* Multiplies the given 3D vector with this 3D vector.
	*
	* @param {Vector3} v - The vector to multiply.
	* @return {Vector3} A reference to this vector.
	*/
	multiply( v ) {

		this.x *= v.x;
		this.y *= v.y;
		this.z *= v.z;

		return this;

	}

	/**
	* Multiplies the given scalar with this 3D vector.
	*
	* @param {Number} s - The scalar to multiply.
	* @return {Vector3} A reference to this vector.
	*/
	multiplyScalar( s ) {

		this.x *= s;
		this.y *= s;
		this.z *= s;

		return this;

	}

	/**
	* Multiplies two given 3D vectors and stores the result in this 3D vector.
	*
	* @param {Vector3} a - The first vector of the operation.
	* @param {Vector3} b - The second vector of the operation.
	* @return {Vector3} A reference to this vector.
	*/
	multiplyVectors( a, b ) {

		this.x = a.x * b.x;
		this.y = a.y * b.y;
		this.z = a.z * b.z;

		return this;

	}

	/**
	* Divides the given 3D vector through this 3D vector.
	*
	* @param {Vector3} v - The vector to divide.
	* @return {Vector3} A reference to this vector.
	*/
	divide( v ) {

		this.x /= v.x;
		this.y /= v.y;
		this.z /= v.z;

		return this;

	}

	/**
	* Divides the given scalar through this 3D vector.
	*
	* @param {Number} s - The scalar to multiply.
	* @return {Vector3} A reference to this vector.
	*/
	divideScalar( s ) {

		this.x /= s;
		this.y /= s;
		this.z /= s;

		return this;

	}

	/**
	* Divides two given 3D vectors and stores the result in this 3D vector.
	*
	* @param {Vector3} a - The first vector of the operation.
	* @param {Vector3} b - The second vector of the operation.
	* @return {Vector3} A reference to this vector.
	*/
	divideVectors( a, b ) {

		this.x = a.x / b.x;
		this.y = a.y / b.y;
		this.z = a.z / b.z;

		return this;

	}

	/**
	* Reflects this vector along the given normal.
	*
	* @param {Vector3} normal - The normal vector.
	* @return {Vector3} A reference to this vector.
	*/
	reflect( normal ) {

		// solve r = v - 2( v * n ) * n

		return this.sub( v1$4.copy( normal ).multiplyScalar( 2 * this.dot( normal ) ) );

	}

	/**
	* Ensures this 3D vector lies in the given min/max range.
	*
	* @param {Vector3} min - The min range.
	* @param {Vector3} max - The max range.
	* @return {Vector3} A reference to this vector.
	*/
	clamp( min, max ) {

		this.x = Math.max( min.x, Math.min( max.x, this.x ) );
		this.y = Math.max( min.y, Math.min( max.y, this.y ) );
		this.z = Math.max( min.z, Math.min( max.z, this.z ) );

		return this;

	}

	/**
	* Compares each vector component of this 3D vector and the
	* given one and stores the minimum value in this instance.
	*
	* @param {Vector3} v - The 3D vector to check.
	* @return {Vector3} A reference to this vector.
	*/
	min( v ) {

		this.x = Math.min( this.x, v.x );
		this.y = Math.min( this.y, v.y );
		this.z = Math.min( this.z, v.z );

		return this;

	}

	/**
	* Compares each vector component of this 3D vector and the
	* given one and stores the maximum value in this instance.
	*
	* @param {Vector3} v - The 3D vector to check.
	* @return {Vector3} A reference to this vector.
	*/
	max( v ) {

		this.x = Math.max( this.x, v.x );
		this.y = Math.max( this.y, v.y );
		this.z = Math.max( this.z, v.z );

		return this;

	}

	/**
	* Computes the dot product of this and the given 3D vector.
	*
	* @param {Vector3} v - The given 3D vector.
	* @return {Number} The results of the dor product.
	*/
	dot( v ) {

		return ( this.x * v.x ) + ( this.y * v.y ) + ( this.z * v.z );

	}

	/**
	* Computes the cross product of this and the given 3D vector and
	* stores the result in this 3D vector.
	*
	* @param {Vector3} v - A 3D vector.
	* @return {Vector3} A reference to this vector.
	*/
	cross( v ) {

		const x = this.x, y = this.y, z = this.z;

		this.x = ( y * v.z ) - ( z * v.y );
		this.y = ( z * v.x ) - ( x * v.z );
		this.z = ( x * v.y ) - ( y * v.x );

		return this;

	}

	/**
	* Computes the cross product of the two given 3D vectors and
	* stores the result in this 3D vector.
	*
	* @param {Vector3} a - The first 3D vector.
	* @param {Vector3} b - The second 3D vector.
	* @return {Vector3} A reference to this vector.
	*/
	crossVectors( a, b ) {

		const ax = a.x, ay = a.y, az = a.z;
		const bx = b.x, by = b.y, bz = b.z;

		this.x = ( ay * bz ) - ( az * by );
		this.y = ( az * bx ) - ( ax * bz );
		this.z = ( ax * by ) - ( ay * bx );

		return this;

	}

	/**
	* Computes the angle between this and the given vector.
	*
	* @param {Vector3} v - A 3D vector.
	* @return {Number} The angle in radians.
	*/
	angleTo( v ) {

		const denominator = Math.sqrt( this.squaredLength() * v.squaredLength() );

		if ( denominator === 0 ) return 0;

		const theta = this.dot( v ) / denominator;

		// clamp, to handle numerical problems

		return Math.acos( MathUtils.clamp( theta, - 1, 1 ) );

	}

	/**
	* Computes the length of this 3D vector.
	*
	* @return {Number} The length of this 3D vector.
	*/
	length() {

		return Math.sqrt( this.squaredLength() );

	}

	/**
	* Computes the squared length of this 3D vector.
	* Calling this method is faster than calling {@link Vector3#length},
	* since it avoids computing a square root.
	*
	* @return {Number} The squared length of this 3D vector.
	*/
	squaredLength() {

		return this.dot( this );

	}

	/**
	* Computes the manhattan length of this 3D vector.
	*
	* @return {Number} The manhattan length of this 3D vector.
	*/
	manhattanLength() {

		return Math.abs( this.x ) + Math.abs( this.y ) + Math.abs( this.z );

	}

	/**
	* Computes the euclidean distance between this 3D vector and the given one.
	*
	* @param {Vector3} v - A 3D vector.
	* @return {Number} The euclidean distance between two 3D vectors.
	*/
	distanceTo( v ) {

		return Math.sqrt( this.squaredDistanceTo( v ) );

	}

	/**
	* Computes the squared euclidean distance between this 3D vector and the given one.
	* Calling this method is faster than calling {@link Vector3#distanceTo},
	* since it avoids computing a square root.
	*
	* @param {Vector3} v - A 3D vector.
	* @return {Number} The squared euclidean distance between two 3D vectors.
	*/
	squaredDistanceTo( v ) {

		const dx = this.x - v.x, dy = this.y - v.y, dz = this.z - v.z;

		return ( dx * dx ) + ( dy * dy ) + ( dz * dz );

	}

	/**
	* Computes the manhattan distance between this 3D vector and the given one.
	*
	* @param {Vector3} v - A 3D vector.
	* @return {Number} The manhattan distance between two 3D vectors.
	*/
	manhattanDistanceTo( v ) {

		const dx = this.x - v.x, dy = this.y - v.y, dz = this.z - v.z;

		return Math.abs( dx ) + Math.abs( dy ) + Math.abs( dz );

	}

	/**
	* Normalizes this 3D vector.
	*
	* @return {Vector3} A reference to this vector.
	*/
	normalize() {

		return this.divideScalar( this.length() || 1 );

	}

	/**
	* Multiplies the given 4x4 matrix with this 3D vector
	*
	* @param {Matrix4} m - A 4x4 matrix.
	* @return {Vector3} A reference to this vector.
	*/
	applyMatrix4( m ) {

		const x = this.x, y = this.y, z = this.z;
		const e = m.elements;

		const w = 1 / ( ( e[ 3 ] * x ) + ( e[ 7 ] * y ) + ( e[ 11 ] * z ) + e[ 15 ] );

		this.x = ( ( e[ 0 ] * x ) + ( e[ 4 ] * y ) + ( e[ 8 ] * z ) + e[ 12 ] ) * w;
		this.y = ( ( e[ 1 ] * x ) + ( e[ 5 ] * y ) + ( e[ 9 ] * z ) + e[ 13 ] ) * w;
		this.z = ( ( e[ 2 ] * x ) + ( e[ 6 ] * y ) + ( e[ 10 ] * z ) + e[ 14 ] ) * w;

		return this;

	}

	/**
	* Multiplies the given quaternion with this 3D vector.
	*
	* @param {Quaternion} q - A quaternion.
	* @return {Vector3} A reference to this vector.
	*/
	applyRotation( q ) {

		const x = this.x, y = this.y, z = this.z;
		const qx = q.x, qy = q.y, qz = q.z, qw = q.w;

		// calculate quat * vector

		const ix = qw * x + qy * z - qz * y;
		const iy = qw * y + qz * x - qx * z;
		const iz = qw * z + qx * y - qy * x;
		const iw = - qx * x - qy * y - qz * z;

		// calculate result * inverse quat

		this.x = ix * qw + iw * - qx + iy * - qz - iz * - qy;
		this.y = iy * qw + iw * - qy + iz * - qx - ix * - qz;
		this.z = iz * qw + iw * - qz + ix * - qy - iy * - qx;

		return this;

	}

	/**
	* Extracts the position portion of the given 4x4 matrix and stores it in this 3D vector.
	*
	* @param {Matrix4} m - A 4x4 matrix.
	* @return {Vector3} A reference to this vector.
	*/
	extractPositionFromMatrix( m ) {

		const e = m.elements;

		this.x = e[ 12 ];
		this.y = e[ 13 ];
		this.z = e[ 14 ];

		return this;

	}

	/**
	* Transform this direction vector by the given 4x4 matrix.
	*
	* @param {Matrix4} m - A 4x4 matrix.
	* @return {Vector3} A reference to this vector.
	*/
	transformDirection( m ) {

		const x = this.x, y = this.y, z = this.z;
		const e = m.elements;

		this.x = e[ 0 ] * x + e[ 4 ] * y + e[ 8 ] * z;
		this.y = e[ 1 ] * x + e[ 5 ] * y + e[ 9 ] * z;
		this.z = e[ 2 ] * x + e[ 6 ] * y + e[ 10 ] * z;

		return this.normalize();

	}

	/**
	* Sets the components of this 3D vector from a column of a 3x3 matrix.
	*
	* @param {Matrix3} m - A 3x3 matrix.
	* @param {Number} i - The index of the column.
	* @return {Vector3} A reference to this vector.
	*/
	fromMatrix3Column( m, i ) {

		return this.fromArray( m.elements, i * 3 );

	}

	/**
	* Sets the components of this 3D vector from a column of a 4x4 matrix.
	*
	* @param {Matrix3} m - A 4x4 matrix.
	* @param {Number} i - The index of the column.
	* @return {Vector3} A reference to this vector.
	*/
	fromMatrix4Column( m, i ) {

		return this.fromArray( m.elements, i * 4 );

	}

	/**
	* Sets the components of this 3D vector from a spherical coordinate.
	*
	* @param {Number} radius - The radius.
	* @param {Number} phi - The polar or inclination angle in radians. Should be in the range of (−π/2, +π/2].
	* @param {Number} theta - The azimuthal angle in radians. Should be in the range of (−π, +π].
	* @return {Vector3} A reference to this vector.
	*/
	fromSpherical( radius, phi, theta ) {

		const sinPhiRadius = Math.sin( phi ) * radius;

		this.x = sinPhiRadius * Math.sin( theta );
		this.y = Math.cos( phi ) * radius;
		this.z = sinPhiRadius * Math.cos( theta );

		return this;

	}

	/**
	* Sets the components of this 3D vector from an array.
	*
	* @param {Array<Number>} array - An array.
	* @param {Number} offset - An optional offset.
	* @return {Vector3} A reference to this vector.
	*/
	fromArray( array, offset = 0 ) {

		this.x = array[ offset + 0 ];
		this.y = array[ offset + 1 ];
		this.z = array[ offset + 2 ];

		return this;

	}

	/**
	* Copies all values of this 3D vector to the given array.
	*
	* @param {Array<Number>} array - An array.
	* @param {Number} offset - An optional offset.
	* @return {Array<Number>} The array with the 3D vector components.
	*/
	toArray( array, offset = 0 ) {

		array[ offset + 0 ] = this.x;
		array[ offset + 1 ] = this.y;
		array[ offset + 2 ] = this.z;

		return array;

	}

	/**
	* Returns true if the given 3D vector is deep equal with this 3D vector.
	*
	* @param {Vector3} v - The 3D vector to test.
	* @return {Boolean} The result of the equality test.
	*/
	equals( v ) {

		return ( ( v.x === this.x ) && ( v.y === this.y ) && ( v.z === this.z ) );

	}

}

const v1$4 = new Vector3();

const WorldUp = new Vector3( 0, 1, 0 );

const localRight = new Vector3();
const worldRight = new Vector3();
const perpWorldUp = new Vector3();
const temp = new Vector3();

const colVal = [ 2, 2, 1 ];
const rowVal = [ 1, 0, 0 ];

/**
* Class representing a 3x3 matrix. The elements of the matrix
* are stored in column-major order.
*
* @author {@link https://github.com/Mugen87|Mugen87}
*/
class Matrix3 {

	/**
	* Constructs a new 3x3 identity matrix.
	*/
	constructor() {

		/**
		* The elements of the matrix in column-major order.
		* @type {Array<Number>}
		*/
		this.elements = [

			1, 0, 0,
			0, 1, 0,
			0, 0, 1

		];

	}

	/**
	* Sets the given values to this matrix. The arguments are in row-major order.
	*
	* @param {Number} n11 - An element of the matrix.
	* @param {Number} n12 - An element of the matrix.
	* @param {Number} n13 - An element of the matrix.
	* @param {Number} n21 - An element of the matrix.
	* @param {Number} n22 - An element of the matrix.
	* @param {Number} n23 - An element of the matrix.
	* @param {Number} n31 - An element of the matrix.
	* @param {Number} n32 - An element of the matrix.
	* @param {Number} n33 - An element of the matrix.
	* @return {Matrix3} A reference to this matrix.
	*/
	set( n11, n12, n13, n21, n22, n23, n31, n32, n33 ) {

		const e = this.elements;

		e[ 0 ] = n11; e[ 3 ] = n12; e[ 6 ] = n13;
		e[ 1 ] = n21; e[ 4 ] = n22; e[ 7 ] = n23;
		e[ 2 ] = n31; e[ 5 ] = n32; e[ 8 ] = n33;

		return this;

	}

	/**
	* Copies all values from the given matrix to this matrix.
	*
	* @param {Matrix3} m - The matrix to copy.
	* @return {Matrix3} A reference to this matrix.
	*/
	copy( m ) {

		const e = this.elements;
		const me = m.elements;

		e[ 0 ] = me[ 0 ]; e[ 1 ] = me[ 1 ]; e[ 2 ] = me[ 2 ];
		e[ 3 ] = me[ 3 ]; e[ 4 ] = me[ 4 ]; e[ 5 ] = me[ 5 ];
		e[ 6 ] = me[ 6 ]; e[ 7 ] = me[ 7 ]; e[ 8 ] = me[ 8 ];

		return this;

	}

	/**
	* Creates a new matrix and copies all values from this matrix.
	*
	* @return {Matrix3} A new matrix.
	*/
	clone() {

		return new this.constructor().copy( this );

	}

	/**
	* Transforms this matrix to an identity matrix.
	*
	* @return {Matrix3} A reference to this matrix.
	*/
	identity() {

		this.set(

			1, 0, 0,
			0, 1, 0,
			0, 0, 1

		);

		return this;

	}

	/**
	* Multiplies this matrix with the given matrix.
	*
	* @param {Matrix3} m - The matrix to multiply.
	* @return {Matrix3} A reference to this matrix.
	*/
	multiply( m ) {

		return this.multiplyMatrices( this, m );

	}

	/**
	* Multiplies this matrix with the given matrix.
	* So the order of the multiplication is switched compared to {@link Matrix3#multiply}.
	*
	* @param {Matrix3} m - The matrix to multiply.
	* @return {Matrix3} A reference to this matrix.
	*/
	premultiply( m ) {

		return this.multiplyMatrices( m, this );

	}

	/**
	* Multiplies two given matrices and stores the result in this matrix.
	*
	* @param {Matrix3} a - The first matrix of the operation.
	* @param {Matrix3} b - The second matrix of the operation.
	* @return {Matrix3} A reference to this matrix.
	*/
	multiplyMatrices( a, b ) {

		const ae = a.elements;
		const be = b.elements;
		const e = this.elements;

		const a11 = ae[ 0 ], a12 = ae[ 3 ], a13 = ae[ 6 ];
		const a21 = ae[ 1 ], a22 = ae[ 4 ], a23 = ae[ 7 ];
		const a31 = ae[ 2 ], a32 = ae[ 5 ], a33 = ae[ 8 ];

		const b11 = be[ 0 ], b12 = be[ 3 ], b13 = be[ 6 ];
		const b21 = be[ 1 ], b22 = be[ 4 ], b23 = be[ 7 ];
		const b31 = be[ 2 ], b32 = be[ 5 ], b33 = be[ 8 ];

		e[ 0 ] = a11 * b11 + a12 * b21 + a13 * b31;
		e[ 3 ] = a11 * b12 + a12 * b22 + a13 * b32;
		e[ 6 ] = a11 * b13 + a12 * b23 + a13 * b33;

		e[ 1 ] = a21 * b11 + a22 * b21 + a23 * b31;
		e[ 4 ] = a21 * b12 + a22 * b22 + a23 * b32;
		e[ 7 ] = a21 * b13 + a22 * b23 + a23 * b33;

		e[ 2 ] = a31 * b11 + a32 * b21 + a33 * b31;
		e[ 5 ] = a31 * b12 + a32 * b22 + a33 * b32;
		e[ 8 ] = a31 * b13 + a32 * b23 + a33 * b33;

		return this;

	}

	/**
	* Multiplies the given scalar with this matrix.
	*
	* @param {Number} s - The scalar to multiply.
	* @return {Matrix3} A reference to this matrix.
	*/
	multiplyScalar( s ) {

		const e = this.elements;

		e[ 0 ] *= s; e[ 3 ] *= s; e[ 6 ] *= s;
		e[ 1 ] *= s; e[ 4 ] *= s; e[ 7 ] *= s;
		e[ 2 ] *= s; e[ 5 ] *= s; e[ 8 ] *= s;

		return this;

	}

	/**
	* Extracts the basis vectors and stores them to the given vectors.
	*
	* @param {Vector3} xAxis - The first result vector for the x-axis.
	* @param {Vector3} yAxis - The second result vector for the y-axis.
	* @param {Vector3} zAxis - The third result vector for the z-axis.
	* @return {Matrix3} A reference to this matrix.
	*/
	extractBasis( xAxis, yAxis, zAxis ) {

		xAxis.fromMatrix3Column( this, 0 );
		yAxis.fromMatrix3Column( this, 1 );
		zAxis.fromMatrix3Column( this, 2 );

		return this;

	}

	/**
	* Makes a basis from the given vectors.
	*
	* @param {Vector3} xAxis - The first basis vector for the x-axis.
	* @param {Vector3} yAxis - The second basis vector for the y-axis.
	* @param {Vector3} zAxis - The third basis vector for the z-axis.
	* @return {Matrix3} A reference to this matrix.
	*/
	makeBasis( xAxis, yAxis, zAxis ) {

		this.set(
			xAxis.x, yAxis.x, zAxis.x,
			xAxis.y, yAxis.y, zAxis.y,
			xAxis.z, yAxis.z, zAxis.z
		);

		return this;

	}

	/**
	* Creates a rotation matrix that orients an object to face towards a specified target direction.
	*
	* @param {Vector3} localForward - Specifies the forward direction in the local space of the object.
	* @param {Vector3} targetDirection - Specifies the desired world space direction the object should look at.
	* @param {Vector3} localUp - Specifies the up direction in the local space of the object.
	* @return {Matrix3} A reference to this matrix.
	*/
	lookAt( localForward, targetDirection, localUp ) {

		localRight.crossVectors( localUp, localForward ).normalize();

		// orthonormal linear basis A { localRight, localUp, localForward } for the object local space

		worldRight.crossVectors( WorldUp, targetDirection ).normalize();

		if ( worldRight.squaredLength() === 0 ) {

			// handle case when it's not possible to build a basis from targetDirection and worldUp
			// slightly shift targetDirection in order to avoid collinearity

			temp.copy( targetDirection ).addScalar( Number.EPSILON );
			worldRight.crossVectors( WorldUp, temp ).normalize();

		}

		perpWorldUp.crossVectors( targetDirection, worldRight ).normalize();

		// orthonormal linear basis B { worldRight, perpWorldUp, targetDirection } for the desired target orientation

		m1.makeBasis( worldRight, perpWorldUp, targetDirection );
		m2.makeBasis( localRight, localUp, localForward );

		// construct a matrix that maps basis A to B

		this.multiplyMatrices( m1, m2.transpose() );

		return this;

	}

	/**
	* Transposes this matrix.
	*
	* @return {Matrix3} A reference to this matrix.
	*/
	transpose() {

		const e = this.elements;
		let t;

		t = e[ 1 ]; e[ 1 ] = e[ 3 ]; e[ 3 ] = t;
		t = e[ 2 ]; e[ 2 ] = e[ 6 ]; e[ 6 ] = t;
		t = e[ 5 ]; e[ 5 ] = e[ 7 ]; e[ 7 ] = t;

		return this;

	}

	/**
	* Computes the element index according to the given column and row.
	*
	* @param {Number} column - Index of the column.
	* @param {Number} row - Index of the row.
	* @return {Number} The index of the element at the provided row and column.
	*/
	getElementIndex( column, row ) {

		return column * 3 + row;

	}

	/**
	* Computes the frobenius norm. It's the squareroot of the sum of all
	* squared matrix elements.
	*
	* @return {Number} The frobenius norm.
	*/
	frobeniusNorm() {

		const e = this.elements;
		let norm = 0;

		for ( let i = 0; i < 9; i ++ ) {

			norm += e[ i ] * e[ i ];

		}

		return Math.sqrt( norm );

	}

	/**
	* Computes the  "off-diagonal" frobenius norm. Assumes the matrix is symmetric.
	*
	* @return {Number} The "off-diagonal" frobenius norm.
	*/
	offDiagonalFrobeniusNorm() {

		const e = this.elements;
		let norm = 0;

		for ( let i = 0; i < 3; i ++ ) {

			const t = e[ this.getElementIndex( colVal[ i ], rowVal[ i ] ) ];
			norm += 2 * t * t; // multiply the result by two since the matrix is symetric

		}

		return Math.sqrt( norm );

	}

	/**
	* Computes the eigenvectors and eigenvalues.
	*
	* Reference: https://github.com/AnalyticalGraphicsInc/cesium/blob/411a1afbd36b72df64d7362de6aa934730447234/Source/Core/Matrix3.js#L1141 (Apache License 2.0)
	*
	* The values along the diagonal of the diagonal matrix are the eigenvalues.
	* The columns of the unitary matrix are the corresponding eigenvectors.
	*
	* @param {Object} result - An object with unitary and diagonal properties which are matrices onto which to store the result.
	* @return {Object} An object with unitary and diagonal properties which are matrices onto which to store the result.
	*/
	eigenDecomposition( result ) {

		let count = 0;
		let sweep = 0;

		const maxSweeps = 10;

		result.unitary.identity();
		result.diagonal.copy( this );

		const unitaryMatrix = result.unitary;
		const diagonalMatrix = result.diagonal;

		const epsilon = Number.EPSILON * diagonalMatrix.frobeniusNorm();

		while ( sweep < maxSweeps && diagonalMatrix.offDiagonalFrobeniusNorm() > epsilon ) {

			diagonalMatrix.shurDecomposition( m1 );
			m2.copy( m1 ).transpose();
			diagonalMatrix.multiply( m1 );
			diagonalMatrix.premultiply( m2 );
			unitaryMatrix.multiply( m1 );

			if ( ++ count > 2 ) {

				sweep ++;
				count = 0;

			}

		}

		return result;

	}

	/**
	* Finds the largest off-diagonal term and then creates a matrix
	* which can be used to help reduce it.
	*
	* @param {Matrix3} result - The result matrix.
	* @return {Matrix3} The result matrix.
	*/
	shurDecomposition( result ) {

		let maxDiagonal = 0;
		let rotAxis = 1;

		// find pivot (rotAxis) based on largest off-diagonal term

		const e = this.elements;

		for ( let i = 0; i < 3; i ++ ) {

			const t = Math.abs( e[ this.getElementIndex( colVal[ i ], rowVal[ i ] ) ] );

			if ( t > maxDiagonal ) {

				maxDiagonal = t;
				rotAxis = i;

			}

		}

		let c = 1;
		let s = 0;

		const p = rowVal[ rotAxis ];
		const q = colVal[ rotAxis ];

		if ( Math.abs( e[ this.getElementIndex( q, p ) ] ) > Number.EPSILON ) {

			const qq = e[ this.getElementIndex( q, q ) ];
			const pp = e[ this.getElementIndex( p, p ) ];
			const qp = e[ this.getElementIndex( q, p ) ];

			const tau = ( qq - pp ) / 2 / qp;

			let t;

			if ( tau < 0 ) {

				t = - 1 / ( - tau + Math.sqrt( 1 + tau * tau ) );

			} else {

				t = 1 / ( tau + Math.sqrt( 1.0 + tau * tau ) );

			}

			c = 1.0 / Math.sqrt( 1.0 + t * t );
			s = t * c;

		}

		result.identity();

		result.elements[ this.getElementIndex( p, p ) ] = c;
		result.elements[ this.getElementIndex( q, q ) ] = c;
		result.elements[ this.getElementIndex( q, p ) ] = s;
		result.elements[ this.getElementIndex( p, q ) ] = - s;

		return result;

	}

	/**
	* Creates a rotation matrix from the given quaternion.
	*
	* @param {Quaternion} q - A quaternion representing a rotation.
	* @return {Matrix3} A reference to this matrix.
	*/
	fromQuaternion( q ) {

		const e = this.elements;

		const x = q.x, y = q.y, z = q.z, w = q.w;
		const x2 = x + x, y2 = y + y, z2 = z + z;
		const xx = x * x2, xy = x * y2, xz = x * z2;
		const yy = y * y2, yz = y * z2, zz = z * z2;
		const wx = w * x2, wy = w * y2, wz = w * z2;

		e[ 0 ] = 1 - ( yy + zz );
		e[ 3 ] = xy - wz;
		e[ 6 ] = xz + wy;

		e[ 1 ] = xy + wz;
		e[ 4 ] = 1 - ( xx + zz );
		e[ 7 ] = yz - wx;

		e[ 2 ] = xz - wy;
		e[ 5 ] = yz + wx;
		e[ 8 ] = 1 - ( xx + yy );

		return this;

	}

	/**
	* Sets the elements of this matrix by extracting the upper-left 3x3 portion
	* from a 4x4 matrix.
	*
	* @param {Matrix4} m - A 4x4 matrix.
	* @return {Matrix3} A reference to this matrix.
	*/
	fromMatrix4( m ) {

		const e = this.elements;
		const me = m.elements;

		e[ 0 ] = me[ 0 ]; e[ 1 ] = me[ 1 ]; e[ 2 ] = me[ 2 ];
		e[ 3 ] = me[ 4 ]; e[ 4 ] = me[ 5 ]; e[ 5 ] = me[ 6 ];
		e[ 6 ] = me[ 8 ]; e[ 7 ] = me[ 9 ]; e[ 8 ] = me[ 10 ];

		return this;

	}

	/**
	* Sets the elements of this matrix from an array.
	*
	* @param {Array<Number>} array - An array.
	* @param {Number} offset - An optional offset.
	* @return {Matrix3} A reference to this matrix.
	*/
	fromArray( array, offset = 0 ) {

		const e = this.elements;

		for ( let i = 0; i < 9; i ++ ) {

			e[ i ] = array[ i + offset ];

		}

		return this;

	}

	/**
	* Copies all elements of this matrix to the given array.
	*
	* @param {Array<Number>} array - An array.
	* @param {Number} offset - An optional offset.
	* @return {Array<Number>} The array with the elements of the matrix.
	*/
	toArray( array, offset = 0 ) {

		const e = this.elements;

		array[ offset + 0 ] = e[ 0 ];
		array[ offset + 1 ] = e[ 1 ];
		array[ offset + 2 ] = e[ 2 ];

		array[ offset + 3 ] = e[ 3 ];
		array[ offset + 4 ] = e[ 4 ];
		array[ offset + 5 ] = e[ 5 ];

		array[ offset + 6 ] = e[ 6 ];
		array[ offset + 7 ] = e[ 7 ];
		array[ offset + 8 ] = e[ 8 ];

		return array;

	}

	/**
	* Returns true if the given matrix is deep equal with this matrix.
	*
	* @param {Matrix3} m - The matrix to test.
	* @return {Boolean} The result of the equality test.
	*/
	equals( m ) {

		const e = this.elements;
		const me = m.elements;

		for ( let i = 0; i < 9; i ++ ) {

			if ( e[ i ] !== me[ i ] ) return false;

		}

		return true;

	}

}

const m1 = new Matrix3();
const m2 = new Matrix3();

const matrix$1 = new Matrix3();
const vector$1 = new Vector3();

/**
* Class representing a quaternion.
*
* @author {@link https://github.com/Mugen87|Mugen87}
*/
class Quaternion {

	/**
	* Constructs a new quaternion with the given values.
	*
	* @param {Number} x - The x component.
	* @param {Number} y - The y component.
	* @param {Number} z - The z component.
	* @param {Number} w - The w component.
	*/
	constructor( x = 0, y = 0, z = 0, w = 1 ) {

		/**
		* The x component.
		* @type {Number}
		*/
		this.x = x;

		/**
		* The y component.
		* @type {Number}
		*/
		this.y = y;

		/**
		* The z component.
		* @type {Number}
		*/
		this.z = z;

		/**
		* The w component.
		* @type {Number}
		*/
		this.w = w;

	}

	/**
	* Sets the given values to this quaternion.
	*
	* @param {Number} x - The x component.
	* @param {Number} y - The y component.
	* @param {Number} z - The z component.
	* @param {Number} w - The w component.
	* @return {Quaternion} A reference to this quaternion.
	*/
	set( x, y, z, w ) {

		this.x = x;
		this.y = y;
		this.z = z;
		this.w = w;

		return this;

	}

	/**
	* Copies all values from the given quaternion to this quaternion.
	*
	* @param {Quaternion} q - The quaternion to copy.
	* @return {Quaternion} A reference to this quaternion.
	*/
	copy( q ) {

		this.x = q.x;
		this.y = q.y;
		this.z = q.z;
		this.w = q.w;

		return this;

	}

	/**
	* Creates a new quaternion and copies all values from this quaternion.
	*
	* @return {Quaternion} A new quaternion.
	*/
	clone() {

		return new this.constructor().copy( this );

	}

	/**
	* Computes the inverse of this quaternion.
	*
	* @return {Quaternion} A reference to this quaternion.
	*/
	inverse() {

		return this.conjugate().normalize();

	}

	/**
	* Computes the conjugate of this quaternion.
	*
	* @return {Quaternion} A reference to this quaternion.
	*/
	conjugate() {

		this.x *= - 1;
		this.y *= - 1;
		this.z *= - 1;

		return this;

	}

	/**
	* Computes the dot product of this and the given quaternion.
	*
	* @param {Quaternion} q - The given quaternion.
	* @return {Quaternion} A reference to this quaternion.
	*/
	dot( q ) {

		return ( this.x * q.x ) + ( this.y * q.y ) + ( this.z * q.z ) + ( this.w * q.w );

	}

	/**
	* Computes the length of this quaternion.
	*
	* @return {Number} The length of this quaternion.
	*/
	length() {

		return Math.sqrt( this.squaredLength() );

	}

	/**
	* Computes the squared length of this quaternion.
	*
	* @return {Number} The squared length of this quaternion.
	*/
	squaredLength() {

		return this.dot( this );

	}

	/**
	* Normalizes this quaternion.
	*
	* @return {Quaternion} A reference to this quaternion.
	*/
	normalize() {

		let l = this.length();

		if ( l === 0 ) {

			this.x = 0;
			this.y = 0;
			this.z = 0;
			this.w = 1;

		} else {

			l = 1 / l;

			this.x = this.x * l;
			this.y = this.y * l;
			this.z = this.z * l;
			this.w = this.w * l;

		}

		return this;

	}

	/**
	* Multiplies this quaternion with the given quaternion.
	*
	* @param {Quaternion} q - The quaternion to multiply.
	* @return {Quaternion} A reference to this quaternion.
	*/
	multiply( q ) {

		return this.multiplyQuaternions( this, q );

	}

	/**
	* Multiplies the given quaternion with this quaternion.
	* So the order of the multiplication is switched compared to {@link Quaternion#multiply}.
	*
	* @param {Quaternion} q - The quaternion to multiply.
	* @return {Quaternion} A reference to this quaternion.
	*/
	premultiply( q ) {

		return this.multiplyQuaternions( q, this );

	}

	/**
	* Multiplies two given quaternions and stores the result in this quaternion.
	*
	* @param {Quaternion} a - The first quaternion of the operation.
	* @param {Quaternion} b - The second quaternion of the operation.
	* @return {Quaternion} A reference to this quaternion.
	*/
	multiplyQuaternions( a, b ) {

		const qax = a.x, qay = a.y, qaz = a.z, qaw = a.w;
		const qbx = b.x, qby = b.y, qbz = b.z, qbw = b.w;

		this.x = ( qax * qbw ) + ( qaw * qbx ) + ( qay * qbz ) - ( qaz * qby );
		this.y = ( qay * qbw ) + ( qaw * qby ) + ( qaz * qbx ) - ( qax * qbz );
		this.z = ( qaz * qbw ) + ( qaw * qbz ) + ( qax * qby ) - ( qay * qbx );
		this.w = ( qaw * qbw ) - ( qax * qbx ) - ( qay * qby ) - ( qaz * qbz );

		return this;

	}

	/**
	* Computes the shortest angle between two rotation defined by this quaternion and the given one.
	*
	* @param {Quaternion} q - The given quaternion.
	* @return {Number} The angle in radians.
	*/
	angleTo( q ) {

		return 2 * Math.acos( Math.abs( MathUtils.clamp( this.dot( q ), - 1, 1 ) ) );

	}

	/**
	* Transforms this rotation defined by this quaternion towards the target rotation
	* defined by the given quaternion by the given angular step. The rotation will not overshoot.
	*
	* @param {Quaternion} q - The target rotation.
	* @param {Number} step - The maximum step in radians.
	* @param {Number} tolerance - A tolerance value in radians to tweak the result
	* when both rotations are considered to be equal.
	* @return {Boolean} Whether the given quaternion already represents the target rotation.
	*/
	rotateTo( q, step, tolerance = 0.0001 ) {

		const angle = this.angleTo( q );

		if ( angle < tolerance ) return true;

		const t = Math.min( 1, step / angle );

		this.slerp( q, t );

		return false;

	}

	/**
	* Creates a quaternion that orients an object to face towards a specified target direction.
	*
	* @param {Vector3} localForward - Specifies the forward direction in the local space of the object.
	* @param {Vector3} targetDirection - Specifies the desired world space direction the object should look at.
	* @param {Vector3} localUp - Specifies the up direction in the local space of the object.
	* @return {Quaternion} A reference to this quaternion.
	*/
	lookAt( localForward, targetDirection, localUp ) {

		matrix$1.lookAt( localForward, targetDirection, localUp );
		this.fromMatrix3( matrix$1 );

	}

	/**
	* Spherically interpolates between this quaternion and the given quaternion by t.
	* The parameter t is clamped to the range [0, 1].
	*
	* @param {Quaternion} q - The target rotation.
	* @param {Number} t - The interpolation parameter.
	* @return {Quaternion} A reference to this quaternion.
	*/
	slerp( q, t ) {

		if ( t === 0 ) return this;
		if ( t === 1 ) return this.copy( q );

		const x = this.x, y = this.y, z = this.z, w = this.w;

		let cosHalfTheta = w * q.w + x * q.x + y * q.y + z * q.z;

		if ( cosHalfTheta < 0 ) {

			this.w = - q.w;
			this.x = - q.x;
			this.y = - q.y;
			this.z = - q.z;

			cosHalfTheta = - cosHalfTheta;

		} else {

			this.copy( q );

		}

		if ( cosHalfTheta >= 1.0 ) {

			this.w = w;
			this.x = x;
			this.y = y;
			this.z = z;

			return this;

		}

		const sinHalfTheta = Math.sqrt( 1.0 - cosHalfTheta * cosHalfTheta );

		if ( Math.abs( sinHalfTheta ) < 0.001 ) {

			this.w = 0.5 * ( w + this.w );
			this.x = 0.5 * ( x + this.x );
			this.y = 0.5 * ( y + this.y );
			this.z = 0.5 * ( z + this.z );

			return this;

		}

		const halfTheta = Math.atan2( sinHalfTheta, cosHalfTheta );
		const ratioA = Math.sin( ( 1 - t ) * halfTheta ) / sinHalfTheta;
		const ratioB = Math.sin( t * halfTheta ) / sinHalfTheta;

		this.w = ( w * ratioA ) + ( this.w * ratioB );
		this.x = ( x * ratioA ) + ( this.x * ratioB );
		this.y = ( y * ratioA ) + ( this.y * ratioB );
		this.z = ( z * ratioA ) + ( this.z * ratioB );

		return this;

	}

	/**
	* Extracts the rotation of the given 4x4 matrix and stores it in this quaternion.
	*
	* @param {Matrix4} m - A 4x4 matrix.
	* @return {Quaternion} A reference to this quaternion.
	*/
	extractRotationFromMatrix( m ) {

		const e = matrix$1.elements;
		const me = m.elements;

		// remove scaling from the 3x3 portion

		const sx = 1 / vector$1.fromMatrix4Column( m, 0 ).length();
		const sy = 1 / vector$1.fromMatrix4Column( m, 1 ).length();
		const sz = 1 / vector$1.fromMatrix4Column( m, 2 ).length();

		e[ 0 ] = me[ 0 ] * sx;
		e[ 1 ] = me[ 1 ] * sx;
		e[ 2 ] = me[ 2 ] * sx;

		e[ 3 ] = me[ 4 ] * sy;
		e[ 4 ] = me[ 5 ] * sy;
		e[ 5 ] = me[ 6 ] * sy;

		e[ 6 ] = me[ 8 ] * sz;
		e[ 7 ] = me[ 9 ] * sz;
		e[ 8 ] = me[ 10 ] * sz;

		this.fromMatrix3( matrix$1 );

		return this;

	}

	/**
	* Sets the components of this quaternion from the given euler angle (YXZ order).
	*
	* @param {Number} x - Rotation around x axis in radians.
	* @param {Number} y - Rotation around y axis in radians.
	* @param {Number} z - Rotation around z axis in radians.
	* @return {Quaternion} A reference to this quaternion.
	*/
	fromEuler( x, y, z ) {

		// from 3D Math Primer for Graphics and Game Development
		// 8.7.5 Converting Euler Angles to a Quaternion

		// assuming YXZ (head/pitch/bank or yaw/pitch/roll) order

		const c1 = Math.cos( y / 2 );
		const c2 = Math.cos( x / 2 );
		const c3 = Math.cos( z / 2 );

		const s1 = Math.sin( y / 2 );
		const s2 = Math.sin( x / 2 );
		const s3 = Math.sin( z / 2 );

		this.w = c1 * c2 * c3 + s1 * s2 * s3;
		this.x = c1 * s2 * c3 + s1 * c2 * s3;
		this.y = s1 * c2 * c3 - c1 * s2 * s3;
		this.z = c1 * c2 * s3 - s1 * s2 * c3;

		return this;

	}

	/**
	* Returns an euler angel (YXZ order) representation of this quaternion.
	*
	* @param {Object} euler - The resulting euler angles.
	* @return {Object} The resulting euler angles.
	*/
	toEuler( euler ) {

		// from 3D Math Primer for Graphics and Game Development
		// 8.7.6 Converting a Quaternion to Euler Angles

		// extract pitch

		const sp = - 2 * ( this.y * this.z - this.x * this.w );

		// check for gimbal lock

		if ( Math.abs( sp ) > 0.9999 ) {

			// looking straight up or down

			euler.x = Math.PI * 0.5 * sp;
			euler.y = Math.atan2( this.x * this.z + this.w * this.y, 0.5 - this.x * this.x - this.y * this.y );
			euler.z = 0;

		} else { //todo test

			euler.x = Math.asin( sp );
			euler.y = Math.atan2( this.x * this.z + this.w * this.y, 0.5 - this.x * this.x - this.y * this.y );
			euler.z = Math.atan2( this.x * this.y + this.w * this.z, 0.5 - this.x * this.x - this.z * this.z );

		}

		return euler;

	}

	/**
	* Sets the components of this quaternion from the given 3x3 rotation matrix.
	*
	* @param {Matrix3} m - The rotation matrix.
	* @return {Quaternion} A reference to this quaternion.
	*/
	fromMatrix3( m ) {

		const e = m.elements;

		const m11 = e[ 0 ], m12 = e[ 3 ], m13 = e[ 6 ];
		const m21 = e[ 1 ], m22 = e[ 4 ], m23 = e[ 7 ];
		const m31 = e[ 2 ], m32 = e[ 5 ], m33 = e[ 8 ];

		const trace = m11 + m22 + m33;

		if ( trace > 0 ) {

			let s = 0.5 / Math.sqrt( trace + 1.0 );

			this.w = 0.25 / s;
			this.x = ( m32 - m23 ) * s;
			this.y = ( m13 - m31 ) * s;
			this.z = ( m21 - m12 ) * s;

		} else if ( ( m11 > m22 ) && ( m11 > m33 ) ) {

			let s = 2.0 * Math.sqrt( 1.0 + m11 - m22 - m33 );

			this.w = ( m32 - m23 ) / s;
			this.x = 0.25 * s;
			this.y = ( m12 + m21 ) / s;
			this.z = ( m13 + m31 ) / s;

		} else if ( m22 > m33 ) {

			let s = 2.0 * Math.sqrt( 1.0 + m22 - m11 - m33 );

			this.w = ( m13 - m31 ) / s;
			this.x = ( m12 + m21 ) / s;
			this.y = 0.25 * s;
			this.z = ( m23 + m32 ) / s;

		} else {

			let s = 2.0 * Math.sqrt( 1.0 + m33 - m11 - m22 );

			this.w = ( m21 - m12 ) / s;
			this.x = ( m13 + m31 ) / s;
			this.y = ( m23 + m32 ) / s;
			this.z = 0.25 * s;

		}

		return this;

	}

	/**
	* Sets the components of this quaternion from an array.
	*
	* @param {Array<Number>} array - An array.
	* @param {Number} offset - An optional offset.
	* @return {Quaternion} A reference to this quaternion.
	*/
	fromArray( array, offset = 0 ) {

		this.x = array[ offset + 0 ];
		this.y = array[ offset + 1 ];
		this.z = array[ offset + 2 ];
		this.w = array[ offset + 3 ];

		return this;

	}

	/**
	* Copies all values of this quaternion to the given array.
	*
	* @param {Array<Number>} array - An array.
	* @param {Number} offset - An optional offset.
	* @return {Array<Number>} The array with the quaternion components.
	*/
	toArray( array, offset = 0 ) {

		array[ offset + 0 ] = this.x;
		array[ offset + 1 ] = this.y;
		array[ offset + 2 ] = this.z;
		array[ offset + 3 ] = this.w;

		return array;

	}

	/**
	* Returns true if the given quaternion is deep equal with this quaternion.
	*
	* @param {Quaternion} q - The quaternion to test.
	* @return {Boolean} The result of the equality test.
	*/
	equals( q ) {

		return ( ( q.x === this.x ) && ( q.y === this.y ) && ( q.z === this.z ) && ( q.w === this.w ) );

	}

}

/**
* Class representing a 4x4 matrix. The elements of the matrix
* are stored in column-major order.
*
* @author {@link https://github.com/Mugen87|Mugen87}
*/
class Matrix4 {

	/**
	* Constructs a new 4x4 identity matrix.
	*/
	constructor() {

		/**
		* The elements of the matrix in column-major order.
		* @type {Array<Number>}
		*/
		this.elements = [

			1, 0, 0, 0,
			0, 1, 0, 0,
			0, 0, 1, 0,
			0, 0, 0, 1

		];

	}

	/**
	* Sets the given values to this matrix. The arguments are in row-major order.
	*
	* @param {Number} n11 - An element of the matrix.
	* @param {Number} n12 - An element of the matrix.
	* @param {Number} n13 - An element of the matrix.
	* @param {Number} n14 - An element of the matrix.
	* @param {Number} n21 - An element of the matrix.
	* @param {Number} n22 - An element of the matrix.
	* @param {Number} n23 - An element of the matrix.
	* @param {Number} n24 - An element of the matrix.
	* @param {Number} n31 - An element of the matrix.
	* @param {Number} n32 - An element of the matrix.
	* @param {Number} n33 - An element of the matrix.
	* @param {Number} n34 - An element of the matrix.
	* @param {Number} n41 - An element of the matrix.
	* @param {Number} n42 - An element of the matrix.
	* @param {Number} n43 - An element of the matrix.
	* @param {Number} n44 - An element of the matrix.
	* @return {Matrix4} A reference to this matrix.
	*/
	set( n11, n12, n13, n14, n21, n22, n23, n24, n31, n32, n33, n34, n41, n42, n43, n44 ) {

		const e = this.elements;

		e[ 0 ] = n11; e[ 4 ] = n12; e[ 8 ] = n13; e[ 12 ] = n14;
		e[ 1 ] = n21; e[ 5 ] = n22; e[ 9 ] = n23; e[ 13 ] = n24;
		e[ 2 ] = n31; e[ 6 ] = n32; e[ 10 ] = n33; e[ 14 ] = n34;
		e[ 3 ] = n41; e[ 7 ] = n42; e[ 11 ] = n43; e[ 15 ] = n44;

		return this;

	}

	/**
	* Copies all values from the given matrix to this matrix.
	*
	* @param {Matrix4} m - The matrix to copy.
	* @return {Matrix4} A reference to this matrix.
	*/
	copy( m ) {

		const e = this.elements;
		const me = m.elements;

		e[ 0 ] = me[ 0 ]; e[ 1 ] = me[ 1 ]; e[ 2 ] = me[ 2 ]; e[ 3 ] = me[ 3 ];
		e[ 4 ] = me[ 4 ]; e[ 5 ] = me[ 5 ]; e[ 6 ] = me[ 6 ]; e[ 7 ] = me[ 7 ];
		e[ 8 ] = me[ 8 ]; e[ 9 ] = me[ 9 ]; e[ 10 ] = me[ 10 ]; e[ 11 ] = me[ 11 ];
		e[ 12 ] = me[ 12 ]; e[ 13 ] = me[ 13 ]; e[ 14 ] = me[ 14 ]; e[ 15 ] = me[ 15 ];

		return this;

	}

	/**
	* Creates a new matrix and copies all values from this matrix.
	*
	* @return {Matrix4} A new matrix.
	*/
	clone() {

		return new this.constructor().copy( this );

	}

	/**
	* Transforms this matrix to an identity matrix.
	*
	* @return {Matrix4} A reference to this matrix.
	*/
	identity() {

		this.set(

			1, 0, 0, 0,
			0, 1, 0, 0,
			0, 0, 1, 0,
			0, 0, 0, 1

		);

		return this;

	}

	/**
	* Multiplies this matrix with the given matrix.
	*
	* @param {Matrix4} m - The matrix to multiply.
	* @return {Matrix4} A reference to this matrix.
	*/
	multiply( m ) {

		return this.multiplyMatrices( this, m );

	}

	/**
	* Multiplies this matrix with the given matrix.
	* So the order of the multiplication is switched compared to {@link Matrix4#multiply}.
	*
	* @param {Matrix4} m - The matrix to multiply.
	* @return {Matrix4} A reference to this matrix.
	*/
	premultiply( m ) {

		return this.multiplyMatrices( m, this );

	}

	/**
	* Multiplies two given matrices and stores the result in this matrix.
	*
	* @param {Matrix4} a - The first matrix of the operation.
	* @param {Matrix4} b - The second matrix of the operation.
	* @return {Matrix4} A reference to this matrix.
	*/
	multiplyMatrices( a, b ) {

		const ae = a.elements;
		const be = b.elements;
		const e = this.elements;

		const a11 = ae[ 0 ], a12 = ae[ 4 ], a13 = ae[ 8 ], a14 = ae[ 12 ];
		const a21 = ae[ 1 ], a22 = ae[ 5 ], a23 = ae[ 9 ], a24 = ae[ 13 ];
		const a31 = ae[ 2 ], a32 = ae[ 6 ], a33 = ae[ 10 ], a34 = ae[ 14 ];
		const a41 = ae[ 3 ], a42 = ae[ 7 ], a43 = ae[ 11 ], a44 = ae[ 15 ];

		const b11 = be[ 0 ], b12 = be[ 4 ], b13 = be[ 8 ], b14 = be[ 12 ];
		const b21 = be[ 1 ], b22 = be[ 5 ], b23 = be[ 9 ], b24 = be[ 13 ];
		const b31 = be[ 2 ], b32 = be[ 6 ], b33 = be[ 10 ], b34 = be[ 14 ];
		const b41 = be[ 3 ], b42 = be[ 7 ], b43 = be[ 11 ], b44 = be[ 15 ];

		e[ 0 ] = ( a11 * b11 ) + ( a12 * b21 ) + ( a13 * b31 ) + ( a14 * b41 );
		e[ 4 ] = ( a11 * b12 ) + ( a12 * b22 ) + ( a13 * b32 ) + ( a14 * b42 );
		e[ 8 ] = ( a11 * b13 ) + ( a12 * b23 ) + ( a13 * b33 ) + ( a14 * b43 );
		e[ 12 ] = ( a11 * b14 ) + ( a12 * b24 ) + ( a13 * b34 ) + ( a14 * b44 );

		e[ 1 ] = ( a21 * b11 ) + ( a22 * b21 ) + ( a23 * b31 ) + ( a24 * b41 );
		e[ 5 ] = ( a21 * b12 ) + ( a22 * b22 ) + ( a23 * b32 ) + ( a24 * b42 );
		e[ 9 ] = ( a21 * b13 ) + ( a22 * b23 ) + ( a23 * b33 ) + ( a24 * b43 );
		e[ 13 ] = ( a21 * b14 ) + ( a22 * b24 ) + ( a23 * b34 ) + ( a24 * b44 );

		e[ 2 ] = ( a31 * b11 ) + ( a32 * b21 ) + ( a33 * b31 ) + ( a34 * b41 );
		e[ 6 ] = ( a31 * b12 ) + ( a32 * b22 ) + ( a33 * b32 ) + ( a34 * b42 );
		e[ 10 ] = ( a31 * b13 ) + ( a32 * b23 ) + ( a33 * b33 ) + ( a34 * b43 );
		e[ 14 ] = ( a31 * b14 ) + ( a32 * b24 ) + ( a33 * b34 ) + ( a34 * b44 );

		e[ 3 ] = ( a41 * b11 ) + ( a42 * b21 ) + ( a43 * b31 ) + ( a44 * b41 );
		e[ 7 ] = ( a41 * b12 ) + ( a42 * b22 ) + ( a43 * b32 ) + ( a44 * b42 );
		e[ 11 ] = ( a41 * b13 ) + ( a42 * b23 ) + ( a43 * b33 ) + ( a44 * b43 );
		e[ 15 ] = ( a41 * b14 ) + ( a42 * b24 ) + ( a43 * b34 ) + ( a44 * b44 );

		return this;

	}

	/**
	* Multiplies the given scalar with this matrix.
	*
	* @param {Number} s - The scalar to multiply.
	* @return {Matrix4} A reference to this matrix.
	*/
	multiplyScalar( s ) {

		const e = this.elements;

		e[ 0 ] *= s; e[ 4 ] *= s; e[ 8 ] *= s; e[ 12 ] *= s;
		e[ 1 ] *= s; e[ 5 ] *= s; e[ 9 ] *= s; e[ 13 ] *= s;
		e[ 2 ] *= s; e[ 6 ] *= s; e[ 10 ] *= s; e[ 14 ] *= s;
		e[ 3 ] *= s; e[ 7 ] *= s; e[ 11 ] *= s; e[ 15 ] *= s;

		return this;

	}

	/**
	* Extracts the basis vectors and stores them to the given vectors.
	*
	* @param {Vector3} xAxis - The first result vector for the x-axis.
	* @param {Vector3} yAxis - The second result vector for the y-axis.
	* @param {Vector3} zAxis - The third result vector for the z-axis.
	* @return {Matrix4} A reference to this matrix.
	*/
	extractBasis( xAxis, yAxis, zAxis ) {

		xAxis.fromMatrix4Column( this, 0 );
		yAxis.fromMatrix4Column( this, 1 );
		zAxis.fromMatrix4Column( this, 2 );

		return this;

	}

	/**
	* Makes a basis from the given vectors.
	*
	* @param {Vector3} xAxis - The first basis vector for the x-axis.
	* @param {Vector3} yAxis - The second basis vector for the y-axis.
	* @param {Vector3} zAxis - The third basis vector for the z-axis.
	* @return {Matrix4} A reference to this matrix.
	*/
	makeBasis( xAxis, yAxis, zAxis ) {

		this.set(
			xAxis.x, yAxis.x, zAxis.x, 0,
			xAxis.y, yAxis.y, zAxis.y, 0,
			xAxis.z, yAxis.z, zAxis.z, 0,
			0, 0, 0, 1
		);

		return this;

	}

	/**
	* Composes a matrix from the given position, quaternion and scale.
	*
	* @param {Vector3} position - A vector representing a position in 3D space.
	* @param {Quaternion} rotation - A quaternion representing a rotation.
	* @param {Vector3} scale - A vector representing a 3D scaling.
	* @return {Matrix4} A reference to this matrix.
	*/
	compose( position, rotation, scale ) {

		this.fromQuaternion( rotation );
		this.scale( scale );
		this.setPosition( position );

		return this;

	}

	/**
	* Scales this matrix by the given 3D vector.
	*
	* @param {Vector3} v - A 3D vector representing a scaling.
	* @return {Matrix4} A reference to this matrix.
	*/
	scale( v ) {

		const e = this.elements;

		const x = v.x, y = v.y, z = v.z;

		e[ 0 ] *= x; e[ 4 ] *= y; e[ 8 ] *= z;
		e[ 1 ] *= x; e[ 5 ] *= y; e[ 9 ] *= z;
		e[ 2 ] *= x; e[ 6 ] *= y; e[ 10 ] *= z;
		e[ 3 ] *= x; e[ 7 ] *= y; e[ 11 ] *= z;

		return this;

	}

	/**
	* Sets the translation part of the 4x4 matrix to the given position vector.
	*
	* @param {Vector3} v - A 3D vector representing a position.
	* @return {Matrix4} A reference to this matrix.
	*/
	setPosition( v ) {

		const e = this.elements;

		e[ 12 ] = v.x;
		e[ 13 ] = v.y;
		e[ 14 ] = v.z;

		return this;

	}

	/**
	* Transposes this matrix.
	*
	* @return {Matrix4} A reference to this matrix.
	*/
	transpose() {

		const e = this.elements;
		let t;

		t = e[ 1 ]; e[ 1 ] = e[ 4 ]; e[ 4 ] = t;
		t = e[ 2 ]; e[ 2 ] = e[ 8 ]; e[ 8 ] = t;
		t = e[ 6 ]; e[ 6 ] = e[ 9 ]; e[ 9 ] = t;

		t = e[ 3 ]; e[ 3 ] = e[ 12 ]; e[ 12 ] = t;
		t = e[ 7 ]; e[ 7 ] = e[ 13 ]; e[ 13 ] = t;
		t = e[ 11 ]; e[ 11 ] = e[ 14 ]; e[ 14 ] = t;

		return this;


	}

	/**
	* Computes the inverse of this matrix and stored the result in the given matrix.
	*
	* You can not invert a matrix with a determinant of zero. If you attempt this, the method returns a zero matrix instead.
	*
	* @param {Matrix4} m - The result matrix.
	* @return {Matrix4} The result matrix.
	*/
	getInverse( m ) {

		const e = this.elements;
		const me = m.elements;

		const n11 = e[ 0 ], n21 = e[ 1 ], n31 = e[ 2 ], n41 = e[ 3 ];
		const n12 = e[ 4 ], n22 = e[ 5 ], n32 = e[ 6 ], n42 = e[ 7 ];
		const n13 = e[ 8 ], n23 = e[ 9 ], n33 = e[ 10 ], n43 = e[ 11 ];
		const n14 = e[ 12 ], n24 = e[ 13 ], n34 = e[ 14 ], n44 = e[ 15 ];

		const t11 = n23 * n34 * n42 - n24 * n33 * n42 + n24 * n32 * n43 - n22 * n34 * n43 - n23 * n32 * n44 + n22 * n33 * n44;
		const t12 = n14 * n33 * n42 - n13 * n34 * n42 - n14 * n32 * n43 + n12 * n34 * n43 + n13 * n32 * n44 - n12 * n33 * n44;
		const t13 = n13 * n24 * n42 - n14 * n23 * n42 + n14 * n22 * n43 - n12 * n24 * n43 - n13 * n22 * n44 + n12 * n23 * n44;
		const t14 = n14 * n23 * n32 - n13 * n24 * n32 - n14 * n22 * n33 + n12 * n24 * n33 + n13 * n22 * n34 - n12 * n23 * n34;

		const det = n11 * t11 + n21 * t12 + n31 * t13 + n41 * t14;

		if ( det === 0 ) return m.set( 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 );

		const detInv = 1 / det;

		me[ 0 ] = t11 * detInv;
		me[ 1 ] = ( n24 * n33 * n41 - n23 * n34 * n41 - n24 * n31 * n43 + n21 * n34 * n43 + n23 * n31 * n44 - n21 * n33 * n44 ) * detInv;
		me[ 2 ] = ( n22 * n34 * n41 - n24 * n32 * n41 + n24 * n31 * n42 - n21 * n34 * n42 - n22 * n31 * n44 + n21 * n32 * n44 ) * detInv;
		me[ 3 ] = ( n23 * n32 * n41 - n22 * n33 * n41 - n23 * n31 * n42 + n21 * n33 * n42 + n22 * n31 * n43 - n21 * n32 * n43 ) * detInv;

		me[ 4 ] = t12 * detInv;
		me[ 5 ] = ( n13 * n34 * n41 - n14 * n33 * n41 + n14 * n31 * n43 - n11 * n34 * n43 - n13 * n31 * n44 + n11 * n33 * n44 ) * detInv;
		me[ 6 ] = ( n14 * n32 * n41 - n12 * n34 * n41 - n14 * n31 * n42 + n11 * n34 * n42 + n12 * n31 * n44 - n11 * n32 * n44 ) * detInv;
		me[ 7 ] = ( n12 * n33 * n41 - n13 * n32 * n41 + n13 * n31 * n42 - n11 * n33 * n42 - n12 * n31 * n43 + n11 * n32 * n43 ) * detInv;

		me[ 8 ] = t13 * detInv;
		me[ 9 ] = ( n14 * n23 * n41 - n13 * n24 * n41 - n14 * n21 * n43 + n11 * n24 * n43 + n13 * n21 * n44 - n11 * n23 * n44 ) * detInv;
		me[ 10 ] = ( n12 * n24 * n41 - n14 * n22 * n41 + n14 * n21 * n42 - n11 * n24 * n42 - n12 * n21 * n44 + n11 * n22 * n44 ) * detInv;
		me[ 11 ] = ( n13 * n22 * n41 - n12 * n23 * n41 - n13 * n21 * n42 + n11 * n23 * n42 + n12 * n21 * n43 - n11 * n22 * n43 ) * detInv;

		me[ 12 ] = t14 * detInv;
		me[ 13 ] = ( n13 * n24 * n31 - n14 * n23 * n31 + n14 * n21 * n33 - n11 * n24 * n33 - n13 * n21 * n34 + n11 * n23 * n34 ) * detInv;
		me[ 14 ] = ( n14 * n22 * n31 - n12 * n24 * n31 - n14 * n21 * n32 + n11 * n24 * n32 + n12 * n21 * n34 - n11 * n22 * n34 ) * detInv;
		me[ 15 ] = ( n12 * n23 * n31 - n13 * n22 * n31 + n13 * n21 * n32 - n11 * n23 * n32 - n12 * n21 * n33 + n11 * n22 * n33 ) * detInv;

		return m;

	}

	/**
	* Computes the maximum scale value for all three axis.
	*
	* @return {Number} The maximum scale value.
	*/
	getMaxScale() {

		const e = this.elements;

		const scaleXSq = e[ 0 ] * e[ 0 ] + e[ 1 ] * e[ 1 ] + e[ 2 ] * e[ 2 ];
		const scaleYSq = e[ 4 ] * e[ 4 ] + e[ 5 ] * e[ 5 ] + e[ 6 ] * e[ 6 ];
		const scaleZSq = e[ 8 ] * e[ 8 ] + e[ 9 ] * e[ 9 ] + e[ 10 ] * e[ 10 ];

		return Math.sqrt( Math.max( scaleXSq, scaleYSq, scaleZSq ) );

	}

	/**
	* Uses the given quaternion to transform the upper left 3x3 part to a rotation matrix.
	* Other parts of the matrix are equal to the identiy matrix.
	*
	* @param {Quaternion} q - A quaternion representing a rotation.
	* @return {Matrix4} A reference to this matrix.
	*/
	fromQuaternion( q ) {

		const e = this.elements;

		const x = q.x, y = q.y, z = q.z, w = q.w;
		const x2 = x + x, y2 = y + y, z2 = z + z;
		const xx = x * x2, xy = x * y2, xz = x * z2;
		const yy = y * y2, yz = y * z2, zz = z * z2;
		const wx = w * x2, wy = w * y2, wz = w * z2;

		e[ 0 ] = 1 - ( yy + zz );
		e[ 4 ] = xy - wz;
		e[ 8 ] = xz + wy;

		e[ 1 ] = xy + wz;
		e[ 5 ] = 1 - ( xx + zz );
		e[ 9 ] = yz - wx;

		e[ 2 ] = xz - wy;
		e[ 6 ] = yz + wx;
		e[ 10 ] = 1 - ( xx + yy );

		e[ 3 ] = 0;
		e[ 7 ] = 0;
		e[ 11 ] = 0;

		e[ 12 ] = 0;
		e[ 13 ] = 0;
		e[ 14 ] = 0;
		e[ 15 ] = 1;

		return this;

	}

	/**
	* Sets the upper-left 3x3 portion of this matrix by the given 3x3 matrix. Other
	* parts of the matrix are equal to the identiy matrix.
	*
	* @param {Matrix3} m - A 3x3 matrix.
	* @return {Matrix4} A reference to this matrix.
	*/
	fromMatrix3( m ) {

		const e = this.elements;
		const me = m.elements;

		e[ 0 ] = me[ 0 ];
		e[ 1 ] = me[ 1 ];
		e[ 2 ] = me[ 2 ];
		e[ 3 ] = 0;

		e[ 4 ] = me[ 3 ];
		e[ 5 ] = me[ 4 ];
		e[ 6 ] = me[ 5 ];
		e[ 7 ] = 0;

		e[ 8 ] = me[ 6 ];
		e[ 9 ] = me[ 7 ];
		e[ 10 ] = me[ 8 ];
		e[ 11 ] = 0;

		e[ 12 ] = 0;
		e[ 13 ] = 0;
		e[ 14 ] = 0;
		e[ 15 ] = 1;

		return this;

	}

	/**
	* Sets the elements of this matrix from an array.
	*
	* @param {Array<Number>} array - An array.
	* @param {Number} offset - An optional offset.
	* @return {Matrix4} A reference to this matrix.
	*/
	fromArray( array, offset = 0 ) {

		const e = this.elements;

		for ( let i = 0; i < 16; i ++ ) {

			e[ i ] = array[ i + offset ];

		}

		return this;

	}

	/**
	* Copies all elements of this matrix to the given array.
	*
	* @param {Array<Number>} array - An array.
	* @param {Number} offset - An optional offset.
	* @return {Array<Number>} The array with the elements of the matrix.
	*/
	toArray( array, offset = 0 ) {

		const e = this.elements;

		array[ offset + 0 ] = e[ 0 ];
		array[ offset + 1 ] = e[ 1 ];
		array[ offset + 2 ] = e[ 2 ];
		array[ offset + 3 ] = e[ 3 ];

		array[ offset + 4 ] = e[ 4 ];
		array[ offset + 5 ] = e[ 5 ];
		array[ offset + 6 ] = e[ 6 ];
		array[ offset + 7 ] = e[ 7 ];

		array[ offset + 8 ] = e[ 8 ];
		array[ offset + 9 ] = e[ 9 ];
		array[ offset + 10 ] = e[ 10 ];
		array[ offset + 11 ] = e[ 11 ];

		array[ offset + 12 ] = e[ 12 ];
		array[ offset + 13 ] = e[ 13 ];
		array[ offset + 14 ] = e[ 14 ];
		array[ offset + 15 ] = e[ 15 ];

		return array;

	}

	/**
	* Returns true if the given matrix is deep equal with this matrix.
	*
	* @param {Matrix4} m - The matrix to test.
	* @return {Boolean} The result of the equality test.
	*/
	equals( m ) {

		const e = this.elements;
		const me = m.elements;

		for ( let i = 0; i < 16; i ++ ) {

			if ( e[ i ] !== me[ i ] ) return false;

		}

		return true;

	}

}

const targetRotation = new Quaternion();
const targetDirection = new Vector3();
const positionWorld = new Vector3();
const quaternionWorld = new Quaternion();

/**
* Base class for all game entities.
*
* @author {@link https://github.com/Mugen87|Mugen87}
*/
class GameEntity {

	/**
	* Constructs a new game entity.
	*/
	constructor() {

		/**
		* The name of this game entity.
		* @type {String}
		*/
		this.name = '';

		/**
		* Whether this game entity is active or not.
		* @type {Boolean}
		* @default true
		*/
		this.active = true;

		/**
		* The child entities of this game entity.
		* @type {Array<GameEntity>}
		*/
		this.children = new Array();

		/**
		* A reference to the parent entity of this game entity.
		* Automatically set when added to a {@link GameEntity}.
		* @type {?GameEntity}
		* @default null
		* @readonly
		*/
		this.parent = null;

		/**
		* A list of neighbors of this game entity.
		* @type {Array<GameEntity>}
		* @readonly
		*/
		this.neighbors = new Array();

		/**
		* Game entities within this radius are considered as neighbors of this entity.
		* @type {Number}
		* @default 1
		*/
		this.neighborhoodRadius = 1;

		/**
		* Whether the neighborhood of this game entity is updated or not.
		* @type {Boolean}
		* @default false
		*/
		this.updateNeighborhood = false;

		/**
		* The position of this game entity.
		* @type {Vector3}
		*/
		this.position = new Vector3();

		/**
		* The rotation of this game entity.
		* @type {Quaternion}
		*/
		this.rotation = new Quaternion();

		/**
		* The scaling of this game entity.
		* @type {Vector3}
		*/
		this.scale = new Vector3( 1, 1, 1 );

		/**
		* The default forward vector of this game entity.
		* @type {Vector3}
		* @default (0,0,1)
		*/
		this.forward = new Vector3( 0, 0, 1 );

		/**
		* The default up vector of this game entity.
		* @type {Vector3}
		* @default (0,1,0)
		*/
		this.up = new Vector3( 0, 1, 0 );

		/**
		* The bounding radius of this game entity in world units.
		* @type {Number}
		* @default 0
		*/
		this.boundingRadius = 0;

		/**
		* The maximum turn rate of this game entity in radians per seconds.
		* The only method that uses this property right now is {@link GameEntity#rotateTo}.
		* @type {Number}
		* @default π
		*/
		this.maxTurnRate = Math.PI;

		/**
		* Whether the entity can activate a trigger or not.
		* @type {Boolean}
		* @default true
		*/
		this.canActivateTrigger = true;

		/**
		* A reference to the entity manager of this game entity.
		* Automatically set when added to an {@link EntityManager}.
		* @type {EntityManager}
		* @default null
		* @readonly
		*/
		this.manager = null;

		// private properties

		// local transformation matrix. no part of the public API due to caching

		this._localMatrix = new Matrix4();

		// internal world matrix reference (only accessible via a getter)

		this._worldMatrix = new Matrix4();

		// per-entity cache in order to avoid unnecessary matrix calculations

		this._cache = {
			position: new Vector3(),
			rotation: new Quaternion(),
			scale: new Vector3( 1, 1, 1 )
		};

		// render component

		this._renderComponent = null;
		this._renderComponentCallback = null;

		// flag to indicate whether the entity was updated by its manager at least once or not

		this._started = false;

		//

		this._uuid = null;

		// if set to true, it means the world matrix requires a recomputation

		this._worldMatrixDirty = false;

	}

	/**
	* A transformation matrix representing the world space of this game entity.
	* @type {Matrix4}
	* @readonly
	*/
	get worldMatrix() {

		this._updateWorldMatrix();

		return this._worldMatrix;

	}

	/**
	* Unique ID, primarily used in context of serialization/deserialization.
	* @type {String}
	* @readonly
	*/
	get uuid() {

		if ( this._uuid === null ) {

			this._uuid = MathUtils.generateUUID();

		}

		return this._uuid;

	}

	/**
	* Executed when this game entity is updated for the first time by its {@link EntityManager}.
	*
	* @return {GameEntity} A reference to this game entity.
	*/
	start() {

		return this;

	}

	/**
	* Updates the internal state of this game entity. Normally called by {@link EntityManager#update}
	* in each simulation step.
	*
	* @param {Number} delta - The time delta.
	* @return {GameEntity} A reference to this game entity.
	*/
	update( /* delta */ ) {

		return this;

	}


	/**
	* Adds a game entity as a child to this game entity.
	*
	* @param {GameEntity} entity - The game entity to add.
	* @return {GameEntity} A reference to this game entity.
	*/
	add( entity ) {

		if ( entity.parent !== null ) {

			entity.parent.remove( entity );

		}

		this.children.push( entity );
		entity.parent = this;

		return this;

	}

	/**
	* Removes a game entity as a child from this game entity.
	*
	* @param {GameEntity} entity - The game entity to remove.
	* @return {GameEntity} A reference to this game entity.
	*/
	remove( entity ) {

		const index = this.children.indexOf( entity );
		this.children.splice( index, 1 );

		entity.parent = null;

		return this;

	}

	/**
	* Computes the current direction (forward) vector of this game entity
	* and stores the result in the given vector.
	*
	* @param {Vector3} result - The direction vector of this game entity.
	* @return {Vector3} The direction vector of this game entity.
	*/
	getDirection( result ) {

		return result.copy( this.forward ).applyRotation( this.rotation ).normalize();

	}

	/**
	* Directly rotates the entity so it faces the given target position.
	*
	* @param {Vector3} target - The target position.
	* @return {GameEntity} A reference to this game entity.
	*/
	lookAt( target ) {

		const parent = this.parent;

		if ( parent !== null ) {

			this.getWorldPosition( positionWorld );

			targetDirection.subVectors( target, positionWorld ).normalize();

			this.rotation.lookAt( this.forward, targetDirection, this.up );

			quaternionWorld.extractRotationFromMatrix( parent.worldMatrix ).inverse();

			this.rotation.premultiply( quaternionWorld );

		} else {

			targetDirection.subVectors( target, this.position ).normalize();

			this.rotation.lookAt( this.forward, targetDirection, this.up );

		}

		return this;

	}

	/**
	* Given a target position, this method rotates the entity by an amount not
	* greater than {@link GameEntity#maxTurnRate} until it directly faces the target.
	*
	* @param {Vector3} target - The target position.
	* @param {Number} delta - The time delta.
	* @param {Number} tolerance - A tolerance value in radians to tweak the result
	* when a game entity is considered to face a target.
	* @return {Boolean} Whether the entity is faced to the target or not.
	*/
	rotateTo( target, delta, tolerance = 0.0001 ) {

		const parent = this.parent;

		if ( parent !== null ) {

			this.getWorldPosition( positionWorld );

			targetDirection.subVectors( target, positionWorld ).normalize();

			targetRotation.lookAt( this.forward, targetDirection, this.up );

			quaternionWorld.extractRotationFromMatrix( parent.worldMatrix ).inverse();

			targetRotation.premultiply( quaternionWorld );

		} else {

			targetDirection.subVectors( target, this.position ).normalize();

			targetRotation.lookAt( this.forward, targetDirection, this.up );

		}

		return this.rotation.rotateTo( targetRotation, this.maxTurnRate * delta, tolerance );

	}

	/**
	* Computes the current direction (forward) vector of this game entity
	* in world space and stores the result in the given vector.
	*
	* @param {Vector3} result - The direction vector of this game entity in world space.
	* @return {Vector3} The direction vector of this game entity in world space.
	*/
	getWorldDirection( result ) {

		quaternionWorld.extractRotationFromMatrix( this.worldMatrix );

		return result.copy( this.forward ).applyRotation( quaternionWorld ).normalize();

	}

	/**
	* Computes the current position of this game entity in world space and
	* stores the result in the given vector.
	*
	* @param {Vector3} result - The position of this game entity in world space.
	* @return {Vector3} The position of this game entity in world space.
	*/
	getWorldPosition( result ) {

		return result.extractPositionFromMatrix( this.worldMatrix );

	}

	/**
	* Sets a renderable component of a 3D engine with a sync callback for this game entity.
	*
	* @param {Object} renderComponent - A renderable component of a 3D engine.
	* @param {Function} callback - A callback that can be used to sync this game entity with the renderable component.
	* @return {GameEntity} A reference to this game entity.
	*/
	setRenderComponent( renderComponent, callback ) {

		this._renderComponent = renderComponent;
		this._renderComponentCallback = callback;

		return this;

	}

	/**
	* Holds the implementation for the message handling of this game entity.
	*
	* @param {Telegram} telegram - The telegram with the message data.
	* @return {Boolean} Whether the message was processed or not.
	*/
	handleMessage() {

		return false;

	}

	/**
	* Holds the implementation for the line of sight test of this game entity.
	* This method is used by {@link Vision#visible} in order to determine whether
	* this game entity blocks the given line of sight or not. Implement this method
	* when your game entity acts as an obstacle.
	*
	* @param {Ray} ray - The ray that represents the line of sight.
	* @param {Vector3} intersectionPoint - The intersection point.
	* @return {Vector3} The intersection point.
	*/
	lineOfSightTest() {

		return null;

	}

	/**
	* Sends a message with the given data to the specified receiver.
	*
	* @param {GameEntity} receiver - The receiver.
	* @param {String} message - The actual message.
	* @param {Number} delay - A time value in millisecond used to delay the message dispatching.
	* @param {Object} data - An object for custom data.
	* @return {GameEntity} A reference to this game entity.
	*/
	sendMessage( receiver, message, delay = 0, data = null ) {

		if ( this.manager !== null ) {

			this.manager.sendMessage( this, receiver, message, delay, data );

		} else {

			Logger.error( 'YUKA.GameEntity: The game entity must be added to a manager in order to send a message.' );

		}

		return this;

	}

	/**
	* Transforms this instance into a JSON object.
	*
	* @return {Object} The JSON object.
	*/
	toJSON() {

		return {
			type: this.constructor.name,
			uuid: this.uuid,
			name: this.name,
			active: this.active,
			children: entitiesToIds( this.children ),
			parent: ( this.parent !== null ) ? this.parent.uuid : null,
			neighbors: entitiesToIds( this.neighbors ),
			neighborhoodRadius: this.neighborhoodRadius,
			updateNeighborhood: this.updateNeighborhood,
			position: this.position.toArray( new Array() ),
			rotation: this.rotation.toArray( new Array() ),
			scale: this.scale.toArray( new Array() ),
			forward: this.forward.toArray( new Array() ),
			up: this.up.toArray( new Array() ),
			boundingRadius: this.boundingRadius,
			maxTurnRate: this.maxTurnRate,
			canActivateTrigger: this.canActivateTrigger,
			worldMatrix: this.worldMatrix.toArray( new Array() ),
			_localMatrix: this._localMatrix.toArray( new Array() ),
			_cache: {
				position: this._cache.position.toArray( new Array() ),
				rotation: this._cache.rotation.toArray( new Array() ),
				scale: this._cache.scale.toArray( new Array() ),
			},
			_started: this._started
		};

	}

	/**
	* Restores this instance from the given JSON object.
	*
	* @param {Object} json - The JSON object.
	* @return {GameEntity} A reference to this game entity.
	*/
	fromJSON( json ) {

		this.name = json.name;
		this.active = json.active;
		this.neighborhoodRadius = json.neighborhoodRadius;
		this.updateNeighborhood = json.updateNeighborhood;
		this.position.fromArray( json.position );
		this.rotation.fromArray( json.rotation );
		this.scale.fromArray( json.scale );
		this.forward.fromArray( json.forward );
		this.up.fromArray( json.up );
		this.boundingRadius = json.boundingRadius;
		this.maxTurnRate = json.maxTurnRate;
		this.canActivateTrigger = json.canActivateTrigger;

		this.children = json.children.slice();
		this.neighbors = json.neighbors.slice();
		this.parent = json.parent;

		this._localMatrix.fromArray( json._localMatrix );
		this._worldMatrix.fromArray( json.worldMatrix );

		this._cache.position.fromArray( json._cache.position );
		this._cache.rotation.fromArray( json._cache.rotation );
		this._cache.scale.fromArray( json._cache.scale );

		this._started = json._started;

		this._uuid = json.uuid;

		return this;

	}

	/**
	* Restores UUIDs with references to GameEntity objects.
	*
	* @param {Map<String,GameEntity>} entities - Maps game entities to UUIDs.
	* @return {GameEntity} A reference to this game entity.
	*/
	resolveReferences( entities ) {

		//

		const neighbors = this.neighbors;

		for ( let i = 0, l = neighbors.length; i < l; i ++ ) {

			neighbors[ i ] = entities.get( neighbors[ i ] );

		}

		//

		const children = this.children;

		for ( let i = 0, l = children.length; i < l; i ++ ) {

			children[ i ] = entities.get( children[ i ] );

		}

		//

		this.parent = entities.get( this.parent ) || null;

		return this;

	}

	// Updates the transformation matrix representing the local space.

	_updateMatrix() {

		const cache = this._cache;

		if ( cache.position.equals( this.position ) &&
				cache.rotation.equals( this.rotation ) &&
				cache.scale.equals( this.scale ) ) {

			return;

		}

		this._localMatrix.compose( this.position, this.rotation, this.scale );

		cache.position.copy( this.position );
		cache.rotation.copy( this.rotation );
		cache.scale.copy( this.scale );

		this._worldMatrixDirty = true;

	}

	_updateWorldMatrix() {

		const parent = this.parent;

		if ( parent !== null ) {

			parent._updateWorldMatrix();

		}

		this._updateMatrix();

		if ( this._worldMatrixDirty === true ) {

			if ( parent === null ) {

				this._worldMatrix.copy( this._localMatrix );

			} else {

				this._worldMatrix.multiplyMatrices( this.parent._worldMatrix, this._localMatrix );

			}

			this._worldMatrixDirty = false;

			// invalidate world matrices of children

			const children = this.children;

			for ( let i = 0, l = children.length; i < l; i ++ ) {

				const child = children[ i ];
				child._worldMatrixDirty = true;

			}

		}

	}

	// deprecated

	updateWorldMatrix() {

		// this warning will be removed with v1.0.0

		console.warn( 'GameEntity: .updateWorldMatrix() has been removed. World matrices are automatically updated on access.' );
		return this;

	}

}

function entitiesToIds( array ) {

	const ids = new Array();

	for ( let i = 0, l = array.length; i < l; i ++ ) {

		ids.push( array[ i ].uuid );

	}

	return ids;

}

const displacement$4 = new Vector3();
const target$1 = new Vector3();

/**
* Class representing moving game entities.
*
* @author {@link https://github.com/Mugen87|Mugen87}
* @augments GameEntity
*/
class MovingEntity extends GameEntity {

	/**
	* Constructs a new moving entity.
	*/
	constructor() {

		super();

		/**
		* The velocity of this game entity.
		* @type {Vector3}
		*/
		this.velocity = new Vector3();

		/**
		* The maximum speed at which this game entity may travel.
		* @type {Number}
		* @default 1
		*/
		this.maxSpeed = 1;

		/**
		* Whether the orientation of this game entity will be updated based on the velocity or not.
		* @type {Boolean}
		* @default true
		*/
		this.updateOrientation = true;

	}

	/**
	* Updates the internal state of this game entity.
	*
	* @param {Number} delta - The time delta.
	* @return {MovingEntity} A reference to this moving entity.
	*/
	update( delta ) {

		// make sure vehicle does not exceed maximum speed

		if ( this.getSpeedSquared() > ( this.maxSpeed * this.maxSpeed ) ) {

			this.velocity.normalize();
			this.velocity.multiplyScalar( this.maxSpeed );

		}

		// calculate displacement

		displacement$4.copy( this.velocity ).multiplyScalar( delta );

		// calculate target position

		target$1.copy( this.position ).add( displacement$4 );

		// update the orientation if the vehicle has a non zero velocity

		if ( this.updateOrientation && this.getSpeedSquared() > 0.00000001 ) {

			this.lookAt( target$1 );

		}

		// update position

		this.position.copy( target$1 );

		return this;

	}

	/**
	* Returns the current speed of this game entity.
	*
	* @return {Number} The current speed.
	*/
	getSpeed() {

		return this.velocity.length();

	}

	/**
	* Returns the current speed in squared space of this game entity.
	*
	* @return {Number} The current speed in squared space.
	*/
	getSpeedSquared() {

		return this.velocity.squaredLength();

	}

	/**
	* Transforms this instance into a JSON object.
	*
	* @return {Object} The JSON object.
	*/
	toJSON() {

		const json = super.toJSON();

		json.velocity = this.velocity.toArray( new Array() );
		json.maxSpeed = this.maxSpeed;
		json.updateOrientation = this.updateOrientation;

		return json;

	}

	/**
	* Restores this instance from the given JSON object.
	*
	* @param {Object} json - The JSON object.
	* @return {MovingEntity} A reference to this moving entity.
	*/
	fromJSON( json ) {

		super.fromJSON( json );

		this.velocity.fromArray( json.velocity );
		this.maxSpeed = json.maxSpeed;
		this.updateOrientation = json.updateOrientation;

		return this;

	}

}

/**
* Base class for all concrete steering behaviors. They produce a force that describes
* where an agent should move and how fast it should travel to get there.
*
* Note: All built-in steering behaviors assume a {@link Vehicle#mass} of one. Different values can lead to an unexpected results.
*
* @author {@link https://github.com/Mugen87|Mugen87}
*/
class SteeringBehavior {

	/**
	* Constructs a new steering behavior.
	*/
	constructor() {

		/**
		* Whether this steering behavior is active or not.
		* @type {Boolean}
		* @default true
		*/
		this.active = true;

		/**
		* Can be used to tweak the amount that a steering force contributes to the total steering force.
		* @type {Number}
		* @default 1
		*/
		this.weight = 1;

	}

	/**
	* Calculates the steering force for a single simulation step.
	*
	* @param {Vehicle} vehicle - The game entity the force is produced for.
	* @param {Vector3} force - The force/result vector.
	* @param {Number} delta - The time delta.
	* @return {Vector3} The force/result vector.
	*/
	calculate( /* vehicle, force, delta */ ) {}

	/**
	* Transforms this instance into a JSON object.
	*
	* @return {Object} The JSON object.
	*/
	toJSON() {

		return {
			type: this.constructor.name,
			active: this.active,
			weight: this.weight
		};

	}

	/**
	* Restores this instance from the given JSON object.
	*
	* @param {Object} json - The JSON object.
	* @return {SteeringBehavior} A reference to this steering behavior.
	*/
	fromJSON( json ) {

		this.active = json.active;
		this.weight = json.weight;

		return this;

	}

	/**
	* Restores UUIDs with references to GameEntity objects.
	*
	* @param {Map<String,GameEntity>} entities - Maps game entities to UUIDs.
	* @return {SteeringBehavior} A reference to this steering behavior.
	*/
	resolveReferences( /* entities */ ) {}

}

const averageDirection = new Vector3();
const direction$1 = new Vector3();

/**
* This steering behavior produces a force that keeps a vehicle’s heading aligned with its neighbors.
*
* @author {@link https://github.com/Mugen87|Mugen87}
* @augments SteeringBehavior
*/
class AlignmentBehavior extends SteeringBehavior {

	/**
	* Constructs a new alignment behavior.
	*/
	constructor() {

		super();

	}

	/**
	* Calculates the steering force for a single simulation step.
	*
	* @param {Vehicle} vehicle - The game entity the force is produced for.
	* @param {Vector3} force - The force/result vector.
	* @param {Number} delta - The time delta.
	* @return {Vector3} The force/result vector.
	*/
	calculate( vehicle, force /*, delta */ ) {

		averageDirection.set( 0, 0, 0 );

		const neighbors = vehicle.neighbors;

		// iterate over all neighbors to calculate the average direction vector

		for ( let i = 0, l = neighbors.length; i < l; i ++ ) {

			const neighbor = neighbors[ i ];

			neighbor.getDirection( direction$1 );

			averageDirection.add( direction$1 );

		}

		if ( neighbors.length > 0 ) {

			averageDirection.divideScalar( neighbors.length );

			// produce a force to align the vehicle's heading

			vehicle.getDirection( direction$1 );
			force.subVectors( averageDirection, direction$1 );

		}

		return force;

	}

}

const desiredVelocity$2 = new Vector3();
const displacement$3 = new Vector3();

/**
* This steering behavior produces a force that directs an agent toward a target position.
* Unlike {@link SeekBehavior}, it decelerates so the agent comes to a gentle halt at the target position.
*
* @author {@link https://github.com/Mugen87|Mugen87}
* @augments SteeringBehavior
*/
class ArriveBehavior extends SteeringBehavior {

	/**
	* Constructs a new arrive behavior.
	*
	* @param {Vector3} target - The target vector.
	* @param {Number} deceleration - The amount of deceleration.
	* @param {Number} tolerance - A tolerance value in world units to prevent the vehicle from overshooting its target.
	*/
	constructor( target = new Vector3(), deceleration = 3, tolerance = 0 ) {

		super();

		/**
		* The target vector.
		* @type {Vector3}
		*/
		this.target = target;

		/**
		* The amount of deceleration.
		* @type {Number}
		* @default 3
		*/
		this.deceleration = deceleration;

		/**
		* A tolerance value in world units to prevent the vehicle from overshooting its target.
		* @type {Number}
		* @default 0
		*/
		this.tolerance = tolerance;

	}

	/**
	* Calculates the steering force for a single simulation step.
	*
	* @param {Vehicle} vehicle - The game entity the force is produced for.
	* @param {Vector3} force - The force/result vector.
	* @param {Number} delta - The time delta.
	* @return {Vector3} The force/result vector.
	*/
	calculate( vehicle, force /*, delta */ ) {

		const target = this.target;
		const deceleration = this.deceleration;

		displacement$3.subVectors( target, vehicle.position );

		const distance = displacement$3.length();

		if ( distance > this.tolerance ) {

			// calculate the speed required to reach the target given the desired deceleration

			let speed = distance / deceleration;

			// make sure the speed does not exceed the max

			speed = Math.min( speed, vehicle.maxSpeed );

			// from here proceed just like "seek" except we don't need to normalize
			// the "displacement" vector because we have already gone to the trouble
			// of calculating its length.

			desiredVelocity$2.copy( displacement$3 ).multiplyScalar( speed / distance );

		} else {

			desiredVelocity$2.set( 0, 0, 0 );

		}

		return force.subVectors( desiredVelocity$2, vehicle.velocity );

	}

	/**
	* Transforms this instance into a JSON object.
	*
	* @return {Object} The JSON object.
	*/
	toJSON() {

		const json = super.toJSON();

		json.target = this.target.toArray( new Array() );
		json.deceleration = this.deceleration;

		return json;

	}

	/**
	* Restores this instance from the given JSON object.
	*
	* @param {Object} json - The JSON object.
	* @return {ArriveBehavior} A reference to this behavior.
	*/
	fromJSON( json ) {

		super.fromJSON( json );

		this.target.fromArray( json.target );
		this.deceleration = json.deceleration;

		return this;

	}

}

const desiredVelocity$1 = new Vector3();

/**
* This steering behavior produces a force that directs an agent toward a target position.
*
* @author {@link https://github.com/Mugen87|Mugen87}
* @augments SteeringBehavior
*/
class SeekBehavior extends SteeringBehavior {

	/**
	* Constructs a new seek behavior.
	*
	* @param {Vector3} target - The target vector.
	*/
	constructor( target = new Vector3() ) {

		super();

		/**
		* The target vector.
		* @type {Vector3}
		*/
		this.target = target;

	}

	/**
	* Calculates the steering force for a single simulation step.
	*
	* @param {Vehicle} vehicle - The game entity the force is produced for.
	* @param {Vector3} force - The force/result vector.
	* @param {Number} delta - The time delta.
	* @return {Vector3} The force/result vector.
	*/
	calculate( vehicle, force /*, delta */ ) {

		const target = this.target;

		// First the desired velocity is calculated.
		// This is the velocity the agent would need to reach the target position in an ideal world.
		// It represents the vector from the agent to the target,
		// scaled to be the length of the maximum possible speed of the agent.

		desiredVelocity$1.subVectors( target, vehicle.position ).normalize();
		desiredVelocity$1.multiplyScalar( vehicle.maxSpeed );

		// The steering force returned by this method is the force required,
		// which when added to the agent’s current velocity vector gives the desired velocity.
		// To achieve this you simply subtract the agent’s current velocity from the desired velocity.

		return force.subVectors( desiredVelocity$1, vehicle.velocity );

	}

	/**
	* Transforms this instance into a JSON object.
	*
	* @return {Object} The JSON object.
	*/
	toJSON() {

		const json = super.toJSON();

		json.target = this.target.toArray( new Array() );

		return json;

	}

	/**
	* Restores this instance from the given JSON object.
	*
	* @param {Object} json - The JSON object.
	* @return {SeekBehavior} A reference to this behavior.
	*/
	fromJSON( json ) {

		super.fromJSON( json );

		this.target.fromArray( json.target );

		return this;

	}

}

const centerOfMass = new Vector3();

/**
* This steering produces a steering force that moves a vehicle toward the center of mass of its neighbors.
*
* @author {@link https://github.com/Mugen87|Mugen87}
* @augments SteeringBehavior
*/
class CohesionBehavior extends SteeringBehavior {

	/**
	* Constructs a new cohesion behavior.
	*/
	constructor() {

		super();

		// internal behaviors

		this._seek = new SeekBehavior();

	}

	/**
	* Calculates the steering force for a single simulation step.
	*
	* @param {Vehicle} vehicle - The game entity the force is produced for.
	* @param {Vector3} force - The force/result vector.
	* @param {Number} delta - The time delta.
	* @return {Vector3} The force/result vector.
	*/
	calculate( vehicle, force /*, delta */ ) {

		centerOfMass.set( 0, 0, 0 );

		const neighbors = vehicle.neighbors;

		// iterate over all neighbors to calculate the center of mass

		for ( let i = 0, l = neighbors.length; i < l; i ++ ) {

			const neighbor = neighbors[ i ];

			centerOfMass.add( neighbor.position );

		}

		if ( neighbors.length > 0 ) {

			centerOfMass.divideScalar( neighbors.length );

			// seek to it

			this._seek.target = centerOfMass;
			this._seek.calculate( vehicle, force );

			// the magnitude of cohesion is usually much larger than separation
			// or alignment so it usually helps to normalize it

			force.normalize();

		}

		return force;

	}

}

const desiredVelocity = new Vector3();

/**
* This steering behavior produces a force that steers an agent away from a target position.
* It's the opposite of {@link SeekBehavior}.
*
* @author {@link https://github.com/Mugen87|Mugen87}
* @augments SteeringBehavior
*/
class FleeBehavior extends SteeringBehavior {

	/**
	* Constructs a new flee behavior.
	*
	* @param {Vector3} target - The target vector.
	* @param {Number} panicDistance - The agent only flees from the target if it is inside this radius.
	*/
	constructor( target = new Vector3(), panicDistance = 10 ) {

		super();

		/**
		* The target vector.
		* @type {Vector3}
		*/
		this.target = target;

		/**
		* The agent only flees from the target if it is inside this radius.
		* @type {Number}
		* @default 10
		*/
		this.panicDistance = panicDistance;

	}

	/**
	* Calculates the steering force for a single simulation step.
	*
	* @param {Vehicle} vehicle - The game entity the force is produced for.
	* @param {Vector3} force - The force/result vector.
	* @param {Number} delta - The time delta.
	* @return {Vector3} The force/result vector.
	*/
	calculate( vehicle, force /*, delta */ ) {

		const target = this.target;

		// only flee if the target is within panic distance

		const distanceToTargetSq = vehicle.position.squaredDistanceTo( target );

		if ( distanceToTargetSq <= ( this.panicDistance * this.panicDistance ) ) {

			// from here, the only difference compared to seek is that the desired
			// velocity is calculated using a vector pointing in the opposite direction

			desiredVelocity.subVectors( vehicle.position, target ).normalize();

			// if target and vehicle position are identical, choose default velocity

			if ( desiredVelocity.squaredLength() === 0 ) {

				desiredVelocity.set( 0, 0, 1 );

			}

			desiredVelocity.multiplyScalar( vehicle.maxSpeed );

			force.subVectors( desiredVelocity, vehicle.velocity );

		}

		return force;

	}

	/**
	* Transforms this instance into a JSON object.
	*
	* @return {Object} The JSON object.
	*/
	toJSON() {

		const json = super.toJSON();

		json.target = this.target.toArray( new Array() );
		json.panicDistance = this.panicDistance;

		return json;

	}

	/**
	* Restores this instance from the given JSON object.
	*
	* @param {Object} json - The JSON object.
	* @return {FleeBehavior} A reference to this behavior.
	*/
	fromJSON( json ) {

		super.fromJSON( json );

		this.target.fromArray( json.target );
		this.panicDistance = json.panicDistance;

		return this;

	}

}

const displacement$2 = new Vector3();
const newPursuerVelocity = new Vector3();
const predictedPosition$3 = new Vector3();

/**
* This steering behavior is is almost the same as {@link PursuitBehavior} except that
* the agent flees from the estimated future position of the pursuer.
*
* @author {@link https://github.com/Mugen87|Mugen87}
* @augments SteeringBehavior
*/
class EvadeBehavior extends SteeringBehavior {

	/**
	* Constructs a new evade behavior.
	*
	* @param {MovingEntity} pursuer - The agent to evade from.
	* @param {Number} panicDistance - The agent only flees from the pursuer if it is inside this radius.
	* @param {Number} predictionFactor - This factor determines how far the vehicle predicts the movement of the pursuer.
	*/
	constructor( pursuer = null, panicDistance = 10, predictionFactor = 1 ) {

		super();

		/**
		* The agent to evade from.
		* @type {?MovingEntity}
		* @default null
		*/
		this.pursuer = pursuer;

		/**
		* The agent only flees from the pursuer if it is inside this radius.
		* @type {Number}
		* @default 10
		*/
		this.panicDistance = panicDistance;

		/**
		* This factor determines how far the vehicle predicts the movement of the pursuer.
		* @type {Number}
		* @default 1
		*/
		this.predictionFactor = predictionFactor;

		// internal behaviors

		this._flee = new FleeBehavior();

	}

	/**
	* Calculates the steering force for a single simulation step.
	*
	* @param {Vehicle} vehicle - The game entity the force is produced for.
	* @param {Vector3} force - The force/result vector.
	* @param {Number} delta - The time delta.
	* @return {Vector3} The force/result vector.
	*/
	calculate( vehicle, force /*, delta */ ) {

		const pursuer = this.pursuer;

		displacement$2.subVectors( pursuer.position, vehicle.position );

		let lookAheadTime = displacement$2.length() / ( vehicle.maxSpeed + pursuer.getSpeed() );
		lookAheadTime *= this.predictionFactor; // tweak the magnitude of the prediction

		// calculate new velocity and predicted future position

		newPursuerVelocity.copy( pursuer.velocity ).multiplyScalar( lookAheadTime );
		predictedPosition$3.addVectors( pursuer.position, newPursuerVelocity );

		// now flee away from predicted future position of the pursuer

		this._flee.target = predictedPosition$3;
		this._flee.panicDistance = this.panicDistance;
		this._flee.calculate( vehicle, force );

		return force;

	}

	/**
	* Transforms this instance into a JSON object.
	*
	* @return {Object} The JSON object.
	*/
	toJSON() {

		const json = super.toJSON();

		json.pursuer = this.pursuer ? this.pursuer.uuid : null;
		json.panicDistance = this.panicDistance;
		json.predictionFactor = this.predictionFactor;

		return json;

	}

	/**
	* Restores this instance from the given JSON object.
	*
	* @param {Object} json - The JSON object.
	* @return {EvadeBehavior} A reference to this behavior.
	*/
	fromJSON( json ) {

		super.fromJSON( json );

		this.pursuer = json.pursuer;
		this.panicDistance = json.panicDistance;
		this.predictionFactor = json.predictionFactor;

		return this;

	}

	/**
	* Restores UUIDs with references to GameEntity objects.
	*
	* @param {Map<String,GameEntity>} entities - Maps game entities to UUIDs.
	* @return {EvadeBehavior} A reference to this behavior.
	*/
	resolveReferences( entities ) {

		this.pursuer = entities.get( this.pursuer ) || null;

	}

}

/**
* Class for representing a walkable path.
*
* @author {@link https://github.com/Mugen87|Mugen87}
*/
class Path {

	/**
	* Constructs a new path.
	*/
	constructor() {

		/**
		* Whether this path is looped or not.
		* @type {Boolean}
		*/
		this.loop = false;

		this._waypoints = new Array();
		this._index = 0;

	}

	/**
	* Adds the given waypoint to this path.
	*
	* @param {Vector3} waypoint - The waypoint to add.
	* @return {Path} A reference to this path.
	*/
	add( waypoint ) {

		this._waypoints.push( waypoint );

		return this;

	}

	/**
	* Clears the internal state of this path.
	*
	* @return {Path} A reference to this path.
	*/
	clear() {

		this._waypoints.length = 0;
		this._index = 0;

		return this;

	}

	/**
	* Returns the current active waypoint of this path.
	*
	* @return {Vector3} The current active waypoint.
	*/
	current() {

		return this._waypoints[ this._index ];

	}

	/**
	* Returns true if this path is not looped and the last waypoint is active.
	*
	* @return {Boolean} Whether this path is finished or not.
	*/
	finished() {

		const lastIndex = this._waypoints.length - 1;

		return ( this.loop === true ) ? false : ( this._index === lastIndex );

	}

	/**
	* Makes the next waypoint of this path active. If the path is looped and
	* {@link Path#finished} returns true, the path starts from the beginning.
	*
	* @return {Path} A reference to this path.
	*/
	advance() {

		this._index ++;

		if ( ( this._index === this._waypoints.length ) ) {

			if ( this.loop === true ) {

				this._index = 0;

			} else {

				this._index --;

			}

		}

		return this;

	}

	/**
	* Transforms this instance into a JSON object.
	*
	* @return {Object} The JSON object.
	*/
	toJSON() {

		const data = {
			type: this.constructor.name,
			loop: this.loop,
			_waypoints: new Array(),
			_index: this._index
		};

		// waypoints

		const waypoints = this._waypoints;

		for ( let i = 0, l = waypoints.length; i < l; i ++ ) {

			const waypoint = waypoints[ i ];
			data._waypoints.push( waypoint.toArray( new Array() ) );

		}

		return data;

	}

	/**
	* Restores this instance from the given JSON object.
	*
	* @param {Object} json - The JSON object.
	* @return {Path} A reference to this path.
	*/
	fromJSON( json ) {

		this.loop = json.loop;
		this._index = json._index;

		// waypoints

		const waypointsJSON = json._waypoints;

		for ( let i = 0, l = waypointsJSON.length; i < l; i ++ ) {

			const waypointJSON = waypointsJSON[ i ];
			this._waypoints.push( new Vector3().fromArray( waypointJSON ) );

		}

		return this;

	}

}

/**
* This steering behavior produces a force that moves a vehicle along a series of waypoints forming a path.
*
* @author {@link https://github.com/Mugen87|Mugen87}
* @augments SteeringBehavior
*/
class FollowPathBehavior extends SteeringBehavior {

	/**
	* Constructs a new follow path behavior.
	*
	* @param {Path} path - The path to follow.
	* @param {Number} nextWaypointDistance - The distance the agent seeks for the next waypoint.
	*/
	constructor( path = new Path(), nextWaypointDistance = 1 ) {

		super();

		/**
		* The path to follow.
		* @type {Path}
		*/
		this.path = path;

		/**
		* The distance the agent seeks for the next waypoint.
		* @type {Number}
		* @default 1
		*/
		this.nextWaypointDistance = nextWaypointDistance;

		// internal behaviors

		this._arrive = new ArriveBehavior();
		this._seek = new SeekBehavior();

	}

	/**
	* Calculates the steering force for a single simulation step.
	*
	* @param {Vehicle} vehicle - The game entity the force is produced for.
	* @param {Vector3} force - The force/result vector.
	* @param {Number} delta - The time delta.
	* @return {Vector3} The force/result vector.
	*/
	calculate( vehicle, force /*, delta */ ) {

		const path = this.path;

		// calculate distance in square space from current waypoint to vehicle

		const distanceSq = path.current().squaredDistanceTo( vehicle.position );

		// move to next waypoint if close enough to current target

		if ( distanceSq < ( this.nextWaypointDistance * this.nextWaypointDistance ) ) {

			path.advance();

		}

		const target = path.current();

		if ( path.finished() === true ) {

			this._arrive.target = target;
			this._arrive.calculate( vehicle, force );

		} else {

			this._seek.target = target;
			this._seek.calculate( vehicle, force );

		}

		return force;

	}

	/**
	* Transforms this instance into a JSON object.
	*
	* @return {Object} The JSON object.
	*/
	toJSON() {

		const json = super.toJSON();

		json.path = this.path.toJSON();
		json.nextWaypointDistance = this.nextWaypointDistance;

		return json;

	}

	/**
	* Restores this instance from the given JSON object.
	*
	* @param {Object} json - The JSON object.
	* @return {FollowPathBehavior} A reference to this behavior.
	*/
	fromJSON( json ) {

		super.fromJSON( json );

		this.path.fromJSON( json.path );
		this.nextWaypointDistance = json.nextWaypointDistance;

		return this;

	}

}

const midPoint = new Vector3();
const translation$1 = new Vector3();
const predictedPosition1 = new Vector3();
const predictedPosition2 = new Vector3();

/**
* This steering behavior produces a force that moves a vehicle to the midpoint
* of the imaginary line connecting two other agents.
*
* @author {@link https://github.com/Mugen87|Mugen87}
* @augments SteeringBehavior
*/
class InterposeBehavior extends SteeringBehavior {

	/**
	* Constructs a new interpose behavior.
	*
	* @param {MovingEntity} entity1 - The first agent.
	* @param {MovingEntity} entity2 - The second agent.
	* @param {Number} deceleration - The amount of deceleration.
	*/
	constructor( entity1 = null, entity2 = null, deceleration = 3 ) {

		super();

		/**
		* The first agent.
		* @type {?MovingEntity}
		* @default null
		*/
		this.entity1 = entity1;

		/**
		* The second agent.
		* @type {?MovingEntity}
		* @default null
		*/
		this.entity2 = entity2;

		/**
		* The amount of deceleration.
		* @type {Number}
		* @default 3
		*/
		this.deceleration = deceleration;

		// internal behaviors

		this._arrive = new ArriveBehavior();

	}

	/**
	* Calculates the steering force for a single simulation step.
	*
	* @param {Vehicle} vehicle - The game entity the force is produced for.
	* @param {Vector3} force - The force/result vector.
	* @param {Number} delta - The time delta.
	* @return {Vector3} The force/result vector.
	*/
	calculate( vehicle, force /*, delta */ ) {

		const entity1 = this.entity1;
		const entity2 = this.entity2;

		// first we need to figure out where the two entities are going to be
		// in the future. This is approximated by determining the time
		// taken to reach the mid way point at the current time at max speed

		midPoint.addVectors( entity1.position, entity2.position ).multiplyScalar( 0.5 );
		const time = vehicle.position.distanceTo( midPoint ) / vehicle.maxSpeed;

		// now we have the time, we assume that entity 1 and entity 2 will
		// continue on a straight trajectory and extrapolate to get their future positions

		translation$1.copy( entity1.velocity ).multiplyScalar( time );
		predictedPosition1.addVectors( entity1.position, translation$1 );

		translation$1.copy( entity2.velocity ).multiplyScalar( time );
		predictedPosition2.addVectors( entity2.position, translation$1 );

		// calculate the mid point of these predicted positions

		midPoint.addVectors( predictedPosition1, predictedPosition2 ).multiplyScalar( 0.5 );

		// then steer to arrive at it

		this._arrive.deceleration = this.deceleration;
		this._arrive.target = midPoint;
		this._arrive.calculate( vehicle, force );

		return force;

	}

	/**
	* Transforms this instance into a JSON object.
	*
	* @return {Object} The JSON object.
	*/
	toJSON() {

		const json = super.toJSON();

		json.entity1 = this.entity1 ? this.entity1.uuid : null;
		json.entity2 = this.entity2 ? this.entity2.uuid : null;
		json.deceleration = this.deceleration;

		return json;

	}

	/**
	* Restores this instance from the given JSON object.
	*
	* @param {Object} json - The JSON object.
	* @return {InterposeBehavior} A reference to this behavior.
	*/
	fromJSON( json ) {

		super.fromJSON( json );

		this.entity1 = json.entity1;
		this.entity2 = json.entity2;
		this.deceleration = json.deceleration;

		return this;

	}

	/**
	* Restores UUIDs with references to GameEntity objects.
	*
	* @param {Map<String,GameEntity>} entities - Maps game entities to UUIDs.
	* @return {InterposeBehavior} A reference to this behavior.
	*/
	resolveReferences( entities ) {

		this.entity1 = entities.get( this.entity1 ) || null;
		this.entity2 = entities.get( this.entity2 ) || null;

	}

}

const vector = new Vector3();
const center$1 = new Vector3();
const size$1 = new Vector3();

const points = [
	new Vector3(),
	new Vector3(),
	new Vector3(),
	new Vector3(),
	new Vector3(),
	new Vector3(),
	new Vector3(),
	new Vector3()
];

/**
* Class representing an axis-aligned bounding box (AABB).
*
* @author {@link https://github.com/Mugen87|Mugen87}
*/
class AABB {

	/**
	* Constructs a new AABB with the given values.
	*
	* @param {Vector3} min - The minimum bounds of the AABB.
	* @param {Vector3} max - The maximum bounds of the AABB.
	*/
	constructor( min = new Vector3(), max = new Vector3() ) {

		/**
		* The minimum bounds of the AABB.
		* @type {Vector3}
		*/
		this.min = min;

		/**
		* The maximum bounds of the AABB.
		* @type {Vector3}
		*/
		this.max = max;

	}

	/**
	* Sets the given values to this AABB.
	*
	* @param {Vector3} min - The minimum bounds of the AABB.
	* @param {Vector3} max - The maximum bounds of the AABB.
	* @return {AABB} A reference to this AABB.
	*/
	set( min, max ) {

		this.min = min;
		this.max = max;

		return this;

	}

	/**
	* Copies all values from the given AABB to this AABB.
	*
	* @param {AABB} aabb - The AABB to copy.
	* @return {AABB} A reference to this AABB.
	*/
	copy( aabb ) {

		this.min.copy( aabb.min );
		this.max.copy( aabb.max );

		return this;

	}

	/**
	* Creates a new AABB and copies all values from this AABB.
	*
	* @return {AABB} A new AABB.
	*/
	clone() {

		return new this.constructor().copy( this );

	}

	/**
	* Ensures the given point is inside this AABB and stores
	* the result in the given vector.
	*
	* @param {Vector3} point - A point in 3D space.
	* @param {Vector3} result - The result vector.
	* @return {Vector3} The result vector.
	*/
	clampPoint( point, result ) {

		result.copy( point ).clamp( this.min, this.max );

		return result;

	}

	/**
	* Returns true if the given point is inside this AABB.
	*
	* @param {Vector3} point - A point in 3D space.
	* @return {Boolean} The result of the containments test.
	*/
	containsPoint( point ) {

		return point.x < this.min.x || point.x > this.max.x ||
			point.y < this.min.y || point.y > this.max.y ||
			point.z < this.min.z || point.z > this.max.z ? false : true;

	}

	/**
	* Expands this AABB by the given point. So after this method call,
	* the given point lies inside the AABB.
	*
	* @param {Vector3} point - A point in 3D space.
	* @return {AABB} A reference to this AABB.
	*/
	expand( point ) {

		this.min.min( point );
		this.max.max( point );

		return this;

	}

	/**
	* Computes the center point of this AABB and stores it into the given vector.
	*
	* @param {Vector3} result - The result vector.
	* @return {Vector3} The result vector.
	*/
	getCenter( result ) {

		return result.addVectors( this.min, this.max ).multiplyScalar( 0.5 );

	}

	/**
	* Computes the size (width, height, depth) of this AABB and stores it into the given vector.
	*
	* @param {Vector3} result - The result vector.
	* @return {Vector3} The result vector.
	*/
	getSize( result ) {

		return result.subVectors( this.max, this.min );

	}

	/**
	* Returns true if the given AABB intersects this AABB.
	*
	* @param {AABB} aabb - The AABB to test.
	* @return {Boolean} The result of the intersection test.
	*/
	intersectsAABB( aabb ) {

		return aabb.max.x < this.min.x || aabb.min.x > this.max.x ||
			aabb.max.y < this.min.y || aabb.min.y > this.max.y ||
			aabb.max.z < this.min.z || aabb.min.z > this.max.z ? false : true;

	}

	/**
	* Returns true if the given bounding sphere intersects this AABB.
	*
	* @param {BoundingSphere} sphere - The bounding sphere to test.
	* @return {Boolean} The result of the intersection test.
	*/
	intersectsBoundingSphere( sphere ) {

		// find the point on the AABB closest to the sphere center

		this.clampPoint( sphere.center, vector );

		// if that point is inside the sphere, the AABB and sphere intersect.

		return vector.squaredDistanceTo( sphere.center ) <= ( sphere.radius * sphere.radius );

	}

	/**
	* Returns true if the given plane intersects this AABB.
	*
	* Reference: Testing Box Against Plane in Real-Time Collision Detection
	* by Christer Ericson (chapter 5.2.3)
	*
	* @param {Plane} plane - The plane to test.
	* @return {Boolean} The result of the intersection test.
	*/
	intersectsPlane( plane ) {

		const normal = plane.normal;

		this.getCenter( center$1 );
		size$1.subVectors( this.max, center$1 ); // positive extends

		// compute the projection interval radius of b onto L(t) = c + t * plane.normal

		const r = size$1.x * Math.abs( normal.x ) + size$1.y * Math.abs( normal.y ) + size$1.z * Math.abs( normal.z );

		// compute distance of box center from plane

		const s = plane.distanceToPoint( center$1 );

		return Math.abs( s ) <= r;

	}

	/**
	* Returns the normal for a given point on this AABB's surface.
	*
	* @param {Vector3} point - The point on the surface
	* @param {Vector3} result - The result vector.
	* @return {Vector3} The result vector.
	*/
	getNormalFromSurfacePoint( point, result ) {

		// from https://www.gamedev.net/forums/topic/551816-finding-the-aabb-surface-normal-from-an-intersection-point-on-aabb/

		result.set( 0, 0, 0 );

		let distance;
		let minDistance = Infinity;

		this.getCenter( center$1 );
		this.getSize( size$1 );

		// transform point into local space of AABB

		vector.copy( point ).sub( center$1 );

		// x-axis

		distance = Math.abs( size$1.x - Math.abs( vector.x ) );

		if ( distance < minDistance ) {

			minDistance = distance;
			result.set( 1 * Math.sign( vector.x ), 0, 0 );

		}

		// y-axis

		distance = Math.abs( size$1.y - Math.abs( vector.y ) );

		if ( distance < minDistance ) {

			minDistance = distance;
			result.set( 0, 1 * Math.sign( vector.y ), 0 );

		}

		// z-axis

		distance = Math.abs( size$1.z - Math.abs( vector.z ) );

		if ( distance < minDistance ) {

			result.set( 0, 0, 1 * Math.sign( vector.z ) );

		}

		return result;

	}

	/**
	* Sets the values of the AABB from the given center and size vector.
	*
	* @param {Vector3} center - The center point of the AABB.
	* @param {Vector3} size - The size of the AABB per axis.
	* @return {AABB} A reference to this AABB.
	*/
	fromCenterAndSize( center, size ) {

		vector.copy( size ).multiplyScalar( 0.5 ); // compute half size

		this.min.copy( center ).sub( vector );
		this.max.copy( center ).add( vector );

		return this;

	}

	/**
	* Computes an AABB that encloses the given set of points.
	*
	* @param {Array<Vector3>} points - An array of 3D vectors representing points in 3D space.
	* @return {AABB} A reference to this AABB.
	*/
	fromPoints( points ) {

		this.min.set( Infinity, Infinity, Infinity );
		this.max.set( - Infinity, - Infinity, - Infinity );

		for ( let i = 0, l = points.length; i < l; i ++ ) {

			this.expand( points[ i ] );

		}

		return this;

	}

	/**
	* Transforms this AABB with the given 4x4 transformation matrix.
	*
	* @param {Matrix4} matrix - The 4x4 transformation matrix.
	* @return {AABB} A reference to this AABB.
	*/
	applyMatrix4( matrix ) {

		const min = this.min;
		const max = this.max;

		points[ 0 ].set( min.x, min.y, min.z ).applyMatrix4( matrix );
		points[ 1 ].set( min.x, min.y, max.z ).applyMatrix4( matrix );
		points[ 2 ].set( min.x, max.y, min.z ).applyMatrix4( matrix );
		points[ 3 ].set( min.x, max.y, max.z ).applyMatrix4( matrix );
		points[ 4 ].set( max.x, min.y, min.z ).applyMatrix4( matrix );
		points[ 5 ].set( max.x, min.y, max.z ).applyMatrix4( matrix );
		points[ 6 ].set( max.x, max.y, min.z ).applyMatrix4( matrix );
		points[ 7 ].set( max.x, max.y, max.z ).applyMatrix4( matrix );

		return this.fromPoints( points );

	}

	/**
	* Returns true if the given AABB is deep equal with this AABB.
	*
	* @param {AABB} aabb - The AABB to test.
	* @return {Boolean} The result of the equality test.
	*/
	equals( aabb ) {

		return ( aabb.min.equals( this.min ) ) && ( aabb.max.equals( this.max ) );

	}

	/**
	* Transforms this instance into a JSON object.
	*
	* @return {Object} The JSON object.
	*/
	toJSON() {

		return {
			type: this.constructor.name,
			min: this.min.toArray( new Array() ),
			max: this.max.toArray( new Array() )
		};

	}

	/**
	* Restores this instance from the given JSON object.
	*
	* @param {Object} json - The JSON object.
	* @return {AABB} A reference to this AABB.
	*/
	fromJSON( json ) {

		this.min.fromArray( json.min );
		this.max.fromArray( json.max );

		return this;

	}

}

const aabb$2 = new AABB();

/**
* Class representing a bounding sphere.
*
* @author {@link https://github.com/Mugen87|Mugen87}
*/
class BoundingSphere {

	/**
	* Constructs a new bounding sphere with the given values.
	*
	* @param {Vector3} center - The center position of the bounding sphere.
	* @param {Number} radius - The radius of the bounding sphere.
	*/
	constructor( center = new Vector3(), radius = 0 ) {

		/**
		* The center position of the bounding sphere.
		* @type {Vector3}
		*/
		this.center = center;

		/**
		* The radius of the bounding sphere.
		* @type {Number}
		*/
		this.radius = radius;

	}

	/**
	* Sets the given values to this bounding sphere.
	*
	* @param {Vector3} center - The center position of the bounding sphere.
	* @param {Number} radius - The radius of the bounding sphere.
	* @return {BoundingSphere} A reference to this bounding sphere.
	*/
	set( center, radius ) {

		this.center = center;
		this.radius = radius;

		return this;

	}

	/**
	* Copies all values from the given bounding sphere to this bounding sphere.
	*
	* @param {BoundingSphere} sphere - The bounding sphere to copy.
	* @return {BoundingSphere} A reference to this bounding sphere.
	*/
	copy( sphere ) {

		this.center.copy( sphere.center );
		this.radius = sphere.radius;

		return this;

	}

	/**
	* Creates a new bounding sphere and copies all values from this bounding sphere.
	*
	* @return {BoundingSphere} A new bounding sphere.
	*/
	clone() {

		return new this.constructor().copy( this );

	}

	/**
	* Ensures the given point is inside this bounding sphere and stores
	* the result in the given vector.
	*
	* @param {Vector3} point - A point in 3D space.
	* @param {Vector3} result - The result vector.
	* @return {Vector3} The result vector.
	*/
	clampPoint( point, result ) {

		result.copy( point );

		const squaredDistance = this.center.squaredDistanceTo( point );

		if ( squaredDistance > ( this.radius * this.radius ) ) {

			result.sub( this.center ).normalize();
			result.multiplyScalar( this.radius ).add( this.center );

		}

		return result;

	}

	/**
	* Returns true if the given point is inside this bounding sphere.
	*
	* @param {Vector3} point - A point in 3D space.
	* @return {Boolean} The result of the containments test.
	*/
	containsPoint( point ) {

		return ( point.squaredDistanceTo( this.center ) <= ( this.radius * this.radius ) );

	}

	/**
	* Returns true if the given bounding sphere intersects this bounding sphere.
	*
	* @param {BoundingSphere} sphere - The bounding sphere to test.
	* @return {Boolean} The result of the intersection test.
	*/
	intersectsBoundingSphere( sphere ) {

		const radius = this.radius + sphere.radius;

		return ( sphere.center.squaredDistanceTo( this.center ) <= ( radius * radius ) );

	}

	/**
	* Returns true if the given plane intersects this bounding sphere.
	*
	* Reference: Testing Sphere Against Plane in Real-Time Collision Detection
	* by Christer Ericson (chapter 5.2.2)
	*
	* @param {Plane} plane - The plane to test.
	* @return {Boolean} The result of the intersection test.
	*/
	intersectsPlane( plane ) {

		return Math.abs( plane.distanceToPoint( this.center ) ) <= this.radius;

	}

	/**
	* Returns the normal for a given point on this bounding sphere's surface.
	*
	* @param {Vector3} point - The point on the surface
	* @param {Vector3} result - The result vector.
	* @return {Vector3} The result vector.
	*/
	getNormalFromSurfacePoint( point, result ) {

		return result.subVectors( point, this.center ).normalize();

	}

	/**
	* Computes a bounding sphere that encloses the given set of points.
	*
	* @param {Array<Vector3>} points - An array of 3D vectors representing points in 3D space.
	* @return {BoundingSphere} A reference to this bounding sphere.
	*/
	fromPoints( points ) {

		// Using an AABB is a simple way to compute a bounding sphere for a given set
		// of points. However, there are other more complex algorithms that produce a
		// more tight bounding sphere. For now, this approach is a good start.

		aabb$2.fromPoints( points );

		aabb$2.getCenter( this.center );
		this.radius = this.center.distanceTo( aabb$2.max );

		return this;

	}

	/**
	* Transforms this bounding sphere with the given 4x4 transformation matrix.
	*
	* @param {Matrix4} matrix - The 4x4 transformation matrix.
	* @return {BoundingSphere} A reference to this bounding sphere.
	*/
	applyMatrix4( matrix ) {

		this.center.applyMatrix4( matrix );
		this.radius = this.radius * matrix.getMaxScale();

		return this;

	}

	/**
	* Returns true if the given bounding sphere is deep equal with this bounding sphere.
	*
	* @param {BoundingSphere} sphere - The bounding sphere to test.
	* @return {Boolean} The result of the equality test.
	*/
	equals( sphere ) {

		return ( sphere.center.equals( this.center ) ) && ( sphere.radius === this.radius );

	}

	/**
	* Transforms this instance into a JSON object.
	*
	* @return {Object} The JSON object.
	*/
	toJSON() {

		return {
			type: this.constructor.name,
			center: this.center.toArray( new Array() ),
			radius: this.radius
		};

	}

	/**
	* Restores this instance from the given JSON object.
	*
	* @param {Object} json - The JSON object.
	* @return {BoundingSphere} A reference to this bounding sphere.
	*/
	fromJSON( json ) {

		this.center.fromArray( json.center );
		this.radius = json.radius;

		return this;

	}

}

const v1$3 = new Vector3();
const edge1 = new Vector3();
const edge2 = new Vector3();
const normal$1 = new Vector3();
const size = new Vector3();
const matrix = new Matrix4();
const inverse$1 = new Matrix4();
const aabb$1 = new AABB();

/**
* Class representing a ray in 3D space.
*
* @author {@link https://github.com/Mugen87|Mugen87}
*/
class Ray {

	/**
	* Constructs a new ray with the given values.
	*
	* @param {Vector3} origin - The origin of the ray.
	* @param {Vector3} direction - The direction of the ray.
	*/
	constructor( origin = new Vector3(), direction = new Vector3() ) {

		/**
		* The origin of the ray.
		* @type {Vector3}
		*/
		this.origin = origin;

		/**
		* The direction of the ray.
		* @type {Vector3}
		*/
		this.direction = direction;

	}

	/**
	* Sets the given values to this ray.
	*
	* @param {Vector3} origin - The origin of the ray.
	* @param {Vector3} direction - The direction of the ray.
	* @return {Ray} A reference to this ray.
	*/
	set( origin, direction ) {

		this.origin = origin;
		this.direction = direction;

		return this;

	}

	/**
	* Copies all values from the given ray to this ray.
	*
	* @param {Ray} ray - The ray to copy.
	* @return {Ray} A reference to this ray.
	*/
	copy( ray ) {

		this.origin.copy( ray.origin );
		this.direction.copy( ray.direction );

		return this;

	}

	/**
	* Creates a new ray and copies all values from this ray.
	*
	* @return {Ray} A new ray.
	*/
	clone() {

		return new this.constructor().copy( this );

	}

	/**
	* Computes a position on the ray according to the given t value
	* and stores the result in the given 3D vector. The t value has a range of
	* [0, Infinity] where 0 means the position is equal with the origin of the ray.
	*
	* @param {Number} t - A scalar value representing a position on the ray.
	* @param {Vector3} result - The result vector.
	* @return {Vector3} The result vector.
	*/
	at( t, result ) {

		// t has to be zero or positive
		return result.copy( this.direction ).multiplyScalar( t ).add( this.origin );

	}

	/**
	* Performs a ray/sphere intersection test and stores the intersection point
	* to the given 3D vector. If no intersection is detected, *null* is returned.
	*
	* @param {BoundingSphere} sphere - A bounding sphere.
	* @param {Vector3} result - The result vector.
	* @return {Vector3} The result vector.
	*/
	intersectBoundingSphere( sphere, result ) {

		v1$3.subVectors( sphere.center, this.origin );
		const tca = v1$3.dot( this.direction );
		const d2 = v1$3.dot( v1$3 ) - tca * tca;
		const radius2 = sphere.radius * sphere.radius;

		if ( d2 > radius2 ) return null;

		const thc = Math.sqrt( radius2 - d2 );

		// t0 = first intersect point - entrance on front of sphere

		const t0 = tca - thc;

		// t1 = second intersect point - exit point on back of sphere

		const t1 = tca + thc;

		// test to see if both t0 and t1 are behind the ray - if so, return null

		if ( t0 < 0 && t1 < 0 ) return null;

		// test to see if t0 is behind the ray:
		// if it is, the ray is inside the sphere, so return the second exit point scaled by t1,
		// in order to always return an intersect point that is in front of the ray.

		if ( t0 < 0 ) return this.at( t1, result );

		// else t0 is in front of the ray, so return the first collision point scaled by t0

		return this.at( t0, result );

	}

	/**
	* Performs a ray/sphere intersection test. Returns either true or false if
	* there is a intersection or not.
	*
	* @param {BoundingSphere} sphere - A bounding sphere.
	* @return {boolean} Whether there is an intersection or not.
	*/
	intersectsBoundingSphere( sphere ) {

		const v1 = new Vector3();
		let squaredDistanceToPoint;

		const directionDistance = v1.subVectors( sphere.center, this.origin ).dot( this.direction );

		if ( directionDistance < 0 ) {

			// sphere's center behind the ray

			squaredDistanceToPoint = this.origin.squaredDistanceTo( sphere.center );

		} else {

			v1.copy( this.direction ).multiplyScalar( directionDistance ).add( this.origin );

			squaredDistanceToPoint = v1.squaredDistanceTo( sphere.center );

		}


		return squaredDistanceToPoint <= ( sphere.radius * sphere.radius );

	}

	/**
	* Performs a ray/AABB intersection test and stores the intersection point
	* to the given 3D vector. If no intersection is detected, *null* is returned.
	*
	* @param {AABB} aabb - An AABB.
	* @param {Vector3} result - The result vector.
	* @return {Vector3} The result vector.
	*/
	intersectAABB( aabb, result ) {

		let tmin, tmax, tymin, tymax, tzmin, tzmax;

		const invdirx = 1 / this.direction.x,
			invdiry = 1 / this.direction.y,
			invdirz = 1 / this.direction.z;

		const origin = this.origin;

		if ( invdirx >= 0 ) {

			tmin = ( aabb.min.x - origin.x ) * invdirx;
			tmax = ( aabb.max.x - origin.x ) * invdirx;

		} else {

			tmin = ( aabb.max.x - origin.x ) * invdirx;
			tmax = ( aabb.min.x - origin.x ) * invdirx;

		}

		if ( invdiry >= 0 ) {

			tymin = ( aabb.min.y - origin.y ) * invdiry;
			tymax = ( aabb.max.y - origin.y ) * invdiry;

		} else {

			tymin = ( aabb.max.y - origin.y ) * invdiry;
			tymax = ( aabb.min.y - origin.y ) * invdiry;

		}

		if ( ( tmin > tymax ) || ( tymin > tmax ) ) return null;

		// these lines also handle the case where tmin or tmax is NaN
		// (result of 0 * Infinity). x !== x returns true if x is NaN

		if ( tymin > tmin || tmin !== tmin ) tmin = tymin;

		if ( tymax < tmax || tmax !== tmax ) tmax = tymax;

		if ( invdirz >= 0 ) {

			tzmin = ( aabb.min.z - origin.z ) * invdirz;
			tzmax = ( aabb.max.z - origin.z ) * invdirz;

		} else {

			tzmin = ( aabb.max.z - origin.z ) * invdirz;
			tzmax = ( aabb.min.z - origin.z ) * invdirz;

		}

		if ( ( tmin > tzmax ) || ( tzmin > tmax ) ) return null;

		if ( tzmin > tmin || tmin !== tmin ) tmin = tzmin;

		if ( tzmax < tmax || tmax !== tmax ) tmax = tzmax;

		// return point closest to the ray (positive side)

		if ( tmax < 0 ) return null;

		return this.at( tmin >= 0 ? tmin : tmax, result );

	}

	/**
	* Performs a ray/AABB intersection test. Returns either true or false if
	* there is a intersection or not.
	*
	* @param {AABB} aabb - An axis-aligned bounding box.
	* @return {boolean} Whether there is an intersection or not.
	*/
	intersectsAABB( aabb ) {

		return this.intersectAABB( aabb, v1$3 ) !== null;

	}

	/**
	* Performs a ray/plane intersection test and stores the intersection point
	* to the given 3D vector. If no intersection is detected, *null* is returned.
	*
	* @param {Plane} plane - A plane.
	* @param {Vector3} result - The result vector.
	* @return {Vector3} The result vector.
	*/
	intersectPlane( plane, result ) {

		let t;

		const denominator = plane.normal.dot( this.direction );

		if ( denominator === 0 ) {

			if ( plane.distanceToPoint( this.origin ) === 0 ) {

				// ray is coplanar

				t = 0;

			} else {

				// ray is parallel, no intersection

				return null;

			}

		} else {

			t = - ( this.origin.dot( plane.normal ) + plane.constant ) / denominator;

		}

		// there is no intersection if t is negative

		return ( t >= 0 ) ? this.at( t, result ) : null;

	}

	/**
	* Performs a ray/plane intersection test. Returns either true or false if
	* there is a intersection or not.
	*
	* @param {Plane} plane - A plane.
	* @return {boolean} Whether there is an intersection or not.
	*/
	intersectsPlane( plane ) {

		// check if the ray lies on the plane first

		const distToPoint = plane.distanceToPoint( this.origin );

		if ( distToPoint === 0 ) {

			return true;

		}

		const denominator = plane.normal.dot( this.direction );

		if ( denominator * distToPoint < 0 ) {

			return true;

		}

		// ray origin is behind the plane (and is pointing behind it)

		return false;

	}

	/**
	* Performs a ray/OBB intersection test and stores the intersection point
	* to the given 3D vector. If no intersection is detected, *null* is returned.
	*
	* @param {OBB} obb - An orientend bounding box.
	* @param {Vector3} result - The result vector.
	* @return {Vector3} The result vector.
	*/
	intersectOBB( obb, result ) {

		// the idea is to perform the intersection test in the local space
		// of the OBB.

		obb.getSize( size );
		aabb$1.fromCenterAndSize( v1$3.set( 0, 0, 0 ), size );

		matrix.fromMatrix3( obb.rotation );
		matrix.setPosition( obb.center );

		// transform ray to the local space of the OBB

		localRay.copy( this ).applyMatrix4( matrix.getInverse( inverse$1 ) );

		// perform ray <-> AABB intersection test

		if ( localRay.intersectAABB( aabb$1, result ) ) {

			// transform the intersection point back to world space

			return result.applyMatrix4( matrix );

		} else {

			return null;

		}

	}

	/**
	* Performs a ray/OBB intersection test. Returns either true or false if
	* there is a intersection or not.
	*
	* @param {OBB} obb - An orientend bounding box.
	* @return {boolean} Whether there is an intersection or not.
	*/
	intersectsOBB( obb ) {

		return this.intersectOBB( obb, v1$3 ) !== null;

	}

	/**
	* Performs a ray/convex hull intersection test and stores the intersection point
	* to the given 3D vector. If no intersection is detected, *null* is returned.
	* The implementation is based on "Fast Ray-Convex Polyhedron Intersection"
	* by Eric Haines, GRAPHICS GEMS II
	*
	* @param {ConvexHull} convexHull - A convex hull.
	* @param {Vector3} result - The result vector.
	* @return {Vector3} The result vector.
	*/
	intersectConvexHull( convexHull, result ) {

		const faces = convexHull.faces;

		let tNear = - Infinity;
		let tFar = Infinity;

		for ( let i = 0, l = faces.length; i < l; i ++ ) {

			const face = faces[ i ];
			const plane = face.plane;

			const vN = plane.distanceToPoint( this.origin );
			const vD = plane.normal.dot( this.direction );

			// if the origin is on the positive side of a plane (so the plane can "see" the origin) and
			// the ray is turned away or parallel to the plane, there is no intersection

			if ( vN > 0 && vD >= 0 ) return null;

			// compute the distance from the ray’s origin to the intersection with the plane

			const t = ( vD !== 0 ) ? ( - vN / vD ) : 0;

			// only proceed if the distance is positive. since the ray has a direction, the intersection point
			// would lie "behind" the origin with a negative distance

			if ( t <= 0 ) continue;

			// now categorized plane as front-facing or back-facing

			if ( vD > 0 ) {

				//  plane faces away from the ray, so this plane is a back-face

				tFar = Math.min( t, tFar );

			} else {

				// front-face

				tNear = Math.max( t, tNear );

			}

			if ( tNear > tFar ) {

				// if tNear ever is greater than tFar, the ray must miss the convex hull

				return null;

			}

		}

		// evaluate intersection point

		// always try tNear first since its the closer intersection point

		if ( tNear !== - Infinity ) {

			this.at( tNear, result );

		} else {

			this.at( tFar, result );

		}

		return result;

	}

	/**
	* Performs a ray/convex hull intersection test. Returns either true or false if
	* there is a intersection or not.
	*
	* @param {ConvexHull} convexHull - A convex hull.
	* @return {boolean} Whether there is an intersection or not.
	*/
	intersectsConvexHull( convexHull ) {

		return this.intersectConvexHull( convexHull, v1$3 ) !== null;

	}

	/**
	* Performs a ray/triangle intersection test and stores the intersection point
	* to the given 3D vector. If no intersection is detected, *null* is returned.
	*
	* @param {Triangle} triangle - A triangle.
	* @param {Boolean} backfaceCulling - Whether back face culling is active or not.
	* @param {Vector3} result - The result vector.
	* @return {Vector3} The result vector.
	*/
	intersectTriangle( triangle, backfaceCulling, result ) {

		// reference: https://www.geometrictools.com/GTEngine/Include/Mathematics/GteIntrRay3Triangle3.h

		const a = triangle.a;
		const b = triangle.b;
		const c = triangle.c;

		edge1.subVectors( b, a );
		edge2.subVectors( c, a );
		normal$1.crossVectors( edge1, edge2 );

		let DdN = this.direction.dot( normal$1 );
		let sign;

		if ( DdN > 0 ) {

			if ( backfaceCulling ) return null;
			sign = 1;

		} else if ( DdN < 0 ) {

			sign = - 1;
			DdN = - DdN;

		} else {

			return null;

		}

		v1$3.subVectors( this.origin, a );
		const DdQxE2 = sign * this.direction.dot( edge2.crossVectors( v1$3, edge2 ) );

		// b1 < 0, no intersection

		if ( DdQxE2 < 0 ) {

			return null;

		}

		const DdE1xQ = sign * this.direction.dot( edge1.cross( v1$3 ) );

		// b2 < 0, no intersection

		if ( DdE1xQ < 0 ) {

			return null;

		}

		// b1 + b2 > 1, no intersection

		if ( DdQxE2 + DdE1xQ > DdN ) {

			return null;

		}

		// line intersects triangle, check if ray does

		const QdN = - sign * v1$3.dot( normal$1 );

		// t < 0, no intersection

		if ( QdN < 0 ) {

			return null;

		}

		// ray intersects triangle

		return this.at( QdN / DdN, result );

	}

	/**
	* Performs a ray/BVH intersection test and stores the intersection point
	* to the given 3D vector. If no intersection is detected, *null* is returned.
	*
	* @param {BVH} bvh - A BVH.
	* @param {Vector3} result - The result vector.
	* @return {Vector3} The result vector.
	*/
	intersectBVH( bvh, result ) {

		return bvh.root.intersectRay( this, result );

	}

	/**
	* Performs a ray/BVH intersection test. Returns either true or false if
	* there is a intersection or not.
	*
	* @param {BVH} bvh - A BVH.
	* @return {boolean} Whether there is an intersection or not.
	*/
	intersectsBVH( bvh ) {

		return bvh.root.intersectsRay( this );

	}

	/**
	* Transforms this ray by the given 4x4 matrix.
	*
	* @param {Matrix4} m - The 4x4 matrix.
	* @return {Ray} A reference to this ray.
	*/
	applyMatrix4( m ) {

		this.origin.applyMatrix4( m );
		this.direction.transformDirection( m );

		return this;

	}

	/**
	* Returns true if the given ray is deep equal with this ray.
	*
	* @param {Ray} ray - The ray to test.
	* @return {Boolean} The result of the equality test.
	*/
	equals( ray ) {

		return ray.origin.equals( this.origin ) && ray.direction.equals( this.direction );

	}

}

const localRay = new Ray();

const inverse = new Matrix4();
const localPositionOfObstacle = new Vector3();
const localPositionOfClosestObstacle = new Vector3();
const intersectionPoint$1 = new Vector3();
const boundingSphere$1 = new BoundingSphere();

const ray$1 = new Ray( new Vector3( 0, 0, 0 ), new Vector3( 0, 0, 1 ) );

/**
* This steering behavior produces a force so a vehicle avoids obstacles lying in its path.
*
* @author {@link https://github.com/Mugen87|Mugen87}
* @author {@link https://github.com/robp94|robp94}
* @augments SteeringBehavior
*/
class ObstacleAvoidanceBehavior extends SteeringBehavior {

	/**
	* Constructs a new obstacle avoidance behavior.
	*
	* @param {Array<GameEntity>} obstacles - An Array with obstacle of type {@link GameEntity}.
	*/
	constructor( obstacles = new Array() ) {

		super();

		/**
		* An Array with obstacle of type {@link GameEntity}.
		* @type {Array<GameEntity>}
		*/
		this.obstacles = obstacles;

		/**
		* This factor determines how much the vehicle decelerates if an intersection occurs.
		* @type {Number}
		* @default 0.2
		*/
		this.brakingWeight = 0.2;

		/**
		* Minimum length of the detection box used for intersection tests.
		* @type {Number}
		* @default 4
		*/
		this.dBoxMinLength = 4; //

	}

	/**
	* Calculates the steering force for a single simulation step.
	*
	* @param {Vehicle} vehicle - The game entity the force is produced for.
	* @param {Vector3} force - The force/result vector.
	* @param {Number} delta - The time delta.
	* @return {Vector3} The force/result vector.
	*/
	calculate( vehicle, force /*, delta */ ) {

		const obstacles = this.obstacles;

		// this will keep track of the closest intersecting obstacle

		let closestObstacle = null;

		// this will be used to track the distance to the closest obstacle

		let distanceToClosestObstacle = Infinity;

		// the detection box length is proportional to the agent's velocity

		const dBoxLength = this.dBoxMinLength + ( vehicle.getSpeed() / vehicle.maxSpeed ) * this.dBoxMinLength;

		vehicle.worldMatrix.getInverse( inverse );

		for ( let i = 0, l = obstacles.length; i < l; i ++ ) {

			const obstacle = obstacles[ i ];

			if ( obstacle === vehicle ) continue;

			// calculate this obstacle's position in local space of the vehicle

			localPositionOfObstacle.copy( obstacle.position ).applyMatrix4( inverse );

			// if the local position has a positive z value then it must lay behind the agent.
			// besides the absolute z value must be smaller than the length of the detection box

			if ( localPositionOfObstacle.z > 0 && Math.abs( localPositionOfObstacle.z ) < dBoxLength ) {

				// if the distance from the x axis to the object's position is less
				// than its radius + half the width of the detection box then there is a potential intersection

				const expandedRadius = obstacle.boundingRadius + vehicle.boundingRadius;

				if ( Math.abs( localPositionOfObstacle.x ) < expandedRadius ) {

					// do intersection test in local space of the vehicle

					boundingSphere$1.center.copy( localPositionOfObstacle );
					boundingSphere$1.radius = expandedRadius;

					ray$1.intersectBoundingSphere( boundingSphere$1, intersectionPoint$1 );

					// compare distances

					if ( intersectionPoint$1.z < distanceToClosestObstacle ) {

						// save new minimum distance

						distanceToClosestObstacle = intersectionPoint$1.z;

						// save closest obstacle

						closestObstacle = obstacle;

						// save local position for force calculation

						localPositionOfClosestObstacle.copy( localPositionOfObstacle );

					}

				}

			}

		}

		// if we have found an intersecting obstacle, calculate a steering force away from it

		if ( closestObstacle !== null ) {

			// the closer the agent is to an object, the stronger the steering force should be

			const multiplier = 1 + ( ( dBoxLength - localPositionOfClosestObstacle.z ) / dBoxLength );

			// calculate the lateral force

			force.x = ( closestObstacle.boundingRadius - localPositionOfClosestObstacle.x ) * multiplier;

			// apply a braking force proportional to the obstacles distance from the vehicle

			force.z = ( closestObstacle.boundingRadius - localPositionOfClosestObstacle.z ) * this.brakingWeight;

			// finally, convert the steering vector from local to world space (just apply the rotation)

			force.applyRotation( vehicle.rotation );

		}

		return force;

	}

	/**
	* Transforms this instance into a JSON object.
	*
	* @return {Object} The JSON object.
	*/
	toJSON() {

		const json = super.toJSON();

		json.obstacles = new Array();
		json.brakingWeight = this.brakingWeight;
		json.dBoxMinLength = this.dBoxMinLength;

		// obstacles

		for ( let i = 0, l = this.obstacles.length; i < l; i ++ ) {

			json.obstacles.push( this.obstacles[ i ].uuid );

		}

		return json;

	}

	/**
	* Restores this instance from the given JSON object.
	*
	* @param {Object} json - The JSON object.
	* @return {ObstacleAvoidanceBehavior} A reference to this behavior.
	*/
	fromJSON( json ) {

		super.fromJSON( json );

		this.obstacles = json.obstacles;
		this.brakingWeight = json.brakingWeight;
		this.dBoxMinLength = json.dBoxMinLength;

		return this;

	}

	/**
	* Restores UUIDs with references to GameEntity objects.
	*
	* @param {Map<String,GameEntity>} entities - Maps game entities to UUIDs.
	* @return {ObstacleAvoidanceBehavior} A reference to this behavior.
	*/
	resolveReferences( entities ) {

		const obstacles = this.obstacles;

		for ( let i = 0, l = obstacles.length; i < l; i ++ ) {

			obstacles[ i ] = entities.get( obstacles[ i ] );

		}


	}

}

const offsetWorld = new Vector3();
const toOffset = new Vector3();
const newLeaderVelocity = new Vector3();
const predictedPosition$2 = new Vector3();

/**
* This steering behavior produces a force that keeps a vehicle at a specified offset from a leader vehicle.
* Useful for creating formations.
*
* @author {@link https://github.com/Mugen87|Mugen87}
* @augments SteeringBehavior
*/
class OffsetPursuitBehavior extends SteeringBehavior {

	/**
	* Constructs a new offset pursuit behavior.
	*
	* @param {Vehicle} leader - The leader vehicle.
	* @param {Vector3} offset - The offset from the leader.
	*/
	constructor( leader = null, offset = new Vector3() ) {

		super();

		/**
		* The leader vehicle.
		* @type {?Vehicle}
		* @default null
		*/
		this.leader = leader;

		/**
		* The offset from the leader.
		* @type {Vector3}
		*/
		this.offset = offset;

		// internal behaviors

		this._arrive = new ArriveBehavior();
		this._arrive.deceleration = 1.5;

	}

	/**
	* Calculates the steering force for a single simulation step.
	*
	* @param {Vehicle} vehicle - The game entity the force is produced for.
	* @param {Vector3} force - The force/result vector.
	* @param {Number} delta - The time delta.
	* @return {Vector3} The force/result vector.
	*/
	calculate( vehicle, force /*, delta */ ) {

		const leader = this.leader;
		const offset = this.offset;

		// calculate the offset's position in world space

		offsetWorld.copy( offset ).applyMatrix4( leader.worldMatrix );

		// calculate the vector that points from the vehicle to the offset position

		toOffset.subVectors( offsetWorld, vehicle.position );

		// the lookahead time is proportional to the distance between the leader
		// and the pursuer and is inversely proportional to the sum of both
		// agent's velocities

		const lookAheadTime = toOffset.length() / ( vehicle.maxSpeed + leader.getSpeed() );

		// calculate new velocity and predicted future position

		newLeaderVelocity.copy( leader.velocity ).multiplyScalar( lookAheadTime );

		predictedPosition$2.addVectors( offsetWorld, newLeaderVelocity );

		// now arrive at the predicted future position of the offset

		this._arrive.target = predictedPosition$2;
		this._arrive.calculate( vehicle, force );

		return force;

	}

	/**
	* Transforms this instance into a JSON object.
	*
	* @return {Object} The JSON object.
	*/
	toJSON() {

		const json = super.toJSON();

		json.leader = this.leader ? this.leader.uuid : null;
		json.offset = this.offset;

		return json;

	}

	/**
	* Restores this instance from the given JSON object.
	*
	* @param {Object} json - The JSON object.
	* @return {OffsetPursuitBehavior} A reference to this behavior.
	*/
	fromJSON( json ) {

		super.fromJSON( json );

		this.leader = json.leader;
		this.offset = json.offset;

		return this;

	}


	/**
	* Restores UUIDs with references to GameEntity objects.
	*
	* @param {Map<String,GameEntity>} entities - Maps game entities to UUIDs.
	* @return {OffsetPursuitBehavior} A reference to this behavior.
	*/
	resolveReferences( entities ) {

		this.leader = entities.get( this.leader ) || null;

	}

}

const displacement$1 = new Vector3();
const vehicleDirection = new Vector3();
const evaderDirection = new Vector3();
const newEvaderVelocity = new Vector3();
const predictedPosition$1 = new Vector3();

/**
* This steering behavior is useful when an agent is required to intercept a moving agent.
*
* @author {@link https://github.com/Mugen87|Mugen87}
* @augments SteeringBehavior
*/
class PursuitBehavior extends SteeringBehavior {

	/**
	* Constructs a new pursuit behavior.
	*
	* @param {MovingEntity} evader - The agent to pursue.
	* @param {Number} predictionFactor - This factor determines how far the vehicle predicts the movement of the evader.
	*/
	constructor( evader = null, predictionFactor = 1 ) {

		super();

		/**
		* The agent to pursue.
		* @type {?MovingEntity}
		* @default null
		*/
		this.evader = evader;

		/**
		* This factor determines how far the vehicle predicts the movement of the evader.
		* @type {Number}
		* @default 1
		*/
		this.predictionFactor = predictionFactor;

		// internal behaviors

		this._seek = new SeekBehavior();

	}

	/**
	* Calculates the steering force for a single simulation step.
	*
	* @param {Vehicle} vehicle - The game entity the force is produced for.
	* @param {Vector3} force - The force/result vector.
	* @param {Number} delta - The time delta.
	* @return {Vector3} The force/result vector.
	*/
	calculate( vehicle, force /*, delta */ ) {

		const evader = this.evader;

		displacement$1.subVectors( evader.position, vehicle.position );

		// 1. if the evader is ahead and facing the agent then we can just seek for the evader's current position

		vehicle.getDirection( vehicleDirection );
		evader.getDirection( evaderDirection );

		// first condition: evader must be in front of the pursuer

		const evaderAhead = displacement$1.dot( vehicleDirection ) > 0;

		// second condition: evader must almost directly facing the agent

		const facing = vehicleDirection.dot( evaderDirection ) < - 0.95;

		if ( evaderAhead === true && facing === true ) {

			this._seek.target = evader.position;
			this._seek.calculate( vehicle, force );
			return force;

		}

		// 2. evader not considered ahead so we predict where the evader will be

		// the lookahead time is proportional to the distance between the evader
		// and the pursuer. and is inversely proportional to the sum of the
		// agent's velocities

		let lookAheadTime = displacement$1.length() / ( vehicle.maxSpeed + evader.getSpeed() );
		lookAheadTime *= this.predictionFactor; // tweak the magnitude of the prediction

		// calculate new velocity and predicted future position

		newEvaderVelocity.copy( evader.velocity ).multiplyScalar( lookAheadTime );
		predictedPosition$1.addVectors( evader.position, newEvaderVelocity );

		// now seek to the predicted future position of the evader

		this._seek.target = predictedPosition$1;
		this._seek.calculate( vehicle, force );

		return force;

	}

	/**
	* Transforms this instance into a JSON object.
	*
	* @return {Object} The JSON object.
	*/
	toJSON() {

		const json = super.toJSON();

		json.evader = this.evader ? this.evader.uuid : null;
		json.predictionFactor = this.predictionFactor;

		return json;

	}

	/**
	* Restores this instance from the given JSON object.
	*
	* @param {Object} json - The JSON object.
	* @return {PursuitBehavior} A reference to this behavior.
	*/
	fromJSON( json ) {

		super.fromJSON( json );

		this.evader = json.evader;
		this.predictionFactor = json.predictionFactor;

		return this;

	}

	/**
	* Restores UUIDs with references to GameEntity objects.
	*
	* @param {Map<String,GameEntity>} entities - Maps game entities to UUIDs.
	* @return {PursuitBehavior} A reference to this behavior.
	*/
	resolveReferences( entities ) {

		this.evader = entities.get( this.evader ) || null;

	}

}

const toAgent = new Vector3();

/**
* This steering produces a force that steers a vehicle away from those in its neighborhood region.
*
* @author {@link https://github.com/Mugen87|Mugen87}
* @augments SteeringBehavior
*/
class SeparationBehavior extends SteeringBehavior {

	/**
	* Constructs a new separation behavior.
	*/
	constructor() {

		super();

	}

	/**
	* Calculates the steering force for a single simulation step.
	*
	* @param {Vehicle} vehicle - The game entity the force is produced for.
	* @param {Vector3} force - The force/result vector.
	* @param {Number} delta - The time delta.
	* @return {Vector3} The force/result vector.
	*/
	calculate( vehicle, force /*, delta */ ) {

		const neighbors = vehicle.neighbors;

		for ( let i = 0, l = neighbors.length; i < l; i ++ ) {

			const neighbor = neighbors[ i ];

			toAgent.subVectors( vehicle.position, neighbor.position );

			let length = toAgent.length();

			// handle zero length if both vehicles have the same position

			if ( length === 0 ) length = 0.0001;

			// scale the force inversely proportional to the agents distance from its neighbor

			toAgent.normalize().divideScalar( length );

			force.add( toAgent );

		}

		return force;

	}

}

const targetWorld = new Vector3();
const randomDisplacement = new Vector3();

/**
* This steering behavior produces a steering force that will give the
* impression of a random walk through the agent’s environment. The behavior only
* produces a 2D force (XZ).
*
* @author {@link https://github.com/Mugen87|Mugen87}
* @augments SteeringBehavior
*/
class WanderBehavior extends SteeringBehavior {

	/**
	* Constructs a new wander behavior.
	*
	* @param {Number} radius - The radius of the wander circle for the wander behavior.
	* @param {Number} distance - The distance the wander circle is projected in front of the agent.
	* @param {Number} jitter - The maximum amount of displacement along the sphere each frame.
	*/
	constructor( radius = 1, distance = 5, jitter = 5 ) {

		super();

		/**
		* The radius of the constraining circle for the wander behavior.
		* @type {Number}
		* @default 1
		*/
		this.radius = radius;

		/**
		* The distance the wander sphere is projected in front of the agent.
		* @type {Number}
		* @default 5
		*/
		this.distance = distance;

		/**
		* The maximum amount of displacement along the sphere each frame.
		* @type {Number}
		* @default 5
		*/
		this.jitter = jitter;

		this._targetLocal = new Vector3();

		generateRandomPointOnCircle( this.radius, this._targetLocal );

	}

	/**
	* Calculates the steering force for a single simulation step.
	*
	* @param {Vehicle} vehicle - The game entity the force is produced for.
	* @param {Vector3} force - The force/result vector.
	* @param {Number} delta - The time delta.
	* @return {Vector3} The force/result vector.
	*/
	calculate( vehicle, force, delta ) {

		// this behavior is dependent on the update rate, so this line must be
		// included when using time independent frame rate

		const jitterThisTimeSlice = this.jitter * delta;

		// prepare random vector

		randomDisplacement.x = MathUtils.randFloat( - 1, 1 ) * jitterThisTimeSlice;
		randomDisplacement.z = MathUtils.randFloat( - 1, 1 ) * jitterThisTimeSlice;

		// add random vector to the target's position

		this._targetLocal.add( randomDisplacement );

		// re-project this new vector back onto a unit sphere

		this._targetLocal.normalize();

		// increase the length of the vector to the same as the radius of the wander sphere

		this._targetLocal.multiplyScalar( this.radius );

		// move the target into a position wanderDist in front of the agent

		targetWorld.copy( this._targetLocal );
		targetWorld.z += this.distance;

		// project the target into world space

		targetWorld.applyMatrix4( vehicle.worldMatrix );

		// and steer towards it

		force.subVectors( targetWorld, vehicle.position );

		return force;

	}

	/**
	* Transforms this instance into a JSON object.
	*
	* @return {Object} The JSON object.
	*/
	toJSON() {

		const json = super.toJSON();

		json.radius = this.radius;
		json.distance = this.distance;
		json.jitter = this.jitter;
		json._targetLocal = this._targetLocal.toArray( new Array() );

		return json;

	}

	/**
	* Restores this instance from the given JSON object.
	*
	* @param {Object} json - The JSON object.
	* @return {WanderBehavior} A reference to this behavior.
	*/
	fromJSON( json ) {

		super.fromJSON( json );

		this.radius = json.radius;
		this.distance = json.distance;
		this.jitter = json.jitter;
		this._targetLocal.fromArray( json._targetLocal );

		return this;

	}

}

//

function generateRandomPointOnCircle( radius, target ) {

	const theta = Math.random() * Math.PI * 2;

	target.x = radius * Math.cos( theta );
	target.z = radius * Math.sin( theta );

}

const force = new Vector3();

/**
* This class is responsible for managing the steering of a single vehicle. The steering manager
* can manage multiple steering behaviors and combine their produced force into a single one used
* by the vehicle.
*
* @author {@link https://github.com/Mugen87|Mugen87}
*/
class SteeringManager {

	/**
	* Constructs a new steering manager.
	*
	* @param {Vehicle} vehicle - The vehicle that owns this steering manager.
	*/
	constructor( vehicle ) {

		/**
		* The vehicle that owns this steering manager.
		* @type {Vehicle}
		*/
		this.vehicle = vehicle;

		/**
		* A list of all steering behaviors.
		* @type {Array<SteeringBehavior>}
		* @readonly
		*/
		this.behaviors = new Array();

		this._steeringForce = new Vector3(); // the calculated steering force per simulation step
		this._typesMap = new Map(); // used for deserialization of custom behaviors

	}

	/**
	* Adds the given steering behavior to this steering manager.
	*
	* @param {SteeringBehavior} behavior - The steering behavior to add.
	* @return {SteeringManager} A reference to this steering manager.
	*/
	add( behavior ) {

		this.behaviors.push( behavior );

		return this;

	}

	/**
	* Removes the given steering behavior from this steering manager.
	*
	* @param {SteeringBehavior} behavior - The steering behavior to remove.
	* @return {SteeringManager} A reference to this steering manager.
	*/
	remove( behavior ) {

		const index = this.behaviors.indexOf( behavior );
		this.behaviors.splice( index, 1 );

		return this;

	}

	/**
	* Clears the internal state of this steering manager.
	*
	* @return {SteeringManager} A reference to this steering manager.
	*/
	clear() {

		this.behaviors.length = 0;

		return this;

	}

	/**
	* Calculates the steering forces for all active steering behaviors and
	* combines it into a single result force. This method is called in
	* {@link Vehicle#update}.
	*
	* @param {Number} delta - The time delta.
	* @param {Vector3} result - The force/result vector.
	* @return {Vector3} The force/result vector.
	*/
	calculate( delta, result ) {

		this._calculateByOrder( delta );

		return result.copy( this._steeringForce );

	}

	// this method calculates how much of its max steering force the vehicle has
	// left to apply and then applies that amount of the force to add

	_accumulate( forceToAdd ) {

		// calculate how much steering force the vehicle has used so far

		const magnitudeSoFar = this._steeringForce.length();

		// calculate how much steering force remains to be used by this vehicle

		const magnitudeRemaining = this.vehicle.maxForce - magnitudeSoFar;

		// return false if there is no more force left to use

		if ( magnitudeRemaining <= 0 ) return false;

		// calculate the magnitude of the force we want to add

		const magnitudeToAdd = forceToAdd.length();

		// restrict the magnitude of forceToAdd, so we don't exceed the max force of the vehicle

		if ( magnitudeToAdd > magnitudeRemaining ) {

			forceToAdd.normalize().multiplyScalar( magnitudeRemaining );

		}

		// add force

		this._steeringForce.add( forceToAdd );

		return true;

	}

	_calculateByOrder( delta ) {

		const behaviors = this.behaviors;

		// reset steering force

		this._steeringForce.set( 0, 0, 0 );

		// calculate for each behavior the respective force

		for ( let i = 0, l = behaviors.length; i < l; i ++ ) {

			const behavior = behaviors[ i ];

			if ( behavior.active === true ) {

				force.set( 0, 0, 0 );

				behavior.calculate( this.vehicle, force, delta );

				force.multiplyScalar( behavior.weight );

				if ( this._accumulate( force ) === false ) return;

			}

		}

	}

	/**
	* Transforms this instance into a JSON object.
	*
	* @return {Object} The JSON object.
	*/
	toJSON() {

		const data = {
			type: 'SteeringManager',
			behaviors: new Array()
		};

		const behaviors = this.behaviors;

		for ( let i = 0, l = behaviors.length; i < l; i ++ ) {

			const behavior = behaviors[ i ];
			data.behaviors.push( behavior.toJSON() );

		}

		return data;

	}

	/**
	* Restores this instance from the given JSON object.
	*
	* @param {Object} json - The JSON object.
	* @return {SteeringManager} A reference to this steering manager.
	*/
	fromJSON( json ) {

		this.clear();

		const behaviorsJSON = json.behaviors;

		for ( let i = 0, l = behaviorsJSON.length; i < l; i ++ ) {

			const behaviorJSON = behaviorsJSON[ i ];
			const type = behaviorJSON.type;

			let behavior;

			switch ( type ) {

				case 'SteeringBehavior':
					behavior = new SteeringBehavior().fromJSON( behaviorJSON );
					break;

				case 'AlignmentBehavior':
					behavior = new AlignmentBehavior().fromJSON( behaviorJSON );
					break;

				case 'ArriveBehavior':
					behavior = new ArriveBehavior().fromJSON( behaviorJSON );
					break;

				case 'CohesionBehavior':
					behavior = new CohesionBehavior().fromJSON( behaviorJSON );
					break;

				case 'EvadeBehavior':
					behavior = new EvadeBehavior().fromJSON( behaviorJSON );
					break;

				case 'FleeBehavior':
					behavior = new FleeBehavior().fromJSON( behaviorJSON );
					break;

				case 'FollowPathBehavior':
					behavior = new FollowPathBehavior().fromJSON( behaviorJSON );
					break;

				case 'InterposeBehavior':
					behavior = new InterposeBehavior().fromJSON( behaviorJSON );
					break;

				case 'ObstacleAvoidanceBehavior':
					behavior = new ObstacleAvoidanceBehavior().fromJSON( behaviorJSON );
					break;

				case 'OffsetPursuitBehavior':
					behavior = new OffsetPursuitBehavior().fromJSON( behaviorJSON );
					break;

				case 'PursuitBehavior':
					behavior = new PursuitBehavior().fromJSON( behaviorJSON );
					break;

				case 'SeekBehavior':
					behavior = new SeekBehavior().fromJSON( behaviorJSON );
					break;

				case 'SeparationBehavior':
					behavior = new SeparationBehavior().fromJSON( behaviorJSON );
					break;

				case 'WanderBehavior':
					behavior = new WanderBehavior().fromJSON( behaviorJSON );
					break;

				default:

					// handle custom type

					const ctor = this._typesMap.get( type );

					if ( ctor !== undefined ) {

						behavior = new ctor().fromJSON( behaviorJSON );

					} else {

						Logger.warn( 'YUKA.SteeringManager: Unsupported steering behavior type:', type );
						continue;

					}

			}

			this.add( behavior );

		}

		return this;

	}

	/**
	 * Registers a custom type for deserialization. When calling {@link SteeringManager#fromJSON}
	 * the steering manager is able to pick the correct constructor in order to create custom
	 * steering behavior.
	 *
	 * @param {String} type - The name of the behavior type.
	 * @param {Function} constructor - The constructor function.
	 * @return {SteeringManager} A reference to this steering manager.
	 */
	registerType( type, constructor ) {

		this._typesMap.set( type, constructor );

		return this;

	}

	/**
	* Restores UUIDs with references to GameEntity objects.
	*
	* @param {Map<String,GameEntity>} entities - Maps game entities to UUIDs.
	* @return {SteeringManager} A reference to this steering manager.
	*/
	resolveReferences( entities ) {

		const behaviors = this.behaviors;

		for ( let i = 0, l = behaviors.length; i < l; i ++ ) {

			const behavior = behaviors[ i ];
			behavior.resolveReferences( entities );


		}

		return this;

	}

}

/**
* This class can be used to smooth the result of a vector calculation. One use case
* is the smoothing of the velocity vector of game entities in order to avoid a shaky
* movements due to conflicting forces.
*
* @author {@link https://github.com/Mugen87|Mugen87}
* @author {@link https://github.com/robp94|robp94}
*/
class Smoother {

	/**
	* Constructs a new smoother.
	*
	* @param {Number} count - The amount of samples the smoother will use to average a vector.
	*/
	constructor( count = 10 ) {

		/**
		* The amount of samples the smoother will use to average a vector.
		* @type {Number}
		* @default 10
		*/
		this.count = count;

		this._history = new Array(); // this holds the history
		this._slot = 0; // the current sample slot

		// initialize history with Vector3s

		for ( let i = 0; i < this.count; i ++ ) {

			this._history[ i ] = new Vector3();

		}

	}

	/**
	* Calculates for the given value a smooth average.
	*
	* @param {Vector3} value - The value to smooth.
	* @param {Vector3} average - The calculated average.
	* @return {Vector3} The calculated average.
	*/
	calculate( value, average ) {

		// ensure, average is a zero vector

		average.set( 0, 0, 0 );

		// make sure the slot index wraps around

		if ( this._slot === this.count ) {

			this._slot = 0;

		}

		// overwrite the oldest value with the newest

		this._history[ this._slot ].copy( value );

		// increase slot index

		this._slot ++;

		// now calculate the average of the history array

		for ( let i = 0; i < this.count; i ++ ) {

			average.add( this._history[ i ] );

		}

		average.divideScalar( this.count );

		return average;

	}

	/**
	* Transforms this instance into a JSON object.
	*
	* @return {Object} The JSON object.
	*/
	toJSON() {

		const data = {
			type: this.constructor.name,
			count: this.count,
			_history: new Array(),
			_slot: this._slot
		};

		// history

		const history = this._history;

		for ( let i = 0, l = history.length; i < l; i ++ ) {

			const value = history[ i ];
			data._history.push( value.toArray( new Array() ) );

		}

		return data;

	}

	/**
	* Restores this instance from the given JSON object.
	*
	* @param {Object} json - The JSON object.
	* @return {Smoother} A reference to this smoother.
	*/
	fromJSON( json ) {

		this.count = json.count;
		this._slot = json._slot;

		// history

		const historyJSON = json._history;
		this._history.length = 0;

		for ( let i = 0, l = historyJSON.length; i < l; i ++ ) {

			const valueJSON = historyJSON[ i ];
			this._history.push( new Vector3().fromArray( valueJSON ) );

		}


		return this;

	}

}

const steeringForce = new Vector3();
const displacement = new Vector3();
const acceleration = new Vector3();
const target = new Vector3();
const velocitySmooth = new Vector3();

/**
* This type of game entity implements a special type of locomotion, the so called
* *Vehicle Model*. The class uses basic physical metrics in order to implement a
* realistic movement.
*
* @author {@link https://github.com/Mugen87|Mugen87}
* @author {@link https://github.com/robp94|robp94}
* @augments MovingEntity
*/
class Vehicle extends MovingEntity {

	/**
	* Constructs a new vehicle.
	*/
	constructor() {

		super();

		/**
		* The mass of the vehicle in kilogram.
		* @type {Number}
		* @default 1
		*/
		this.mass = 1;

		/**
		* The maximum force this entity can produce to power itself.
		* @type {Number}
		* @default 100
		*/
		this.maxForce = 100;

		/**
		* The steering manager of this vehicle.
		* @type {SteeringManager}
		*/
		this.steering = new SteeringManager( this );

		/**
		* An optional smoother to avoid shakiness due to conflicting steering behaviors.
		* @type {?Smoother}
		* @default null
		*/
		this.smoother = null;

	}

	/**
	* This method is responsible for updating the position based on the force produced
	* by the internal steering manager.
	*
	* @param {Number} delta - The time delta.
	* @return {Vehicle} A reference to this vehicle.
	*/
	update( delta ) {

		// calculate steering force

		this.steering.calculate( delta, steeringForce );

		// acceleration = force / mass

		acceleration.copy( steeringForce ).divideScalar( this.mass );

		// update velocity

		this.velocity.add( acceleration.multiplyScalar( delta ) );

		// make sure vehicle does not exceed maximum speed

		if ( this.getSpeedSquared() > ( this.maxSpeed * this.maxSpeed ) ) {

			this.velocity.normalize();
			this.velocity.multiplyScalar( this.maxSpeed );

		}

		// calculate displacement

		displacement.copy( this.velocity ).multiplyScalar( delta );

		// calculate target position

		target.copy( this.position ).add( displacement );

		// update the orientation if the vehicle has a non zero velocity

		if ( this.updateOrientation === true && this.smoother === null && this.getSpeedSquared() > 0.00000001 ) {

			this.lookAt( target );

		}

		// update position

		this.position.copy( target );

		// if smoothing is enabled, the orientation (not the position!) of the vehicle is
		// changed based on a post-processed velocity vector

		if ( this.updateOrientation === true && this.smoother !== null ) {

			this.smoother.calculate( this.velocity, velocitySmooth );

			displacement.copy( velocitySmooth ).multiplyScalar( delta );
			target.copy( this.position ).add( displacement );

			this.lookAt( target );

		}

		return this;

	}

	/**
	* Transforms this instance into a JSON object.
	*
	* @return {Object} The JSON object.
	*/
	toJSON() {

		const json = super.toJSON();

		json.mass = this.mass;
		json.maxForce = this.maxForce;
		json.steering = this.steering.toJSON();
		json.smoother = this.smoother ? this.smoother.toJSON() : null;

		return json;

	}

	/**
	* Restores this instance from the given JSON object.
	*
	* @param {Object} json - The JSON object.
	* @return {Vehicle} A reference to this vehicle.
	*/
	fromJSON( json ) {

		super.fromJSON( json );

		this.mass = json.mass;
		this.maxForce = json.maxForce;
		this.steering = new SteeringManager( this ).fromJSON( json.steering );
		this.smoother = json.smoother ? new Smoother().fromJSON( json.smoother ) : null;

		return this;

	}

	/**
	* Restores UUIDs with references to GameEntity objects.
	*
	* @param {Map<String,GameEntity>} entities - Maps game entities to UUIDs.
	* @return {Vehicle} A reference to this vehicle.
	*/
	resolveReferences( entities ) {

		super.resolveReferences( entities );

		this.steering.resolveReferences( entities );

	}

}

/**
* Base class for representing trigger regions. It's a predefine region in 3D space,
* owned by one or more triggers. The shape of the trigger can be arbitrary.
*
* @author {@link https://github.com/Mugen87|Mugen87}
*/
class TriggerRegion {

	/**
	* Returns true if the bounding volume of the given game entity touches/intersects
	* the trigger region. Must be implemented by all concrete trigger regions.
	*
	* @param {GameEntity} entity - The entity to test.
	* @return {Boolean} Whether this trigger touches the given game entity or not.
	*/
	touching( /* entity */ ) {

		return false;

	}

	/**
	* Updates this trigger region. Must be implemented by all concrete trigger regions.
	*
	* @param {Trigger} trigger - The trigger that owns this region.
	* @return {TriggerRegion} A reference to this trigger region.
	*/
	update( /* trigger */ ) {

		return this;

	}

	/**
	* Transforms this instance into a JSON object.
	*
	* @return {Object} The JSON object.
	*/
	toJSON() {

		return {
			type: this.constructor.name
		};

	}

	/**
	* Restores this instance from the given JSON object.
	*
	* @param {Object} json - The JSON object.
	* @return {TriggerRegion} A reference to this trigger region.
	*/
	fromJSON( /* json */ ) {

		return this;

	}

}

const boundingSphereEntity$1 = new BoundingSphere();
const center = new Vector3();

/**
* Class for representing a rectangular trigger region as an AABB.
*
* @author {@link https://github.com/Mugen87|Mugen87}
* @augments TriggerRegion
*/
class RectangularTriggerRegion extends TriggerRegion {

	/**
	* Constructs a new rectangular trigger region with the given values.
	*
	* @param {Vector3} size - The size of the region.
	*/
	constructor( size = new Vector3() ) {

		super();

		/**
		* The size of the region.
		* @type {Vector3}
		*/
		this.size = size;

		this._aabb = new AABB();

	}

	/**
	* Returns true if the bounding volume of the given game entity touches/intersects
	* the trigger region.
	*
	* @param {GameEntity} entity - The entity to test.
	* @return {Boolean} Whether this trigger touches the given game entity or not.
	*/
	touching( entity ) {

		boundingSphereEntity$1.set( entity.position, entity.boundingRadius );

		return this._aabb.intersectsBoundingSphere( boundingSphereEntity$1 );

	}

	/**
	* Updates this trigger region.
	*
	* @param {Trigger} trigger - The trigger that owns this region.
	* @return {RectangularTriggerRegion} A reference to this trigger region.
	*/
	update( trigger ) {

		trigger.getWorldPosition( center );

		this._aabb.fromCenterAndSize( center, this.size );

		return this;

	}

	/**
	* Transforms this instance into a JSON object.
	*
	* @return {Object} The JSON object.
	*/
	toJSON() {

		const json = super.toJSON();

		json.size = this.size.toArray( new Array() );

		return json;

	}

	/**
	* Restores this instance from the given JSON object.
	*
	* @param {Object} json - The JSON object.
	* @return {RectangularTriggerRegion} A reference to this trigger region.
	*/
	fromJSON( json ) {

		super.fromJSON( json );

		this.size.fromArray( json.size );

		return this;

	}

}

const boundingSphereEntity = new BoundingSphere();

/**
* Class for representing a spherical trigger region as a bounding sphere.
*
* @author {@link https://github.com/Mugen87|Mugen87}
* @augments TriggerRegion
*/
class SphericalTriggerRegion extends TriggerRegion {

	/**
	* Constructs a new spherical trigger region.
	*
	* @param {Number} radius - The radius of the region.
	*/
	constructor( radius = 0 ) {

		super();

		/**
		* The radius of the region.
		* @type {Number}
		* @default 0
		*/
		this.radius = radius;

		//

		this._boundingSphere = new BoundingSphere();

	}

	/**
	* Returns true if the bounding volume of the given game entity touches/intersects
	* the trigger region.
	*
	* @param {GameEntity} entity - The entity to test.
	* @return {Boolean} Whether this trigger touches the given game entity or not.
	*/
	touching( entity ) {

		entity.getWorldPosition( boundingSphereEntity.center );
		boundingSphereEntity.radius = entity.boundingRadius;

		return this._boundingSphere.intersectsBoundingSphere( boundingSphereEntity );

	}

	/**
	* Updates this trigger region.
	*
	* @param {Trigger} trigger - The trigger that owns this region.
	* @return {SphericalTriggerRegion} A reference to this trigger region.
	*/
	update( trigger ) {

		trigger.getWorldPosition( this._boundingSphere.center );
		this._boundingSphere.radius = this.radius;

		return this;

	}

	/**
	* Transforms this instance into a JSON object.
	*
	* @return {Object} The JSON object.
	*/
	toJSON() {

		const json = super.toJSON();

		json.radius = this.radius;

		return json;

	}

	/**
	* Restores this instance from the given JSON object.
	*
	* @param {Object} json - The JSON object.
	* @return {SphericalTriggerRegion} A reference to this trigger region.
	*/
	fromJSON( json ) {

		super.fromJSON( json );

		this.radius = json.radius;

		return this;

	}

}

/**
* Base class for representing triggers. A trigger generates an action if a game entity
* touches its trigger region, a predefine area in 3D space.
*
* @author {@link https://github.com/Mugen87|Mugen87}
* @augments GameEntity
*/
class Trigger extends GameEntity {

	/**
	* Constructs a new trigger with the given values.
	*
	* @param {TriggerRegion} region - The region of the trigger.
	*/
	constructor( region = new TriggerRegion() ) {

		super();

		/**
		* The region of the trigger.
		* @type {TriggerRegion}
		*/
		this.region = region;

		//

		this.canActivateTrigger = false; // triggers can't activate other triggers by default

		this._typesMap = new Map(); // used for deserialization of custom trigger regions

	}

	/**
	* This method is called per simulation step for all game entities. If the game
	* entity touches the region of the trigger, the respective action is executed.
	*
	* @param {GameEntity} entity - The entity to test
	* @return {Trigger} A reference to this trigger.
	*/
	check( entity ) {

		if ( this.region.touching( entity ) === true ) {

			this.execute( entity );

		}

		return this;

	}

	/**
	* This method is called when the trigger should execute its action.
	* Must be implemented by all concrete triggers.
	*
	* @param {GameEntity} entity - The entity that touched the trigger region.
	* @return {Trigger} A reference to this trigger.
	*/
	execute( /* entity */ ) {}

	/**
	* Updates the region of this trigger. Called by the {@link EntityManager} per
	* simulation step.
	*
	* @return {Trigger} A reference to this trigger.
	*/
	updateRegion() {

		this.region.update( this );

		return this;

	}

	/**
	* Transforms this instance into a JSON object.
	*
	* @return {Object} The JSON object.
	*/
	toJSON() {

		const json = super.toJSON();

		json.region = this.region.toJSON();

		return json;

	}

	/**
	* Restores this instance from the given JSON object.
	*
	* @param {Object} json - The JSON object.
	* @return {Trigger} A reference to this trigger.
	*/
	fromJSON( json ) {

		super.fromJSON( json );

		const regionJSON = json.region;
		let type = regionJSON.type;

		switch ( type ) {

			case 'TriggerRegion':
				this.region = new TriggerRegion().fromJSON( regionJSON );
				break;

			case 'RectangularTriggerRegion':
				this.region = new RectangularTriggerRegion().fromJSON( regionJSON );
				break;

			case 'SphericalTriggerRegion':
				this.region = new SphericalTriggerRegion().fromJSON( regionJSON );
				break;

			default:
				// handle custom type

				const ctor = this._typesMap.get( type );

				if ( ctor !== undefined ) {

					this.region = new ctor().fromJSON( regionJSON );

				} else {

					Logger.warn( 'YUKA.Trigger: Unsupported trigger region type:', regionJSON.type );

				}

		}

		return this;

	}

	/**
	 * Registers a custom type for deserialization. When calling {@link Trigger#fromJSON}
	 * the trigger is able to pick the correct constructor in order to create custom
	 * trigger regions.
	 *
	 * @param {String} type - The name of the trigger region.
	 * @param {Function} constructor - The constructor function.
	 * @return {Trigger} A reference to this trigger.
	 */
	registerType( type, constructor ) {

		this._typesMap.set( type, constructor );

		return this;

	}

}

const candidates = new Array();

/**
* This class is used for managing all central objects of a game like
* game entities.
*
* @author {@link https://github.com/Mugen87|Mugen87}
*/
class EntityManager {

	/**
	* Constructs a new entity manager.
	*/
	constructor() {

		/**
		* A list of {@link GameEntity game entities}.
		* @type {Array<GameEntity>}
		* @readonly
		*/
		this.entities = new Array();

		/**
		* A reference to a spatial index.
		* @type {?CellSpacePartitioning}
		* @default null
		*/
		this.spatialIndex = null;

		this._triggers = new Array(); // used to manage triggers
		this._indexMap = new Map(); // used by spatial indices
		this._typesMap = new Map(); // used for deserialization of custom entities
		this._messageDispatcher = new MessageDispatcher();

	}

	/**
	* Adds a game entity to this entity manager.
	*
	* @param {GameEntity} entity - The game entity to add.
	* @return {EntityManager} A reference to this entity manager.
	*/
	add( entity ) {

		this.entities.push( entity );

		entity.manager = this;

		return this;

	}

	/**
	* Removes a game entity from this entity manager.
	*
	* @param {GameEntity} entity - The game entity to remove.
	* @return {EntityManager} A reference to this entity manager.
	*/
	remove( entity ) {

		const index = this.entities.indexOf( entity );
		this.entities.splice( index, 1 );

		entity.manager = null;

		return this;

	}

	/**
	* Clears the internal state of this entity manager.
	*
	* @return {EntityManager} A reference to this entity manager.
	*/
	clear() {

		this.entities.length = 0;

		this._messageDispatcher.clear();

		return this;

	}

	/**
	* Returns an entity by the given name. If no game entity is found, *null*
	* is returned. This method should be used once (e.g. at {@link GameEntity#start})
	* and the result should be cached for later use.
	*
	* @param {String} name - The name of the game entity.
	* @return {GameEntity} The found game entity.
	*/
	getEntityByName( name ) {

		const entities = this.entities;

		for ( let i = 0, l = entities.length; i < l; i ++ ) {

			const entity = entities[ i ];

			if ( entity.name === name ) return entity;

		}

		return null;

	}

	/**
	* The central update method of this entity manager. Updates all
	* game entities and delayed messages.
	*
	* @param {Number} delta - The time delta.
	* @return {EntityManager} A reference to this entity manager.
	*/
	update( delta ) {

		const entities = this.entities;
		const triggers = this._triggers;

		// update entities

		for ( let i = ( entities.length - 1 ); i >= 0; i -- ) {

			const entity = entities[ i ];

			this.updateEntity( entity, delta );

		}

		// process triggers (this is done after the entity update to ensure
		// up-to-date world matries)

		for ( let i = ( triggers.length - 1 ); i >= 0; i -- ) {

			const trigger = triggers[ i ];

			this.processTrigger( trigger );

		}

		this._triggers.length = 0; // reset

		// handle messaging

		this._messageDispatcher.dispatchDelayedMessages( delta );

		return this;

	}

	/**
	* Updates a single entity.
	*
	* @param {GameEntity} entity - The game entity to update.
	* @param {Number} delta - The time delta.
	* @return {EntityManager} A reference to this entity manager.
	*/
	updateEntity( entity, delta ) {

		if ( entity.active === true ) {

			this.updateNeighborhood( entity );

			// check if start() should be executed

			if ( entity._started === false ) {

				entity.start();

				entity._started = true;

			}

			// update entity

			entity.update( delta );

			// update children

			const children = entity.children;

			for ( let i = ( children.length - 1 ); i >= 0; i -- ) {

				const child = children[ i ];

				this.updateEntity( child, delta );

			}

			// if the entity is a trigger, save the reference for further processing

			if ( entity instanceof Trigger ) {

				this._triggers.push( entity );

			}

			// update spatial index

			if ( this.spatialIndex !== null ) {

				let currentIndex = this._indexMap.get( entity ) || - 1;
				currentIndex = this.spatialIndex.updateEntity( entity, currentIndex );
				this._indexMap.set( entity, currentIndex );

			}

			// update render component

			const renderComponent = entity._renderComponent;
			const renderComponentCallback = entity._renderComponentCallback;

			if ( renderComponent !== null && renderComponentCallback !== null ) {

				renderComponentCallback( entity, renderComponent );

			}

		}

		return this;

	}

	/**
	* Updates the neighborhood of a single game entity.
	*
	* @param {GameEntity} entity - The game entity to update.
	* @return {EntityManager} A reference to this entity manager.
	*/
	updateNeighborhood( entity ) {

		if ( entity.updateNeighborhood === true ) {

			entity.neighbors.length = 0;

			// determine candidates

			if ( this.spatialIndex !== null ) {

				this.spatialIndex.query( entity.position, entity.neighborhoodRadius, candidates );

			} else {

				// worst case runtime complexity with O(n²)

				candidates.length = 0;
				candidates.push( ...this.entities );

			}

			// verify if candidates are within the predefined range

			const neighborhoodRadiusSq = ( entity.neighborhoodRadius * entity.neighborhoodRadius );

			for ( let i = 0, l = candidates.length; i < l; i ++ ) {

				const candidate = candidates[ i ];

				if ( entity !== candidate && candidate.active === true ) {

					const distanceSq = entity.position.squaredDistanceTo( candidate.position );

					if ( distanceSq <= neighborhoodRadiusSq ) {

						entity.neighbors.push( candidate );

					}

				}

			}

		}

		return this;

	}

	/**
	* Processes a single trigger.
	*
	* @param {Trigger} trigger - The trigger to process.
	* @return {EntityManager} A reference to this entity manager.
	*/
	processTrigger( trigger ) {

		trigger.updateRegion(); // ensure its region is up-to-date

		const entities = this.entities;

		for ( let i = ( entities.length - 1 ); i >= 0; i -- ) {

			const entity = entities[ i ];

			if ( trigger !== entity && entity.active === true && entity.canActivateTrigger === true ) {

				trigger.check( entity );

			}

		}

		return this;

	}

	/**
	* Interface for game entities so they can send messages to other game entities.
	*
	* @param {GameEntity} sender - The sender.
	* @param {GameEntity} receiver - The receiver.
	* @param {String} message - The actual message.
	* @param {Number} delay - A time value in millisecond used to delay the message dispatching.
	* @param {Object} data - An object for custom data.
	* @return {EntityManager} A reference to this entity manager.
	*/
	sendMessage( sender, receiver, message, delay, data ) {

		this._messageDispatcher.dispatch( sender, receiver, message, delay, data );

		return this;

	}

	/**
	* Transforms this instance into a JSON object.
	*
	* @return {Object} The JSON object.
	*/
	toJSON() {

		const data = {
			type: this.constructor.name,
			entities: new Array(),
			_messageDispatcher: this._messageDispatcher.toJSON()
		};

		// entities

		function processEntity( entity ) {

			data.entities.push( entity.toJSON() );

			for ( let i = 0, l = entity.children.length; i < l; i ++ ) {

				processEntity( entity.children[ i ] );

			}

		}

		for ( let i = 0, l = this.entities.length; i < l; i ++ ) {

			// recursively process all entities

			processEntity( this.entities[ i ] );

		}

		return data;

	}

	/**
	* Restores this instance from the given JSON object.
	*
	* @param {Object} json - The JSON object.
	* @return {EntityManager} A reference to this entity manager.
	*/
	fromJSON( json ) {

		this.clear();

		const entitiesJSON = json.entities;
		const _messageDispatcherJSON = json._messageDispatcher;

		// entities

		const entitiesMap = new Map();

		for ( let i = 0, l = entitiesJSON.length; i < l; i ++ ) {

			const entityJSON = entitiesJSON[ i ];
			const type = entityJSON.type;

			let entity;

			switch ( type ) {

				case 'GameEntity':
					entity = new GameEntity().fromJSON( entityJSON );
					break;

				case 'MovingEntity':
					entity = new MovingEntity().fromJSON( entityJSON );
					break;

				case 'Vehicle':
					entity = new Vehicle().fromJSON( entityJSON );
					break;

				case 'Trigger':
					entity = new Trigger().fromJSON( entityJSON );
					break;

				default:

					// handle custom type

					const ctor = this._typesMap.get( type );

					if ( ctor !== undefined ) {

						entity = new ctor().fromJSON( entityJSON );

					} else {

						Logger.warn( 'YUKA.EntityManager: Unsupported entity type:', type );
						continue;

					}

			}

			entitiesMap.set( entity.uuid, entity );

			if ( entity.parent === null ) this.add( entity );

		}

		// resolve UUIDs to game entity objects

		for ( let entity of entitiesMap.values() ) {

			entity.resolveReferences( entitiesMap );

		}

		// restore delayed messages

		this._messageDispatcher.fromJSON( _messageDispatcherJSON );

		return this;

	}

	/**
	* Registers a custom type for deserialization. When calling {@link EntityManager#fromJSON}
	* the entity manager is able to pick the correct constructor in order to create custom
	* game entities.
	*
	* @param {String} type - The name of the entity type.
	* @param {Function} constructor - The constructor function.
	* @return {EntityManager} A reference to this entity manager.
	*/
	registerType( type, constructor ) {

		this._typesMap.set( type, constructor );

		return this;

	}

}

/**
* Other classes can inherit from this class in order to provide an
* event based API. Useful for controls development.
*
* @author {@link https://github.com/Mugen87|Mugen87}
*/

class EventDispatcher {

	/**
	* Constructs a new event dispatcher.
	*/
	constructor() {

		this._events = new Map();

	}

	/**
	* Adds an event listener for the given event type.
	*
	* @param {String} type - The event type.
	* @param {Function} listener - The event listener to add.
	*/
	addEventListener( type, listener ) {

		const events = this._events;

		if ( events.has( type ) === false ) {

			events.set( type, new Array() );

		}

		const listeners = events.get( type );

		if ( listeners.indexOf( listener ) === - 1 ) {

			listeners.push( listener );

		}

	}

	/**
	* Removes the given event listener for the given event type.
	*
	* @param {String} type - The event type.
	* @param {Function} listener - The event listener to remove.
	*/
	removeEventListener( type, listener ) {

		const events = this._events;
		const listeners = events.get( type );

		if ( listeners !== undefined ) {

			const index = listeners.indexOf( listener );

			if ( index !== - 1 ) listeners.splice( index, 1 );

		}

	}

	/**
	* Returns true if the given event listener is set for the given event type.
	*
	* @param {String} type - The event type.
	* @param {Function} listener - The event listener to test.
	* @return {Boolean} Whether the given event listener is set for the given event type or not.
	*/
	hasEventListener( type, listener ) {

		const events = this._events;
		const listeners = events.get( type );

		return ( listeners !== undefined ) && ( listeners.indexOf( listener ) !== - 1 );

	}

	/**
	* Dispatches an event to all respective event listeners.
	*
	* @param {Object} event - The event object.
	*/
	dispatchEvent( event ) {

		const events = this._events;
		const listeners = events.get( event.type );

		if ( listeners !== undefined ) {

			event.target = this;

			for ( let i = 0, l = listeners.length; i < l; i ++ ) {

				listeners[ i ].call( this, event );

			}

		}

	}

}

const v1$2 = new Vector3();
const v2$1 = new Vector3();
const d$1 = new Vector3();

/**
* Class representing a plane in 3D space. The plane is specified in Hessian normal form.
*
* @author {@link https://github.com/Mugen87|Mugen87}
*/
class Plane {

	/**
	* Constructs a new plane with the given values.
	*
	* @param {Vector3} normal - The normal vector of the plane.
	* @param {Number} constant - The distance of the plane from the origin.
	*/
	constructor( normal = new Vector3( 0, 0, 1 ), constant = 0 ) {

		/**
		* The normal vector of the plane.
		* @type {Vector3}
		*/
		this.normal = normal;

		/**
		* The distance of the plane from the origin.
		* @type {Number}
		*/
		this.constant = constant;

	}

	/**
	* Sets the given values to this plane.
	*
	* @param {Vector3} normal - The normal vector of the plane.
	* @param {Number} constant - The distance of the plane from the origin.
	* @return {Plane} A reference to this plane.
	*/
	set( normal, constant ) {

		this.normal = normal;
		this.constant = constant;

		return this;

	}

	/**
	* Copies all values from the given plane to this plane.
	*
	* @param {Plane} plane - The plane to copy.
	* @return {Plane} A reference to this plane.
	*/
	copy( plane ) {

		this.normal.copy( plane.normal );
		this.constant = plane.constant;

		return this;

	}

	/**
	* Creates a new plane and copies all values from this plane.
	*
	* @return {Plane} A new plane.
	*/
	clone() {

		return new this.constructor().copy( this );

	}

	/**
	* Computes the signed distance from the given 3D vector to this plane.
	* The sign of the distance indicates the half-space in which the points lies.
	* Zero means the point lies on the plane.
	*
	* @param {Vector3} point - A point in 3D space.
	* @return {Number} The signed distance.
	*/
	distanceToPoint( point ) {

		return this.normal.dot( point ) + this.constant;

	}

	/**
	* Sets the values of the plane from the given normal vector and a coplanar point.
	*
	* @param {Vector3} normal - A normalized vector.
	* @param {Vector3} point - A coplanar point.
	* @return {Plane} A reference to this plane.
	*/
	fromNormalAndCoplanarPoint( normal, point ) {

		this.normal.copy( normal );
		this.constant = - point.dot( this.normal );

		return this;

	}

	/**
	* Sets the values of the plane from three given coplanar points.
	*
	* @param {Vector3} a - A coplanar point.
	* @param {Vector3} b - A coplanar point.
	* @param {Vector3} c - A coplanar point.
	* @return {Plane} A reference to this plane.
	*/
	fromCoplanarPoints( a, b, c ) {

		v1$2.subVectors( c, b ).cross( v2$1.subVectors( a, b ) ).normalize();

		this.fromNormalAndCoplanarPoint( v1$2, a );

		return this;

	}

	/**
	* Performs a plane/plane intersection test and stores the intersection point
	* to the given 3D vector. If no intersection is detected, *null* is returned.
	*
	* Reference: Intersection of Two Planes in Real-Time Collision Detection
	* by Christer Ericson (chapter 5.4.4)
	*
	* @param {Plane} plane - The plane to test.
	* @param {Vector3} result - The result vector.
	* @return {Vector3} The result vector.
	*/
	intersectPlane( plane, result ) {

		// compute direction of intersection line

		d$1.crossVectors( this.normal, plane.normal );

		// if d is zero, the planes are parallel (and separated)
		// or coincident, so they’re not considered intersecting

		const denom = d$1.dot( d$1 );

		if ( denom === 0 ) return null;

		// compute point on intersection line

		v1$2.copy( plane.normal ).multiplyScalar( this.constant );
		v2$1.copy( this.normal ).multiplyScalar( plane.constant );

		result.crossVectors( v1$2.sub( v2$1 ), d$1 ).divideScalar( denom );

		return result;

	}

	/**
	* Returns true if the given plane intersects this plane.
	*
	* @param {Plane} plane - The plane to test.
	* @return {Boolean} The result of the intersection test.
	*/
	intersectsPlane( plane ) {

		const d = this.normal.dot( plane.normal );

		return ( Math.abs( d ) !== 1 );

	}

	/**
	* Projects the given point onto the plane. The result is written
	* to the given vector.
	*
	* @param {Vector3} point - The point to project onto the plane.
	* @param {Vector3} result - The projected point.
	* @return {Vector3} The projected point.
	*/
	projectPoint( point, result ) {

		v1$2.copy( this.normal ).multiplyScalar( this.distanceToPoint( point ) );

		result.subVectors( point, v1$2 );

		return result;

	}

	/**
	* Returns true if the given plane is deep equal with this plane.
	*
	* @param {Plane} plane - The plane to test.
	* @return {Boolean} The result of the equality test.
	*/
	equals( plane ) {

		return plane.normal.equals( this.normal ) && plane.constant === this.constant;

	}

}

const boundingSphere = new BoundingSphere();
const triangle$1 = { a: new Vector3(), b: new Vector3(), c: new Vector3() };
const rayLocal = new Ray();
const plane$1 = new Plane();
const inverseMatrix = new Matrix4();
const closestIntersectionPoint = new Vector3();
const closestTriangle = { a: new Vector3(), b: new Vector3(), c: new Vector3() };

/**
* Class for representing a polygon mesh. The faces consist of triangles.
*
* @author {@link https://github.com/Mugen87|Mugen87}
*/
class MeshGeometry {

	/**
	* Constructs a new mesh geometry.
	*
	* @param {TypedArray} vertices - The vertex buffer (Float32Array).
	* @param {TypedArray} indices - The index buffer (Uint16Array/Uint32Array).
	*/
	constructor( vertices = new Float32Array(), indices = null ) {

		/**
		* The vertex buffer.
		* @type {Float32Array}
		*/
		this.vertices = vertices;

		/**
		* The index buffer.
		* @type {?(Uint16Array|?Uint32Array)}
		* @default null
		*/
		this.indices = indices;

		/**
		*  Whether back face culling is active or not. Only relevant for raycasting.
		* @type {Boolean}
		*/
		this.backfaceCulling = true;

		/**
		* An AABB enclosing the geometry.
		* @type {AABB}
		*/
		this.aabb = new AABB();

		/**
		* A bounding sphere enclosing the geometry.
		* @type {BoundingSphere}
		*/
		this.boundingSphere = new BoundingSphere();

		this.computeBoundingVolume();

	}

	/**
	* Computes the internal bounding volumes of this mesh geometry.
	*
	* @return {MeshGeometry} A reference to this mesh geometry.
	*/
	computeBoundingVolume() {

		const vertices = this.vertices;
		const vertex = new Vector3();

		const aabb = this.aabb;
		const boundingSphere = this.boundingSphere;

		// compute AABB

		aabb.min.set( Infinity, Infinity, Infinity );
		aabb.max.set( - Infinity, - Infinity, - Infinity );

		for ( let i = 0, l = vertices.length; i < l; i += 3 ) {

			vertex.x = vertices[ i ];
			vertex.y = vertices[ i + 1 ];
			vertex.z = vertices[ i + 2 ];

			aabb.expand( vertex );

		}

		// compute bounding sphere

		aabb.getCenter( boundingSphere.center );
		boundingSphere.radius = boundingSphere.center.distanceTo( aabb.max );

		return this;

	}

	/**
	 * Performs a ray intersection test with the geometry of the obstacle and stores
	 * the intersection point in the given result vector. If no intersection is detected,
	 * *null* is returned.
	 *
	 * @param {Ray} ray - The ray to test.
	 * @param {Matrix4} worldMatrix - The matrix that transforms the geometry to world space.
	 * @param {Boolean} closest - Whether the closest intersection point should be computed or not.
	 * @param {Vector3} intersectionPoint - The intersection point.
	 * @param {Vector3} normal - The normal vector of the respective triangle.
	 * @return {Vector3} The result vector.
	 */
	intersectRay( ray, worldMatrix, closest, intersectionPoint, normal = null ) {

		// check bounding sphere first in world space

		boundingSphere.copy( this.boundingSphere ).applyMatrix4( worldMatrix );

		if ( ray.intersectsBoundingSphere( boundingSphere ) ) {

			// transform the ray into the local space of the obstacle

			worldMatrix.getInverse( inverseMatrix );
			rayLocal.copy( ray ).applyMatrix4( inverseMatrix );

			// check AABB in local space since its more expensive to convert an AABB to world space than a bounding sphere

			if ( rayLocal.intersectsAABB( this.aabb ) ) {

				// now perform more expensive test with all triangles of the geometry

				const vertices = this.vertices;
				const indices = this.indices;

				let minDistance = Infinity;
				let found = false;

				if ( indices === null ) {

					// non-indexed geometry

					for ( let i = 0, l = vertices.length; i < l; i += 9 ) {

						triangle$1.a.set( vertices[ i ], vertices[ i + 1 ], vertices[ i + 2 ] );
						triangle$1.b.set( vertices[ i + 3 ], vertices[ i + 4 ], vertices[ i + 5 ] );
						triangle$1.c.set( vertices[ i + 6 ], vertices[ i + 7 ], vertices[ i + 8 ] );

						if ( rayLocal.intersectTriangle( triangle$1, this.backfaceCulling, intersectionPoint ) !== null ) {

							if ( closest ) {

								const distance = intersectionPoint.squaredDistanceTo( rayLocal.origin );

								if ( distance < minDistance ) {

									minDistance = distance;

									closestIntersectionPoint.copy( intersectionPoint );
									closestTriangle.a.copy( triangle$1.a );
									closestTriangle.b.copy( triangle$1.b );
									closestTriangle.c.copy( triangle$1.c );
									found = true;

								}

							} else {

								found = true;
								break;

							}

						}

					}

				} else {

					// indexed geometry

					for ( let i = 0, l = indices.length; i < l; i += 3 ) {

						const a = indices[ i ];
						const b = indices[ i + 1 ];
						const c = indices[ i + 2 ];

						const stride = 3;

						triangle$1.a.set( vertices[ ( a * stride ) ], vertices[ ( a * stride ) + 1 ], vertices[ ( a * stride ) + 2 ] );
						triangle$1.b.set( vertices[ ( b * stride ) ], vertices[ ( b * stride ) + 1 ], vertices[ ( b * stride ) + 2 ] );
						triangle$1.c.set( vertices[ ( c * stride ) ], vertices[ ( c * stride ) + 1 ], vertices[ ( c * stride ) + 2 ] );

						if ( rayLocal.intersectTriangle( triangle$1, this.backfaceCulling, intersectionPoint ) !== null ) {

							if ( closest ) {

								const distance = intersectionPoint.squaredDistanceTo( rayLocal.origin );

								if ( distance < minDistance ) {

									minDistance = distance;

									closestIntersectionPoint.copy( intersectionPoint );
									closestTriangle.a.copy( triangle$1.a );
									closestTriangle.b.copy( triangle$1.b );
									closestTriangle.c.copy( triangle$1.c );
									found = true;

								}

							} else {

								found = true;
								break;

							}

						}

					}

				}

				// intersection was found

				if ( found ) {

					if ( closest ) {

						// restore closest intersection point and triangle

						intersectionPoint.copy( closestIntersectionPoint );
						triangle$1.a.copy( closestTriangle.a );
						triangle$1.b.copy( closestTriangle.b );
						triangle$1.c.copy( closestTriangle.c );

					}

					// transform intersection point back to world space

					intersectionPoint.applyMatrix4( worldMatrix );

					// compute normal of triangle in world space if necessary

					if ( normal !== null ) {

						plane$1.fromCoplanarPoints( triangle$1.a, triangle$1.b, triangle$1.c );
						normal.copy( plane$1.normal );
						normal.transformDirection( worldMatrix );

					}

					return intersectionPoint;

				}

			}

		}

		return null;

	}

	/**
	 * Returns a new geometry without containing indices. If the geometry is already
	 * non-indexed, the method performs no changes.
	 *
	 * @return {MeshGeometry} The new non-indexed geometry.
	 */
	toTriangleSoup() {

		const indices = this.indices;

		if ( indices ) {

			const vertices = this.vertices;
			const newVertices = new Float32Array( indices.length * 3 );

			for ( let i = 0, l = indices.length; i < l; i ++ ) {

				const a = indices[ i ];
				const stride = 3;

				newVertices[ i * stride ] = vertices[ a * stride ];
				newVertices[ ( i * stride ) + 1 ] = vertices[ ( a * stride ) + 1 ];
				newVertices[ ( i * stride ) + 2 ] = vertices[ ( a * stride ) + 2 ];

			}

			return new MeshGeometry( newVertices );

		} else {

			return this;

		}

	}

	/**
	* Transforms this instance into a JSON object.
	*
	* @return {Object} The JSON object.
	*/
	toJSON() {

		const json = {
			type: this.constructor.name
		};

		json.indices = {
			type: this.indices ? this.indices.constructor.name : 'null',
			data: this.indices ? Array.from( this.indices ) : null
		};

		json.vertices = Array.from( this.vertices );
		json.backfaceCulling = this.backfaceCulling;
		json.aabb = this.aabb.toJSON();
		json.boundingSphere = this.boundingSphere.toJSON();

		return json;

	}

	/**
	* Restores this instance from the given JSON object.
	*
	* @param {Object} json - The JSON object.
	* @return {MeshGeometry} A reference to this mesh geometry.
	*/
	fromJSON( json ) {

		this.aabb = new AABB().fromJSON( json.aabb );
		this.boundingSphere = new BoundingSphere().fromJSON( json.boundingSphere );
		this.backfaceCulling = json.backfaceCulling;

		this.vertices = new Float32Array( json.vertices );

		switch ( json.indices.type ) {

			case 'Uint16Array':
				this.indices = new Uint16Array( json.indices.data );
				break;

			case 'Uint32Array':
				this.indices = new Uint32Array( json.indices.data );
				break;

			case 'null':
				this.indices = null;
				break;

		}

		return this;

	}

}

/**
* Class for representing a timer.
*
* @author {@link https://github.com/Mugen87|Mugen87}
*/
class Time {

	/**
	* Constructs a new time object.
	*/
	constructor() {

		this._previousTime = 0;
		this._currentTime = 0;

		this._delta = 0;
		this._elapsed = 0;

		this._timescale = 1;

		this._useFixedDelta = false;
		this._fixedDelta = 16.67; // ms, corresponds to approx. 60 FPS

		// use Page Visibility API to avoid large time delta values

		this._usePageVisibilityAPI = ( typeof document !== 'undefined' && document.hidden !== undefined );

		if ( this._usePageVisibilityAPI === true ) {

			this._pageVisibilityHandler = handleVisibilityChange.bind( this );

			document.addEventListener( 'visibilitychange', this._pageVisibilityHandler, false );

		}

	}

	/**
	* Disables the usage of a fixed delta value.
	*
	* @return {Time} A reference to this time object.
	*/
	disableFixedDelta() {

		this._useFixedDelta = false;

		return this;

	}

	/**
	* Frees all internal resources.
	*
	* @return {Time} A reference to this time object.
	*/
	dispose() {

		if ( this._usePageVisibilityAPI === true ) {

			document.removeEventListener( 'visibilitychange', this._pageVisibilityHandler );

		}

		return this;

	}

	/**
	* Enables the usage of a fixed delta value. Can be useful for debugging and testing.
	*
	* @return {Time} A reference to this time object.
	*/
	enableFixedDelta() {

		this._useFixedDelta = true;

		return this;

	}

	/**
	* Returns the delta time in seconds. Represents the completion time in seconds since
	* the last simulation step.
	*
	* @return {Number} The delta time in seconds.
	*/
	getDelta() {

		return this._delta / 1000;

	}

	/**
	* Returns the elapsed time in seconds. It's the accumulated
	* value of all previous time deltas.
	*
	* @return {Number} The elapsed time in seconds.
	*/
	getElapsed() {

		return this._elapsed / 1000;

	}

	/**
	* Returns the fixed delta time in seconds.
	*
	* @return {Number} The fixed delta time in seconds.
	*/
	getFixedDelta() {

		return this._fixedDelta / 1000;

	}

	/**
	* Returns the timescale value.
	*
	* @return {Number} The timescale value.
	*/
	getTimescale() {

		return this._timescale;

	}

	/**
	* Resets this time object.
	*
	* @return {Time} A reference to this time object.
	*/
	reset() {

		this._currentTime = this._now();

		return this;

	}

	/**
	* Sets a fixed time delta value.
	*
	* @param {Number} fixedDelta - Fixed time delta in seconds.
	* @return {Time} A reference to this time object.
	*/
	setFixedDelta( fixedDelta ) {

		this._fixedDelta = fixedDelta * 1000;

		return this;

	}

	/**
	* Sets a timescale value. This value represents the scale at which time passes.
	* Can be used for slow down or  accelerate the simulation.
	*
	* @param {Number} timescale - The timescale value.
	* @return {Time} A reference to this time object.
	*/
	setTimescale( timescale ) {

		this._timescale = timescale;

		return this;

	}

	/**
	* Updates the internal state of this time object.
	*
	* @return {Time} A reference to this time object.
	*/
	update() {

		if ( this._useFixedDelta === true ) {

			this._delta = this._fixedDelta;

		} else {

			this._previousTime = this._currentTime;
			this._currentTime = this._now();

			this._delta = this._currentTime - this._previousTime;

		}

		this._delta *= this._timescale;

		this._elapsed += this._delta; // _elapsed is the accumulation of all previous deltas

		return this;

	}

	// private

	_now() {

		return ( typeof performance === 'undefined' ? Date : performance ).now();

	}

}

//

function handleVisibilityChange() {

	if ( document.hidden === false ) this.reset();

}

/**
* Not all components of an AI system need to be updated in each simulation step.
* This class can be used to control the update process by defining how many updates
* should be executed per second.
*
* @author {@link https://github.com/Mugen87|Mugen87}
*/
class Regulator {

	/**
	* Constructs a new regulator.
	*
	* @param {Number} updateFrequency - The amount of updates per second.
	*/
	constructor( updateFrequency = 0 ) {

		/**
		* The amount of updates per second.
		* @type {Number}
		* @default 0
		*/
		this.updateFrequency = updateFrequency;

		this._time = new Time();
		this._nextUpdateTime = 0;

	}

	/**
	* Returns true if it is time to allow the next update.
	*
	* @return {Boolean} Whether an update is allowed or not.
	*/
	ready() {

		this._time.update();

		const elapsedTime = this._time.getElapsed();

		if ( elapsedTime >= this._nextUpdateTime ) {

			this._nextUpdateTime = elapsedTime + ( 1 / this.updateFrequency );

			return true;

		}

		return false;

	}

}

/**
* Base class for representing a state in context of State-driven agent design.
*
* @author {@link https://github.com/Mugen87|Mugen87}
*/
class State {

	/**
	* This method is called once during a state transition when the {@link StateMachine} makes
	* this state active.
	*
	* @param {GameEntity} owner - The game entity that represents the execution context of this state.
	*/
	enter( /* owner */ ) {}

	/**
	* This method is called per simulation step if this state is active.
	*
	* @param {GameEntity} owner - The game entity that represents the execution context of this state.
	*/
	execute( /* owner */ ) {}

	/**
	* This method is called once during a state transition when the {@link StateMachine} makes
	* this state inactive.
	*
	* @param {GameEntity} owner - The game entity that represents the execution context of this state.
	*/
	exit( /* owner */ ) {}

	/**
	* Transforms this instance into a JSON object.
	*
	* @return {Object} The JSON object.
	*/
	toJSON() {}

	/**
	* Restores this instance from the given JSON object.
	*
	* @param {Object} json - The JSON object.
	* @return {State} A reference to this state.
	*/
	fromJSON( /* json */ ) {}

	/**
	* Restores UUIDs with references to GameEntity objects.
	*
	* @param {Map<String,GameEntity>} entities - Maps game entities to UUIDs.
	* @return {State} A reference to this state.
	*/
	resolveReferences( /* entities */ ) {}

	/**
	* This method is called when messaging between game entities occurs.
	*
	* @param {GameEntity} owner - The game entity that represents the execution context of this state.
	* @param {Telegram} telegram - A data structure containing the actual message.
	* @return {Boolean} Whether the message was processed or not.
	*/
	onMessage( /* owner, telegram */ ) {

		return false;

	}

}

/**
* Finite state machine (FSM) for implementing State-driven agent design.
*
* @author {@link https://github.com/Mugen87|Mugen87}
*/
class StateMachine {

	/**
	* Constructs a new state machine with the given values.
	*
	* @param {GameEntity} owner - The owner of this state machine.
	*/
	constructor( owner = null ) {

		/**
		* The game entity that owns this state machine.
		* @type {?GameEntity}
		* @default null
		*/
		this.owner = owner;

		/**
		* The current state of the game entity.
		* @type {?State}
		* @default null
		*/
		this.currentState = null;

		/**
		* The previous state of the game entity.
		* @type {?State}
		* @default null
		*/
		this.previousState = null; // a reference to the last state the agent was in

		/**
		* This state logic is called every time the state machine is updated.
		* @type {?State}
		* @default null
		*/
		this.globalState = null;

		/**
		* A map with all states of the state machine.
		* @type {Map<String,State>}
		*/
		this.states = new Map();

		//

		this._typesMap = new Map();

	}

	/**
	* Updates the internal state of the FSM. Usually called by {@link GameEntity#update}.
	*
	* @return {StateMachine} A reference to this state machine.
	*/
	update() {

		if ( this.globalState !== null ) {

			this.globalState.execute( this.owner );

		}

		if ( this.currentState !== null ) {

			this.currentState.execute( this.owner );

		}

		return this;

	}

	/**
	* Adds a new state with the given ID to the state machine.
	*
	* @param {String} id - The ID of the state.
	* @param {State} state - The state.
	* @return {StateMachine} A reference to this state machine.
	*/
	add( id, state ) {

		if ( state instanceof State ) {

			this.states.set( id, state );

		} else {

			Logger.warn( 'YUKA.StateMachine: .add() needs a parameter of type "YUKA.State".' );

		}

		return this;

	}

	/**
	* Removes a state via its ID from the state machine.
	*
	* @param {String} id - The ID of the state.
	* @return {StateMachine} A reference to this state machine.
	*/
	remove( id ) {

		this.states.delete( id );

		return this;

	}

	/**
	* Returns the state for the given ID.
	*
	* @param {String} id - The ID of the state.
	* @return {State} The state for the given ID.
	*/
	get( id ) {

		return this.states.get( id );

	}

	/**
	* Performs a state change to the state defined by its ID.
	*
	* @param {String} id - The ID of the state.
	* @return {StateMachine} A reference to this state machine.
	*/
	changeTo( id ) {

		const state = this.get( id );

		this._change( state );

		return this;

	}

	/**
	* Returns to the previous state.
	*
	* @return {StateMachine} A reference to this state machine.
	*/
	revert() {

		this._change( this.previousState );

		return this;

	}

	/**
	* Returns true if this FSM is in the given state.
	*
	* @return {Boolean} Whether this FSM is in the given state or not.
	*/
	in( id ) {

		const state = this.get( id );

		return ( state === this.currentState );

	}

	/**
	* Tries to dispatch the massage to the current or global state and returns true
	* if the message was processed successfully.
	*
	* @param {Telegram} telegram - The telegram with the message data.
	* @return {Boolean} Whether the message was processed or not.
	*/
	handleMessage( telegram ) {

		// first see, if the current state is valid and that it can handle the message

		if ( this.currentState !== null && this.currentState.onMessage( this.owner, telegram ) === true ) {

			return true;

		}

		// if not, and if a global state has been implemented, send the message to the global state

		if ( this.globalState !== null && this.globalState.onMessage( this.owner, telegram ) === true ) {

			return true;

		}

		return false;

	}

	/**
	* Transforms this instance into a JSON object.
	*
	* @return {Object} The JSON object.
	*/
	toJSON() {

		const json = {
			owner: this.owner.uuid,
			currentState: null,
			previousState: null,
			globalState: null,
			states: new Array()
		};

		const statesMap = new Map();

		// states

		for ( let [ id, state ] of this.states ) {

			json.states.push( {
				type: state.constructor.name,
				id: id,
				state: state.toJSON()
			} );

			statesMap.set( state, id );

		}

		json.currentState = statesMap.get( this.currentState ) || null;
		json.previousState = statesMap.get( this.previousState ) || null;
		json.globalState = statesMap.get( this.globalState ) || null;

		return json;

	}

	/**
	* Restores this instance from the given JSON object.
	*
	* @param {Object} json - The JSON object.
	* @return {StateMachine} A reference to this state machine.
	*/
	fromJSON( json ) {

		this.owner = json.owner;

		//

		const statesJSON = json.states;

		for ( let i = 0, l = statesJSON.length; i < l; i ++ ) {

			const stateJSON = statesJSON[ i ];
			const type = stateJSON.type;

			const ctor = this._typesMap.get( type );

			if ( ctor !== undefined ) {

				const id = stateJSON.id;
				const state = new ctor().fromJSON( stateJSON.state );

				this.add( id, state );

			} else {

				Logger.warn( 'YUKA.StateMachine: Unsupported state type:', type );
				continue;

			}

		}

		//

		this.currentState = ( json.currentState !== null ) ? ( this.get( json.currentState ) || null ) : null;
		this.previousState = ( json.previousState !== null ) ? ( this.get( json.previousState ) || null ) : null;
		this.globalState = ( json.globalState !== null ) ? ( this.get( json.globalState ) || null ) : null;

		return this;

	}

	/**
	* Restores UUIDs with references to GameEntity objects.
	*
	* @param {Map<String,GameEntity>} entities - Maps game entities to UUIDs.
	* @return {StateMachine} A reference to this state machine.
	*/
	resolveReferences( entities ) {

		this.owner = entities.get( this.owner ) || null;

		for ( let state of this.states.values() ) {

			state.resolveReferences( entities );

		}

		return this;

	}

	/**
	* Registers a custom type for deserialization. When calling {@link StateMachine#fromJSON}
	* the state machine is able to pick the correct constructor in order to create custom states.
	*
	* @param {String} type - The name of the state type.
	* @param {Function} constructor - The constructor function.
	* @return {StateMachine} A reference to this state machine.
	*/
	registerType( type, constructor ) {

		this._typesMap.set( type, constructor );

		return this;

	}

	//

	_change( state ) {

		this.previousState = this.currentState;

		if ( this.currentState !== null ) {

			this.currentState.exit( this.owner );

		}

		this.currentState = state;

		this.currentState.enter( this.owner );

	}

}

/**
* Base class for representing a term in a {@link FuzzyRule}.
*
* @author {@link https://github.com/Mugen87|Mugen87}
*/
class FuzzyTerm {

	/**
	* Clears the degree of membership value.
	*
	* @return {FuzzyTerm} A reference to this term.
	*/
	clearDegreeOfMembership() {}

	/**
	* Returns the degree of membership.
	*
	* @return {Number} Degree of membership.
	*/
	getDegreeOfMembership() {}

	/**
	* Updates the degree of membership by the given value. This method is used when
	* the term is part of a fuzzy rule's consequent.
	*
	* @param {Number} value - The value used to update the degree of membership.
	* @return {FuzzyTerm} A reference to this term.
	*/
	updateDegreeOfMembership( /* value */ ) {}

	/**
	* Transforms this instance into a JSON object.
	*
	* @return {Object} The JSON object.
	*/
	toJSON() {

		return {
			type: this.constructor.name
		};

	}

}

/**
* Base class for representing more complex fuzzy terms based on the
* composite design pattern.
*
* @author {@link https://github.com/Mugen87|Mugen87}
* @augments FuzzyTerm
*/
class FuzzyCompositeTerm extends FuzzyTerm {

	/**
	* Constructs a new fuzzy composite term with the given values.
	*
	* @param {Array<FuzzyTerm>} terms - An arbitrary amount of fuzzy terms.
	*/
	constructor( terms = new Array() ) {

		super();

		/**
		* List of fuzzy terms.
		* @type {Array<FuzzyTerm>}
		*/
		this.terms = terms;

	}

	/**
	* Clears the degree of membership value.
	*
	* @return {FuzzyCompositeTerm} A reference to this term.
	*/
	clearDegreeOfMembership() {

		const terms = this.terms;

		for ( let i = 0, l = terms.length; i < l; i ++ ) {

			terms[ i ].clearDegreeOfMembership();

		}

		return this;

	}

	/**
	* Updates the degree of membership by the given value. This method is used when
	* the term is part of a fuzzy rule's consequent.
	*
	* @param {Number} value - The value used to update the degree of membership.
	* @return {FuzzyCompositeTerm} A reference to this term.
	*/
	updateDegreeOfMembership( value ) {

		const terms = this.terms;

		for ( let i = 0, l = terms.length; i < l; i ++ ) {

			terms[ i ].updateDegreeOfMembership( value );

		}

		return this;

	}

	/**
	* Transforms this instance into a JSON object.
	*
	* @return {Object} The JSON object.
	*/
	toJSON() {

		const json = super.toJSON();

		json.terms = new Array();

		for ( let i = 0, l = this.terms.length; i < l; i ++ ) {

			const term = this.terms[ i ];

			if ( term instanceof FuzzyCompositeTerm ) {

				json.terms.push( term.toJSON() );

			} else {

				json.terms.push( term.uuid );

			}

		}

		return json;

	}

}

/**
* Class for representing an AND operator. Can be used to construct
* fuzzy rules.
*
* @author {@link https://github.com/Mugen87|Mugen87}
* @augments FuzzyCompositeTerm
*/
class FuzzyAND extends FuzzyCompositeTerm {

	/**
	* Constructs a new fuzzy AND operator with the given values. The constructor
	* accepts and arbitrary amount of fuzzy terms.
	*/
	constructor() {

		const terms = Array.from( arguments );

		super( terms );

	}

	/**
	* Returns the degree of membership. The AND operator returns the minimum
	* degree of membership of the sets it is operating on.
	*
	* @return {Number} Degree of membership.
	*/
	getDegreeOfMembership() {

		const terms = this.terms;
		let minDOM = Infinity;

		for ( let i = 0, l = terms.length; i < l; i ++ ) {

			const term = terms[ i ];
			const currentDOM = term.getDegreeOfMembership();

			if ( currentDOM < minDOM ) minDOM = currentDOM;

		}

		return minDOM;

	}

}

/**
* Hedges are special unary operators that can be employed to modify the meaning
* of a fuzzy set. The FAIRLY fuzzy hedge widens the membership function.
*
* @author {@link https://github.com/Mugen87|Mugen87}
* @augments FuzzyCompositeTerm
*/
class FuzzyFAIRLY extends FuzzyCompositeTerm {

	/**
	* Constructs a new fuzzy FAIRLY hedge with the given values.
	*
	* @param {FuzzyTerm} fuzzyTerm - The fuzzy term this hedge is working on.
	*/
	constructor( fuzzyTerm = null ) {

		const terms = ( fuzzyTerm !== null ) ? [ fuzzyTerm ] : new Array();

		super( terms );

	}

	// FuzzyTerm API

	/**
	* Clears the degree of membership value.
	*
	* @return {FuzzyFAIRLY} A reference to this fuzzy hedge.
	*/
	clearDegreeOfMembership() {

		const fuzzyTerm = this.terms[ 0 ];
		fuzzyTerm.clearDegreeOfMembership();

		return this;

	}

	/**
	* Returns the degree of membership.
	*
	* @return {Number} Degree of membership.
	*/
	getDegreeOfMembership() {

		const fuzzyTerm = this.terms[ 0 ];
		const dom = fuzzyTerm.getDegreeOfMembership();

		return Math.sqrt( dom );

	}

	/**
	* Updates the degree of membership by the given value.
	*
	* @return {FuzzyFAIRLY} A reference to this fuzzy hedge.
	*/
	updateDegreeOfMembership( value ) {

		const fuzzyTerm = this.terms[ 0 ];
		fuzzyTerm.updateDegreeOfMembership( Math.sqrt( value ) );

		return this;

	}

}

/**
* Class for representing an OR operator. Can be used to construct
* fuzzy rules.
*
* @author {@link https://github.com/Mugen87|Mugen87}
* @augments FuzzyCompositeTerm
*/
class FuzzyOR extends FuzzyCompositeTerm {

	/**
	* Constructs a new fuzzy AND operator with the given values. The constructor
	* accepts and arbitrary amount of fuzzy terms.
	*/
	constructor() {

		const terms = Array.from( arguments );

		super( terms );

	}

	/**
	* Returns the degree of membership. The AND operator returns the maximum
	* degree of membership of the sets it is operating on.
	*
	* @return {Number} Degree of membership.
	*/
	getDegreeOfMembership() {

		const terms = this.terms;
		let maxDOM = - Infinity;

		for ( let i = 0, l = terms.length; i < l; i ++ ) {

			const term = terms[ i ];
			const currentDOM = term.getDegreeOfMembership();

			if ( currentDOM > maxDOM ) maxDOM = currentDOM;

		}

		return maxDOM;

	}

}

/**
* Hedges are special unary operators that can be employed to modify the meaning
* of a fuzzy set. The FAIRLY fuzzy hedge widens the membership function.
*
* @author {@link https://github.com/Mugen87|Mugen87}
* @augments FuzzyCompositeTerm
*/
class FuzzyVERY extends FuzzyCompositeTerm {

	/**
	* Constructs a new fuzzy VERY hedge with the given values.
	*
	* @param {FuzzyTerm} fuzzyTerm - The fuzzy term this hedge is working on.
	*/
	constructor( fuzzyTerm = null ) {

		const terms = ( fuzzyTerm !== null ) ? [ fuzzyTerm ] : new Array();

		super( terms );

	}

	// FuzzyTerm API

	/**
	* Clears the degree of membership value.
	*
	* @return {FuzzyVERY} A reference to this fuzzy hedge.
	*/
	clearDegreeOfMembership() {

		const fuzzyTerm = this.terms[ 0 ];
		fuzzyTerm.clearDegreeOfMembership();

		return this;

	}

	/**
	* Returns the degree of membership.
	*
	* @return {Number} Degree of membership.
	*/
	getDegreeOfMembership() {

		const fuzzyTerm = this.terms[ 0 ];
		const dom = fuzzyTerm.getDegreeOfMembership();

		return dom * dom;

	}

	/**
	* Updates the degree of membership by the given value.
	*
	* @return {FuzzyVERY} A reference to this fuzzy hedge.
	*/
	updateDegreeOfMembership( value ) {

		const fuzzyTerm = this.terms[ 0 ];
		fuzzyTerm.updateDegreeOfMembership( value * value );

		return this;

	}

}

/**
* Base class for fuzzy sets. This type of sets are defined by a membership function
* which can be any arbitrary shape but are typically triangular or trapezoidal. They define
* a gradual transition from regions completely outside the set to regions completely
* within the set, thereby enabling a value to have partial membership to a set.
*
* This class is derived from {@link FuzzyTerm} so it can be directly used in fuzzy rules.
* According to the composite design pattern, a fuzzy set can be considered as an atomic fuzzy term.
*
* @author {@link https://github.com/Mugen87|Mugen87}
* @augments FuzzyTerm
*/
class FuzzySet extends FuzzyTerm {

	/**
	* Constructs a new fuzzy set with the given values.
	*
	* @param {Number} representativeValue - The maximum of the set's membership function.
	*/
	constructor( representativeValue = 0 ) {

		super();

		/**
		* Represents the degree of membership to this fuzzy set.
		* @type {Number}
		* @default 0
		*/
		this.degreeOfMembership = 0;

		/**
		* The maximum of the set's membership function. For instance, if
		* the set is triangular then this will be the peak point of the triangular.
		* If the set has a plateau then this value will be the mid point of the
		* plateau. Used to avoid runtime calculations.
		* @type {Number}
		* @default 0
		*/
		this.representativeValue = representativeValue;

		/**
		* Represents the left border of this fuzzy set.
		* @type {Number}
		* @default 0
		*/
		this.left = 0;

		/**
		* Represents the right border of this fuzzy set.
		* @type {Number}
		* @default 0
		*/
		this.right = 0;

		//

		this._uuid = null;

	}

	/**
	* Unique ID, primarily used in context of serialization/deserialization.
	* @type {String}
	* @readonly
	*/
	get uuid() {

		if ( this._uuid === null ) {

			this._uuid = MathUtils.generateUUID();

		}

		return this._uuid;

	}

	/**
	* Computes the degree of membership for the given value. Notice that this method
	* does not set {@link FuzzySet#degreeOfMembership} since other classes use it in
	* order to calculate intermediate degree of membership values. This method be
	* implemented by all concrete fuzzy set classes.
	*
	* @param {Number} value - The value used to calculate the degree of membership.
	* @return {Number} The degree of membership.
	*/
	computeDegreeOfMembership( /* value */ ) {}

	// FuzzyTerm API

	/**
	* Clears the degree of membership value.
	*
	* @return {FuzzySet} A reference to this fuzzy set.
	*/
	clearDegreeOfMembership() {

		this.degreeOfMembership = 0;

		return this;

	}

	/**
	* Returns the degree of membership.
	*
	* @return {Number} Degree of membership.
	*/
	getDegreeOfMembership() {

		return this.degreeOfMembership;

	}

	/**
	* Updates the degree of membership by the given value. This method is used when
	* the set is part of a fuzzy rule's consequent.
	*
	* @return {FuzzySet} A reference to this fuzzy set.
	*/
	updateDegreeOfMembership( value ) {

		// update the degree of membership if the given value is greater than the
		// existing one

		if ( value > this.degreeOfMembership ) this.degreeOfMembership = value;

		return this;

	}

	/**
	* Transforms this instance into a JSON object.
	*
	* @return {Object} The JSON object.
	*/
	toJSON() {

		const json = super.toJSON();

		json.degreeOfMembership = this.degreeOfMembership;
		json.representativeValue = this.representativeValue;
		json.left = this.left;
		json.right = this.right;
		json.uuid = this.uuid;

		return json;

	}

	/**
	* Restores this instance from the given JSON object.
	*
	* @param {Object} json - The JSON object.
	* @return {FuzzySet} A reference to this fuzzy set.
	*/
	fromJSON( json ) {

		this.degreeOfMembership = json.degreeOfMembership;
		this.representativeValue = json.representativeValue;
		this.left = json.left;
		this.right = json.right;

		this._uuid = json.uuid;

		return this;

	}

}

/**
* Class for representing a fuzzy set that has a s-shape membership function with
* values from highest to lowest.
*
* @author {@link https://github.com/robp94|robp94}
* @augments FuzzySet
*/
class LeftSCurveFuzzySet extends FuzzySet {

	/**
	* Constructs a new S-curve fuzzy set with the given values.
	*
	* @param {Number} left - Represents the left border of this fuzzy set.
	* @param {Number} midpoint - Represents the peak value of this fuzzy set.
	* @param {Number} right - Represents the right border of this fuzzy set.
	*/
	constructor( left = 0, midpoint = 0, right = 0 ) {

		// the representative value is the midpoint of the plateau of the shoulder

		const representativeValue = ( midpoint + left ) / 2;

		super( representativeValue );

		/**
		* Represents the left border of this fuzzy set.
		* @type {Number}
		* @default 0
		*/
		this.left = left;

		/**
		* Represents the peak value of this fuzzy set.
		* @type {Number}
		* @default 0
		*/
		this.midpoint = midpoint;

		/**
		* Represents the right border of this fuzzy set.
		* @type {Number}
		* @default 0
		*/
		this.right = right;

	}

	/**
	* Computes the degree of membership for the given value.
	*
	* @param {Number} value - The value used to calculate the degree of membership.
	* @return {Number} The degree of membership.
	*/
	computeDegreeOfMembership( value ) {

		const midpoint = this.midpoint;
		const left = this.left;
		const right = this.right;

		// find DOM if the given value is left of the center or equal to the center

		if ( ( value >= left ) && ( value <= midpoint ) ) {

			return 1;

		}

		// find DOM if the given value is right of the midpoint

		if ( ( value > midpoint ) && ( value <= right ) ) {

			if ( value >= ( ( midpoint + right ) / 2 ) ) {

				return 2 * ( Math.pow( ( value - right ) / ( midpoint - right ), 2 ) );

			} else { //todo test

				return 1 - ( 2 * ( Math.pow( ( value - midpoint ) / ( midpoint - right ), 2 ) ) );

			}

		}

		// out of range

		return 0;

	}

	/**
	* Transforms this instance into a JSON object.
	*
	* @return {Object} The JSON object.
	*/
	toJSON() {

		const json = super.toJSON();

		json.midpoint = this.midpoint;

		return json;

	}

	/**
	* Restores this instance from the given JSON object.
	*
	* @param {Object} json - The JSON object.
	* @return {LeftSCurveFuzzySet} A reference to this fuzzy set.
	*/
	fromJSON( json ) {

		super.fromJSON( json );

		this.midpoint = json.midpoint;

		return this;

	}

}

/**
* Class for representing a fuzzy set that has a left shoulder shape. The range between
* the midpoint and left border point represents the same DOM.
*
* @author {@link https://github.com/Mugen87|Mugen87}
* @augments FuzzySet
*/
class LeftShoulderFuzzySet extends FuzzySet {

	/**
	* Constructs a new left shoulder fuzzy set with the given values.
	*
	* @param {Number} left - Represents the left border of this fuzzy set.
	* @param {Number} midpoint - Represents the peak value of this fuzzy set.
	* @param {Number} right - Represents the right border of this fuzzy set.
	*/
	constructor( left = 0, midpoint = 0, right = 0 ) {

		// the representative value is the midpoint of the plateau of the shoulder

		const representativeValue = ( midpoint + left ) / 2;

		super( representativeValue );

		/**
		* Represents the left border of this fuzzy set.
		* @type {Number}
		* @default 0
		*/
		this.left = left;

		/**
		* Represents the peak value of this fuzzy set.
		* @type {Number}
		* @default 0
		*/
		this.midpoint = midpoint;

		/**
		* Represents the right border of this fuzzy set.
		* @type {Number}
		* @default 0
		*/
		this.right = right;

	}

	/**
	* Computes the degree of membership for the given value.
	*
	* @param {Number} value - The value used to calculate the degree of membership.
	* @return {Number} The degree of membership.
	*/
	computeDegreeOfMembership( value ) {

		const midpoint = this.midpoint;
		const left = this.left;
		const right = this.right;

		// find DOM if the given value is left of the center or equal to the center

		if ( ( value >= left ) && ( value <= midpoint ) ) {

			return 1;

		}

		// find DOM if the given value is right of the midpoint

		if ( ( value > midpoint ) && ( value <= right ) ) {

			const grad = 1 / ( right - midpoint );

			return grad * ( right - value );

		}

		// out of range

		return 0;

	}

	/**
	* Transforms this instance into a JSON object.
	*
	* @return {Object} The JSON object.
	*/
	toJSON() {

		const json = super.toJSON();

		json.midpoint = this.midpoint;

		return json;

	}

	/**
	* Restores this instance from the given JSON object.
	*
	* @param {Object} json - The JSON object.
	* @return {LeftShoulderFuzzySet} A reference to this fuzzy set.
	*/
	fromJSON( json ) {

		super.fromJSON( json );

		this.midpoint = json.midpoint;

		return this;

	}

}

/**
* Class for representing a fuzzy set that has a normal distribution shape. It can be defined
* by the mean and standard deviation.
*
* @author {@link https://github.com/robp94|robp94}
* @augments FuzzySet
*/
class NormalDistFuzzySet extends FuzzySet {

	/**
	* Constructs a new triangular fuzzy set with the given values.
	*
	* @param {Number} left - Represents the left border of this fuzzy set.
	* @param {Number} midpoint - Mean or expectation of the normal distribution.
	* @param {Number} right - Represents the right border of this fuzzy set.
	* @param {Number} standardDeviation - Standard deviation of the normal distribution.
	*/
	constructor( left = 0, midpoint = 0, right = 0, standardDeviation = 0 ) {

		super( midpoint );

		/**
		* Represents the left border of this fuzzy set.
		* @type {Number}
		* @default 0
		*/
		this.left = left;

		/**
		* Represents the peak value of this fuzzy set.
		* @type {Number}
		* @default 0
		*/
		this.midpoint = midpoint;

		/**
		* Represents the right border of this fuzzy set.
		* @type {Number}
		* @default 0
		*/
		this.right = right;

		/**
		* Represents the standard deviation of this fuzzy set.
		* @type {Number}
		* @default 0
		*/
		this.standardDeviation = standardDeviation;

		//

		this._cache = {};

	}

	/**
	* Computes the degree of membership for the given value.
	*
	* @param {Number} value - The value used to calculate the degree of membership.
	* @return {Number} The degree of membership.
	*/
	computeDegreeOfMembership( value ) {

		this._updateCache();

		if ( value >= this.right || value <= this.left ) return 0;

		return probabilityDensity( value, this.midpoint, this._cache.variance ) / this._cache.normalizationFactor;

	}

	/**
	* Transforms this instance into a JSON object.
	*
	* @return {Object} The JSON object.
	*/
	toJSON() {

		const json = super.toJSON();

		json.midpoint = this.midpoint;
		json.standardDeviation = this.standardDeviation;

		return json;

	}

	/**
	* Restores this instance from the given JSON object.
	*
	* @param {Object} json - The JSON object.
	* @return {NormalDistFuzzySet} A reference to this fuzzy set.
	*/
	fromJSON( json ) {

		super.fromJSON( json );

		this.midpoint = json.midpoint;
		this.standardDeviation = json.standardDeviation;

		return this;

	}

	//

	_updateCache() {

		const cache =	this._cache;
		const midpoint = this.midpoint;
		const standardDeviation = this.standardDeviation;

		if ( midpoint !== cache.midpoint || standardDeviation !== cache.standardDeviation ) {

			const variance = standardDeviation * standardDeviation;

			cache.midpoint = midpoint;
			cache.standardDeviation = standardDeviation;
			cache.variance = variance;

			// this value is used to ensure the DOM lies in the range of [0,1]

			cache.normalizationFactor = probabilityDensity( midpoint, midpoint, variance );

		}

		return this;

	}

}

//

function probabilityDensity( x, mean, variance ) {

	return ( 1 / Math.sqrt( 2 * Math.PI * variance ) ) * Math.exp( - ( Math.pow( ( x - mean ), 2 ) ) / ( 2 * variance ) );

}

/**
* Class for representing a fuzzy set that has a s-shape membership function with
* values from lowest to highest.
*
* @author {@link https://github.com/robp94|robp94}
* @augments FuzzySet
*/
class RightSCurveFuzzySet extends FuzzySet {

	/**
	* Constructs a new S-curve fuzzy set with the given values.
	*
	* @param {Number} left - Represents the left border of this fuzzy set.
	* @param {Number} midpoint - Represents the peak value of this fuzzy set.
	* @param {Number} right - Represents the right border of this fuzzy set.
	*/
	constructor( left = 0, midpoint = 0, right = 0 ) {

		// the representative value is the midpoint of the plateau of the shoulder

		const representativeValue = ( midpoint + right ) / 2;

		super( representativeValue );

		/**
		* Represents the left border of this fuzzy set.
		* @type {Number}
		* @default 0
		*/
		this.left = left;

		/**
		* Represents the peak value of this fuzzy set.
		* @type {Number}
		* @default 0
		*/
		this.midpoint = midpoint;

		/**
		* Represents the right border of this fuzzy set.
		* @type {Number}
		* @default 0
		*/
		this.right = right;

	}

	/**
	* Computes the degree of membership for the given value.
	*
	* @param {Number} value - The value used to calculate the degree of membership.
	* @return {Number} The degree of membership.
	*/
	computeDegreeOfMembership( value ) {

		const midpoint = this.midpoint;
		const left = this.left;
		const right = this.right;

		// find DOM if the given value is left of the center or equal to the center

		if ( ( value >= left ) && ( value <= midpoint ) ) {

			if ( value <= ( ( left + midpoint ) / 2 ) ) {

				return 2 * ( Math.pow( ( value - left ) / ( midpoint - left ), 2 ) );

			} else {

				return 1 - ( 2 * ( Math.pow( ( value - midpoint ) / ( midpoint - left ), 2 ) ) );

			}


		}

		// find DOM if the given value is right of the midpoint

		if ( ( value > midpoint ) && ( value <= right ) ) {

			return 1;

		}

		// out of range

		return 0;

	}

	/**
	* Transforms this instance into a JSON object.
	*
	* @return {Object} The JSON object.
	*/
	toJSON() {

		const json = super.toJSON();

		json.midpoint = this.midpoint;

		return json;

	}

	/**
	* Restores this instance from the given JSON object.
	*
	* @param {Object} json - The JSON object.
	* @return {RightSCurveFuzzySet} A reference to this fuzzy set.
	*/
	fromJSON( json ) {

		super.fromJSON( json );

		this.midpoint = json.midpoint;

		return this;

	}

}

/**
* Class for representing a fuzzy set that has a right shoulder shape. The range between
* the midpoint and right border point represents the same DOM.
*
* @author {@link https://github.com/Mugen87|Mugen87}
* @augments FuzzySet
*/
class RightShoulderFuzzySet extends FuzzySet {

	/**
	* Constructs a new right shoulder fuzzy set with the given values.
	*
	* @param {Number} left - Represents the left border of this fuzzy set.
	* @param {Number} midpoint - Represents the peak value of this fuzzy set.
	* @param {Number} right - Represents the right border of this fuzzy set.
	*/
	constructor( left = 0, midpoint = 0, right = 0 ) {

		// the representative value is the midpoint of the plateau of the shoulder

		const representativeValue = ( midpoint + right ) / 2;

		super( representativeValue );

		/**
		* Represents the left border of this fuzzy set.
		* @type {Number}
		* @default 0
		*/
		this.left = left;

		/**
		* Represents the peak value of this fuzzy set.
		* @type {Number}
		* @default 0
		*/
		this.midpoint = midpoint;

		/**
		* Represents the right border of this fuzzy set.
		* @type {Number}
		* @default 0
		*/
		this.right = right;

	}

	/**
	* Computes the degree of membership for the given value.
	*
	* @param {Number} value - The value used to calculate the degree of membership.
	* @return {Number} The degree of membership.
	*/
	computeDegreeOfMembership( value ) {

		const midpoint = this.midpoint;
		const left = this.left;
		const right = this.right;

		// find DOM if the given value is left of the center or equal to the center

		if ( ( value >= left ) && ( value <= midpoint ) ) {

			const grad = 1 / ( midpoint - left );

			return grad * ( value - left );

		}

		// find DOM if the given value is right of the midpoint

		if ( ( value > midpoint ) && ( value <= right ) ) {

			return 1;

		}

		// out of range

		return 0;

	}

	/**
	* Transforms this instance into a JSON object.
	*
	* @return {Object} The JSON object.
	*/
	toJSON() {

		const json = super.toJSON();

		json.midpoint = this.midpoint;

		return json;

	}

	/**
	* Restores this instance from the given JSON object.
	*
	* @param {Object} json - The JSON object.
	* @return {RightShoulderFuzzySet} A reference to this fuzzy set.
	*/
	fromJSON( json ) {

		super.fromJSON( json );

		this.midpoint = json.midpoint;

		return this;

	}

}

/**
* Class for representing a fuzzy set that is a singleton. In its range, the degree of
* membership is always one.
*
* @author {@link https://github.com/Mugen87|Mugen87}
* @augments FuzzySet
*/
class SingletonFuzzySet extends FuzzySet {

	/**
	* Constructs a new singleton fuzzy set with the given values.
	*
	* @param {Number} left - Represents the left border of this fuzzy set.
	* @param {Number} midpoint - Represents the peak value of this fuzzy set.
	* @param {Number} right - Represents the right border of this fuzzy set.
	*/
	constructor( left = 0, midpoint = 0, right = 0 ) {

		super( midpoint );

		/**
		* Represents the left border of this fuzzy set.
		* @type {Number}
		* @default 0
		*/
		this.left = left;

		/**
		* Represents the peak value of this fuzzy set.
		* @type {Number}
		* @default 0
		*/
		this.midpoint = midpoint;

		/**
		* Represents the right border of this fuzzy set.
		* @type {Number}
		* @default 0
		*/
		this.right = right;

	}

	/**
	* Computes the degree of membership for the given value.
	*
	* @param {Number} value - The value used to calculate the degree of membership.
	* @return {Number} The degree of membership.
	*/
	computeDegreeOfMembership( value ) {

		const left = this.left;
		const right = this.right;

		return ( value >= left && value <= right ) ? 1 : 0;

	}

	/**
	* Transforms this instance into a JSON object.
	*
	* @return {Object} The JSON object.
	*/
	toJSON() {

		const json = super.toJSON();

		json.midpoint = this.midpoint;

		return json;

	}

	/**
	* Restores this instance from the given JSON object.
	*
	* @param {Object} json - The JSON object.
	* @return {SingletonFuzzySet} A reference to this fuzzy set.
	*/
	fromJSON( json ) {

		super.fromJSON( json );

		this.midpoint = json.midpoint;

		return this;

	}

}

/**
* Class for representing a fuzzy set that has a triangular shape. It can be defined
* by a left point, a midpoint (peak) and a right point.
*
* @author {@link https://github.com/Mugen87|Mugen87}
* @augments FuzzySet
*/
class TriangularFuzzySet extends FuzzySet {

	/**
	* Constructs a new triangular fuzzy set with the given values.
	*
	* @param {Number} left - Represents the left border of this fuzzy set.
	* @param {Number} midpoint - Represents the peak value of this fuzzy set.
	* @param {Number} right - Represents the right border of this fuzzy set.
	*/
	constructor( left = 0, midpoint = 0, right = 0 ) {

		super( midpoint );

		/**
		* Represents the left border of this fuzzy set.
		* @type {Number}
		* @default 0
		*/
		this.left = left;

		/**
		* Represents the peak value of this fuzzy set.
		* @type {Number}
		* @default 0
		*/
		this.midpoint = midpoint;

		/**
		* Represents the right border of this fuzzy set.
		* @type {Number}
		* @default 0
		*/
		this.right = right;

	}

	/**
	* Computes the degree of membership for the given value.
	*
	* @param {Number} value - The value used to calculate the degree of membership.
	* @return {Number} The degree of membership.
	*/
	computeDegreeOfMembership( value ) {

		const midpoint = this.midpoint;
		const left = this.left;
		const right = this.right;

		// find DOM if the given value is left of the center or equal to the center

		if ( ( value >= left ) && ( value <= midpoint ) ) {

			const grad = 1 / ( midpoint - left );

			return grad * ( value - left );

		}

		// find DOM if the given value is right of the center

		if ( ( value > midpoint ) && ( value <= right ) ) {

			const grad = 1 / ( right - midpoint );

			return grad * ( right - value );

		}

		// out of range

		return 0;

	}

	/**
	* Transforms this instance into a JSON object.
	*
	* @return {Object} The JSON object.
	*/
	toJSON() {

		const json = super.toJSON();

		json.midpoint = this.midpoint;

		return json;

	}

	/**
	* Restores this instance from the given JSON object.
	*
	* @param {Object} json - The JSON object.
	* @return {TriangularFuzzySet} A reference to this fuzzy set.
	*/
	fromJSON( json ) {

		super.fromJSON( json );

		this.midpoint = json.midpoint;

		return this;

	}

}

/**
* Class for representing a fuzzy rule. Fuzzy rules are comprised of an antecedent and
* a consequent in the form: IF antecedent THEN consequent.
*
* Compared to ordinary if/else statements with discrete values, the consequent term
* of a fuzzy rule can fire to a matter of degree.
*
* @author {@link https://github.com/Mugen87|Mugen87}
*/
class FuzzyRule {

	/**
	* Constructs a new fuzzy rule with the given values.
	*
	* @param {FuzzyTerm} antecedent - Represents the condition of the rule.
	* @param {FuzzyTerm} consequence - Describes the consequence if the condition is satisfied.
	*/
	constructor( antecedent = null, consequence = null ) {

		/**
		* Represents the condition of the rule.
		* @type {?FuzzyTerm}
		* @default null
		*/
		this.antecedent = antecedent;

		/**
		* Describes the consequence if the condition is satisfied.
		* @type {?FuzzyTerm}
		* @default null
		*/
		this.consequence = consequence;

	}

	/**
	* Initializes the consequent term of this fuzzy rule.
	*
	* @return {FuzzyRule} A reference to this fuzzy rule.
	*/
	initConsequence() {

		this.consequence.clearDegreeOfMembership();

		return this;

	}

	/**
	* Evaluates the rule and updates the degree of membership of the consequent term with
	* the degree of membership of the antecedent term.
	*
	* @return {FuzzyRule} A reference to this fuzzy rule.
	*/
	evaluate() {

		this.consequence.updateDegreeOfMembership( this.antecedent.getDegreeOfMembership() );

		return this;

	}

	/**
	* Transforms this instance into a JSON object.
	*
	* @return {Object} The JSON object.
	*/
	toJSON() {

		const json = {};

		const antecedent = this.antecedent;
		const consequence = this.consequence;

		json.type = this.constructor.name;
		json.antecedent = ( antecedent instanceof FuzzyCompositeTerm ) ? antecedent.toJSON() : antecedent.uuid;
		json.consequence = ( consequence instanceof FuzzyCompositeTerm ) ? consequence.toJSON() : consequence.uuid;

		return json;

	}

	/**
	* Restores this instance from the given JSON object.
	*
	* @param {Object} json - The JSON object.
	* @param {Map<String,FuzzySet>} fuzzySets - Maps fuzzy sets to UUIDs.
	* @return {FuzzyRule} A reference to this fuzzy rule.
	*/
	fromJSON( json, fuzzySets ) {

		function parseTerm( termJSON ) {

			if ( typeof termJSON === 'string' ) {

				// atomic term -> FuzzySet

				const uuid = termJSON;
				return fuzzySets.get( uuid ) || null;

			} else {

				// composite term

				const type = termJSON.type;

				let term;

				switch ( type ) {

					case 'FuzzyAND':
						term = new FuzzyAND();
						break;

					case 'FuzzyOR':
						term = new FuzzyOR();
						break;

					case 'FuzzyVERY':
						term = new FuzzyVERY();
						break;

					case 'FuzzyFAIRLY':
						term = new FuzzyFAIRLY();
						break;

					default:
						Logger.error( 'YUKA.FuzzyRule: Unsupported operator type:', type );
						return;

				}

				const termsJSON = termJSON.terms;

				for ( let i = 0, l = termsJSON.length; i < l; i ++ ) {

					// recursively parse all subordinate terms

					term.terms.push( parseTerm( termsJSON[ i ] ) );

				}

				return term;

			}

		}

		this.antecedent = parseTerm( json.antecedent );
		this.consequence = parseTerm( json.consequence );

		return this;

	}

}

/**
* Class for representing a fuzzy linguistic variable (FLV). A FLV is the
* composition of one or more fuzzy sets to represent a concept or domain
* qualitatively. For example fuzzs sets "Dumb", "Average", and "Clever"
* are members of the fuzzy linguistic variable "IQ".
*
* @author {@link https://github.com/Mugen87|Mugen87}
*/
class FuzzyVariable {

	/**
	* Constructs a new fuzzy linguistic variable.
	*/
	constructor() {

		/**
		* An array of the fuzzy sets that comprise this FLV.
		* @type {Array<FuzzySet>}
		* @readonly
		*/
		this.fuzzySets = new Array();

		/**
		* The minimum value range of this FLV. This value is
		* automatically updated when adding/removing fuzzy sets.
		* @type {Number}
		* @default Infinity
		* @readonly
		*/
		this.minRange = Infinity;

		/**
		* The maximum value range of this FLV. This value is
		* automatically updated when adding/removing fuzzy sets.
		* @type {Number}
		* @default - Infinity
		* @readonly
		*/
		this.maxRange = - Infinity;

	}

	/**
	* Adds the given fuzzy set to this FLV.
	*
	* @param {FuzzySet} fuzzySet - The fuzzy set to add.
	* @return {FuzzyVariable} A reference to this FLV.
	*/
	add( fuzzySet ) {

		this.fuzzySets.push( fuzzySet );

		// adjust range

		if ( fuzzySet.left < this.minRange ) this.minRange = fuzzySet.left;
		if ( fuzzySet.right > this.maxRange ) this.maxRange = fuzzySet.right;

		return this;

	}

	/**
	* Removes the given fuzzy set from this FLV.
	*
	* @param {FuzzySet} fuzzySet - The fuzzy set to remove.
	* @return {FuzzyVariable} A reference to this FLV.
	*/
	remove( fuzzySet ) {

		const fuzzySets = this.fuzzySets;

		const index = fuzzySets.indexOf( fuzzySet );
		fuzzySets.splice( index, 1 );

		// iterate over all fuzzy sets to recalculate the min/max range

		this.minRange = Infinity;
		this.maxRange = - Infinity;

		for ( let i = 0, l = fuzzySets.length; i < l; i ++ ) {

			const fuzzySet = fuzzySets[ i ];

			if ( fuzzySet.left < this.minRange ) this.minRange = fuzzySet.left;
			if ( fuzzySet.right > this.maxRange ) this.maxRange = fuzzySet.right;

		}

		return this;

	}

	/**
	* Fuzzifies a value by calculating its degree of membership in each of
	* this variable's fuzzy sets.
	*
	* @param {Number} value - The crips value to fuzzify.
	* @return {FuzzyVariable} A reference to this FLV.
	*/
	fuzzify( value ) {

		if ( value < this.minRange || value > this.maxRange ) {

			Logger.warn( 'YUKA.FuzzyVariable: Value for fuzzification out of range.' );
			return;

		}

		const fuzzySets = this.fuzzySets;

		for ( let i = 0, l = fuzzySets.length; i < l; i ++ ) {

			const fuzzySet = fuzzySets[ i ];

			fuzzySet.degreeOfMembership = fuzzySet.computeDegreeOfMembership( value );

		}

		return this;

	}

	/**
	* Defuzzifies the FLV using the "Average of Maxima" (MaxAv) method.
	*
	* @return {Number} The defuzzified, crips value.
	*/
	defuzzifyMaxAv() {

		// the average of maxima (MaxAv for short) defuzzification method scales the
		// representative value of each fuzzy set by its DOM and takes the average

		const fuzzySets = this.fuzzySets;

		let bottom = 0;
		let top = 0;

		for ( let i = 0, l = fuzzySets.length; i < l; i ++ ) {

			const fuzzySet = fuzzySets[ i ];

			bottom += fuzzySet.degreeOfMembership;
			top += fuzzySet.representativeValue * fuzzySet.degreeOfMembership;

		}

		return ( bottom === 0 ) ? 0 : ( top / bottom );

	}

	/**
	* Defuzzifies the FLV using the "Centroid" method.
	*
	* @param {Number} samples - The amount of samples used for defuzzification.
	* @return {Number} The defuzzified, crips value.
	*/
	defuzzifyCentroid( samples = 10 ) {

		const fuzzySets = this.fuzzySets;

		const stepSize = ( this.maxRange - this.minRange ) / samples;

		let totalArea = 0;
		let sumOfMoments = 0;

		for ( let s = 1; s <= samples; s ++ ) {

			const sample = this.minRange + ( s * stepSize );

			for ( let i = 0, l = fuzzySets.length; i < l; i ++ ) {

				const fuzzySet = fuzzySets[ i ];

				const contribution = Math.min( fuzzySet.degreeOfMembership, fuzzySet.computeDegreeOfMembership( sample ) );

				totalArea += contribution;

				sumOfMoments += ( sample * contribution );

			}

		}

		return ( totalArea === 0 ) ? 0 : ( sumOfMoments / totalArea );

	}

	/**
	* Transforms this instance into a JSON object.
	*
	* @return {Object} The JSON object.
	*/
	toJSON() {

		const json = {
			type: this.constructor.name,
			fuzzySets: new Array(),
			minRange: this.minRange.toString(),
			maxRange: this.maxRange.toString(),
		};

		for ( let i = 0, l = this.fuzzySets.length; i < l; i ++ ) {

			const fuzzySet = this.fuzzySets[ i ];
			json.fuzzySets.push( fuzzySet.toJSON() );

		}

		return json;

	}

	/**
	* Restores this instance from the given JSON object.
	*
	* @param {Object} json - The JSON object.
	* @return {FuzzyVariable} A reference to this fuzzy variable.
	*/
	fromJSON( json ) {

		this.minRange = parseFloat( json.minRange );
		this.maxRange = parseFloat( json.maxRange );

		for ( let i = 0, l = json.fuzzySets.length; i < l; i ++ ) {

			const fuzzySetJson = json.fuzzySets[ i ];

			let type = fuzzySetJson.type;

			switch ( type ) {

				case 'LeftShoulderFuzzySet':
					this.fuzzySets.push( new LeftShoulderFuzzySet().fromJSON( fuzzySetJson ) );
					break;

				case 'RightShoulderFuzzySet':
					this.fuzzySets.push( new RightShoulderFuzzySet().fromJSON( fuzzySetJson ) );
					break;

				case 'SingletonFuzzySet':
					this.fuzzySets.push( new SingletonFuzzySet().fromJSON( fuzzySetJson ) );
					break;

				case 'TriangularFuzzySet':
					this.fuzzySets.push( new TriangularFuzzySet().fromJSON( fuzzySetJson ) );
					break;

				default:
					Logger.error( 'YUKA.FuzzyVariable: Unsupported fuzzy set type:', fuzzySetJson.type );

			}

		}

		return this;

	}

}

/**
* Class for representing a fuzzy module. Instances of this class are used by
* game entities for fuzzy inference. A fuzzy module is a collection of fuzzy variables
* and the rules that operate on them.
*
* @author {@link https://github.com/Mugen87|Mugen87}
*/
class FuzzyModule {

	/**
	* Constructs a new fuzzy module.
	*/
	constructor() {

		/**
		* An array of the fuzzy rules.
		* @type {Array<FuzzyRule>}
		* @readonly
		*/
		this.rules = new Array();

		/**
		* A map of FLVs.
		* @type {Map<String,FuzzyVariable>}
		* @readonly
		*/
		this.flvs = new Map();

	}

	/**
	* Adds the given FLV under the given name to this fuzzy module.
	*
	* @param {String} name - The name of the FLV.
	* @param {FuzzyVariable} flv - The FLV to add.
	* @return {FuzzyModule} A reference to this fuzzy module.
	*/
	addFLV( name, flv ) {

		this.flvs.set( name, flv );

		return this;

	}

	/**
	* Remove the FLV under the given name from this fuzzy module.
	*
	* @param {String} name - The name of the FLV to remove.
	* @return {FuzzyModule} A reference to this fuzzy module.
	*/
	removeFLV( name ) {

		this.flvs.delete( name );

		return this;

	}

	/**
	* Adds the given fuzzy rule to this fuzzy module.
	*
	* @param {FuzzyRule} rule - The fuzzy rule to add.
	* @return {FuzzyModule} A reference to this fuzzy module.
	*/
	addRule( rule ) {

		this.rules.push( rule );

		return this;

	}

	/**
	* Removes the given fuzzy rule from this fuzzy module.
	*
	* @param {FuzzyRule} rule - The fuzzy rule to remove.
	* @return {FuzzyModule} A reference to this fuzzy module.
	*/
	removeRule( rule ) {

		const rules = this.rules;

		const index = rules.indexOf( rule );
		rules.splice( index, 1 );

		return this;

	}

	/**
	* Calls the fuzzify method of the defined FLV with the given value.
	*
	* @param {String} name - The name of the FLV
	* @param {Number} value - The crips value to fuzzify.
	* @return {FuzzyModule} A reference to this fuzzy module.
	*/
	fuzzify( name, value ) {

		const flv = this.flvs.get( name );

		flv.fuzzify( value );

		return this;

	}

	/**
	* Given a fuzzy variable and a defuzzification method this returns a crisp value.
	*
	* @param {String} name - The name of the FLV
	* @param {String} type - The type of defuzzification.
	* @return {Number} The defuzzified, crips value.
	*/
	defuzzify( name, type = FuzzyModule.DEFUZ_TYPE.MAXAV ) {

		const flvs = this.flvs;
		const rules = this.rules;

		this._initConsequences();

		for ( let i = 0, l = rules.length; i < l; i ++ ) {

			const rule = rules[ i ];

			rule.evaluate();

		}

		const flv = flvs.get( name );

		let value;

		switch ( type ) {

			case FuzzyModule.DEFUZ_TYPE.MAXAV:
				value = flv.defuzzifyMaxAv();
				break;

			case FuzzyModule.DEFUZ_TYPE.CENTROID:
				value = flv.defuzzifyCentroid();
				break;

			default:
				Logger.warn( 'YUKA.FuzzyModule: Unknown defuzzification method:', type );
				value = flv.defuzzifyMaxAv(); // use MaxAv as fallback

		}

		return value;

	}

	_initConsequences() {

		const rules = this.rules;

		// initializes the consequences of all rules.

		for ( let i = 0, l = rules.length; i < l; i ++ ) {

			const rule = rules[ i ];

			rule.initConsequence();

		}

		return this;

	}

	/**
	* Transforms this instance into a JSON object.
	*
	* @return {Object} The JSON object.
	*/
	toJSON() {

		const json = {
			rules: new Array(),
			flvs: new Array()
		};

		// rules

		const rules = this.rules;

		for ( let i = 0, l = rules.length; i < l; i ++ ) {

			json.rules.push( rules[ i ].toJSON() );

		}

		// flvs

		const flvs = this.flvs;

		for ( let [ name, flv ] of flvs ) {

			json.flvs.push( { name: name, flv: flv.toJSON() } );

		}

		return json;

	}

	/**
	* Restores this instance from the given JSON object.
	*
	* @param {Object} json - The JSON object.
	* @return {FuzzyModule} A reference to this fuzzy module.
	*/
	fromJSON( json ) {

		const fuzzySets = new Map(); // used for rules

		// flvs

		const flvsJSON = json.flvs;

		for ( let i = 0, l = flvsJSON.length; i < l; i ++ ) {

			const flvJSON = flvsJSON[ i ];
			const name = flvJSON.name;
			const flv = new FuzzyVariable().fromJSON( flvJSON.flv );

			this.addFLV( name, flv );

			for ( let fuzzySet of flv.fuzzySets ) {

				fuzzySets.set( fuzzySet.uuid, fuzzySet );

			}

		}

		// rules

		const rulesJSON = json.rules;

		for ( let i = 0, l = rulesJSON.length; i < l; i ++ ) {

			const ruleJSON = rulesJSON[ i ];
			const rule = new FuzzyRule().fromJSON( ruleJSON, fuzzySets );

			this.addRule( rule );

		}

		return this;

	}

}

FuzzyModule.DEFUZ_TYPE = Object.freeze( {
	MAXAV: 0,
	CENTROID: 1
} );

/**
* Base class for representing a goal in context of Goal-driven agent design.
*
* @author {@link https://github.com/Mugen87|Mugen87}
*/
class Goal {

	/**
	* Constructs a new goal.
	*
	* @param {GameEntity} owner - The owner of this goal.
	*/
	constructor( owner = null ) {

		/**
		* The owner of this goal.
		* @type {?GameEntity}
		* @default null
		*/
		this.owner = owner;

		/**
		* The status of this goal.
		* @type {Status}
		* @default INACTIVE
		*/
		this.status = Goal.STATUS.INACTIVE;

	}

	/**
	* Executed when this goal is activated.
	*/
	activate() {}

	/**
	* Executed in each simulation step.
	*/
	execute() {}

	/**
	* Executed when this goal is satisfied.
	*/
	terminate() {}

	/**
	* Goals can handle messages. Many don't though, so this defines a default behavior
	*
	* @param {Telegram} telegram - The telegram with the message data.
	* @return {Boolean} Whether the message was processed or not.
	*/
	handleMessage( /* telegram */ ) {

		return false;

	}

	/**
	* Returns true if the status of this goal is *ACTIVE*.
	*
	* @return {Boolean} Whether the goal is active or not.
	*/
	active() {

		return this.status === Goal.STATUS.ACTIVE;

	}

	/**
	* Returns true if the status of this goal is *INACTIVE*.
	*
	* @return {Boolean} Whether the goal is inactive or not.
	*/
	inactive() {

		return this.status === Goal.STATUS.INACTIVE;

	}

	/**
	* Returns true if the status of this goal is *COMPLETED*.
	*
	* @return {Boolean} Whether the goal is completed or not.
	*/
	completed() {

		return this.status === Goal.STATUS.COMPLETED;

	}

	/**
	* Returns true if the status of this goal is *FAILED*.
	*
	* @return {Boolean} Whether the goal is failed or not.
	*/
	failed() {

		return this.status === Goal.STATUS.FAILED;

	}

	/**
	* Ensures the goal is replanned if it has failed.
	*
	* @return {Goal} A reference to this goal.
	*/
	replanIfFailed() {

		if ( this.failed() === true ) {

			this.status = Goal.STATUS.INACTIVE;

		}

		return this;

	}

	/**
	* Ensures the goal is activated if it is inactive.
	*
	* @return {Goal} A reference to this goal.
	*/
	activateIfInactive() {

		if ( this.inactive() === true ) {

			this.status = Goal.STATUS.ACTIVE;

			this.activate();

		}

		return this;

	}

	/**
	* Transforms this instance into a JSON object.
	*
	* @return {Object} The JSON object.
	*/
	toJSON() {

		return {
			type: this.constructor.name,
			owner: this.owner.uuid,
			status: this.status
		};

	}

	/**
	* Restores this instance from the given JSON object.
	*
	* @param {Object} json - The JSON object.
	* @return {Goal} A reference to this goal.
	*/
	fromJSON( json ) {

		this.owner = json.owner; // uuid
		this.status = json.status;

		return this;

	}

	/**
	* Restores UUIDs with references to GameEntity objects.
	*
	* @param {Map<String,GameEntity>} entities - Maps game entities to UUIDs.
	* @return {Goal} A reference to this goal.
	*/
	resolveReferences( entities ) {

		this.owner = entities.get( this.owner ) || null;

		return this;

	}

}

Goal.STATUS = Object.freeze( {
	ACTIVE: 'active', // the goal has been activated and will be processed each update step
	INACTIVE: 'inactive', // the goal is waiting to be activated
	COMPLETED: 'completed', // the goal has completed and will be removed on the next update
	FAILED: 'failed' // the goal has failed and will either replan or be removed on the next update
} );

/**
* Class representing a composite goal. Essentially it's a goal which consists of subgoals.
*
* @author {@link https://github.com/Mugen87|Mugen87}
* @augments Goal
*/
class CompositeGoal extends Goal {

	/**
	* Constructs a new composite goal.
	*
	* @param {GameEntity} owner - The owner of this composite goal.
	*/
	constructor( owner = null ) {

		super( owner );

		/**
		* A list of subgoals.
		* @type {Array<Goal>}
		*/
		this.subgoals = new Array();

	}

	/**
	* Adds a goal as a subgoal to this instance.
	*
	* @param {Goal} goal - The subgoal to add.
	* @return {Goal} A reference to this goal.
	*/
	addSubgoal( goal ) {

		this.subgoals.unshift( goal );

		return this;

	}

	/**
	* Removes a subgoal from this instance.
	*
	* @param {Goal} goal - The subgoal to remove.
	* @return {Goal} A reference to this goal.
	*/
	removeSubgoal( goal ) {

		const index = this.subgoals.indexOf( goal );
		this.subgoals.splice( index, 1 );

		return this;

	}

	/**
	* Removes all subgoals and ensures {@link Goal#terminate} is called
	* for each subgoal.
	*
	* @return {Goal} A reference to this goal.
	*/
	clearSubgoals() {

		const subgoals = this.subgoals;

		for ( let i = 0, l = subgoals.length; i < l; i ++ ) {

			const subgoal = subgoals[ i ];

			subgoal.terminate();

		}

		subgoals.length = 0;

		return this;

	}

	/**
	* Returns the current subgoal. If no subgoals are defined, *null* is returned.
	*
	* @return {Goal} The current subgoal.
	*/
	currentSubgoal() {

		const length = this.subgoals.length;

		if ( length > 0 ) {

			return this.subgoals[ length - 1 ];

		} else {

			return null;

		}

	}

	/**
	* Executes the current subgoal of this composite goal.
	*
	* @return {Status} The status of this composite subgoal.
	*/
	executeSubgoals() {

		const subgoals = this.subgoals;

		// remove all completed and failed goals from the back of the subgoal list

		for ( let i = subgoals.length - 1; i >= 0; i -- ) {

			const subgoal = subgoals[ i ];

			if ( ( subgoal.completed() === true ) || ( subgoal.failed() === true ) ) {

				// if the current subgoal is a composite goal, terminate its subgoals too

				if ( subgoal instanceof CompositeGoal ) {

					subgoal.clearSubgoals();

				}

				// terminate the subgoal itself

				subgoal.terminate();
				subgoals.pop();

			} else {

				break;

			}

		}

		// if any subgoals remain, process the one at the back of the list

		const subgoal = this.currentSubgoal();

		if ( subgoal !== null ) {

			subgoal.activateIfInactive();

			subgoal.execute();

			// if subgoal is completed but more subgoals are in the list, return 'ACTIVE'
			// status in order to keep processing the list of subgoals

			if ( ( subgoal.completed() === true ) && ( subgoals.length > 1 ) ) {

				return Goal.STATUS.ACTIVE;

			} else {

				return subgoal.status;

			}

		} else {

			return Goal.STATUS.COMPLETED;

		}

	}

	/**
	* Returns true if this composite goal has subgoals.
	*
	* @return {Boolean} Whether the composite goal has subgoals or not.
	*/
	hasSubgoals() {

		return this.subgoals.length > 0;

	}

	/**
	* Returns true if the given message was processed by the current subgoal.
	*
	* @return {Boolean} Whether the message was processed or not.
	*/
	handleMessage( telegram ) {

		const subgoal = this.currentSubgoal();

		if ( subgoal !== null ) {

			return subgoal.handleMessage( telegram );

		}

		return false;

	}

	/**
	* Transforms this instance into a JSON object.
	*
	* @return {Object} The JSON object.
	*/
	toJSON() {

		const json = super.toJSON();

		json.subgoals = new Array();

		for ( let i = 0, l = this.subgoals.length; i < l; i ++ ) {

			const subgoal = this.subgoals[ i ];
			json.subgoals.push( subgoal.toJSON() );

		}

		return json;

	}

	/**
	* Restores UUIDs with references to GameEntity objects.
	*
	* @param {Map<String,GameEntity>} entities - Maps game entities to UUIDs.
	* @return {CompositeGoal} A reference to this composite goal.
	*/
	resolveReferences( entities ) {

		super.resolveReferences( entities );

		for ( let i = 0, l = this.subgoals.length; i < l; i ++ ) {

			const subgoal = this.subgoals[ i ];
			subgoal.resolveReferences( entities );

		}

		return this;

	}

}

/**
* Base class for representing a goal evaluator in context of Goal-driven agent design.
*
* @author {@link https://github.com/Mugen87|Mugen87}
*/
class GoalEvaluator {

	/**
	* Constructs a new goal evaluator.
	*
	* @param {Number} characterBias - Can be used to adjust the preferences of agents.
	*/
	constructor( characterBias = 1 ) {

		/**
		* Can be used to adjust the preferences of agents. When the desirability score
		* for a goal has been evaluated, it is multiplied by this value.
		* @type {Number}
		* @default 1
		*/
		this.characterBias = characterBias;

	}

	/**
	* Calculates the desirability. It's a score between 0 and 1 representing the desirability
	* of a goal. This goal is considered as a top level strategy of the agent like *Explore* or
	* *AttackTarget*. Must be implemented by all concrete goal evaluators.
	*
	* @param {GameEntity} owner - The owner of this goal evaluator.
	* @return {Number} The desirability.
	*/
	calculateDesirability( /* owner */ ) {

		return 0;

	}

	/**
	* Executed if this goal evaluator produces the highest desirability. Must be implemented
	* by all concrete goal evaluators.
	*
	* @param {GameEntity} owner - The owner of this goal evaluator.
	*/
	setGoal( /* owner */ ) {}

	/**
	* Transforms this instance into a JSON object.
	*
	* @return {Object} The JSON object.
	*/
	toJSON() {

		return {
			type: this.constructor.name,
			characterBias: this.characterBias
		};

	}

	/**
	* Restores this instance from the given JSON object.
	*
	* @param {Object} json - The JSON object.
	* @return {GoalEvaluator} A reference to this goal evaluator.
	*/
	fromJSON( json ) {

		this.characterBias = json.characterBias;

		return this;

	}

}

/**
* Class for representing the brain of a game entity.
*
* @author {@link https://github.com/Mugen87|Mugen87}
* @augments CompositeGoal
*/
class Think extends CompositeGoal {

	/**
	* Constructs a new *Think* object.
	*
	* @param {GameEntity} owner - The owner of this instance.
	*/
	constructor( owner = null ) {

		super( owner );

		/**
		* A list of goal evaluators.
		* @type {Array<GoalEvaluator>}
		*/
		this.evaluators = new Array();

		//

		this._typesMap = new Map();

	}

	/**
	* Executed when this goal is activated.
	*/
	activate() {

		this.arbitrate();

	}

	/**
	* Executed in each simulation step.
	*/
	execute() {

		this.activateIfInactive();

		const subgoalStatus = this.executeSubgoals();

		if ( subgoalStatus === Goal.STATUS.COMPLETED || subgoalStatus === Goal.STATUS.FAILED ) {

			this.status = Goal.STATUS.INACTIVE;

		}

	}

	/**
	* Executed when this goal is satisfied.
	*/
	terminate() {

		this.clearSubgoals();

	}

	/**
	* Adds the given goal evaluator to this instance.
	*
	* @param {GoalEvaluator} evaluator - The goal evaluator to add.
	* @return {Think} A reference to this instance.
	*/
	addEvaluator( evaluator ) {

		this.evaluators.push( evaluator );

		return this;

	}

	/**
	* Removes the given goal evaluator from this instance.
	*
	* @param {GoalEvaluator} evaluator - The goal evaluator to remove.
	* @return {Think} A reference to this instance.
	*/
	removeEvaluator( evaluator ) {

		const index = this.evaluators.indexOf( evaluator );
		this.evaluators.splice( index, 1 );

		return this;

	}

	/**
	* This method represents the top level decision process of an agent.
	* It iterates through each goal evaluator and selects the one that
	* has the highest score as the current goal.
	*
	* @return {Think} A reference to this instance.
	*/
	arbitrate() {

		const evaluators = this.evaluators;

		let bestDesirability = - 1;
		let bestEvaluator = null;

		// try to find the best top-level goal/strategy for the entity

		for ( let i = 0, l = evaluators.length; i < l; i ++ ) {

			const evaluator = evaluators[ i ];

			let desirability = evaluator.calculateDesirability( this.owner );
			desirability *= evaluator.characterBias;

			if ( desirability >= bestDesirability ) {

				bestDesirability = desirability;
				bestEvaluator = evaluator;

			}

		}

		// use the evaluator to set the respective goal

		if ( bestEvaluator !== null ) {

			bestEvaluator.setGoal( this.owner );

		} else {

			Logger.error( 'YUKA.Think: Unable to determine goal evaluator for game entity:', this.owner );

		}

		return this;

	}

	/**
	* Transforms this instance into a JSON object.
	*
	* @return {Object} The JSON object.
	*/
	toJSON() {

		const json = super.toJSON();

		json.evaluators = new Array();

		for ( let i = 0, l = this.evaluators.length; i < l; i ++ ) {

			const evaluator = this.evaluators[ i ];
			json.evaluators.push( evaluator.toJSON() );

		}

		return json;

	}

	/**
	* Restores this instance from the given JSON object.
	*
	* @param {Object} json - The JSON object.
	* @return {Think} A reference to this instance.
	*/
	fromJSON( json ) {

		super.fromJSON( json );

		const typesMap = this._typesMap;

		this.evaluators.length = 0;
		this.terminate();

		// evaluators

		for ( let i = 0, l = json.evaluators.length; i < l; i ++ ) {

			const evaluatorJSON = json.evaluators[ i ];
			const type = evaluatorJSON.type;

			const ctor = typesMap.get( type );

			if ( ctor !== undefined ) {

				const evaluator = new ctor().fromJSON( evaluatorJSON );
				this.evaluators.push( evaluator );

			} else {

				Logger.warn( 'YUKA.Think: Unsupported goal evaluator type:', type );
				continue;

			}

		}

		// goals

		function parseGoal( goalJSON ) {

			const type = goalJSON.type;

			const ctor = typesMap.get( type );

			if ( ctor !== undefined ) {

				const goal = new ctor().fromJSON( goalJSON );

				const subgoalsJSON = goalJSON.subgoals;

				if ( subgoalsJSON !== undefined ) {

					// composite goal

					for ( let i = 0, l = subgoalsJSON.length; i < l; i ++ ) {

						const subgoal = parseGoal( subgoalsJSON[ i ] );

						if ( subgoal ) goal.subgoals.push( subgoal );

					}

				}

				return goal;

			} else {

				Logger.warn( 'YUKA.Think: Unsupported goal evaluator type:', type );
				return;

			}

		}

		for ( let i = 0, l = json.subgoals.length; i < l; i ++ ) {

			const subgoal = parseGoal( json.subgoals[ i ] );

			if ( subgoal ) this.subgoals.push( subgoal );

		}

		return this;

	}

	/**
	* Registers a custom type for deserialization. When calling {@link Think#fromJSON}
	* this instance is able to pick the correct constructor in order to create custom
	* goals or goal evaluators.
	*
	* @param {String} type - The name of the goal or goal evaluator.
	* @param {Function} constructor - The constructor function.
	* @return {Think} A reference to this instance.
	*/
	registerType( type, constructor ) {

		this._typesMap.set( type, constructor );

		return this;

	}

}

/**
* Base class for graph edges.
*
* @author {@link https://github.com/Mugen87|Mugen87}
*/
class Edge {

	/**
	* Constructs a new edge.
	*
	* @param {Number} from - The index of the from node.
	* @param {Number} to - The index of the to node.
	* @param {Number} cost - The cost of this edge.
	*/
	constructor( from = - 1, to = - 1, cost = 0 ) {

		/**
		* The index of the *from* node.
		* @type {Number}
		* @default -1
		*/
		this.from = from;

		/**
		* The index of the *to* node.
		* @type {Number}
		* @default -1
		*/
		this.to = to;

		/**
		* The cost of this edge. This could be for example a distance or time value.
		* @type {Number}
		* @default 0
		*/
		this.cost = cost;

	}

	/**
	* Copies all values from the given edge to this edge.
	*
	* @param {Edge} edge - The edge to copy.
	* @return {Edge} A reference to this edge.
	*/
	copy( edge ) {

		this.from = edge.from;
		this.to = edge.to;
		this.cost = edge.cost;

		return this;

	}

	/**
	* Creates a new edge and copies all values from this edge.
	*
	* @return {Edge} A new edge.
	*/
	clone() {

		return new this.constructor().copy( this );

	}

	/**
	* Transforms this instance into a JSON object.
	*
	* @return {Object} The JSON object.
	*/
	toJSON() {

		return {
			type: this.constructor.name,
			from: this.from,
			to: this.to,
			cost: this.cost
		};

	}

	/**
	* Restores this instance from the given JSON object.
	*
	* @param {Object} json - The JSON object.
	* @return {Edge} A reference to this edge.
	*/
	fromJSON( json ) {

		this.from = json.from;
		this.to = json.to;
		this.cost = json.cost;

		return this;

	}

}

/**
* Base class for graph nodes.
*
* @author {@link https://github.com/Mugen87|Mugen87}
*/
class Node {

	/**
	* Constructs a new node.
	*
	* @param {Number} index - The unique index of this node.
	*/
	constructor( index = - 1 ) {

		/**
		* The unique index of this node. The default value *-1* means invalid index.
		* @type {Number}
		* @default -1
		*/
		this.index = index;

	}

	/**
	* Transforms this instance into a JSON object.
	*
	* @return {Object} The JSON object.
	*/
	toJSON() {

		return {
			type: this.constructor.name,
			index: this.index
		};

	}

	/**
	* Restores this instance from the given JSON object.
	*
	* @param {Object} json - The JSON object.
	* @return {Node} A reference to this node.
	*/
	fromJSON( json ) {

		this.index = json.index;
		return this;

	}

}

/**
* Class representing a sparse graph implementation based on adjacency lists.
* A sparse graph can be used to model many different types of graphs like navigation
* graphs (pathfinding), dependency graphs (e.g. technology trees) or state graphs
* (a representation of every possible state in a game).
*
* @author {@link https://github.com/Mugen87|Mugen87}
*/
class Graph {

	/**
	* Constructs a new graph.
	*/
	constructor() {

		/**
		* Whether this graph is directed or not.
		* @type {Boolean}
		* @default false
		*/
		this.digraph = false;

		this._nodes = new Map(); // contains all nodes in a map: (nodeIndex => node)
		this._edges = new Map(); // adjacency list for each node: (nodeIndex => edges)

	}

	/**
	* Adds a node to the graph.
	*
	* @param {Node} node - The node to add.
	* @return {Graph} A reference to this graph.
	*/
	addNode( node ) {

		const index = node.index;

		this._nodes.set( index, node );
		this._edges.set( index, new Array() );

		return this;

	}

	/**
	* Adds an edge to the graph. If the graph is undirected, the method
	* automatically creates the opponent edge.
	*
	* @param {Edge} edge - The edge to add.
	* @return {Graph} A reference to this graph.
	*/
	addEdge( edge ) {

		let edges;

		edges = this._edges.get( edge.from );
		edges.push( edge );

		if ( this.digraph === false ) {

			const oppositeEdge = edge.clone();

			oppositeEdge.from = edge.to;
			oppositeEdge.to = edge.from;

			edges = this._edges.get( edge.to );
			edges.push( oppositeEdge );

		}

		return this;

	}

	/**
	* Returns a node for the given node index. If no node is found,
	* *null* is returned.
	*
	* @param {Number} index - The index of the node.
	* @return {Node} The requested node.
	*/
	getNode( index ) {

		return this._nodes.get( index ) || null;

	}

	/**
	* Returns an edge for the given *from* and *to* node indices.
	* If no node is found, *null* is returned.
	*
	* @param {Number} from - The index of the from node.
	* @param {Number} to - The index of the to node.
	* @return {Edge} The requested edge.
	*/
	getEdge( from, to ) {

		if ( this.hasNode( from ) && this.hasNode( to ) ) {

			const edges = this._edges.get( from );

			for ( let i = 0, l = edges.length; i < l; i ++ ) {

				const edge = edges[ i ];

				if ( edge.to === to ) {

					return edge;

				}

			}

		}

		return null;

	}

	/**
	* Gathers all nodes of the graph and stores them into the given array.
	*
	* @param {Array<Node>} result - The result array.
	* @return {Array<Node>} The result array.
	*/
	getNodes( result ) {

		result.length = 0;
		result.push( ...this._nodes.values() );

		return result;

	}

	/**
	* Gathers all edges leading from the given node index and stores them
	* into the given array.
	*
	* @param {Number} index - The node index.
	* @param {Array<Edge>} result - The result array.
	* @return {Array<Edge>} The result array.
	*/
	getEdgesOfNode( index, result ) {

		const edges = this._edges.get( index );

		if ( edges !== undefined ) {

			result.length = 0;
			result.push( ...edges );

		}

		return result;

	}

	/**
	* Returns the node count of the graph.
	*
	* @return {number} The amount of nodes.
	*/
	getNodeCount() {

		return this._nodes.size;

	}

	/**
	* Returns the edge count of the graph.
	*
	* @return {number} The amount of edges.
	*/
	getEdgeCount() {

		let count = 0;

		for ( const edges of this._edges.values() ) {

			count += edges.length;

		}

		return count;

	}

	/**
	* Removes the given node from the graph and all edges which are connected
	* with this node.
	*
	* @param {Node} node - The node to remove.
	* @return {Graph} A reference to this graph.
	*/
	removeNode( node ) {

		this._nodes.delete( node.index );

		if ( this.digraph === false ) {

			// if the graph is not directed, remove all edges leading to this node

			const edges = this._edges.get( node.index );

			for ( const edge of edges ) {

				const edgesOfNeighbor = this._edges.get( edge.to );

				for ( let i = ( edgesOfNeighbor.length - 1 ); i >= 0; i -- ) {

					const edgeNeighbor = edgesOfNeighbor[ i ];

					if ( edgeNeighbor.to === node.index ) {

						const index = edgesOfNeighbor.indexOf( edgeNeighbor );
						edgesOfNeighbor.splice( index, 1 );

						break;

					}

				}

			}

		} else {

			// if the graph is directed, remove the edges the slow way

			for ( const edges of this._edges.values() ) {

				for ( let i = ( edges.length - 1 ); i >= 0; i -- ) {

					const edge = edges[ i ];

					if ( ! this.hasNode( edge.to ) || ! this.hasNode( edge.from ) ) {

						const index = edges.indexOf( edge );
						edges.splice( index, 1 );

					}

				}

			}

		}

		// delete edge list of node (edges leading from this node)

		this._edges.delete( node.index );

		return this;

	}

	/**
	* Removes the given edge from the graph. If the graph is undirected, the
	* method also removes the opponent edge.
	*
	* @param {Edge} edge - The edge to remove.
	* @return {Graph} A reference to this graph.
	*/
	removeEdge( edge ) {

		// delete the edge from the node's edge list

		const edges = this._edges.get( edge.from );

		if ( edges !== undefined ) {

			const index = edges.indexOf( edge );
			edges.splice( index, 1 );

			// if the graph is not directed, delete the edge connecting the node in the opposite direction

			if ( this.digraph === false ) {

				const edges = this._edges.get( edge.to );

				for ( let i = 0, l = edges.length; i < l; i ++ ) {

					const e = edges[ i ];

					if ( e.to === edge.from ) {

						const index = edges.indexOf( e );
						edges.splice( index, 1 );
						break;

					}

				}

			}

		}

		return this;

	}

	/**
	* Return true if the graph has the given node index.
	*
	* @param {Number} index - The node index to test.
	* @return {Boolean} Whether this graph has the node or not.
	*/
	hasNode( index ) {

		return this._nodes.has( index );

	}

	/**
	* Return true if the graph has an edge connecting the given
	* *from* and *to* node indices.
	*
	* @param {Number} from - The index of the from node.
	* @param {Number} to - The index of the to node.
	* @return {Boolean} Whether this graph has the edge or not.
	*/
	hasEdge( from, to ) {

		if ( this.hasNode( from ) && this.hasNode( to ) ) {

			const edges = this._edges.get( from );

			for ( let i = 0, l = edges.length; i < l; i ++ ) {

				const edge = edges[ i ];

				if ( edge.to === to ) {

					return true;

				}

			}

			return false;

		} else {

			return false;

		}

	}

	/**
	* Removes all nodes and edges from this graph.
	*
	* @return {Graph} A reference to this graph.
	*/
	clear() {

		this._nodes.clear();
		this._edges.clear();

		return this;

	}

	/**
	* Transforms this instance into a JSON object.
	*
	* @return {Object} The JSON object.
	*/
	toJSON() {

		const json = {
			type: this.constructor.name,
			digraph: this.digraph
		};

		const edges = new Array();
		const nodes = new Array();

		for ( let [ key, value ] of this._nodes.entries() ) {

			const adjacencyList = new Array();

			this.getEdgesOfNode( key, adjacencyList );

			for ( let i = 0, l = adjacencyList.length; i < l; i ++ ) {

				edges.push( adjacencyList[ i ].toJSON() );

			}

			nodes.push( value.toJSON() );

		}

		json._edges = edges;
		json._nodes = nodes;

		return json;

	}

	/**
	* Restores this instance from the given JSON object.
	*
	* @param {Object} json - The JSON object.
	* @return {Graph} A reference to this graph.
	*/
	fromJSON( json ) {

		this.digraph = json.digraph;

		for ( let i = 0, l = json._nodes.length; i < l; i ++ ) {

			this.addNode( new Node().fromJSON( json._nodes[ i ] ) );

		}

		for ( let i = 0, l = json._edges.length; i < l; i ++ ) {

			this.addEdge( new Edge().fromJSON( json._edges[ i ] ) );

		}

		return this;

	}

}

/**
* Class for representing a heuristic for graph search algorithms based
* on the euclidean distance. The heuristic assumes that the node have
* a *position* property of type {@link Vector3}.
*
* @author {@link https://github.com/Mugen87|Mugen87}
*/
class HeuristicPolicyEuclid {

	/**
	* Calculates the euclidean distance between two nodes.
	*
	* @param {Graph} graph - The graph.
	* @param {Number} source - The index of the source node.
	* @param {Number} target - The index of the target node.
	* @return {Number} The euclidean distance between both nodes.
	*/
	static calculate( graph, source, target ) {

		const sourceNode = graph.getNode( source );
		const targetNode = graph.getNode( target );

		return sourceNode.position.distanceTo( targetNode.position );

	}

}

/**
* Class for representing a heuristic for graph search algorithms based
* on the squared euclidean distance. The heuristic assumes that the node
* have a *position* property of type {@link Vector3}.
*
* @author {@link https://github.com/Mugen87|Mugen87}
*/
class HeuristicPolicyEuclidSquared {

	/**
	* Calculates the squared euclidean distance between two nodes.
	*
	* @param {Graph} graph - The graph.
	* @param {Number} source - The index of the source node.
	* @param {Number} target - The index of the target node.
	* @return {Number} The squared euclidean distance between both nodes.
	*/
	static calculate( graph, source, target ) {

		const sourceNode = graph.getNode( source );
		const targetNode = graph.getNode( target );

		return sourceNode.position.squaredDistanceTo( targetNode.position );

	}

}

/**
* Class for representing a heuristic for graph search algorithms based
* on the manhattan distance. The heuristic assumes that the node
* have a *position* property of type {@link Vector3}.
*
* @author {@link https://github.com/Mugen87|Mugen87}
*/
class HeuristicPolicyManhattan {

	/**
	* Calculates the manhattan distance between two nodes.
	*
	* @param {Graph} graph - The graph.
	* @param {Number} source - The index of the source node.
	* @param {Number} target - The index of the target node.
	* @return {Number} The manhattan distance between both nodes.
	*/
	static calculate( graph, source, target ) {

		const sourceNode = graph.getNode( source );
		const targetNode = graph.getNode( target );

		return sourceNode.position.manhattanDistanceTo( targetNode.position );

	}

}

/**
* Class for representing a heuristic for graph search algorithms based
* on Dijkstra's algorithm.
*
* @author {@link https://github.com/Mugen87|Mugen87}
*/
class HeuristicPolicyDijkstra {

	/**
	* This heuristic always returns *0*. The {@link AStar} algorithm
	* behaves with this heuristic exactly like {@link Dijkstra}
	*
	* @param {Graph} graph - The graph.
	* @param {Number} source - The index of the source node.
	* @param {Number} target - The index of the target node.
	* @return {Number} The value 0.
	*/
	static calculate( /* graph, source, target */ ) {

		return 0;

	}

}

/**
 * Class for representing a binary heap priority queue that enables
 * more efficient sorting of arrays. The implementation is based on
 * {@link https://github.com/mourner/tinyqueue tinyqueue}.
 *
 * @author {@link https://github.com/Mugen87|Mugen87}
 */
class PriorityQueue {

	/**
	* Constructs a new priority queue.
	*
	* @param {Function} compare - The compare function used for sorting.
	*/
	constructor( compare = defaultCompare ) {

		/**
		* The data items of the priority queue.
		* @type {Array<Object>}
		*/
		this.data = new Array();

		/**
		* The length of the priority queue.
		* @type {Number}
		* @default 0
		*/
		this.length = 0;

		/**
		* The compare function used for sorting.
		* @type {Function}
		* @default defaultCompare
		*/
		this.compare = compare;

	}

	/**
	* Pushes an item to the priority queue.
	*
	* @param {Object} item - The item to add.
	*/
	push( item ) {

		this.data.push( item );
		this.length ++;
		this._up( this.length - 1 );

	}

	/**
	* Returns the item with the highest priority and removes
	* it from the priority queue.
	*
	* @return {Object} The item with the highest priority.
	*/
	pop() {

		if ( this.length === 0 ) return null;

		const top = this.data[ 0 ];
		this.length --;

		if ( this.length > 0 ) {

			this.data[ 0 ] = this.data[ this.length ];
			this._down( 0 );

		}

		this.data.pop();

		return top;

	}

	/**
	* Returns the item with the highest priority without removal.
	*
	* @return {Object} The item with the highest priority.
	*/
	peek() {

		return this.data[ 0 ] || null;

	}

	_up( index ) {

		const data = this.data;
		const compare = this.compare;
		const item = data[ index ];

		while ( index > 0 ) {

			const parent = ( index - 1 ) >> 1;
			const current = data[ parent ];
			if ( compare( item, current ) >= 0 ) break;
			data[ index ] = current;
			index = parent;

		}

		data[ index ] = item;

	}

	_down( index ) {

		const data = this.data;
		const compare = this.compare;
		const item = data[ index ];
		const halfLength = this.length >> 1;

		while ( index < halfLength ) {

			let left = ( index << 1 ) + 1;
			let right = left + 1;
			let best = data[ left ];

			if ( right < this.length && compare( data[ right ], best ) < 0 ) {

				left = right;
				best = data[ right ];

			}

			if ( compare( best, item ) >= 0 ) break;

			data[ index ] = best;
			index = left;

		}


		data[ index ] = item;

	}

}

/* istanbul ignore next */

function defaultCompare( a, b ) {

	return ( a < b ) ? - 1 : ( a > b ) ? 1 : 0;

}

/**
* Implementation of the AStar algorithm.
*
* @author {@link https://github.com/Mugen87|Mugen87}
*/
class AStar {

	/**
	* Constructs an AStar algorithm object.
	*
	* @param {Graph} graph - The graph.
	* @param {Number} source - The node index of the source node.
	* @param {Number} target - The node index of the target node.
	*/
	constructor( graph = null, source = - 1, target = - 1 ) {

		/**
		* The graph.
		* @type {?Graph}
		* @default null
		*/
		this.graph = graph;

		/**
		* The node index of the source node.
		* @type {Number}
		* @default - 1
		*/
		this.source = source;

		/**
		* The node index of the target node.
		* @type {Number}
		* @default - 1
		*/
		this.target = target;

		/**
		* Whether the search was successful or not.
		* @type {Boolean}
		* @default false
		*/
		this.found = false;

		/**
		* The heuristic of the search.
		* @type {Object}
		* @default HeuristicPolicyEuclid
		*/
		this.heuristic = HeuristicPolicyEuclid;

		this._cost = new Map(); // contains the "real" accumulative cost to a node
		this._shortestPathTree = new Map();
		this._searchFrontier = new Map();

	}

	/**
	* Executes the graph search. If the search was successful, {@link AStar#found}
	* is set to true.
	*
	* @return {AStar} A reference to this AStar object.
	*/
	search() {

		const outgoingEdges = new Array();
		const pQueue = new PriorityQueue( compare$1 );

		pQueue.push( {
			cost: 0,
			index: this.source
		} );

		// while the queue is not empty

		while ( pQueue.length > 0 ) {

			const nextNode = pQueue.pop();
			const nextNodeIndex = nextNode.index;

			// if the shortest path tree has the given node, we already found the shortest
			// path to this particular one

			if ( this._shortestPathTree.has( nextNodeIndex ) ) continue;

			// move this edge from the frontier to the shortest path tree

			if ( this._searchFrontier.has( nextNodeIndex ) === true ) {

				this._shortestPathTree.set( nextNodeIndex, this._searchFrontier.get( nextNodeIndex ) );

			}

			// if the target has been found exit

			if ( nextNodeIndex === this.target ) {

				this.found = true;

				return this;

			}

			// now relax the edges

			this.graph.getEdgesOfNode( nextNodeIndex, outgoingEdges );

			for ( let i = 0, l = outgoingEdges.length; i < l; i ++ ) {

				const edge = outgoingEdges[ i ];

				// A* cost formula : F = G + H

				// G is the cumulative cost to reach a node

				const G = ( this._cost.get( nextNodeIndex ) || 0 ) + edge.cost;

				// H is the heuristic estimate of the distance to the target

				const H = this.heuristic.calculate( this.graph, edge.to, this.target );

				// F is the sum of G and H

				const F = G + H;

				// We enhance our search frontier in two cases:
				// 1. If the node was never on the search frontier
				// 2. If the cost to this node is better than before

				if ( ( this._searchFrontier.has( edge.to ) === false ) || G < ( this._cost.get( edge.to ) ) ) {

					this._cost.set( edge.to, G );

					this._searchFrontier.set( edge.to, edge );

					pQueue.push( {
						cost: F,
						index: edge.to
					} );

				}

			}

		}

		this.found = false;

		return this;

	}

	/**
	* Returns the shortest path from the source to the target node as an array of node indices.
	*
	* @return {Array<Number>} The shortest path.
	*/
	getPath() {

		// array of node indices that comprise the shortest path from the source to the target

		const path = new Array();

		// just return an empty path if no path to target found or if no target has been specified

		if ( this.found === false || this.target === - 1 ) return path;

		// start with the target of the path

		let currentNode = this.target;

		path.push( currentNode );

		// while the current node is not the source node keep processing

		while ( currentNode !== this.source ) {

			// determine the parent of the current node

			currentNode = this._shortestPathTree.get( currentNode ).from;

			// push the new current node at the beginning of the array

			path.unshift( currentNode );

		}

		return path;

	}

	/**
	* Returns the search tree of the algorithm as an array of edges.
	*
	* @return {Array<Edge>} The search tree.
	*/
	getSearchTree() {

		return [ ...this._shortestPathTree.values() ];

	}

	/**
	* Clears the internal state of the object. A new search is now possible.
	*
	* @return {AStar} A reference to this AStar object.
	*/
	clear() {

		this.found = false;

		this._cost.clear();
		this._shortestPathTree.clear();
		this._searchFrontier.clear();

		return this;

	}

}


function compare$1( a, b ) {

	return ( a.cost < b.cost ) ? - 1 : ( a.cost > b.cost ) ? 1 : 0;

}

/**
* Implementation of Breadth-first Search.
*
* @author {@link https://github.com/Mugen87|Mugen87}
*/
class BFS {

	/**
	* Constructs a BFS algorithm object.
	*
	* @param {Graph} graph - The graph.
	* @param {Number} source - The node index of the source node.
	* @param {Number} target - The node index of the target node.
	*/
	constructor( graph = null, source = - 1, target = - 1 ) {

		/**
		* The graph.
		* @type {?Graph}
		* @default null
		*/
		this.graph = graph;

		/**
		* The node index of the source node.
		* @type {Number}
		* @default - 1
		*/
		this.source = source;

		/**
		* The node index of the target node.
		* @type {Number}
		* @default - 1
		*/
		this.target = target;

		/**
		* Whether the search was successful or not.
		* @type {Boolean}
		* @default false
		*/
		this.found = false;

		this._route = new Map(); // this holds the route taken to the target
		this._visited = new Set(); // holds the visited nodes

		this._spanningTree = new Set(); // for debugging purposes

	}

	/**
	* Executes the graph search. If the search was successful, {@link BFS#found}
	* is set to true.
	*
	* @return {BFS} A reference to this BFS object.
	*/
	search() {

		// create a queue(FIFO) of edges, done via an array

		const queue = new Array();
		const outgoingEdges = new Array();

		// create a dummy edge and put on the queue to begin the search

		const startEdge = new Edge( this.source, this.source );

		queue.push( startEdge );

		// mark the source node as visited

		this._visited.add( this.source );

		// while there are edges in the queue keep searching

		while ( queue.length > 0 ) {

			// grab the first edge and remove it from the queue

			const nextEdge = queue.shift();

			// make a note of the parent of the node this edge points to

			this._route.set( nextEdge.to, nextEdge.from );

			// expand spanning tree

			if ( nextEdge !== startEdge ) {

				this._spanningTree.add( nextEdge );

			}

			// if the target has been found the method can return success

			if ( nextEdge.to === this.target ) {

				this.found = true;

				return this;

			}

			// determine outgoing edges

			this.graph.getEdgesOfNode( nextEdge.to, outgoingEdges );

			// push the edges leading from the node this edge points to onto the
			// queue (provided the edge does not point to a previously visited node)

			for ( let i = 0, l = outgoingEdges.length; i < l; i ++ ) {

				const edge = outgoingEdges[ i ];

				if ( this._visited.has( edge.to ) === false ) {

					queue.push( edge );

					// the node is marked as visited here, BEFORE it is examined,
					// because it ensures a maximum of N edges are ever placed in the queue rather than E edges.
					// (N = number of nodes, E = number of edges)

					this._visited.add( edge.to );

				}

			}

		}

		this.found = false;

		return this;

	}

	/**
	* Returns the shortest path from the source to the target node as an array of node indices.
	*
	* @return {Array<Number>} The shortest path.
	*/
	getPath() {

		// array of node indices that comprise the shortest path from the source to the target

		const path = new Array();

		// just return an empty path if no path to target found or if no target has been specified

		if ( this.found === false || this.target === - 1 ) return path;

		// start with the target of the path

		let currentNode = this.target;

		path.push( currentNode );

		// while the current node is not the source node keep processing

		while ( currentNode !== this.source ) {

			// determine the parent of the current node

			currentNode = this._route.get( currentNode );

			// push the new current node at the beginning of the array

			path.unshift( currentNode );

		}

		return path;

	}

	/**
	* Returns the search tree of the algorithm as an array of edges.
	*
	* @return {Array<Edge>} The search tree.
	*/
	getSearchTree() {

		return [ ...this._spanningTree ];

	}

	/**
	* Clears the internal state of the object. A new search is now possible.
	*
	* @return {BFS} A reference to this BFS object.
	*/
	clear() {

		this.found = false;

		this._route.clear();
		this._visited.clear();
		this._spanningTree.clear();

		return this;

	}

}

/**
* Implementation of Depth-first Search.
*
* @author {@link https://github.com/Mugen87|Mugen87}
*/
class DFS {

	/**
	* Constructs a DFS algorithm object.
	*
	* @param {Graph} graph - The graph.
	* @param {Number} source - The node index of the source node.
	* @param {Number} target - The node index of the target node.
	*/
	constructor( graph = null, source = - 1, target = - 1 ) {

		/**
		* The graph.
		* @type {?Graph}
		* @default null
		*/
		this.graph = graph;

		/**
		* The node index of the source node.
		* @type {Number}
		* @default - 1
		*/
		this.source = source;

		/**
		* The node index of the target node.
		* @type {Number}
		* @default - 1
		*/
		this.target = target;

		/**
		* Whether the search was successful or not.
		* @type {Boolean}
		* @default false
		*/
		this.found = false;

		this._route = new Map(); // this holds the route taken to the target
		this._visited = new Set(); // holds the visited nodes

		this._spanningTree = new Set(); // for debugging purposes

	}

	/**
	* Executes the graph search. If the search was successful, {@link DFS#found}
	* is set to true.
	*
	* @return {DFS} A reference to this DFS object.
	*/
	search() {

		// create a stack(LIFO) of edges, done via an array

		const stack = new Array();
		const outgoingEdges = new Array();

		// create a dummy edge and put on the stack to begin the search

		const startEdge = new Edge( this.source, this.source );

		stack.push( startEdge );

		// while there are edges in the stack keep searching

		while ( stack.length > 0 ) {

			// grab the next edge and remove it from the stack

			const nextEdge = stack.pop();

			// make a note of the parent of the node this edge points to

			this._route.set( nextEdge.to, nextEdge.from );

			// and mark it visited

			this._visited.add( nextEdge.to );

			// expand spanning tree

			if ( nextEdge !== startEdge ) {

				this._spanningTree.add( nextEdge );

			}

			// if the target has been found the method can return success

			if ( nextEdge.to === this.target ) {

				this.found = true;

				return this;

			}

			// determine outgoing edges

			this.graph.getEdgesOfNode( nextEdge.to, outgoingEdges );

			// push the edges leading from the node this edge points to onto the
			// stack (provided the edge does not point to a previously visited node)

			for ( let i = 0, l = outgoingEdges.length; i < l; i ++ ) {

				const edge = outgoingEdges[ i ];

				if ( this._visited.has( edge.to ) === false ) {

					stack.push( edge );

				}

			}

		}

		this.found = false;

		return this;

	}

	/**
	* Returns the shortest path from the source to the target node as an array of node indices.
	*
	* @return {Array<Number>} The shortest path.
	*/
	getPath() {

		// array of node indices that comprise the shortest path from the source to the target

		const path = new Array();

		// just return an empty path if no path to target found or if no target has been specified

		if ( this.found === false || this.target === - 1 ) return path;

		// start with the target of the path

		let currentNode = this.target;

		path.push( currentNode );

		// while the current node is not the source node keep processing

		while ( currentNode !== this.source ) {

			// determine the parent of the current node

			currentNode = this._route.get( currentNode );

			// push the new current node at the beginning of the array

			path.unshift( currentNode );

		}

		return path;

	}

	/**
	* Returns the search tree of the algorithm as an array of edges.
	*
	* @return {Array<Edge>} The search tree.
	*/
	getSearchTree() {

		return [ ...this._spanningTree ];

	}

	/**
	* Clears the internal state of the object. A new search is now possible.
	*
	* @return {DFS} A reference to this DFS object.
	*/
	clear() {

		this.found = false;

		this._route.clear();
		this._visited.clear();
		this._spanningTree.clear();

		return this;

	}

}

/**
* Implementation of Dijkstra's algorithm.
*
* @author {@link https://github.com/Mugen87|Mugen87}
*/
class Dijkstra {

	/**
	* Constructs a Dijkstra algorithm object.
	*
	* @param {Graph} graph - The graph.
	* @param {Number} source - The node index of the source node.
	* @param {Number} target - The node index of the target node.
	*/
	constructor( graph = null, source = - 1, target = - 1 ) {

		/**
		* The graph.
		* @type {?Graph}
		* @default null
		*/
		this.graph = graph;

		/**
		* The node index of the source node.
		* @type {Number}
		* @default - 1
		*/
		this.source = source;

		/**
		* The node index of the target node.
		* @type {Number}
		* @default - 1
		*/
		this.target = target;

		/**
		* Whether the search was successful or not.
		* @type {Boolean}
		* @default false
		*/
		this.found = false;

		this._cost = new Map(); // total cost of the bast path so far for a given node
		this._shortestPathTree = new Map();
		this._searchFrontier = new Map();

	}

	/**
	* Executes the graph search. If the search was successful, {@link Dijkstra#found}
	* is set to true.
	*
	* @return {Dijkstra} A reference to this Dijkstra object.
	*/
	search() {

		const outgoingEdges = new Array();
		const pQueue = new PriorityQueue( compare );

		pQueue.push( {
			cost: 0,
			index: this.source
		} );

		// while the queue is not empty

		while ( pQueue.length > 0 ) {

			const nextNode = pQueue.pop();
			const nextNodeIndex = nextNode.index;

			// if the shortest path tree has the given node, we already found the shortest
			// path to this particular one

			if ( this._shortestPathTree.has( nextNodeIndex ) ) continue;

			// move this edge from the frontier to the shortest path tree

			if ( this._searchFrontier.has( nextNodeIndex ) === true ) {

				this._shortestPathTree.set( nextNodeIndex, this._searchFrontier.get( nextNodeIndex ) );

			}

			// if the target has been found exit

			if ( nextNodeIndex === this.target ) {

				this.found = true;

				return this;

			}

			// now relax the edges

			this.graph.getEdgesOfNode( nextNodeIndex, outgoingEdges );

			for ( let i = 0, l = outgoingEdges.length; i < l; i ++ ) {

				const edge = outgoingEdges[ i ];

				// the total cost to the node this edge points to is the cost to the
				// current node plus the cost of the edge connecting them.

				const newCost = ( this._cost.get( nextNodeIndex ) || 0 ) + edge.cost;

				// We enhance our search frontier in two cases:
				// 1. If the node was never on the search frontier
				// 2. If the cost to this node is better than before

				if ( ( this._searchFrontier.has( edge.to ) === false ) || newCost < ( this._cost.get( edge.to ) ) ) {

					this._cost.set( edge.to, newCost );

					this._searchFrontier.set( edge.to, edge );

					pQueue.push( {
						cost: newCost,
						index: edge.to
					} );

				}

			}

		}

		this.found = false;

		return this;

	}

	/**
	* Returns the shortest path from the source to the target node as an array of node indices.
	*
	* @return {Array<Number>} The shortest path.
	*/
	getPath() {

		// array of node indices that comprise the shortest path from the source to the target

		const path = new Array();

		// just return an empty path if no path to target found or if no target has been specified

		if ( this.found === false || this.target === - 1 ) return path;

		// start with the target of the path

		let currentNode = this.target;

		path.push( currentNode );

		// while the current node is not the source node keep processing

		while ( currentNode !== this.source ) {

			// determine the parent of the current node

			currentNode = this._shortestPathTree.get( currentNode ).from;

			// push the new current node at the beginning of the array

			path.unshift( currentNode );

		}

		return path;

	}

	/**
	* Returns the search tree of the algorithm as an array of edges.
	*
	* @return {Array<Edge>} The search tree.
	*/
	getSearchTree() {

		return [ ...this._shortestPathTree.values() ];

	}

	/**
	* Clears the internal state of the object. A new search is now possible.
	*
	* @return {Dijkstra} A reference to this Dijkstra object.
	*/
	clear() {

		this.found = false;

		this._cost.clear();
		this._shortestPathTree.clear();
		this._searchFrontier.clear();

		return this;

	}

}


function compare( a, b ) {

	return ( a.cost < b.cost ) ? - 1 : ( a.cost > b.cost ) ? 1 : 0;

}

const v1$1 = new Vector3();
const v2 = new Vector3();
const v3 = new Vector3();

const xAxis$1 = new Vector3( 1, 0, 0 );
const yAxis$1 = new Vector3( 0, 1, 0 );
const zAxis$1 = new Vector3( 0, 0, 1 );

const triangle = { a: new Vector3(), b: new Vector3(), c: new Vector3() };
const intersection = new Vector3();
const intersections = new Array();

/**
* Class representing a bounding volume hierarchy. The current implementation
* represents single BVH nodes as AABBs. It accepts arbitrary branching factors
* and can subdivide the given geometry until a defined hierarchy depth has been reached.
* Besides, the hierarchy construction is performed top-down and the algorithm only
* performs splits along the cardinal axes.
*
* Reference: Bounding Volume Hierarchies in Real-Time Collision Detection
* by Christer Ericson (chapter 6).
*
* @author {@link https://github.com/robp94|robp94}
* @author {@link https://github.com/Mugen87|Mugen87}
*/
class BVH {

	/**
	* Constructs a new BVH.
	*
	* @param {Number} branchingFactor - The branching factor.
	* @param {Number} primitivesPerNode - The minimum amount of primitives per BVH node.
	* @param {Number} depth - The maximum hierarchical depth.
	*/
	constructor( branchingFactor = 2, primitivesPerNode = 1, depth = 10 ) {

		/**
		* The branching factor (how many nodes per level).
		* @type {Number}
		* @default 2
		*/
		this.branchingFactor = branchingFactor;

		/**
		* The minimum amount of primitives per BVH node.
		* @type {Number}
		* @default 10
		*/
		this.primitivesPerNode = primitivesPerNode;

		/**
		* The maximum hierarchical depth.
		* @type {Number}
		* @default 10
		*/
		this.depth = depth;

		/**
		* The root BVH node.
		* @type {BVHNode}
		* @default null
		*/
		this.root = null;

	}

	/**
	* Computes a BVH for the given mesh geometry.
	*
	* @param {MeshGeometry} geometry - The mesh geometry.
	* @return {BVH} A reference to this BVH.
	*/
	fromMeshGeometry( geometry ) {

		this.root = new BVHNode();

		// primitives

		if ( geometry.indices !== null ) geometry = geometry.toTriangleSoup();

		const vertices = geometry.vertices;

		for ( let i = 0, l = vertices.length; i < l; i ++ ) {

			this.root.primitives.push( vertices[ i ] );

		}

		// centroids

		const primitives = this.root.primitives;

		for ( let i = 0, l = primitives.length; i < l; i += 9 ) {

			v1$1.fromArray( primitives, i );
			v2.fromArray( primitives, i + 3 );
			v3.fromArray( primitives, i + 6 );

			v1$1.add( v2 ).add( v3 ).divideScalar( 3 );

			this.root.centroids.push( v1$1.x, v1$1.y, v1$1.z );

		}

		// build

		this.root.build( this.branchingFactor, this.primitivesPerNode, this.depth, 1 );

		return this;

	}

	/**
	* Executes the given callback for each node of the BVH.
	*
	* @param {Function} callback - The callback to execute.
	* @return {BVH} A reference to this BVH.
	*/
	traverse( callback ) {

		this.root.traverse( callback );

		return this;

	}

}

/**
* A single node in a bounding volume hierarchy (BVH).
*
* @author {@link https://github.com/robp94|robp94}
* @author {@link https://github.com/Mugen87|Mugen87}
*/
class BVHNode {

	/**
	* Constructs a BVH node.
	*/
	constructor() {

		/**
		* The parent BVH node.
		* @type {BVHNode}
		* @default null
		*/
		this.parent = null;

		/**
		* The child BVH nodes.
		* @type {Array<BVHNode>}
		*/
		this.children = new Array();

		/**
		* The bounding volume of this BVH node.
		* @type {AABB}
		*/
		this.boundingVolume = new AABB();

		/**
		* The primitives (triangles) of this BVH node.
		* Only filled for leaf nodes.
		* @type {Array<Number>}
		*/
		this.primitives = new Array();

		/**
		* The centroids of the node's triangles.
		* Only filled for leaf nodes.
		* @type {Array<Number>}
		*/
		this.centroids = new Array();

	}

	/**
	* Returns true if this BVH node is a root node.
	*
	* @return {Boolean} Whether this BVH node is a root node or not.
	*/
	root() {

		return this.parent === null;

	}

	/**
	* Returns true if this BVH node is a leaf node.
	*
	* @return {Boolean} Whether this BVH node is a leaf node or not.
	*/
	leaf() {

		return this.children.length === 0;

	}

	/**
	* Returns the depth of this BVH node in its hierarchy.
	*
	* @return {Number} The hierarchical depth of this BVH node.
	*/
	getDepth() {

		let depth = 0;

		let parent = this.parent;

		while ( parent !== null ) {

			parent = parent.parent;
			depth ++;

		}

		return depth;

	}

	/**
	* Executes the given callback for this BVH node and its ancestors.
	*
	* @param {Function} callback - The callback to execute.
	* @return {BVHNode} A reference to this BVH node.
	*/
	traverse( callback ) {

		callback( this );

		for ( let i = 0, l = this.children.length; i < l; i ++ ) {

			 this.children[ i ].traverse( callback );

		}

		return this;

	}

	/**
	* Builds this BVH node. That means the respective bounding volume
	* is computed and the node's primitives are distributed under new child nodes.
	* This only happens if the maximum hierarchical depth is not yet reached and
	* the node does contain enough primitives required for a split.
	*
	* @param {Number} branchingFactor - The branching factor.
	* @param {Number} primitivesPerNode - The minimum amount of primitives per BVH node.
	* @param {Number} maxDepth - The maximum  hierarchical depth.
	* @param {Number} currentDepth - The current hierarchical depth.
	* @return {BVHNode} A reference to this BVH node.
	*/
	build( branchingFactor, primitivesPerNode, maxDepth, currentDepth ) {

		this.computeBoundingVolume();

		// check depth and primitive count

		const primitiveCount = this.primitives.length / 9;
		const newPrimitiveCount = Math.floor( primitiveCount / branchingFactor );

		if ( ( currentDepth <= maxDepth ) && ( newPrimitiveCount >= primitivesPerNode ) ) {

			// split (distribute primitives on new child BVH nodes)

			this.split( branchingFactor );

			// proceed with build on the next hierarchy level

			for ( let i = 0; i < branchingFactor; i ++ ) {

				this.children[ i ].build( branchingFactor, primitivesPerNode, maxDepth, currentDepth + 1 );

			}

		}

		return this;

	}

	/**
	* Computes the AABB for this BVH node.
	*
	* @return {BVHNode} A reference to this BVH node.
	*/
	computeBoundingVolume() {

		const primitives = this.primitives;

		const aabb = this.boundingVolume;

		// compute AABB

		aabb.min.set( Infinity, Infinity, Infinity );
		aabb.max.set( - Infinity, - Infinity, - Infinity );

		for ( let i = 0, l = primitives.length; i < l; i += 3 ) {

			v1$1.x = primitives[ i ];
			v1$1.y = primitives[ i + 1 ];
			v1$1.z = primitives[ i + 2 ];

			aabb.expand( v1$1 );

		}

		return this;

	}

	/**
	* Computes the split axis. Right now, only the cardinal axes
	* are potential split axes.
	*
	* @return {Vector3} The split axis.
	*/
	computeSplitAxis() {

		let maxX, maxY, maxZ = maxY = maxX = - Infinity;
		let minX, minY, minZ = minY = minX = Infinity;

		const centroids = this.centroids;

		for ( let i = 0, l = centroids.length; i < l; i += 3 ) {

			const x = centroids[ i ];
			const y = centroids[ i + 1 ];
			const z = centroids[ i + 2 ];

			if ( x > maxX ) {

				maxX = x;

			}

			if ( y > maxY ) {

				maxY = y;

			}

			if ( z > maxZ ) {

				maxZ = z;

			}

			if ( x < minX ) {

				minX = x;

			}

			if ( y < minY ) {

				minY = y;

			}

			if ( z < minZ ) {

				minZ = z;

			}

		}

		const rangeX = maxX - minX;
		const rangeY = maxY - minY;
		const rangeZ = maxZ - minZ;

		if ( rangeX > rangeY && rangeX > rangeZ ) {

			return xAxis$1;

		} else if ( rangeY > rangeZ ) {

			return yAxis$1;

		} else {

			return zAxis$1;

		}

	}

	/**
	* Splits the node and distributes node's primitives over new child nodes.
	*
	* @param {Number} branchingFactor - The branching factor.
	* @return {BVHNode} A reference to this BVH node.
	*/
	split( branchingFactor ) {

		const centroids = this.centroids;
		const primitives = this.primitives;

		// create (empty) child BVH nodes

		for ( let i = 0; i < branchingFactor; i ++ ) {

			this.children[ i ] = new BVHNode();
			this.children[ i ].parent = this;

		}

		// sort primitives along split axis

		const axis = this.computeSplitAxis();
		const sortedPrimitiveIndices = new Array();

		for ( let i = 0, l = centroids.length; i < l; i += 3 ) {

			v1$1.fromArray( centroids, i );

			// the result from the dot product is our sort criterion.
			// it represents the projection of the centroid on the split axis

			const p = v1$1.dot( axis );
			const primitiveIndex = i / 3;

			sortedPrimitiveIndices.push( { index: primitiveIndex, p: p } );

		}

		sortedPrimitiveIndices.sort( sortPrimitives );

		// distribute data

		const primitveCount = sortedPrimitiveIndices.length;
		const primitivesPerChild = Math.floor( primitveCount / branchingFactor );

		var childIndex = 0;
		var primitivesIndex = 0;

		for ( let i = 0; i < primitveCount; i ++ ) {

			// selected child

			primitivesIndex ++;

			// check if we try to add more primitives to a child than "primitivesPerChild" defines.
			// move primitives to the next child

			if ( primitivesIndex > primitivesPerChild ) {

				// ensure "childIndex" does not overflow (meaning the last child takes all remaining primitives)

				if ( childIndex < ( branchingFactor - 1 ) ) {

					primitivesIndex = 1; // reset primitive index
					childIndex ++; // raise child index

				}

			}

			const child = this.children[ childIndex ];

			// move data to the next level

			// 1. primitives

			const primitiveIndex = sortedPrimitiveIndices[ i ].index;
			const stride = primitiveIndex * 9; // remember the "primitives" array holds raw vertex data defining triangles

			v1$1.fromArray( primitives, stride );
			v2.fromArray( primitives, stride + 3 );
			v3.fromArray( primitives, stride + 6 );

			child.primitives.push( v1$1.x, v1$1.y, v1$1.z );
			child.primitives.push( v2.x, v2.y, v2.z );
			child.primitives.push( v3.x, v3.y, v3.z );

			// 2. centroid

			v1$1.fromArray( centroids, primitiveIndex * 3 );

			child.centroids.push( v1$1.x, v1$1.y, v1$1.z );

		}

		// remove centroids/primitives after split from this node

		this.centroids.length = 0;
		this.primitives.length = 0;

		return this;

	}

	/**
	* Performs a ray/BVH node intersection test and stores the closest intersection point
	* to the given 3D vector. If no intersection is detected, *null* is returned.
	*
	* @param {Ray} ray - The ray.
	* @param {Vector3} result - The result vector.
	* @return {Vector3} The result vector.
	*/
	intersectRay( ray, result ) {

		// gather all intersection points along the hierarchy

		if ( ray.intersectAABB( this.boundingVolume, result ) !== null ) {

			if ( this.leaf() === true ) {

				const vertices = this.primitives;

				for ( let i = 0, l = vertices.length; i < l; i += 9 ) {

					// remember: we assume primitives are triangles

					triangle.a.fromArray( vertices, i );
					triangle.b.fromArray( vertices, i + 3 );
					triangle.c.fromArray( vertices, i + 6 );

					if ( ray.intersectTriangle( triangle, true, result ) !== null ) {

						intersections.push( result.clone() );

					}

				}

			} else {

				// process childs

				for ( let i = 0, l = this.children.length; i < l; i ++ ) {

					this.children[ i ].intersectRay( ray, result );

				}

			}

		}

		// determine the closest intersection point in the root node (so after
		// the hierarchy was processed)

		if ( this.root() === true ) {

			if ( intersections.length > 0 ) {

				let minDistance = Infinity;

				for ( let i = 0, l = intersections.length; i < l; i ++ ) {

					const squaredDistance = ray.origin.squaredDistanceTo( intersections[ i ] );

					if ( squaredDistance < minDistance ) {

						minDistance = squaredDistance;
						result.copy( intersections[ i ] );

					}

				}

				// reset array

				intersections.length = 0;

				// return closest intersection point

				return result;

			} else {

				// no intersection detected

				return null;

			}

		} else {

			// always return null for non-root nodes

			return null;

		}

	}

	/**
	* Performs a ray/BVH node intersection test. Returns either true or false if
	* there is a intersection or not.
	*
	* @param {Ray} ray - The ray.
	* @return {boolean} Whether there is an intersection or not.
	*/
	intersectsRay( ray ) {

		if ( ray.intersectAABB( this.boundingVolume, intersection ) !== null ) {

			if ( this.leaf() === true ) {

				const vertices = this.primitives;

				for ( let i = 0, l = vertices.length; i < l; i += 9 ) {

					// remember: we assume primitives are triangles

					triangle.a.fromArray( vertices, i );
					triangle.b.fromArray( vertices, i + 3 );
					triangle.c.fromArray( vertices, i + 6 );

					if ( ray.intersectTriangle( triangle, true, intersection ) !== null ) {

						return true;

					}

				}

				return false;

			} else {

				// process child BVH nodes

				for ( let i = 0, l = this.children.length; i < l; i ++ ) {

					if ( this.children[ i ].intersectsRay( ray ) === true ) {

						return true;

					}

				}

				return false;

			}

		} else {

			return false;

		}

	}

}

//

function sortPrimitives( a, b ) {

	return a.p - b.p;

}

const p1 = new Vector3();
const p2 = new Vector3();

/**
* Class representing a 3D line segment.
*
* @author {@link https://github.com/Mugen87|Mugen87}
*/
class LineSegment {

	/**
	* Constructs a new line segment with the given values.
	*
	* @param {Vector3} from - The start point of the line segment.
	* @param {Vector3} to - The end point of the line segment.
	*/
	constructor( from = new Vector3(), to = new Vector3() ) {

		/**
		* The start point of the line segment.
		* @type {Vector3}
		*/
		this.from = from;

		/**
		* The end point of the line segment.
		* @type {Vector3}
		*/
		this.to = to;

	}

	/**
	* Sets the given values to this line segment.
	*
	* @param {Vector3} from - The start point of the line segment.
	* @param {Vector3} to - The end point of the line segment.
	* @return {LineSegment} A reference to this line segment.
	*/
	set( from, to ) {

		this.from = from;
		this.to = to;

		return this;

	}

	/**
	* Copies all values from the given line segment to this line segment.
	*
	* @param {LineSegment} lineSegment - The line segment to copy.
	* @return {LineSegment} A reference to this line segment.
	*/
	copy( lineSegment ) {

		this.from.copy( lineSegment.from );
		this.to.copy( lineSegment.to );

		return this;

	}

	/**
	* Creates a new line segment and copies all values from this line segment.
	*
	* @return {LineSegment} A new line segment.
	*/
	clone() {

		return new this.constructor().copy( this );

	}

	/**
	* Computes the difference vector between the end and start point of this
	* line segment and stores the result in the given vector.
	*
	* @param {Vector3} result - The result vector.
	* @return {Vector3} The result vector.
	*/
	delta( result ) {

		return result.subVectors( this.to, this.from );

	}

	/**
	* Computes a position on the line segment according to the given t value
	* and stores the result in the given 3D vector. The t value has usually a range of
	* [0, 1] where 0 means start position and 1 the end position.
	*
	* @param {Number} t - A scalar value representing a position on the line segment.
	* @param {Vector3} result - The result vector.
	* @return {Vector3} The result vector.
	*/
	at( t, result ) {

		return this.delta( result ).multiplyScalar( t ).add( this.from );

	}

	/**
	* Computes the closest point on an infinite line defined by the line segment.
	* It's possible to clamp the closest point so it does not exceed the start and
	* end position of the line segment.
	*
	* @param {Vector3} point - A point in 3D space.
	* @param {Boolean} clampToLine - Indicates if the results should be clamped.
	* @param {Vector3} result - The result vector.
	* @return {Vector3} The closest point.
	*/
	closestPointToPoint( point, clampToLine, result ) {

		const t = this.closestPointToPointParameter( point, clampToLine );

		return this.at( t, result );

	}

	/**
	* Computes a scalar value which represents the closest point on an infinite line
	* defined by the line segment. It's possible to clamp this value so it does not
	* exceed the start and end position of the line segment.
	*
	* @param {Vector3} point - A point in 3D space.
	* @param {Boolean} clampToLine - Indicates if the results should be clamped.
	* @return {Number} A scalar representing the closest point.
	*/
	closestPointToPointParameter( point, clampToLine = true ) {

		p1.subVectors( point, this.from );
		p2.subVectors( this.to, this.from );

		const dotP2P2 = p2.dot( p2 );
		const dotP2P1 = p2.dot( p1 );

		let t = dotP2P1 / dotP2P2;

		if ( clampToLine ) t = MathUtils.clamp( t, 0, 1 );

		return t;

	}

	/**
	* Returns true if the given line segment is deep equal with this line segment.
	*
	* @param {LineSegment} lineSegment - The line segment to test.
	* @return {Boolean} The result of the equality test.
	*/
	equals( lineSegment ) {

		return lineSegment.from.equals( this.from ) && lineSegment.to.equals( this.to );

	}

}

const normal = new Vector3();
const oppositeNormal = new Vector3();
const directionA = new Vector3();
const directionB = new Vector3();

const c = new Vector3();
const d = new Vector3();
const v = new Vector3();

/**
* Implementation of the separating axis theorem (SAT). Used to detect intersections
* between convex polyhedra. The code is based on the presentation {@link http://twvideo01.ubm-us.net/o1/vault/gdc2013/slides/822403Gregorius_Dirk_TheSeparatingAxisTest.pdf The Separating Axis Test between convex polyhedra}
* by Dirk Gregorius (Valve Software) from GDC 2013.
*
* @author {@link https://github.com/Mugen87|Mugen87}
*/
class SAT {

	/**
	* Returns true if the given convex polyhedra intersect. A polyhedron is just
	* an array of {@link Polygon} objects.
	*
	* @param {Polyhedron} polyhedronA - The first convex polyhedron.
	* @param {Polyhedron} polyhedronB - The second convex polyhedron.
	* @return {Boolean} Whether there is an intersection or not.
	*/
	intersects( polyhedronA, polyhedronB ) {

		const resultAB = this._checkFaceDirections( polyhedronA, polyhedronB );

		if ( resultAB ) return false;

		const resultBA = this._checkFaceDirections( polyhedronB, polyhedronA );

		if ( resultBA ) return false;

		const resultEdges = this._checkEdgeDirections( polyhedronA, polyhedronB );

		if ( resultEdges ) return false;

		// no separating axis found, the polyhedra must intersect

		return true;

	}

	// check possible separating axes from the first given polyhedron. the axes
	// are derived from the respective face normals

	_checkFaceDirections( polyhedronA, polyhedronB ) {

		const faces = polyhedronA.faces;

		for ( let i = 0, l = faces.length; i < l; i ++ ) {

			const face = faces[ i ];
			const plane = face.plane;

			oppositeNormal.copy( plane.normal ).multiplyScalar( - 1 );

			const supportVertex = this._getSupportVertex( polyhedronB, oppositeNormal );
			const distance = plane.distanceToPoint( supportVertex );

			if ( distance > 0 ) return true; // separating axis found

		}

		return false;

	}

	// check with possible separating axes computed via the cross product between
	// all edge combinations of both polyhedra

	_checkEdgeDirections( polyhedronA, polyhedronB ) {

		const edgesA = polyhedronA.edges;
		const edgesB = polyhedronB.edges;

		for ( let i = 0, il = edgesA.length; i < il; i ++ ) {

			const edgeA = edgesA[ i ];

			for ( let j = 0, jl = edgesB.length; j < jl; j ++ ) {

				const edgeB = edgesB[ j ];

				edgeA.getDirection( directionA );
				edgeB.getDirection( directionB );

				// edge pruning: only consider edges if they build a face on the minkowski difference

				if ( this._minkowskiFace( edgeA, directionA, edgeB, directionB ) ) {

					// compute axis

					const distance = this._distanceBetweenEdges( edgeA, directionA, edgeB, directionB, polyhedronA );

					if ( distance > 0 ) return true; // separating axis found

				}

			}

		}

		return false;

	}

	// return the most extreme vertex into a given direction

	_getSupportVertex( polyhedron, direction ) {

		let maxProjection = - Infinity;
		let supportVertex = null;

		// iterate over all polygons

		const vertices = polyhedron.vertices;

		for ( let i = 0, l = vertices.length; i < l; i ++ ) {

			const vertex = vertices[ i ];
			const projection = vertex.dot( direction );

			// check vertex to find the best support point

			if ( projection > maxProjection ) {

				maxProjection = projection;
				supportVertex = vertex;

			}

		}

		return supportVertex;

	}

	// returns true if the given edges build a face on the minkowski difference

	_minkowskiFace( edgeA, directionA, edgeB, directionB ) {

		// get face normals which define the vertices of the arcs on the gauss map

		const a = edgeA.polygon.plane.normal;
		const b = edgeA.twin.polygon.plane.normal;
		c.copy( edgeB.polygon.plane.normal );
		d.copy( edgeB.twin.polygon.plane.normal );

		// negate normals c and d to account for minkowski difference

		c.multiplyScalar( - 1 );
		d.multiplyScalar( - 1 );

		// compute triple products

		// it's not necessary to compute the cross product since edges of convex polyhedron
		// have same direction as the cross product between their adjacent face normals

		const cba = c.dot( directionA );
		const dba = d.dot( directionA );
		const adc = a.dot( directionB );
		const bdc = b.dot( directionB );

		// check signs of plane test

		return ( ( cba * dba ) ) < 0 && ( ( adc * bdc ) < 0 ) && ( ( cba * bdc ) > 0 );

	}

	// use gauss map to compute the distance between two edges

	_distanceBetweenEdges( edgeA, directionA, edgeB, directionB, polyhedronA ) {

		// skip parallel edges

		if ( Math.abs( directionA.dot( directionB ) ) === 1 ) return - Infinity;

		// build plane through one edge

		normal.crossVectors( directionA, directionB ).normalize();

		// ensure normal points from polyhedron A to B

		if ( normal.dot( v.subVectors( edgeA.vertex, polyhedronA.centroid ) ) < 0 ) {

			normal.multiplyScalar( - 1 );

		}

		// compute the distance of any vertex on the other edge to that plane
		// no need to compute support points => O(1)

		return normal.dot( v.subVectors( edgeB.vertex, edgeA.vertex ) );

	}

}

/**
* Implementation of a half-edge data structure, also known as
* {@link https://en.wikipedia.org/wiki/Doubly_connected_edge_list Doubly connected edge list}.
*
* @author {@link https://github.com/Mugen87|Mugen87}
*/
class HalfEdge {

	/**
	* Constructs a new half-edge.
	*
	* @param {Vector3} vertex - The vertex of this half-edge. It represents the head/destination of the respective full edge.
	*/
	constructor( vertex = new Vector3() ) {

		/**
		* The vertex of this half-edge. It represents the head/destination of the respective full edge.
		* @type {Vector3}
		*/
		this.vertex = vertex;

		/**
		* A reference to the next half-edge.
		* @type {?HalfEdge}
		* @default null
		*/
		this.next = null;

		/**
		* A reference to the previous half-edge.
		* @type {?HalfEdge}
		* @default null
		*/
		this.prev = null;

		/**
		* A reference to the opponent half-edge.
		* @type {?HalfEdge}
		* @default null
		*/
		this.twin = null;

		/**
		* A reference to its polygon/face.
		* @type {?Polygon}
		* @default null
		*/
		this.polygon = null;

	}

	/**
	* Returns the tail of this half-edge. That's a reference to the previous
	* half-edge vertex.
	*
	* @return {Vector3} The tail vertex.
	*/
	tail() {

		return this.prev ? this.prev.vertex : null;

	}

	/**
	* Returns the head of this half-edge. That's a reference to the own vertex.
	*
	* @return {Vector3} The head vertex.
	*/
	head() {

		return this.vertex;

	}

	/**
	* Computes the length of this half-edge.
	*
	* @return {Number} The length of this half-edge.
	*/
	length() {

		const tail = this.tail();
		const head = this.head();

		if ( tail !== null ) {

			return tail.distanceTo( head );

		}

		return - 1;

	}

	/**
	* Computes the squared length of this half-edge.
	*
	* @return {Number} The squared length of this half-edge.
	*/
	squaredLength() {

		const tail = this.tail();
		const head = this.head();

		if ( tail !== null ) {

			return tail.squaredDistanceTo( head );

		}

		return - 1;

	}

	/**
	* Links the given opponent half edge with this one.
	*
	* @param {HalfEdge} edge - The opponent edge to link.
	* @return {HalfEdge} A reference to this half edge.
	*/
	linkOpponent( edge ) {

		this.twin = edge;
		edge.twin = this;

		return this;

	}

	/**
	* Computes the direction of this half edge. The method assumes the half edge
	* has a valid reference to a previous half edge.
	*
	* @param {Vector3} result - The result vector.
	* @return {Vector3} The result vector.
	*/
	getDirection( result ) {

		return result.subVectors( this.vertex, this.prev.vertex ).normalize();

	}

}

/**
* Class for representing a planar polygon with an arbitrary amount of edges.
*
* @author {@link https://github.com/Mugen87|Mugen87}
* @author {@link https://github.com/robp94|robp94}
*/
class Polygon {

	/**
	* Constructs a new polygon.
	*/
	constructor() {

		/**
		* The centroid of this polygon.
		* @type {Vector3}
		*/
		this.centroid = new Vector3();

		/**
		* A reference to the first half-edge of this polygon.
		* @type {?HalfEdge}
		* @default null
		*/
		this.edge = null;

		/**
		* A plane abstraction of this polygon.
		* @type {Plane}
		*/
		this.plane = new Plane();

	}

	/**
	* Creates the polygon based on the given array of points in 3D space.
	* The method assumes the contour (the sequence of points) is defined
	* in CCW order.
	*
	* @param {Array<Vector3>} points - The array of points.
	* @return {Polygon} A reference to this polygon.
	*/
	fromContour( points ) {

		const edges = new Array();

		if ( points.length < 3 ) {

			Logger.error( 'YUKA.Polygon: Unable to create polygon from contour. It needs at least three points.' );
			return this;

		}

		for ( let i = 0, l = points.length; i < l; i ++ ) {

			const edge = new HalfEdge( points[ i ] );
			edges.push( edge );

		}

		// link edges

		for ( let i = 0, l = edges.length; i < l; i ++ ) {

			let current, prev, next;

			if ( i === 0 ) {

				current = edges[ i ];
				prev = edges[ l - 1 ];
			 	next = edges[ i + 1 ];

			} else if ( i === ( l - 1 ) ) {

				current = edges[ i ];
			 	prev = edges[ i - 1 ];
				next = edges[ 0 ];

			} else {

			 	current = edges[ i ];
				prev = edges[ i - 1 ];
				next = edges[ i + 1 ];

			}

			current.prev = prev;
			current.next = next;
			current.polygon = this;

		}

		//

		this.edge = edges[ 0 ];

		//

		this.plane.fromCoplanarPoints( points[ 0 ], points[ 1 ], points[ 2 ] );

		return this;

	}

	/**
	* Computes the centroid for this polygon.
	*
	* @return {Polygon} A reference to this polygon.
	*/
	computeCentroid() {

		const centroid = this.centroid;
		let edge = this.edge;
		let count = 0;

		centroid.set( 0, 0, 0 );

		do {

			centroid.add( edge.vertex );

			count ++;

			edge = edge.next;

		} while ( edge !== this.edge );

		centroid.divideScalar( count );

		return this;

	}

	/**
	* Returns true if the polygon contains the given point.
	*
	* @param {Vector3} point - The point to test.
	* @param {Number} epsilon - A tolerance value.
	* @return {Boolean} Whether this polygon contain the given point or not.
	*/
	contains( point, epsilon = 1e-3 ) {

		const plane = this.plane;
		let edge = this.edge;

		// convex test

		do {

			const v1 = edge.tail();
			const v2 = edge.head();

			if ( leftOn( v1, v2, point ) === false ) {

				return false;

			}

			edge = edge.next;

		} while ( edge !== this.edge );

		// ensure the given point lies within a defined tolerance range

		const distance = plane.distanceToPoint( point );

		if ( Math.abs( distance ) > epsilon ) {

			return false;

		}

		return true;

	}

	/**
	* Returns true if the polygon is convex.
	*
	* @param {Boolean} ccw - Whether the winding order is CCW or not.
	* @return {Boolean} Whether this polygon is convex or not.
	*/
	convex( ccw = true ) {

		let edge = this.edge;

		do {

			const v1 = edge.tail();
			const v2 = edge.head();
			const v3 = edge.next.head();

			if ( ccw ) {

				if ( leftOn( v1, v2, v3 ) === false )	return false;

			} else {

				if ( leftOn( v3, v2, v1 ) === false ) return false;

			}

			edge = edge.next;

		} while ( edge !== this.edge );

		return true;

	}

	/**
	* Returns true if the polygon is coplanar.
	*
	* @param {Number} epsilon - A tolerance value.
	* @return {Boolean} Whether this polygon is coplanar or not.
	*/
	coplanar( epsilon = 1e-3 ) {

		const plane = this.plane;
		let edge = this.edge;

		do {

			const distance = plane.distanceToPoint( edge.vertex );

			if ( Math.abs( distance ) > epsilon ) {

				return false;

			}

			edge = edge.next;

		} while ( edge !== this.edge );

		return true;

	}

	/**
	* Computes the signed distance from the given 3D vector to this polygon. The method
	* uses the polygon's plane abstraction in order to compute this value.
	*
	* @param {Vector3} point - A point in 3D space.
	* @return {Number} The signed distance from the given point to this polygon.
	*/
	distanceToPoint( point ) {

		return this.plane.distanceToPoint( point );

	}

	/**
	* Determines the contour (sequence of points) of this polygon and
	* stores the result in the given array.
	*
	* @param {Array<Vector3>} result - The result array.
	* @return {Array<Vector3>} The result array.
	*/
	getContour( result ) {

		let edge = this.edge;

		result.length = 0;

		do {

			result.push( edge.vertex );

			edge = edge.next;

		} while ( edge !== this.edge );

		return result;

	}

}

// from the book "Computational Geometry in C, Joseph O'Rourke"

function leftOn( a, b, c ) {

	return MathUtils.area( a, b, c ) >= 0;

}

/**
* Base class for polyhedra. It is primarily designed for the internal usage in Yuka.
* Objects of this class are always build up from faces. The edges, vertices and
* the polyhedron's centroid have to be derived from a valid face definition with the
* respective methods.
*
* @author {@link https://github.com/Mugen87|Mugen87}
*/
class Polyhedron {

	/**
	* Constructs a new polyhedron.
	*/
	constructor() {

		/**
		* The faces of this polyhedron.
		* @type {Array<Polygon>}
		*/
		this.faces = new Array();

		/**
		* A list of unique edges (no opponent half edges).
		* @type {Array<HalfEdge>}
		*/
		this.edges = new Array();

		/**
		* A list of unique vertices.
		* @type {Array<Vector3>}
		*/
		this.vertices = new Array();

		/**
		* The centroid of this polyhedron.
		* @type {Vector3}
		*/
		this.centroid = new Vector3();

	}

	/**
	* Computes the centroid of this polyhedron. Assumes its faces
	* have valid centroids.
	*
	* @return {Polyhedron} A reference to this polyhedron.
	*/
	computeCentroid() {

		const centroid = this.centroid;
		let faces = this.faces;

		centroid.set( 0, 0, 0 );

		for ( let i = 0, l = faces.length; i < l; i ++ ) {

			const face = faces[ i ];

			centroid.add( face.centroid );

		}

		centroid.divideScalar( faces.length );

		return this;

	}

	/**
	* Computes unique vertices of this polyhedron. Assumes {@link Polyhedron#faces}
	* is properly set.
	*
	* @return {Polyhedron} A reference to this polyhedron.
	*/
	computeUniqueVertices() {

		const faces = this.faces;
		const vertices = this.vertices;

		vertices.length = 0;

		const uniqueVertices = new Set();

		// iterate over all faces

		for ( let i = 0, l = faces.length; i < l; i ++ ) {

			const face = faces[ i ];
			let edge = face.edge;

			// process all edges of a faces

			do {

				// add vertex to set (assuming half edges share unique vertices)

				uniqueVertices.add( edge.vertex );

				edge = edge.next;

			} while ( edge !== face.edge );

		}

		vertices.push( ...uniqueVertices );

		return this;

	}

	/**
	* Computes unique edges of this polyhedron. Assumes {@link Polyhedron#faces}
	* is properly set.
	*
	* @return {Polyhedron} A reference to this polyhedron.
	*/
	computeUniqueEdges() {

		const faces = this.faces;
		const edges = this.edges;

		edges.length = 0;

		// iterate over all faces

		for ( let i = 0, l = faces.length; i < l; i ++ ) {

			const face = faces[ i ];

			let edge = face.edge;

			// process all edges of a faces

			do {

				// only add the edge if the twin was not added before

				if ( edges.includes( edge.twin ) === false ) {

					edges.push( edge );

				}

				edge = edge.next;

			} while ( edge !== face.edge );

		}

		return this;

	}

	/**
	* Configures this polyhedron so it does represent the given AABB.
	*
	* @return {Polyhedron} A reference to this polyhedron.
	*/
	fromAABB( aabb ) {

		this.faces.length = 0;
		this.vertices.length = 0;

		const min = aabb.min;
		const max = aabb.max;

		const vertices = [
			new Vector3( max.x, max.y, max.z ),
			new Vector3( max.x, max.y, min.z ),
			new Vector3( max.x, min.y, max.z ),
			new Vector3( max.x, min.y, min.z ),
			new Vector3( min.x, max.y, max.z ),
			new Vector3( min.x, max.y, min.z ),
			new Vector3( min.x, min.y, max.z ),
			new Vector3( min.x, min.y, min.z )
		];

		this.vertices.push( ... vertices );

		const sideTop = new Polygon().fromContour( [
			vertices[ 4 ],
			vertices[ 0 ],
			vertices[ 1 ],
			vertices[ 5 ]
		] );

		const sideRight = new Polygon().fromContour( [
			vertices[ 2 ],
			vertices[ 3 ],
			vertices[ 1 ],
			vertices[ 0 ]
		] );

		const sideFront = new Polygon().fromContour( [
			vertices[ 6 ],
			vertices[ 2 ],
			vertices[ 0 ],
			vertices[ 4 ]
		] );

		const sideBack = new Polygon().fromContour( [
			vertices[ 3 ],
			vertices[ 7 ],
			vertices[ 5 ],
			vertices[ 1 ]
		] );

		const sideBottom = new Polygon().fromContour( [
			vertices[ 3 ],
			vertices[ 2 ],
			vertices[ 6 ],
			vertices[ 7 ]
		] );

		const sideLeft = new Polygon().fromContour( [
			vertices[ 7 ],
			vertices[ 6 ],
			vertices[ 4 ],
			vertices[ 5 ]
		] );

		// link edges

		sideTop.edge.linkOpponent( sideLeft.edge.prev );
		sideTop.edge.next.linkOpponent( sideFront.edge.prev );
		sideTop.edge.next.next.linkOpponent( sideRight.edge.prev );
		sideTop.edge.prev.linkOpponent( sideBack.edge.prev );

		sideBottom.edge.linkOpponent( sideBack.edge.next );
		sideBottom.edge.next.linkOpponent( sideRight.edge.next );
		sideBottom.edge.next.next.linkOpponent( sideFront.edge.next );
		sideBottom.edge.prev.linkOpponent( sideLeft.edge.next );

		sideLeft.edge.linkOpponent( sideBack.edge.next.next );
		sideBack.edge.linkOpponent( sideRight.edge.next.next );
		sideRight.edge.linkOpponent( sideFront.edge.next.next );
		sideFront.edge.linkOpponent( sideLeft.edge.next.next );

		//

		this.faces.push( sideTop, sideRight, sideFront, sideBack, sideBottom, sideLeft );

		// compute centroids

		sideTop.computeCentroid();
		sideRight.computeCentroid();
		sideFront.computeCentroid();
		sideBack.computeCentroid();
		sideBottom.computeCentroid();
		sideLeft.computeCentroid();

		aabb.getCenter( this.centroid );

		//

		this.computeUniqueEdges();

		return this;

	}

}

const line = new LineSegment();
const plane = new Plane();
const closestPoint$1 = new Vector3();
const up = new Vector3( 0, 1, 0 );
const sat = new SAT();
let polyhedronAABB;

/**
* Class representing a convex hull. This is an implementation of the Quickhull algorithm
* based on the presentation {@link http://media.steampowered.com/apps/valve/2014/DirkGregorius_ImplementingQuickHull.pdf Implementing QuickHull}
* by Dirk Gregorius (Valve Software) from GDC 2014. The algorithm has an average runtime
* complexity of O(nlog(n)), whereas in the worst case it takes O(n²).
*
* @author {@link https://github.com/Mugen87|Mugen87}
* @augments Polyhedron
*/
class ConvexHull extends Polyhedron {

	/**
	* Constructs a new convex hull.
	*/
	constructor() {

		super();

		/**
		* Whether faces of the convex hull should be merged or not.
		* @type {Boolean}
		* @default true
		*/
		this.mergeFaces = true;

		// tolerance value for various (float) compare operations

		this._tolerance = - 1;

		// this array represents the vertices which will be enclosed by the convex hull

		this._vertices = new Array();

		// two doubly linked lists for easier vertex processing

		this._assigned = new VertexList();
		this._unassigned = new VertexList();

	}

	/**
	* Returns true if the given point is inside this convex hull.
	*
	* @param {Vector3} point - A point in 3D space.
	* @return {Boolean} Whether the given point is inside this convex hull or not.
	*/
	containsPoint( point ) {

		const faces = this.faces;

		// use the internal plane abstraction of each face in order to test
		// on what half space the point lies

		for ( let i = 0, l = faces.length; i < l; i ++ ) {

			// if the signed distance is greater than the tolerance value, the point
			// is outside and we can stop processing

			if ( faces[ i ].distanceToPoint( point ) > this._tolerance ) return false;

		}

		return true;

	}

	/**
	* Returns true if this convex hull intersects with the given AABB.
	*
	* @param {AABB} aabb - The AABB to test.
	* @return {Boolean} Whether this convex hull intersects with the given AABB or not.
	*/
	intersectsAABB( aabb ) {

		if ( polyhedronAABB === undefined ) {

			// lazily create the (proxy) polyhedron if necessary

			polyhedronAABB = new Polyhedron().fromAABB( aabb );

		} else {

			// otherwise just ensure up-to-date vertex data.
			// the topology of the polyhedron is equal for all AABBs

			const min = aabb.min;
			const max = aabb.max;

			const vertices = polyhedronAABB.vertices;

			vertices[ 0 ].set( max.x, max.y, max.z );
			vertices[ 1 ].set( max.x, max.y, min.z );
			vertices[ 2 ].set( max.x, min.y, max.z );
			vertices[ 3 ].set( max.x, min.y, min.z );
			vertices[ 4 ].set( min.x, max.y, max.z );
			vertices[ 5 ].set( min.x, max.y, min.z );
			vertices[ 6 ].set( min.x, min.y, max.z );
			vertices[ 7 ].set( min.x, min.y, min.z );

			aabb.getCenter( polyhedronAABB.centroid );

		}

		return sat.intersects( this, polyhedronAABB );

	}

	/**
	* Returns true if this convex hull intersects with the given one.
	*
	* @param {ConvexHull} convexHull - The convex hull to test.
	* @return {Boolean} Whether this convex hull intersects with the given one or not.
	*/
	intersectsConvexHull( convexHull ) {

		return sat.intersects( this, convexHull );

	}

	/**
	* Computes a convex hull that encloses the given set of points. The computation requires
	* at least four points.
	*
	* @param {Array<Vector3>} points - An array of 3D vectors representing points in 3D space.
	* @return {ConvexHull} A reference to this convex hull.
	*/
	fromPoints( points ) {

		if ( points.length < 4 ) {

			Logger.error( 'YUKA.ConvexHull: The given points array needs at least four points.' );
			return this;

		}

		// wrap all points into the internal vertex data structure

		for ( let i = 0, l = points.length; i < l; i ++ ) {

			this._vertices.push( new Vertex( points[ i ] ) );

		}

		// generate the convex hull

		this._generate();

		return this;

	}

	// private API

	// adds a single face to the convex hull by connecting it with the respective horizon edge

	_addAdjoiningFace( vertex, horizonEdge ) {

		// all the half edges are created in ccw order thus the face is always pointing outside the hull

		const face = new Face( vertex.point, horizonEdge.prev.vertex, horizonEdge.vertex );

		this.faces.push( face );

		// join face.getEdge( - 1 ) with the horizon's opposite edge face.getEdge( - 1 ) = face.getEdge( 2 )

		face.getEdge( - 1 ).linkOpponent( horizonEdge.twin );

		return face.getEdge( 0 ); // the half edge whose vertex is the given one

	}

	// adds new faces by connecting the horizon with the new point of the convex hull

	_addNewFaces( vertex, horizon ) {

		const newFaces = [];

		let firstSideEdge = null;
		let previousSideEdge = null;

		for ( let i = 0, l = horizon.length; i < l; i ++ ) {

			// returns the right side edge

			let sideEdge = this._addAdjoiningFace( vertex, horizon[ i ] );

			if ( firstSideEdge === null ) {

				firstSideEdge = sideEdge;

			} else {

				// joins face.getEdge( 1 ) with previousFace.getEdge( 0 )

				sideEdge.next.linkOpponent( previousSideEdge );

			}

			newFaces.push( sideEdge.polygon );
			previousSideEdge = sideEdge;

		}

		// perform final join of new faces

		firstSideEdge.next.linkOpponent( previousSideEdge );

		return newFaces;

	}

	// assigns a single vertex to the given face. that means this face can "see"
	// the vertex and its distance to the vertex is greater than all other faces

	_addVertexToFace( vertex, face ) {

		vertex.face = face;

		if ( face.outside === null ) {

			this._assigned.append( vertex );

			face.outside = vertex;

		} else {

			this._assigned.insertAfter( face.outside, vertex );

		}

		return this;

	}

	// the base iteration of the algorithm. adds a new vertex to the convex hull by
	// connecting faces from the horizon with it.

	_addVertexToHull( vertex ) {

		const horizon = [];

		this._unassigned.clear();

		this._computeHorizon( vertex.point, null, vertex.face, horizon );

		const newFaces = this._addNewFaces( vertex, horizon );

		// reassign 'unassigned' vertices to the new faces

		this._resolveUnassignedPoints( newFaces );

		return this;

	}

	// frees memory by resetting internal data structures

	_reset() {

		this._vertices.length = 0;

		this._assigned.clear();
		this._unassigned.clear();

		return this;

	}

	// computes the initial hull of the algorithm. it's a tetrahedron created
	// with the extreme vertices of the given set of points

	_computeInitialHull() {

		let v0, v1, v2, v3;

		const vertices = this._vertices;
		const extremes = this._computeExtremes();
		const min = extremes.min;
		const max = extremes.max;

		// 1. Find the two points 'p0' and 'p1' with the greatest 1d separation
		// (max.x - min.x)
		// (max.y - min.y)
		// (max.z - min.z)

		// check x

		let distance, maxDistance;

		maxDistance = max.x.point.x - min.x.point.x;

		v0 = min.x;
		v1 = max.x;

		// check y

		distance = max.y.point.y - min.y.point.y;

		if ( distance > maxDistance ) {

			v0 = min.y;
			v1 = max.y;

			maxDistance = distance;

		}

		// check z

		distance = max.z.point.z - min.z.point.z;

		if ( distance > maxDistance ) {

			v0 = min.z;
			v1 = max.z;

		}

		// 2. The next vertex 'v2' is the one farthest to the line formed by 'v0' and 'v1'

		maxDistance = - Infinity;
		line.set( v0.point, v1.point );

		for ( let i = 0, l = vertices.length; i < l; i ++ ) {

			const vertex = vertices[ i ];

			if ( vertex !== v0 && vertex !== v1 ) {

				line.closestPointToPoint( vertex.point, true, closestPoint$1 );

				distance = closestPoint$1.squaredDistanceTo( vertex.point );

				if ( distance > maxDistance ) {

					maxDistance = distance;
					v2 = vertex;

				}

			}

		}

		// 3. The next vertex 'v3' is the one farthest to the plane 'v0', 'v1', 'v2'

		maxDistance = - Infinity;
		plane.fromCoplanarPoints( v0.point, v1.point, v2.point );

		for ( let i = 0, l = vertices.length; i < l; i ++ ) {

			const vertex = vertices[ i ];

			if ( vertex !== v0 && vertex !== v1 && vertex !== v2 ) {

				distance = Math.abs( plane.distanceToPoint( vertex.point ) );

				if ( distance > maxDistance ) {

					maxDistance = distance;
					v3 = vertex;

				}

			}

		}

		// handle case where all points lie in one plane

		if ( plane.distanceToPoint( v3.point ) === 0 ) {

			throw 'ERROR: YUKA.ConvexHull: All extreme points lie in a single plane. Unable to compute convex hull.';

		}

		// build initial tetrahedron

		const faces = this.faces;

		if ( plane.distanceToPoint( v3.point ) < 0 ) {

			// the face is not able to see the point so 'plane.normal' is pointing outside the tetrahedron

			faces.push(
				new Face( v0.point, v1.point, v2.point ),
				new Face( v3.point, v1.point, v0.point ),
				new Face( v3.point, v2.point, v1.point ),
				new Face( v3.point, v0.point, v2.point )
			);

			// set the twin edge

			// join face[ i ] i > 0, with the first face

			faces[ 1 ].getEdge( 2 ).linkOpponent( faces[ 0 ].getEdge( 1 ) );
			faces[ 2 ].getEdge( 2 ).linkOpponent( faces[ 0 ].getEdge( 2 ) );
			faces[ 3 ].getEdge( 2 ).linkOpponent( faces[ 0 ].getEdge( 0 ) );

			// join face[ i ] with face[ i + 1 ], 1 <= i <= 3

			faces[ 1 ].getEdge( 1 ).linkOpponent( faces[ 2 ].getEdge( 0 ) );
			faces[ 2 ].getEdge( 1 ).linkOpponent( faces[ 3 ].getEdge( 0 ) );
			faces[ 3 ].getEdge( 1 ).linkOpponent( faces[ 1 ].getEdge( 0 ) );

		} else {

			// the face is able to see the point so 'plane.normal' is pointing inside the tetrahedron

			faces.push(
				new Face( v0.point, v2.point, v1.point ),
				new Face( v3.point, v0.point, v1.point ),
				new Face( v3.point, v1.point, v2.point ),
				new Face( v3.point, v2.point, v0.point )
			);

			// set the twin edge

			// join face[ i ] i > 0, with the first face

			faces[ 1 ].getEdge( 2 ).linkOpponent( faces[ 0 ].getEdge( 0 ) );
			faces[ 2 ].getEdge( 2 ).linkOpponent( faces[ 0 ].getEdge( 2 ) );
			faces[ 3 ].getEdge( 2 ).linkOpponent( faces[ 0 ].getEdge( 1 ) );

			// join face[ i ] with face[ i + 1 ], 1 <= i <= 3

			faces[ 1 ].getEdge( 0 ).linkOpponent( faces[ 2 ].getEdge( 1 ) );
			faces[ 2 ].getEdge( 0 ).linkOpponent( faces[ 3 ].getEdge( 1 ) );
			faces[ 3 ].getEdge( 0 ).linkOpponent( faces[ 1 ].getEdge( 1 ) );

		}

		// initial assignment of vertices to the faces of the tetrahedron

		for ( let i = 0, l = vertices.length; i < l; i ++ ) {

			const vertex = vertices[ i ];

			if ( vertex !== v0 && vertex !== v1 && vertex !== v2 && vertex !== v3 ) {

				maxDistance = this._tolerance;
				let maxFace = null;

				for ( let j = 0; j < 4; j ++ ) {

					distance = faces[ j ].distanceToPoint( vertex.point );

					if ( distance > maxDistance ) {

						maxDistance = distance;
						maxFace = faces[ j ];

					}

				}

				if ( maxFace !== null ) {

					this._addVertexToFace( vertex, maxFace );

				}

			}

		}

		return this;

	}

	// computes the extreme vertices of used to compute the initial convex hull

	_computeExtremes() {

		const min = new Vector3( Infinity, Infinity, Infinity );
		const max = new Vector3( - Infinity, - Infinity, - Infinity );

		const minVertices = { x: null, y: null, z: null };
		const maxVertices = { x: null, y: null, z: null };

		// compute the min/max points on all six directions

		for ( let i = 0, l = this._vertices.length; i < l; i ++ ) {

			const vertex = this._vertices[ i ];
			const point = vertex.point;

			// update the min coordinates

			if ( point.x < min.x ) {

				min.x = point.x;
				minVertices.x = vertex;

			}

			if ( point.y < min.y ) {

				min.y = point.y;
				minVertices.y = vertex;

			}

			if ( point.z < min.z ) {

				min.z = point.z;
				minVertices.z = vertex;

			}

			// update the max coordinates

			if ( point.x > max.x ) {

				max.x = point.x;
				maxVertices.x = vertex;

			}

			if ( point.y > max.y ) {

				max.y = point.y;
				maxVertices.y = vertex;

			}

			if ( point.z > max.z ) {

				max.z = point.z;
				maxVertices.z = vertex;

			}

		}

		// use min/max vectors to compute an optimal epsilon

		this._tolerance = 3 * Number.EPSILON * (
			Math.max( Math.abs( min.x ), Math.abs( max.x ) ) +
			Math.max( Math.abs( min.y ), Math.abs( max.y ) ) +
			Math.max( Math.abs( min.z ), Math.abs( max.z ) )
		);

		return { min: minVertices, max: maxVertices };

	}

	// computes the horizon, an array of edges enclosing the faces that are able
	// to see the new vertex

	_computeHorizon( eyePoint, crossEdge, face, horizon ) {

		if ( face.outside ) {

			const startVertex = face.outside;

			// remove all vertices from the given face

			this._removeAllVerticesFromFace( face );

			// mark the face vertices to be reassigned to other faces

			this._unassigned.appendChain( startVertex );

		}

		face.active = false;

		let edge;

		if ( crossEdge === null ) {

			edge = crossEdge = face.getEdge( 0 );

		} else {

			// start from the next edge since 'crossEdge' was already analyzed
			// (actually 'crossEdge.twin' was the edge who called this method recursively)

			edge = crossEdge.next;

		}

		do {

			let twinEdge = edge.twin;
			let oppositeFace = twinEdge.polygon;

			if ( oppositeFace.active ) {

				if ( oppositeFace.distanceToPoint( eyePoint ) > this._tolerance ) {

					// the opposite face can see the vertex, so proceed with next edge

					this._computeHorizon( eyePoint, twinEdge, oppositeFace, horizon );

				} else {

					// the opposite face can't see the vertex, so this edge is part of the horizon

					horizon.push( edge );

				}

			}

			edge = edge.next;

		} while ( edge !== crossEdge );

		return this;

	}

	// this method controls the basic flow of the algorithm

	_generate() {

		this.faces.length = 0;

		this._computeInitialHull();

		let vertex;

		while ( vertex = this._nextVertexToAdd() ) {

			this._addVertexToHull( vertex );

		}

		this._updateFaces();

		this._postprocessHull();

		this._reset();

		return this;

	}

	// final tasks after computing the hull

	_postprocessHull() {

		const faces = this.faces;
		const edges = this.edges;

		if ( this.mergeFaces === true ) {

			// merges faces if the result is still convex and coplanar

			const cache = {
				leftPrev: null,
				leftNext: null,
				rightPrev: null,
				rightNext: null
			};

			// gather unique edges and temporarily sort them

			this.computeUniqueEdges();

			edges.sort( ( a, b ) => b.length() - a.length() );

			// process edges from longest to shortest

			for ( let i = 0, l = edges.length; i < l; i ++ ) {

				const entry = edges[ i ];

				if ( this._mergePossible( entry ) === false ) continue;

				let candidate = entry;

				// cache current references for possible restore

				cache.prev = candidate.prev;
				cache.next = candidate.next;
				cache.prevTwin = candidate.twin.prev;
				cache.nextTwin = candidate.twin.next;

				// temporarily change the first polygon in order to represent both polygons

				candidate.prev.next = candidate.twin.next;
				candidate.next.prev = candidate.twin.prev;
				candidate.twin.prev.next = candidate.next;
				candidate.twin.next.prev = candidate.prev;

				const polygon = candidate.polygon;
				polygon.edge = candidate.prev;

				const ccw = polygon.plane.normal.dot( up ) >= 0;

				if ( polygon.convex( ccw ) === true && polygon.coplanar( this._tolerance ) === true ) {

					// correct polygon reference of all edges

					let edge = polygon.edge;

					do {

						edge.polygon = polygon;

						edge = edge.next;

					} while ( edge !== polygon.edge );

					// delete obsolete polygon

					const index = faces.indexOf( entry.twin.polygon );
					faces.splice( index, 1 );

				} else {

					// restore

					cache.prev.next = candidate;
					cache.next.prev = candidate;
					cache.prevTwin.next = candidate.twin;
					cache.nextTwin.prev = candidate.twin;

					polygon.edge = candidate;

				}

			}

			// recompute centroid of faces

			for ( let i = 0, l = faces.length; i < l; i ++ ) {

				faces[ i ].computeCentroid();

			}

		}

		// compute centroid of convex hull and the final edge and vertex list

		this.computeCentroid();
		this.computeUniqueEdges();
		this.computeUniqueVertices();

		return this;

	}

	// checks if the given edge can be used to merge convex regions

	_mergePossible( edge ) {

		const polygon = edge.polygon;
		let currentEdge = edge.twin;

		do {

			// we can only use an edge to merge two regions if the adjacent region does not have any edges
			// apart from edge.twin already connected to the region.

			if ( currentEdge !== edge.twin && currentEdge.twin.polygon === polygon ) return false;

			currentEdge = currentEdge.next;

		} while ( edge.twin !== currentEdge );

		return true;

	}

	// determines the next vertex that should added to the convex hull

	_nextVertexToAdd() {

		let nextVertex = null;

		// if the 'assigned' list of vertices is empty, no vertices are left

		if ( this._assigned.empty() === false ) {

			let maxDistance = 0;

			// grap the first available vertex and save the respective face

			let vertex = this._assigned.first();
			const face = vertex.face;

			// now calculate the farthest vertex that face can see

			do {

				const distance = face.distanceToPoint( vertex.point );

				if ( distance > maxDistance ) {

					maxDistance = distance;
					nextVertex = vertex;

				}

				vertex = vertex.next;

			} while ( vertex !== null && vertex.face === face );

		}

		return nextVertex;

	}

	// updates the faces array after the computation of the convex hull
	// it ensures only visible faces are in the result set

	_updateFaces() {

		const faces = this.faces;
		const activeFaces = new Array();

		for ( let i = 0, l = faces.length; i < l; i ++ ) {

			const face = faces[ i ];

			// only respect visible but not deleted or merged faces

			if ( face.active ) {

				activeFaces.push( face );

			}

		}

		this.faces.length = 0;
		this.faces.push( ...activeFaces );

		return this;

	}

	// removes all vertices from the given face. necessary when deleting a face
	// which is necessary when the hull is going to be expanded

	_removeAllVerticesFromFace( face ) {

		if ( face.outside !== null ) {

			// reference to the first and last vertex of this face

			const firstVertex = face.outside;
			firstVertex.face = null;

			let lastVertex = face.outside;

			while ( lastVertex.next !== null && lastVertex.next.face === face ) {

				lastVertex = lastVertex.next;
				lastVertex.face = null;

			}

			face.outside = null;

			this._assigned.removeChain( firstVertex, lastVertex );

		}

		return this;

	}

	// removes a single vertex from the given face

	_removeVertexFromFace( vertex, face ) {

		vertex.face = null;

		if ( vertex === face.outside ) {

			// fix face.outside link

			if ( vertex.next !== null && vertex.next.face === face ) {

				// face has at least 2 outside vertices, move the 'outside' reference

				face.outside = vertex.next;

			} else {

				// vertex was the only outside vertex that face had

				face.outside = null;

			}

		}

		this._assigned.remove( vertex );

		return this;

	}

	// ensure that all unassigned points are reassigned to other faces of the
	// current convex hull. this method is always executed after the hull was
	// expanded

	_resolveUnassignedPoints( newFaces ) {

		if ( this._unassigned.empty() === false ) {

			let vertex = this._unassigned.first();

			do {

				// buffer 'next' reference since addVertexToFace() can change it

				let nextVertex = vertex.next;
				let maxDistance = this._tolerance;

				let maxFace = null;

				for ( let i = 0, l = newFaces.length; i < l; i ++ ) {

					const face = newFaces[ i ];

					if ( face.active ) {

						const distance = face.distanceToPoint( vertex.point );

						if ( distance > maxDistance ) {

							maxDistance = distance;
							maxFace = face;

						}

					}

				}

				if ( maxFace !== null ) {

					this._addVertexToFace( vertex, maxFace );

				}

				vertex = nextVertex;

			} while ( vertex !== null );

		}

		return this;

	}

}

class Face extends Polygon {

	constructor( a = new Vector3(), b = new Vector3(), c = new Vector3() ) {

		super();

		this.outside = null; // reference to a vertex in a vertex list this face can see
		this.active = true;

		this.fromContour( [ a, b, c ] );

		this.computeCentroid();

	}

	getEdge( i ) {

		let edge = this.edge;

		while ( i > 0 ) {

			edge = edge.next;
			i --;

		}

		while ( i < 0 ) {

			edge = edge.prev;
			i ++;

		}

		return edge;

	}

}

// special data structures for the quick hull implementation

class Vertex {

	constructor( point = new Vector3() ) {

		this.point = point;
		this.prev = null;
		this.next = null;
		this.face = null; // the face that is able to see this vertex

	}

}

class VertexList {

	constructor() {

		this.head = null;
		this.tail = null;

	}

	first() {

		return this.head;

	}

	last() {

		return this.tail;

	}

	clear() {

		this.head = this.tail = null;

		return this;

	}

	insertAfter( target, vertex ) {

		vertex.prev = target;
		vertex.next = target.next;

		if ( ! vertex.next ) {

			this.tail = vertex;

		} else {

			vertex.next.prev = vertex;

		}

		target.next = vertex;

		return this;

	}

	append( vertex ) {

		if ( this.head === null ) {

			this.head = vertex;

		} else {

			this.tail.next = vertex;

		}

		vertex.prev = this.tail;
		vertex.next = null; // the tail has no subsequent vertex

		this.tail = vertex;

		return this;

	}

	appendChain( vertex ) {

		if ( this.head === null ) {

			this.head = vertex;

		} else {

			this.tail.next = vertex;

		}

		vertex.prev = this.tail;

		while ( vertex.next !== null ) {

			vertex = vertex.next;

		}

		this.tail = vertex;

		return this;

	}

	remove( vertex ) {

		if ( vertex.prev === null ) {

			this.head = vertex.next;

		} else {

			vertex.prev.next = vertex.next;

		}

		if ( vertex.next === null ) {

			this.tail = vertex.prev;

		} else {

			vertex.next.prev = vertex.prev;

		}

		vertex.prev = null;
		vertex.next = null;

		return this;

	}

	removeChain( a, b ) {

		if ( a.prev === null ) {

			this.head = b.next;

		} else {

			a.prev.next = b.next;

		}

		if ( b.next === null ) {

			this.tail = a.prev;

		} else {

			b.next.prev = a.prev;

		}

		a.prev = null;
		b.next = null;

		return this;

	}

	empty() {

		return this.head === null;

	}

}

const eigenDecomposition = {
	unitary: new Matrix3(),
	diagonal: new Matrix3()
};

const a = {
	c: null, // center
	u: [ new Vector3(), new Vector3(), new Vector3() ], // basis vectors
	e: [] // half width
};

const b = {
	c: null, // center
	u: [ new Vector3(), new Vector3(), new Vector3() ], // basis vectors
	e: [] // half width
};

const R = [[], [], []];
const AbsR = [[], [], []];
const t = [];

const xAxis = new Vector3();
const yAxis = new Vector3();
const zAxis = new Vector3();
const v1 = new Vector3();
const closestPoint = new Vector3();

/**
* Class representing an oriented bounding box (OBB). Similar to an AABB, it's a
* rectangular block but with an arbitrary orientation. When using {@link OBB#fromPoints},
* the implementation tries to provide a tight-fitting oriented bounding box. In
* many cases, the result is better than an AABB or bounding sphere but worse than a
* convex hull. However, it's more efficient to work with OBBs compared to convex hulls.
* In general, OBB's are a good compromise between performance and tightness.
*
* @author {@link https://github.com/Mugen87|Mugen87}
*/
class OBB {

	/**
	* Constructs a new OBB with the given values.
	*
	* @param {Vector3} center - The center of this OBB.
	* @param {Vector3} halfSizes - The half sizes of the OBB (defines its width, height and depth).
	* @param {Matrix3} rotation - The rotation of this OBB.
	*/
	constructor( center = new Vector3(), halfSizes = new Vector3(), rotation = new Matrix3() ) {

		/**
		* The center of this OBB.
		* @type {Vector3}
		*/
		this.center = center;

		/**
		* The half sizes of the OBB (defines its width, height and depth).
		* @type {Vector3}
		*/
		this.halfSizes = halfSizes;

		/**
		* The rotation of this OBB.
		* @type {Matrix3}
		*/
		this.rotation = rotation;

	}

	/**
	* Sets the given values to this OBB.
	*
	* @param {Vector3} center - The center of this OBB
	* @param {Vector3} halfSizes - The half sizes of the OBB (defines its width, height and depth).
	* @param {Matrix3} rotation - The rotation of this OBB.
	* @return {OBB} A reference to this OBB.
	*/
	set( center, halfSizes, rotation ) {

		this.center = center;
		this.halfSizes = halfSizes;
		this.rotation = rotation;

		return this;

	}

	/**
	* Copies all values from the given OBB to this OBB.
	*
	* @param {OBB} obb - The OBB to copy.
	* @return {OBB} A reference to this OBB.
	*/
	copy( obb ) {

		this.center.copy( obb.center );
		this.halfSizes.copy( obb.halfSizes );
		this.rotation.copy( obb.rotation );

		return this;

	}

	/**
	* Creates a new OBB and copies all values from this OBB.
	*
	* @return {OBB} A new OBB.
	*/
	clone() {

		return new this.constructor().copy( this );

	}

	/**
	* Computes the size (width, height, depth) of this OBB and stores it into the given vector.
	*
	* @param {Vector3} result - The result vector.
	* @return {Vector3} The result vector.
	*/
	getSize( result ) {

		return result.copy( this.halfSizes ).multiplyScalar( 2 );

	}

	/**
	* Ensures the given point is inside this OBB and stores
	* the result in the given vector.
	*
	* Reference: Closest Point on OBB to Point in Real-Time Collision Detection
	* by Christer Ericson (chapter 5.1.4)
	*
	* @param {Vector3} point - A point in 3D space.
	* @param {Vector3} result - The result vector.
	* @return {Vector3} The result vector.
	*/
	clampPoint( point, result ) {

		const halfSizes = this.halfSizes;

		v1.subVectors( point, this.center );
		this.rotation.extractBasis( xAxis, yAxis, zAxis );

		// start at the center position of the OBB

		result.copy( this.center );

		// project the target onto the OBB axes and walk towards that point

		const x = MathUtils.clamp( v1.dot( xAxis ), - halfSizes.x, halfSizes.x );
		result.add( xAxis.multiplyScalar( x ) );

		const y = MathUtils.clamp( v1.dot( yAxis ), - halfSizes.y, halfSizes.y );
		result.add( yAxis.multiplyScalar( y ) );

		const z = MathUtils.clamp( v1.dot( zAxis ), - halfSizes.z, halfSizes.z );
		result.add( zAxis.multiplyScalar( z ) );

		return result;

	}

	/**
	* Returns true if the given point is inside this OBB.
	*
	* @param {Vector3} point - A point in 3D space.
	* @return {Boolean} Whether the given point is inside this OBB or not.
	*/
	containsPoint( point ) {

		v1.subVectors( point, this.center );
		this.rotation.extractBasis( xAxis, yAxis, zAxis );

		// project v1 onto each axis and check if these points lie inside the OBB

		return Math.abs( v1.dot( xAxis ) ) <= this.halfSizes.x &&
				Math.abs( v1.dot( yAxis ) ) <= this.halfSizes.y &&
				Math.abs( v1.dot( zAxis ) ) <= this.halfSizes.z;

	}

	/**
	* Returns true if the given AABB intersects this OBB.
	*
	* @param {AABB} aabb - The AABB to test.
	* @return {Boolean} The result of the intersection test.
	*/
	intersectsAABB( aabb ) {

		return this.intersectsOBB( obb.fromAABB( aabb ) );

	}

	/**
	* Returns true if the given bounding sphere intersects this OBB.
	*
	* @param {BoundingSphere} sphere - The bounding sphere to test.
	* @return {Boolean} The result of the intersection test.
	*/
	intersectsBoundingSphere( sphere ) {

		// find the point on the OBB closest to the sphere center

		this.clampPoint( sphere.center, closestPoint );

		// if that point is inside the sphere, the OBB and sphere intersect

		return closestPoint.squaredDistanceTo( sphere.center ) <= ( sphere.radius * sphere.radius );

	}

	/**
	* Returns true if the given OBB intersects this OBB.
	*
	* Reference: OBB-OBB Intersection in Real-Time Collision Detection
	* by Christer Ericson (chapter 4.4.1)
	*
	* @param {OBB} obb - The OBB to test.
	* @param {Number} epsilon - The epsilon (tolerance) value.
	* @return {Boolean} The result of the intersection test.
	*/
	intersectsOBB( obb, epsilon = Number.EPSILON ) {

		// prepare data structures (the code uses the same nomenclature like the reference)

		a.c = this.center;
		a.e[ 0 ] = this.halfSizes.x;
		a.e[ 1 ] = this.halfSizes.y;
		a.e[ 2 ] = this.halfSizes.z;
		this.rotation.extractBasis( a.u[ 0 ], a.u[ 1 ], a.u[ 2 ] );

		b.c = obb.center;
		b.e[ 0 ] = obb.halfSizes.x;
		b.e[ 1 ] = obb.halfSizes.y;
		b.e[ 2 ] = obb.halfSizes.z;
		obb.rotation.extractBasis( b.u[ 0 ], b.u[ 1 ], b.u[ 2 ] );

		// compute rotation matrix expressing b in a’s coordinate frame

		for ( let i = 0; i < 3; i ++ ) {

			for ( let j = 0; j < 3; j ++ ) {

				R[ i ][ j ] = a.u[ i ].dot( b.u[ j ] );

			}

		}

		// compute translation vector

		v1.subVectors( b.c, a.c );

		// bring translation into a’s coordinate frame

		t[ 0 ] = v1.dot( a.u[ 0 ] );
		t[ 1 ] = v1.dot( a.u[ 1 ] );
		t[ 2 ] = v1.dot( a.u[ 2 ] );

		// compute common subexpressions. Add in an epsilon term to
		// counteract arithmetic errors when two edges are parallel and
		// their cross product is (near) null

		for ( let i = 0; i < 3; i ++ ) {

			for ( let j = 0; j < 3; j ++ ) {

				AbsR[ i ][ j ] = Math.abs( R[ i ][ j ] ) + epsilon;

			}

		}

		let ra, rb;

		// test axes L = A0, L = A1, L = A2

		for ( let i = 0; i < 3; i ++ ) {

			ra = a.e[ i ];
			rb = b.e[ 0 ] * AbsR[ i ][ 0 ] + b.e[ 1 ] * AbsR[ i ][ 1 ] + b.e[ 2 ] * AbsR[ i ][ 2 ];
			if ( Math.abs( t[ i ] ) > ra + rb ) return false;


		}

		// test axes L = B0, L = B1, L = B2

		for ( let i = 0; i < 3; i ++ ) {

			ra = a.e[ 0 ] * AbsR[ 0 ][ i ] + a.e[ 1 ] * AbsR[ 1 ][ i ] + a.e[ 2 ] * AbsR[ 2 ][ i ];
			rb = b.e[ i ];
			if ( Math.abs( t[ 0 ] * R[ 0 ][ i ] + t[ 1 ] * R[ 1 ][ i ] + t[ 2 ] * R[ 2 ][ i ] ) > ra + rb ) return false;

		}

		// test axis L = A0 x B0

		ra = a.e[ 1 ] * AbsR[ 2 ][ 0 ] + a.e[ 2 ] * AbsR[ 1 ][ 0 ];
		rb = b.e[ 1 ] * AbsR[ 0 ][ 2 ] + b.e[ 2 ] * AbsR[ 0 ][ 1 ];
		if ( Math.abs( t[ 2 ] * R[ 1 ][ 0 ] - t[ 1 ] * R[ 2 ][ 0 ] ) > ra + rb ) return false;

		// test axis L = A0 x B1

		ra = a.e[ 1 ] * AbsR[ 2 ][ 1 ] + a.e[ 2 ] * AbsR[ 1 ][ 1 ];
		rb = b.e[ 0 ] * AbsR[ 0 ][ 2 ] + b.e[ 2 ] * AbsR[ 0 ][ 0 ];
		if ( Math.abs( t[ 2 ] * R[ 1 ][ 1 ] - t[ 1 ] * R[ 2 ][ 1 ] ) > ra + rb ) return false;

		// test axis L = A0 x B2

		ra = a.e[ 1 ] * AbsR[ 2 ][ 2 ] + a.e[ 2 ] * AbsR[ 1 ][ 2 ];
		rb = b.e[ 0 ] * AbsR[ 0 ][ 1 ] + b.e[ 1 ] * AbsR[ 0 ][ 0 ];
		if ( Math.abs( t[ 2 ] * R[ 1 ][ 2 ] - t[ 1 ] * R[ 2 ][ 2 ] ) > ra + rb ) return false;

		// test axis L = A1 x B0

		ra = a.e[ 0 ] * AbsR[ 2 ][ 0 ] + a.e[ 2 ] * AbsR[ 0 ][ 0 ];
		rb = b.e[ 1 ] * AbsR[ 1 ][ 2 ] + b.e[ 2 ] * AbsR[ 1 ][ 1 ];
		if ( Math.abs( t[ 0 ] * R[ 2 ][ 0 ] - t[ 2 ] * R[ 0 ][ 0 ] ) > ra + rb ) return false;

		// test axis L = A1 x B1

		ra = a.e[ 0 ] * AbsR[ 2 ][ 1 ] + a.e[ 2 ] * AbsR[ 0 ][ 1 ];
		rb = b.e[ 0 ] * AbsR[ 1 ][ 2 ] + b.e[ 2 ] * AbsR[ 1 ][ 0 ];
		if ( Math.abs( t[ 0 ] * R[ 2 ][ 1 ] - t[ 2 ] * R[ 0 ][ 1 ] ) > ra + rb ) return false;

		// test axis L = A1 x B2

		ra = a.e[ 0 ] * AbsR[ 2 ][ 2 ] + a.e[ 2 ] * AbsR[ 0 ][ 2 ];
		rb = b.e[ 0 ] * AbsR[ 1 ][ 1 ] + b.e[ 1 ] * AbsR[ 1 ][ 0 ];
		if ( Math.abs( t[ 0 ] * R[ 2 ][ 2 ] - t[ 2 ] * R[ 0 ][ 2 ] ) > ra + rb ) return false;

		// test axis L = A2 x B0

		ra = a.e[ 0 ] * AbsR[ 1 ][ 0 ] + a.e[ 1 ] * AbsR[ 0 ][ 0 ];
		rb = b.e[ 1 ] * AbsR[ 2 ][ 2 ] + b.e[ 2 ] * AbsR[ 2 ][ 1 ];
		if ( Math.abs( t[ 1 ] * R[ 0 ][ 0 ] - t[ 0 ] * R[ 1 ][ 0 ] ) > ra + rb ) return false;

		// test axis L = A2 x B1

		ra = a.e[ 0 ] * AbsR[ 1 ][ 1 ] + a.e[ 1 ] * AbsR[ 0 ][ 1 ];
		rb = b.e[ 0 ] * AbsR[ 2 ][ 2 ] + b.e[ 2 ] * AbsR[ 2 ][ 0 ];
		if ( Math.abs( t[ 1 ] * R[ 0 ][ 1 ] - t[ 0 ] * R[ 1 ][ 1 ] ) > ra + rb ) return false;

		// test axis L = A2 x B2

		ra = a.e[ 0 ] * AbsR[ 1 ][ 2 ] + a.e[ 1 ] * AbsR[ 0 ][ 2 ];
		rb = b.e[ 0 ] * AbsR[ 2 ][ 1 ] + b.e[ 1 ] * AbsR[ 2 ][ 0 ];
		if ( Math.abs( t[ 1 ] * R[ 0 ][ 2 ] - t[ 0 ] * R[ 1 ][ 2 ] ) > ra + rb ) return false;

		// since no separating axis is found, the OBBs must be intersecting

		return true;

	}

	/**
	* Returns true if the given plane intersects this OBB.
	*
	* Reference: Testing Box Against Plane in Real-Time Collision Detection
	* by Christer Ericson (chapter 5.2.3)
	*
	* @param {Plane} plane - The plane to test.
	* @return {Boolean} The result of the intersection test.
	*/
	intersectsPlane( plane ) {

		this.rotation.extractBasis( xAxis, yAxis, zAxis );

		// compute the projection interval radius of this OBB onto L(t) = this->center + t * p.normal;

		const r = this.halfSizes.x * Math.abs( plane.normal.dot( xAxis ) ) +
				this.halfSizes.y * Math.abs( plane.normal.dot( yAxis ) ) +
				this.halfSizes.z * Math.abs( plane.normal.dot( zAxis ) );

		// compute distance of the OBB's center from the plane

		const d = plane.normal.dot( this.center ) - plane.constant;

		// Intersection occurs when distance d falls within [-r,+r] interval

		return Math.abs( d ) <= r;

	}

	/**
	* Computes the OBB from an AABB.
	*
	* @param {AABB} aabb - The AABB.
	* @return {OBB} A reference to this OBB.
	*/
	fromAABB( aabb ) {

		aabb.getCenter( this.center );

		aabb.getSize( this.halfSizes ).multiplyScalar( 0.5 );

		this.rotation.identity();

		return this;

	}

	/**
	* Computes the minimum enclosing OBB for the given set of points. The method is an
	* implementation of {@link http://gamma.cs.unc.edu/users/gottschalk/main.pdf Collision Queries using Oriented Bounding Boxes}
	* by Stefan Gottschalk.
	* According to the dissertation, the quality of the fitting process varies from
	* the respective input. This method uses the best approach by computing the
	* covariance matrix based on the triangles of the convex hull (chapter 3.4.3).
	*
	* However, the implementation is susceptible to {@link https://en.wikipedia.org/wiki/Regular_polygon regular polygons}
	* like cubes or spheres. For such shapes, it's recommended to verify the quality
	* of the produced OBB. Consider to use an AABB or bounding sphere if the result
	* is not satisfying.
	*
	* @param {Array<Vector3>} points - An array of 3D vectors representing points in 3D space.
	* @return {OBB} A reference to this OBB.
	*/
	fromPoints( points ) {

		const convexHull = new ConvexHull().fromPoints( points );

		// 1. iterate over all faces of the convex hull and triangulate

		const faces = convexHull.faces;
		const edges = new Array();
		const triangles = new Array();

		for ( let i = 0, il = faces.length; i < il; i ++ ) {

			const face = faces[ i ];
			let edge = face.edge;

			edges.length = 0;

			// gather edges

			do {

				edges.push( edge );

				edge = edge.next;

			} while ( edge !== face.edge );

			// triangulate

			const triangleCount = ( edges.length - 2 );

			for ( let j = 1, jl = triangleCount; j <= jl; j ++ ) {

				const v1 = edges[ 0 ].vertex;
				const v2 = edges[ j + 0 ].vertex;
				const v3 = edges[ j + 1 ].vertex;

				triangles.push( v1.x, v1.y, v1.z );
				triangles.push( v2.x, v2.y, v2.z );
				triangles.push( v3.x, v3.y, v3.z );

			}

		}

		// 2. build covariance matrix

		const p = new Vector3();
		const q = new Vector3();
		const r = new Vector3();

		const qp = new Vector3();
		const rp = new Vector3();

		const v = new Vector3();

		const mean = new Vector3();
		const weightedMean = new Vector3();
		let areaSum = 0;

		let cxx, cxy, cxz, cyy, cyz, czz;
		cxx = cxy = cxz = cyy = cyz = czz = 0;

		for ( let i = 0, l = triangles.length; i < l; i += 9 ) {

			p.fromArray( triangles, i );
			q.fromArray( triangles, i + 3 );
			r.fromArray( triangles, i + 6 );

			mean.set( 0, 0, 0 );
			mean.add( p ).add( q ).add( r ).divideScalar( 3 );

			qp.subVectors( q, p );
			rp.subVectors( r, p );

			const area = v.crossVectors( qp, rp ).length() / 2; // .length() represents the frobenius norm here
			weightedMean.add( v.copy( mean ).multiplyScalar( area ) );

			areaSum += area;

			cxx += ( 9.0 * mean.x * mean.x + p.x * p.x + q.x * q.x + r.x * r.x ) * ( area / 12 );
			cxy += ( 9.0 * mean.x * mean.y + p.x * p.y + q.x * q.y + r.x * r.y ) * ( area / 12 );
			cxz += ( 9.0 * mean.x * mean.z + p.x * p.z + q.x * q.z + r.x * r.z ) * ( area / 12 );
			cyy += ( 9.0 * mean.y * mean.y + p.y * p.y + q.y * q.y + r.y * r.y ) * ( area / 12 );
			cyz += ( 9.0 * mean.y * mean.z + p.y * p.z + q.y * q.z + r.y * r.z ) * ( area / 12 );
			czz += ( 9.0 * mean.z * mean.z + p.z * p.z + q.z * q.z + r.z * r.z ) * ( area / 12 );

		}

		weightedMean.divideScalar( areaSum );

		cxx /= areaSum;
		cxy /= areaSum;
		cxz /= areaSum;
		cyy /= areaSum;
		cyz /= areaSum;
		czz /= areaSum;

		cxx -= weightedMean.x * weightedMean.x;
		cxy -= weightedMean.x * weightedMean.y;
		cxz -= weightedMean.x * weightedMean.z;
		cyy -= weightedMean.y * weightedMean.y;
		cyz -= weightedMean.y * weightedMean.z;
		czz -= weightedMean.z * weightedMean.z;

		const covarianceMatrix = new Matrix3();

		covarianceMatrix.elements[ 0 ] = cxx;
		covarianceMatrix.elements[ 1 ] = cxy;
		covarianceMatrix.elements[ 2 ] = cxz;
		covarianceMatrix.elements[ 3 ] = cxy;
		covarianceMatrix.elements[ 4 ] = cyy;
		covarianceMatrix.elements[ 5 ] = cyz;
		covarianceMatrix.elements[ 6 ] = cxz;
		covarianceMatrix.elements[ 7 ] = cyz;
		covarianceMatrix.elements[ 8 ] = czz;

		// 3. compute rotation, center and half sizes

		covarianceMatrix.eigenDecomposition( eigenDecomposition );

		const unitary = eigenDecomposition.unitary;

		const v1 = new Vector3();
		const v2 = new Vector3();
		const v3 = new Vector3();

		unitary.extractBasis( v1, v2, v3 );

		let u1 = - Infinity;
		let u2 = - Infinity;
		let u3 = - Infinity;
		let l1 = Infinity;
		let l2 = Infinity;
		let l3 = Infinity;

		for ( let i = 0, l = points.length; i < l; i ++ ) {

			const p = points[ i ];

			u1 = Math.max( v1.dot( p ), u1 );
			u2 = Math.max( v2.dot( p ), u2 );
			u3 = Math.max( v3.dot( p ), u3 );

			l1 = Math.min( v1.dot( p ), l1 );
			l2 = Math.min( v2.dot( p ), l2 );
			l3 = Math.min( v3.dot( p ), l3 );

		}

		v1.multiplyScalar( 0.5 * ( l1 + u1 ) );
		v2.multiplyScalar( 0.5 * ( l2 + u2 ) );
		v3.multiplyScalar( 0.5 * ( l3 + u3 ) );

		// center

		this.center.add( v1 ).add( v2 ).add( v3 );

		this.halfSizes.x = u1 - l1;
		this.halfSizes.y = u2 - l2;
		this.halfSizes.z = u3 - l3;

		// halfSizes

		this.halfSizes.multiplyScalar( 0.5 );

		// rotation

		this.rotation.copy( unitary );

		return this;

	}

	/**
	* Returns true if the given OBB is deep equal with this OBB.
	*
	* @param {OBB} obb - The OBB to test.
	* @return {Boolean} The result of the equality test.
	*/
	equals( obb ) {

		return obb.center.equals( this.center ) &&
				obb.halfSizes.equals( this.halfSizes ) &&
				obb.rotation.equals( this.rotation );

	}

	/**
	* Transforms this instance into a JSON object.
	*
	* @return {Object} The JSON object.
	*/
	toJSON() {

		return {
			type: this.constructor.name,
			center: this.center.toArray( new Array() ),
			halfSizes: this.halfSizes.toArray( new Array() ),
			rotation: this.rotation.toArray( new Array() )
		};

	}

	/**
	* Restores this instance from the given JSON object.
	*
	* @param {Object} json - The JSON object.
	* @return {OBB} A reference to this OBB.
	*/
	fromJSON( json ) {

		this.center.fromArray( json.center );
		this.halfSizes.fromArray( json.halfSizes );
		this.rotation.fromArray( json.rotation );

		return this;

	}

}

const obb = new OBB();

/**
* Class for representing navigation edges.
*
* @author {@link https://github.com/Mugen87|Mugen87}
* @augments Edge
*/
class NavEdge extends Edge {

	/**
	* Constructs a navigation edge.
	*
	* @param {Number} from - The index of the from node.
	* @param {Number} to - The index of the to node.
	* @param {Number} cost - The cost of this edge.
	*/
	constructor( from = - 1, to = - 1, cost = 0 ) {

		super( from, to, cost );

	}

}

/**
* Class for representing navigation nodes.
*
* @author {@link https://github.com/Mugen87|Mugen87}
* @augments Node
*/
class NavNode extends Node {

	/**
	* Constructs a new navigation node.
	*
	* @param {Number} index - The unique index of this node.
	* @param {Vector3} position - The position of the node in 3D space.
	* @param {Object} userData - Custom user data connected to this node.
	*/
	constructor( index = - 1, position = new Vector3(), userData = {} ) {

		super( index );

		/**
		* The position of the node in 3D space.
		* @type {Vector3}
		*/
		this.position = position;

		/**
		* Custom user data connected to this node.
		* @type {Object}
		*/
		this.userData = userData;

	}

}

/**
* Class with graph helpers.
*
* @author {@link https://github.com/Mugen87|Mugen87}
*/
class GraphUtils {

	/**
	* Generates a navigation graph with a planar grid layout based on the given parameters.
	*
	* @param {Number} size - The size (width and depth) in x and z direction
	* @param {Number} segments - The amount of segments in x and z direction.
	* @return {Graph} The new graph.
	*/
	static createGridLayout( size, segments ) {

		const graph = new Graph();
		graph.digraph = true;

		const halfSize = size / 2;
		const segmentSize = size / segments;

		// nodes

		let index = 0;

		for ( let i = 0; i <= segments; i ++ ) {

			const z = ( i * segmentSize ) - halfSize;

			for ( let j = 0; j <= segments; j ++ ) {

				const x = ( j * segmentSize ) - halfSize;

				const position = new Vector3( x, 0, z );

				const node = new NavNode( index, position );

				graph.addNode( node );

				index ++;

			}

		}

		// edges

		const count = graph.getNodeCount();
		const range = Math.pow( segmentSize + ( segmentSize / 2 ), 2 );

		for ( let i = 0; i < count; i ++ ) {

			const node = graph.getNode( i );

			// check distance to all other nodes

			for ( let j = 0; j < count; j ++ ) {

				if ( i !== j ) {

					const neighbor = graph.getNode( j );

					const distanceSquared = neighbor.position.squaredDistanceTo( node.position );

					if ( distanceSquared <= range ) {

						const distance = Math.sqrt( distanceSquared );

						const edge = new NavEdge( i, j, distance );

						graph.addEdge( edge );

					}

				}

			}

		}

		return graph;

	}

}

/**
* A corridor is a sequence of portal edges representing a walkable way within a navigation mesh. The class is able
* to find the shortest path through this corridor as a sequence of waypoints. It's an implementation of the so called
* {@link http://digestingduck.blogspot.com/2010/03/simple-stupid-funnel-algorithm.html Funnel Algorithm}. Read
* the paper {@link https://aaai.org/Papers/AAAI/2006/AAAI06-148.pdf Efficient Triangulation-Based Pathfinding} for
* more detailed information.
*
* @author {@link https://github.com/Mugen87|Mugen87}
* @author {@link https://github.com/robp94|robp94}
*/
class Corridor {

	/**
	* Creates a new corridor.
	*/
	constructor() {

		/**
		* The portal edges of the corridor.
		* @type {Array<Object>}
		*/
		this.portalEdges = new Array();

	}

	/**
	* Adds a portal edge defined by its left and right vertex to this corridor.
	*
	* @param {Vector3} left - The left point (origin) of the portal edge.
	* @param {Vector3} right - The right point (destination) of the portal edge.
	* @return {Corridor} A reference to this corridor.
	*/
	push( left, right ) {

		this.portalEdges.push( {
			left: left,
			right: right
		} );

		return this;

	}

	/**
	* Generates the shortest path through the corridor as an array of 3D vectors.
	*
	* @return {Array<Vector3>} An array of 3D waypoints.
	*/
	generate() {

		const portalEdges = this.portalEdges;
		const path = new Array();

		// init scan state

		let portalApex, portalLeft, portalRight;
		let apexIndex = 0, leftIndex = 0, rightIndex = 0;

		portalApex = portalEdges[ 0 ].left;
		portalLeft = portalEdges[ 0 ].left;
		portalRight = portalEdges[ 0 ].right;

		// add start point

		path.push( portalApex );

		for ( let i = 1, l = portalEdges.length; i < l; i ++ ) {

			const left = portalEdges[ i ].left;
			const right = portalEdges[ i ].right;

			// update right vertex

			if ( MathUtils.area( portalApex, portalRight, right ) <= 0 ) {

				if ( portalApex === portalRight || MathUtils.area( portalApex, portalLeft, right ) > 0 ) {

					// tighten the funnel

					portalRight = right;
					rightIndex = i;

				} else {

					// right over left, insert left to path and restart scan from portal left point

					path.push( portalLeft );

					// make current left the new apex

					portalApex = portalLeft;
					apexIndex = leftIndex;

					// review eset portal

					portalLeft = portalApex;
					portalRight = portalApex;
					leftIndex = apexIndex;
					rightIndex = apexIndex;

					// restart scan

					i = apexIndex;

					continue;

				}

			}

			// update left vertex

			if ( MathUtils.area( portalApex, portalLeft, left ) >= 0 ) {

				if ( portalApex === portalLeft || MathUtils.area( portalApex, portalRight, left ) < 0 ) {

					// tighten the funnel

					portalLeft = left;
					leftIndex = i;

				} else {

					// left over right, insert right to path and restart scan from portal right point

					path.push( portalRight );

					// make current right the new apex

					portalApex = portalRight;
					apexIndex = rightIndex;

					// reset portal

					portalLeft = portalApex;
					portalRight = portalApex;
					leftIndex = apexIndex;
					rightIndex = apexIndex;

					// restart scan

					i = apexIndex;

					continue;

				}

			}

		}

		if ( ( path.length === 0 ) || ( path[ path.length - 1 ] !== portalEdges[ portalEdges.length - 1 ].left ) ) {

			// append last point to path

			path.push( portalEdges[ portalEdges.length - 1 ].left );

		}

		return path;

	}

}

/**
* A lookup table representing the cost associated from traveling from one
* node to every other node in the navgiation mesh's graph.
*
* @author {@link https://github.com/Mugen87|Mugen87}
*/
class CostTable {

	/**
	* Creates a new cost table.
	*/
	constructor() {

		this._nodeMap = new Map();

	}

	/**
	* Inits the cost table for the given navigation mesh.
	*
	* @param {NavMesh} navMesh - The navigation mesh.
	* @return {CostTable} A reference to this cost table.
	*/
	init( navMesh ) {

		const graph = navMesh.graph;
		const nodes = new Array();

		this.clear();

		// iterate over all nodes

		graph.getNodes( nodes );

		for ( let i = 0, il = nodes.length; i < il; i ++ ) {

			const from = nodes[ i ];

			// compute the distance to all other nodes

			for ( let j = 0, jl = nodes.length; j < jl; j ++ ) {

				const to = nodes[ j ];

				const path = navMesh.findPath( from.position, to.position );
				const cost = computeDistanceOfPath( path );

				this.set( from.index, to.index, cost );

			}

		}

		return this;

	}

	/**
	* Clears the cost table.
	*
	* @return {CostTable} A reference to this cost table.
	*/
	clear() {

		this._nodeMap.clear();

		return this;

	}

	/**
	* Sets the cost for the given pair of navigation nodes.
	*
	* @param {Number} from - The start node index.
	* @param {Number} to - The destintation node index.
	* @param {Number} cost - The cost.
	* @return {CostTable} A reference to this cost table.
	*/
	set( from, to, cost ) {

		const nodeMap = this._nodeMap;

		if ( nodeMap.has( from ) === false ) nodeMap.set( from, new Map() );

		const nodeCostMap = nodeMap.get( from );

		nodeCostMap.set( to, cost );

		return this;

	}

	/**
	* Returns the cost for the given pair of navigation nodes.
	*
	* @param {Number} from - The start node index.
	* @param {Number} to - The destintation node index.
	* @return {Number} The cost.
	*/
	get( from, to ) {

		const nodeCostMap = this._nodeMap.get( from );

		return nodeCostMap.get( to );

	}

	/**
	* Returns the size of the cost table (amount of entries).
	*
	* @return {Number} The size of the cost table.
	*/
	size() {

		return this._nodeMap.size;

	}

	/**
	* Transforms this instance into a JSON object.
	*
	* @return {Object} The JSON object.
	*/
	toJSON() {

		const json = {
			nodes: new Array()
		};

		for ( let [ key, value ] of this._nodeMap.entries() ) {

			json.nodes.push( { index: key, costs: Array.from( value ) } );

		}

		return json;

	}

	/**
	* Restores this instance from the given JSON object.
	*
	* @param {Object} json - The JSON object.
	* @return {CostTable} A reference to this cost table.
	*/
	fromJSON( json ) {

		const nodes = json.nodes;

		for ( let i = 0, l = nodes.length; i < l; i ++ ) {

			const node = nodes[ i ];

			const index = node.index;
			const costs = new Map( node.costs );

			this._nodeMap.set( index, costs );

		}

		return this;

	}

}

//

function computeDistanceOfPath( path ) {

	let distance = 0;

	for ( let i = 0, l = ( path.length - 1 ); i < l; i ++ ) {

		const from = path[ i ];
		const to = path[ i + 1 ];

		distance += from.distanceTo( to );

	}

	return distance;

}

const pointOnLineSegment = new Vector3();
const edgeDirection = new Vector3();
const movementDirection = new Vector3();
const newPosition = new Vector3();
const lineSegment$1 = new LineSegment();
const edges = new Array();
const closestBorderEdge = {
	edge: null,
	closestPoint: new Vector3()
};

/**
* Implementation of a navigation mesh. A navigation mesh is a network of convex polygons
* which define the walkable areas of a game environment. A convex polygon allows unobstructed travel
* from any point in the polygon to any other. This is useful because it enables the navigation mesh
* to be represented using a graph where each node represents a convex polygon and their respective edges
* represent the neighborly relations to other polygons. More compact navigation graphs lead
* to faster graph search execution.
*
* This particular implementation is able to merge convex polygons into bigger ones as long
* as they keep their convexity and coplanarity. The performance of the path finding process and convex region tests
* for complex navigation meshes can be improved by using a spatial index like {@link CellSpacePartitioning}.
*
* @author {@link https://github.com/Mugen87|Mugen87}
* @author {@link https://github.com/robp94|robp94}
*/
class NavMesh {

	/**
	* Constructs a new navigation mesh.
	*/
	constructor() {

		/**
		* The internal navigation graph of this navigation mesh representing neighboring polygons.
		* @type {Graph}
		*/
		this.graph = new Graph();
		this.graph.digraph = true;

		/**
		* The list of convex regions.
		* @type {Array<Polygon>}
		*/
		this.regions = new Array();

		/**
		* A reference to a spatial index.
		* @type {?CellSpacePartitioning}
		* @default null
		*/
		this.spatialIndex = null;

		/**
		* The tolerance value for the coplanar test.
		* @type {Number}
		* @default 1e-3
		*/
		this.epsilonCoplanarTest = 1e-3;

		/**
		* The tolerance value for the containment test.
		* @type {Number}
		* @default 1
		*/
		this.epsilonContainsTest = 1;

		/**
		* Whether convex regions should be merged or not.
		* @type {Boolean}
		* @default true
		*/
		this.mergeConvexRegions = true;

		//

		this._borderEdges = new Array();

	}

	/**
	* Creates the navigation mesh from an array of convex polygons.
	*
	* @param {Array<Polygon>} polygons - An array of convex polygons.
	* @return {NavMesh} A reference to this navigation mesh.
	*/
	fromPolygons( polygons ) {

		this.clear();

		//

		const initialEdgeList = new Array();
		const sortedEdgeList = new Array();

		// setup list with all edges

		for ( let i = 0, l = polygons.length; i < l; i ++ ) {

			const polygon = polygons[ i ];

			let edge = polygon.edge;

			do {

				initialEdgeList.push( edge );

				edge = edge.next;

			} while ( edge !== polygon.edge );

			//

			this.regions.push( polygon );

		}

		// setup twin references and sorted list of edges

		for ( let i = 0, il = initialEdgeList.length; i < il; i ++ ) {

			let edge0 = initialEdgeList[ i ];

			if ( edge0.twin !== null ) continue;

			for ( let j = i + 1, jl = initialEdgeList.length; j < jl; j ++ ) {

				let edge1 = initialEdgeList[ j ];

				if ( edge0.tail().equals( edge1.head() ) && edge0.head().equals( edge1.tail() ) ) {

					// opponent edge found, set twin references

					edge0.linkOpponent( edge1 );

					// add edge to list

					const cost = edge0.squaredLength();

					sortedEdgeList.push( {
						cost: cost,
						edge: edge0
					} );

					// there can only be a single twin

					break;

				}

			}

		}

		sortedEdgeList.sort( descending );

		// half-edge data structure is now complete, begin build of convex regions

		this._buildRegions( sortedEdgeList );

		// now build the navigation graph

		this._buildGraph();

		return this;

	}

	/**
	* Clears the internal state of this navigation mesh.
	*
	* @return {NavMesh} A reference to this navigation mesh.
	*/
	clear() {

		this.graph.clear();
		this.regions.length = 0;
		this.spatialIndex = null;

		return this;

	}

	/**
	* Returns the closest convex region for the given point in 3D space.
	*
	* @param {Vector3} point - A point in 3D space.
	* @return {Polygon} The closest convex region.
	*/
	getClosestRegion( point ) {

		const regions = this.regions;
		let closesRegion = null;
		let minDistance = Infinity;

		for ( let i = 0, l = regions.length; i < l; i ++ ) {

			const region = regions[ i ];

			const distance = point.squaredDistanceTo( region.centroid );

			if ( distance < minDistance ) {

				minDistance = distance;

				closesRegion = region;

			}

		}

		return closesRegion;

	}

	/**
	* Returns at random a convex region from the navigation mesh.
	*
	* @return {Polygon} The convex region.
	*/
	getRandomRegion() {

		const regions = this.regions;

		let index = Math.floor( Math.random() * ( regions.length ) );

		if ( index === regions.length ) index = regions.length - 1;

		return regions[ index ];

	}

	/**
	* Returns the region that contains the given point. The computational overhead
	* of this method for complex navigation meshes can be reduced by using a spatial index.
	* If no convex region contains the point, *null* is returned.
	*
	* @param {Vector3} point - A point in 3D space.
	* @param {Number} epsilon - Tolerance value for the containment test.
	* @return {Polygon} The convex region that contains the point.
	*/
	getRegionForPoint( point, epsilon = 1e-3 ) {

		let regions;

		if ( this.spatialIndex !== null ) {

			const index = this.spatialIndex.getIndexForPosition( point );
			regions = this.spatialIndex.cells[ index ].entries;

		} else {

			regions = this.regions;

		}

		//

		for ( let i = 0, l = regions.length; i < l; i ++ ) {

			const region = regions[ i ];

			if ( region.contains( point, epsilon ) === true ) {

				return region;

			}

		}

		return null;

	}

	/**
	* Returns the node index for the given region. The index represents
	* the navigation node of a region in the navigation graph.
	*
	* @param {Polygon} region - The convex region.
	* @return {Number} The respective node index.
	*/
	getNodeIndex( region ) {

		return this.regions.indexOf( region );

	}

	/**
	* Returns the shortest path that leads from the given start position to the end position.
	* The computational overhead of this method for complex navigation meshes can greatly
	* reduced by using a spatial index.
	*
	* @param {Vector3} from - The start/source position.
	* @param {Vector3} to - The end/destination position.
	* @return {Array<Vector3>} The shortest path as an array of points.
	*/
	findPath( from, to ) {

		const graph = this.graph;
		const path = new Array();

		let fromRegion = this.getRegionForPoint( from, this.epsilonContainsTest );
		let toRegion = this.getRegionForPoint( to, this.epsilonContainsTest );

		if ( fromRegion === null || toRegion === null ) {

			// if source or target are outside the navmesh, choose the nearest convex region

			if ( fromRegion === null ) fromRegion = this.getClosestRegion( from );
			if ( toRegion === null ) toRegion = this.getClosestRegion( to );

		}

		// check if both convex region are identical

		if ( fromRegion === toRegion ) {

			// no search necessary, directly create the path

			path.push( new Vector3().copy( from ) );
			path.push( new Vector3().copy( to ) );
			return path;

		} else {

			// source and target are not in same region, perform search

			const source = this.getNodeIndex( fromRegion );
			const target = this.getNodeIndex( toRegion );

			const astar = new AStar( graph, source, target );
			astar.search();

			if ( astar.found === true ) {

				const polygonPath = astar.getPath();

				const corridor = new Corridor();
				corridor.push( from, from );

				// push sequence of portal edges to corridor

				const portalEdge = { left: null, right: null };

				for ( let i = 0, l = ( polygonPath.length - 1 ); i < l; i ++ ) {

					const region = this.regions[ polygonPath[ i ] ];
					const nextRegion = this.regions[ polygonPath[ i + 1 ] ];

					this._getPortalEdge( region, nextRegion, portalEdge );

					corridor.push( portalEdge.left, portalEdge.right );

				}

				corridor.push( to, to );

				path.push( ...corridor.generate() );

			}

			return path;

		}

	}

	/**
	* This method can be used to restrict the movement of a game entity on the navigation mesh.
	* Instead of preventing any form of translation when a game entity hits a border edge, the
	* movement is clamped along the contour of the navigation mesh. The computational overhead
	* of this method for complex navigation meshes can be reduced by using a spatial index.
	*
	* @param {Polygon} currentRegion - The current convex region of the game entity.
	* @param {Vector3} startPosition - The original start position of the entity for the current simulation step.
	* @param {Vector3} endPosition - The original end position of the entity for the current simulation step.
	* @param {Vector3} clampPosition - The clamped position of the entity for the current simulation step.
	* @return {Polygon} The new convex region the game entity is in.
	*/
	clampMovement( currentRegion, startPosition, endPosition, clampPosition ) {

		let newRegion = this.getRegionForPoint( endPosition, this.epsilonContainsTest );

		// if newRegion is null, "endPosition" lies outside of the navMesh

		if ( newRegion === null ) {

			if ( currentRegion === null ) throw new Error( 'YUKA.NavMesh.clampMovement(): No current region available.' );

			// determine closest border edge

			this._getClosestBorderEdge( startPosition, closestBorderEdge );

			const closestEdge = closestBorderEdge.edge;
			const closestPoint = closestBorderEdge.closestPoint;

			// calculate movement and edge direction

			closestEdge.getDirection( edgeDirection );
			const length = movementDirection.subVectors( endPosition, startPosition ).length();

			// this value influences the speed at which the entity moves along the edge

			let f = 0;

			// if startPosition and endPosition are equal, length becomes zero.
			// it's important to test this edge case in order to avoid NaN values.

			if ( length !== 0 ) {

				movementDirection.divideScalar( length );

				f = edgeDirection.dot( movementDirection );

			}

			// calculate new position on the edge

			newPosition.copy( closestPoint ).add( edgeDirection.multiplyScalar( f * length ) );

			// the following value "t" tells us if the point exceeds the line segment

			lineSegment$1.set( closestEdge.prev.vertex, closestEdge.vertex );
			const t = lineSegment$1.closestPointToPointParameter( newPosition, false );

			//

			if ( t >= 0 && t <= 1 ) {

				// point is within line segment, we can safely use the new position

				clampPosition.copy( newPosition );

			} else {

				// check, if the new point lies outside the navMesh

				newRegion = this.getRegionForPoint( newPosition, this.epsilonContainsTest );

				if ( newRegion !== null ) {

					// if not, everything is fine

					clampPosition.copy( newPosition );
					return newRegion;

				}

				// otherwise prevent movement

				clampPosition.copy( startPosition );

			}

			return currentRegion;

		} else {

			// return the new region

			return newRegion;

		}

	}

	/**
	* Updates the spatial index by assigning all convex regions to the
	* partitions of the spatial index.
	*
	* @return {NavMesh} A reference to this navigation mesh.
	*/
	updateSpatialIndex() {

		if ( this.spatialIndex !== null ) {

			this.spatialIndex.makeEmpty();

			const regions = this.regions;

			for ( let i = 0, l = regions.length; i < l; i ++ ) {

				const region = regions[ i ];

				this.spatialIndex.addPolygon( region );

			}

		}

		return this;

	}

	_buildRegions( edgeList ) {

		const regions = this.regions;

		const cache = {
			leftPrev: null,
			leftNext: null,
			rightPrev: null,
			rightNext: null
		};

		if ( this.mergeConvexRegions === true ) {

			// process edges from longest to shortest

			for ( let i = 0, l = edgeList.length; i < l; i ++ ) {

				const entry = edgeList[ i ];

				let candidate = entry.edge;

				// cache current references for possible restore

				cache.prev = candidate.prev;
				cache.next = candidate.next;
				cache.prevTwin = candidate.twin.prev;
				cache.nextTwin = candidate.twin.next;

				// temporarily change the first polygon in order to represent both polygons

				candidate.prev.next = candidate.twin.next;
				candidate.next.prev = candidate.twin.prev;
				candidate.twin.prev.next = candidate.next;
				candidate.twin.next.prev = candidate.prev;

				const polygon = candidate.polygon;
				polygon.edge = candidate.prev;

				if ( polygon.convex() === true && polygon.coplanar( this.epsilonCoplanarTest ) === true ) {

					// correct polygon reference of all edges

					let edge = polygon.edge;

					do {

						edge.polygon = polygon;

						edge = edge.next;

					} while ( edge !== polygon.edge );

					// delete obsolete polygon

					const index = regions.indexOf( entry.edge.twin.polygon );
					regions.splice( index, 1 );

				} else {

					// restore

					cache.prev.next = candidate;
					cache.next.prev = candidate;
					cache.prevTwin.next = candidate.twin;
					cache.nextTwin.prev = candidate.twin;

					polygon.edge = candidate;

				}

			}

		}

		// after the merging of convex regions, do some post-processing

		for ( let i = 0, l = regions.length; i < l; i ++ ) {

			const region = regions[ i ];

			// compute the centroid of the region which can be used as
			// a destination point in context of path finding

			region.computeCentroid();

			// gather all border edges used by clampMovement()

			let edge = region.edge;

			do {

				if ( edge.twin === null ) this._borderEdges.push( edge );

				edge = edge.next;

			} while ( edge !== region.edge );

		}

	}

	_buildGraph() {

		const graph = this.graph;
		const regions = this.regions;

		// for each region, the code creates an array of directly accessible regions

		const regionNeighbourhood = new Array();

		for ( let i = 0, l = regions.length; i < l; i ++ ) {

			const region = regions[ i ];

			const nodeIndices = new Array();
			regionNeighbourhood.push( nodeIndices );

			let edge = region.edge;

			// iterate through all egdes of the region (in other words: along its contour)

			do {

				// check for a portal edge

				if ( edge.twin !== null ) {

					const nodeIndex = this.getNodeIndex( edge.twin.polygon );

					nodeIndices.push( nodeIndex ); // the node index of the adjacent region

					// add node for this region to the graph if necessary

					if ( graph.hasNode( this.getNodeIndex( edge.polygon ) ) === false ) {

						const node = new NavNode( this.getNodeIndex( edge.polygon ), edge.polygon.centroid );

						graph.addNode( node );

					}

				}

				edge = edge.next;

			} while ( edge !== region.edge );

		}

		// add navigation edges

		for ( let i = 0, il = regionNeighbourhood.length; i < il; i ++ ) {

			const indices = regionNeighbourhood[ i ];
			const from = i;

			for ( let j = 0, jl = indices.length; j < jl; j ++ ) {

				const to = indices[ j ];

				if ( from !== to ) {

					if ( graph.hasEdge( from, to ) === false ) {

						const nodeFrom = graph.getNode( from );
						const nodeTo = graph.getNode( to );

						const cost = nodeFrom.position.distanceTo( nodeTo.position );

						graph.addEdge( new NavEdge( from, to, cost ) );

					}

				}

			}

		}

		return this;

	}

	_getClosestBorderEdge( point, closestBorderEdge ) {

		let borderEdges;
		let minDistance = Infinity;

		if ( this.spatialIndex !== null ) {

			edges.length = 0;

			const index = this.spatialIndex.getIndexForPosition( point );
			const regions = this.spatialIndex.cells[ index ].entries;

			for ( let i = 0, l = regions.length; i < l; i ++ ) {

				const region = regions[ i ];

				let edge = region.edge;

				do {

					if ( edge.twin === null ) edges.push( edge );

					edge = edge.next;

				} while ( edge !== region.edge );

			}

			// use only border edges from adjacent convex regions (fast)

			borderEdges = edges;

		} else {

			// use all border edges (slow)

			borderEdges = this._borderEdges;

		}

		//

		for ( let i = 0, l = borderEdges.length; i < l; i ++ ) {

			const edge = borderEdges[ i ];

			lineSegment$1.set( edge.prev.vertex, edge.vertex );
			const t = lineSegment$1.closestPointToPointParameter( point );
			lineSegment$1.at( t, pointOnLineSegment );

			const distance = pointOnLineSegment.squaredDistanceTo( point );

			if ( distance < minDistance ) {

				minDistance = distance;

				closestBorderEdge.edge = edge;
				closestBorderEdge.closestPoint.copy( pointOnLineSegment );

			}

		}

		return this;

	}

	// Determines the portal edge that can be used to reach the given polygon over its twin reference.

	_getPortalEdge( region1, region2, portalEdge ) {

		let edge = region1.edge;

		do {

			if ( edge.twin !== null ) {

				if ( edge.twin.polygon === region2 ) {

					// the direction of portal edges are reversed. so "left" is the edge's origin vertex and "right"
					// is the destintation vertex. More details in issue #5

					portalEdge.left = edge.prev.vertex;
					portalEdge.right = edge.vertex;
					return portalEdge;

				}

			}

			edge = edge.next;

		} while ( edge !== region1.edge );

		portalEdge.left = null;
		portalEdge.right = null;

		return portalEdge;

	}

}

//

function descending( a, b ) {

	return ( a.cost < b.cost ) ? 1 : ( a.cost > b.cost ) ? - 1 : 0;

}

/**
* Class for loading navigation meshes as glTF assets. The loader supports
* *glTF* and *glb* files, embedded buffers, index and non-indexed geometries.
* Interleaved geometry data are not yet supported.
*
* @author {@link https://github.com/Mugen87|Mugen87}
*/
class NavMeshLoader {

	/**
	* Loads a {@link NavMesh navigation mesh} from the given URL. The second parameter can be used
	* to influence the parsing of the navigation mesh.
	*
	* @param {String} url - The URL of the glTF asset.
	* @param {Object} options - The (optional) configuration object.
	* @return {Promise} A promise representing the loading and parsing process.
	*/
	load( url, options ) {

		return new Promise( ( resolve, reject ) => {

			fetch( url )

				.then( response => {

					if ( response.status >= 200 && response.status < 300 ) {

						return response.arrayBuffer();

					} else {

						const error = new Error( response.statusText || response.status );
						error.response = response;
						return Promise.reject( error );

					}

				} )

				.then( ( arrayBuffer ) => {

					return this.parse( arrayBuffer, url, options );

				} )

				.then( ( data ) => {

					resolve( data );

				} )

				.catch( ( error ) => {

					Logger.error( 'YUKA.NavMeshLoader: Unable to load navigation mesh.', error );

					reject( error );

				} );

		} );

	}

	/**
	* Use this method if you are loading the contents of a navmesh not via {@link NavMeshLoader#load}.
	* This is for example useful in a node environment.
	*
	* It's mandatory to use glb files with embedded buffer data if you are going to load nav meshes
	* in node.js.
	*
	* @param {ArrayBuffer} arrayBuffer - The array buffer.
	* @param {String} url - The (optional) URL.
	* @param {Object} options - The (optional) configuration object.
	* @return {Promise} A promise representing the parsing process.
	*/
	parse( arrayBuffer, url, options ) {

		const parser = new Parser();
		const decoder = new TextDecoder();
		let data;

		const magic = decoder.decode( new Uint8Array( arrayBuffer, 0, 4 ) );

		if ( magic === BINARY_EXTENSION_HEADER_MAGIC ) {

			parser.parseBinary( arrayBuffer );

			data = parser.extensions.get( 'BINARY' ).content;

		} else {

			data = decoder.decode( new Uint8Array( arrayBuffer ) );

		}

		const json = JSON.parse( data );

		if ( json.asset === undefined || json.asset.version[ 0 ] < 2 ) {

			throw new Error( 'YUKA.NavMeshLoader: Unsupported asset version.' );

		} else {

			const path = extractUrlBase( url );

			return parser.parse( json, path, options );

		}

	}

}

class Parser {

	constructor() {

		this.json = null;
		this.path = null;
		this.cache = new Map();
		this.extensions = new Map();

	}

	parse( json, path, options ) {

		this.json = json;
		this.path = path;

		// read the first mesh in the glTF file

		return this.getDependency( 'mesh', 0 ).then( ( data ) => {

			// parse the raw geometry data into a bunch of polygons

			const polygons = this.parseGeometry( data );

			// create and config navMesh

			const navMesh = new NavMesh();

			if ( options ) {

				if ( options.epsilonCoplanarTest !== undefined ) navMesh.epsilonCoplanarTest = options.epsilonCoplanarTest;
				if ( options.mergeConvexRegions !== undefined ) navMesh.mergeConvexRegions = options.mergeConvexRegions;

			}

			// use polygons to setup the nav mesh

			return navMesh.fromPolygons( polygons );

		} );

	}

	parseGeometry( data ) {

		const index = data.index;
		const position = data.position;

		const vertices = new Array();
		const polygons = new Array();

		// vertices

		for ( let i = 0, l = position.length; i < l; i += 3 ) {

			const v = new Vector3();

			v.x = position[ i + 0 ];
			v.y = position[ i + 1 ];
			v.z = position[ i + 2 ];

			vertices.push( v );

		}

		// polygons

		if ( index ) {

			// indexed geometry

			for ( let i = 0, l = index.length; i < l; i += 3 ) {

				const a = index[ i + 0 ];
				const b = index[ i + 1 ];
				const c = index[ i + 2 ];

				const contour = [ vertices[ a ], vertices[ b ], vertices[ c ] ];

				const polygon = new Polygon().fromContour( contour );

				polygons.push( polygon );

			}

		} else {

			// non-indexed geometry //todo test

			for ( let i = 0, l = vertices.length; i < l; i += 3 ) {

				const contour = [ vertices[ i + 0 ], vertices[ i + 1 ], vertices[ i + 2 ] ];

				const polygon = new Polygon().fromContour( contour );

				polygons.push( polygon );

			}

		}

		return polygons;

	}

	getDependencies( type ) {

		const cache = this.cache;

		let dependencies = cache.get( type );

		if ( ! dependencies ) {

			const definitions = this.json[ type + ( type === 'mesh' ? 'es' : 's' ) ] || new Array();

			dependencies = Promise.all( definitions.map( ( definition, index ) => {

				return this.getDependency( type, index );

			} ) );

			cache.set( type, dependencies );

		}

		return dependencies;

	}

	getDependency( type, index ) {

		const cache = this.cache;
		const key = type + ':' + index;

		let dependency = cache.get( key );

		if ( dependency === undefined ) {

			switch ( type ) {

				case 'accessor':
					dependency = this.loadAccessor( index );
					break;

				case 'buffer':
					dependency = this.loadBuffer( index );
					break;

				case 'bufferView':
					dependency = this.loadBufferView( index );
					break;

				case 'mesh':
					dependency = this.loadMesh( index );
					break;

				default:
					throw new Error( 'Unknown type: ' + type );

			}

			cache.set( key, dependency );

		}

		return dependency;

	}

	loadBuffer( index ) {

		const json = this.json;
		const definition = json.buffers[ index ];

		if ( definition.uri === undefined && index === 0 ) {

			return Promise.resolve( this.extensions.get( 'BINARY' ).body );

		}

		return new Promise( ( resolve, reject ) => {

			const url = resolveURI( definition.uri, this.path );

			fetch( url )

				.then( response => {

					return response.arrayBuffer();

				} )

				.then( ( arrayBuffer ) => {

					resolve( arrayBuffer );

				} ).catch( ( error ) => {

					Logger.error( 'YUKA.NavMeshLoader: Unable to load buffer.', error );

					reject( error );

				} );

		} );

	}

	loadBufferView( index ) {

		const json = this.json;

		const definition = json.bufferViews[ index ];

		return this.getDependency( 'buffer', definition.buffer ).then( ( buffer ) => {

			const byteLength = definition.byteLength || 0;
			const byteOffset = definition.byteOffset || 0;
			return buffer.slice( byteOffset, byteOffset + byteLength );

		} );

	}

	loadAccessor( index ) {

		const json = this.json;
		const definition = json.accessors[ index ];

		return this.getDependency( 'bufferView', definition.bufferView ).then( ( bufferView ) => {

			const itemSize = WEBGL_TYPE_SIZES[ definition.type ];
			const TypedArray = WEBGL_COMPONENT_TYPES[ definition.componentType ];
			const byteOffset = definition.byteOffset || 0;

			return new TypedArray( bufferView, byteOffset, definition.count * itemSize );

		} );

	}

	loadMesh( index ) {

		const json = this.json;
		const definition = json.meshes[ index ];

		return this.getDependencies( 'accessor' ).then( ( accessors ) => {

			// assuming a single primitive

			const primitive = definition.primitives[ 0 ];

			if ( primitive.mode !== undefined && primitive.mode !== 4 ) {

				throw new Error( 'YUKA.NavMeshLoader: Invalid geometry format. Please ensure to represent your geometry as triangles.' );

			}

			return {
				index: accessors[ primitive.indices ],
				position: accessors[ primitive.attributes.POSITION ],
				normal: accessors[ primitive.attributes.NORMAL ]
			};

		} );

	}

	parseBinary( data ) {

		const chunkView = new DataView( data, BINARY_EXTENSION_HEADER_LENGTH );
		let chunkIndex = 0;

		const decoder = new TextDecoder();
		let content = null;
		let body = null;

		while ( chunkIndex < chunkView.byteLength ) {

			const chunkLength = chunkView.getUint32( chunkIndex, true );
			chunkIndex += 4;

			const chunkType = chunkView.getUint32( chunkIndex, true );
			chunkIndex += 4;

			if ( chunkType === BINARY_EXTENSION_CHUNK_TYPES.JSON ) {

				const contentArray = new Uint8Array( data, BINARY_EXTENSION_HEADER_LENGTH + chunkIndex, chunkLength );
				content = decoder.decode( contentArray );

			} else if ( chunkType === BINARY_EXTENSION_CHUNK_TYPES.BIN ) {

				const byteOffset = BINARY_EXTENSION_HEADER_LENGTH + chunkIndex;
				body = data.slice( byteOffset, byteOffset + chunkLength );

			}

			chunkIndex += chunkLength;

		}

		this.extensions.set( 'BINARY', { content: content, body: body } );

	}

}

// helper functions

function extractUrlBase( url = '' ) {

	const index = url.lastIndexOf( '/' );

	if ( index === - 1 ) return './';

	return url.substr( 0, index + 1 );

}

function resolveURI( uri, path ) {

	if ( typeof uri !== 'string' || uri === '' ) return '';

	if ( /^(https?:)?\/\//i.test( uri ) ) return uri;

	if ( /^data:.*,.*$/i.test( uri ) ) return uri;

	if ( /^blob:.*$/i.test( uri ) ) return uri;

	return path + uri;

}

//

const WEBGL_TYPE_SIZES = {
	'SCALAR': 1,
	'VEC2': 2,
	'VEC3': 3,
	'VEC4': 4,
	'MAT2': 4,
	'MAT3': 9,
	'MAT4': 16
};

const WEBGL_COMPONENT_TYPES = {
	5120: Int8Array,
	5121: Uint8Array,
	5122: Int16Array,
	5123: Uint16Array,
	5125: Uint32Array,
	5126: Float32Array
};

const BINARY_EXTENSION_HEADER_MAGIC = 'glTF';
const BINARY_EXTENSION_HEADER_LENGTH = 12;
const BINARY_EXTENSION_CHUNK_TYPES = { JSON: 0x4E4F534A, BIN: 0x004E4942 };

/**
* Class for representing a single partition in context of cell-space partitioning.
*
* @author {@link https://github.com/Mugen87|Mugen87}
*/
class Cell {

	/**
	* Constructs a new cell with the given values.
	*
	* @param {AABB} aabb - The bounding volume of the cell.
	*/
	constructor( aabb = new AABB() ) {

		/**
		* The bounding volume of the cell.
		* @type {AABB}
		*/
		this.aabb = aabb;

		/**
		* The list of entries which belong to this cell.
		* @type {Array<Any>}
		* @readonly
		*/
		this.entries = new Array();

	}

	/**
	* Adds an entry to this cell.
	*
	* @param {Any} entry - The entry to add.
	* @return {Cell} A reference to this cell.
	*/
	add( entry ) {

		this.entries.push( entry );

		return this;

	}

	/**
	* Removes an entry from this cell.
	*
	* @param {Any} entry - The entry to remove.
	* @return {Cell} A reference to this cell.
	*/
	remove( entry ) {

		const index = this.entries.indexOf( entry );
		this.entries.splice( index, 1 );

		return this;

	}

	/**
	* Removes all entries from this cell.
	*
	* @return {Cell} A reference to this cell.
	*/
	makeEmpty() {

		this.entries.length = 0;

		return this;

	}

	/**
	* Returns true if this cell is empty.
	*
	* @return {Boolean} Whether this cell is empty or not.
	*/
	empty() {

		return this.entries.length === 0;

	}

	/**
	* Returns true if the given AABB intersects the internal bounding volume of this cell.
	*
	* @param {AABB} aabb - The AABB to test.
	* @return {Boolean} Whether this cell intersects with the given AABB or not.
	*/
	intersects( aabb ) {

		return this.aabb.intersectsAABB( aabb );

	}

	/**
	* Transforms this instance into a JSON object.
	*
	* @return {Object} The JSON object.
	*/
	toJSON() {

		const json = {
			type: this.constructor.name,
			aabb: this.aabb.toJSON(),
			entries: new Array()
		};

		const entries = this.entries;

		for ( let i = 0, l = entries.length; i < l; i ++ ) {

			json.entries.push( entries[ i ].uuid );

		}

		return json;

	}

	/**
	* Restores this instance from the given JSON object.
	*
	* @param {Object} json - The JSON object.
	* @return {Cell} A reference to this game entity.
	*/
	fromJSON( json ) {

		this.aabb.fromJSON( json.aabb );
		this.entries = json.entries.slice();

		return this;

	}

	/**
	* Restores UUIDs with references to GameEntity objects.
	*
	* @param {Map<String,GameEntity>} entities - Maps game entities to UUIDs.
	* @return {Cell} A reference to this cell.
	*/
	resolveReferences( entities ) {

		const entries = this.entries;

		for ( let i = 0, l = entries.length; i < l; i ++ ) {

			entries[ i ] = entities.get( entries[ i ] );

		}

		return this;

	}

}

const clampedPosition = new Vector3();
const aabb = new AABB();
const contour = new Array();

/**
* This class is used for cell-space partitioning, a basic approach for implementing
* a spatial index. The 3D space is divided up into a number of cells. A cell contains a
* list of references to all the entities it contains. Compared to other spatial indices like
* octrees, the division of the 3D space is coarse and often not balanced but the computational
* overhead for calculating the index of a specific cell based on a position vector is very fast.
*
* @author {@link https://github.com/Mugen87|Mugen87}
*/
class CellSpacePartitioning {

	/**
	* Constructs a new spatial index with the given values.
	*
	* @param {Number} width - The width of the entire spatial index.
	* @param {Number} height - The height of the entire spatial index.
	* @param {Number} depth - The depth of the entire spatial index.
	* @param {Number} cellsX - The amount of cells along the x-axis.
	* @param {Number} cellsY - The amount of cells along the y-axis.
	* @param {Number} cellsZ - The amount of cells along the z-axis.
	*/
	constructor( width, height, depth, cellsX, cellsY, cellsZ ) {

		/**
		* The list of partitions.
		* @type {Array<Cell>}
		*/
		this.cells = new Array();

		/**
		* The width of the entire spatial index.
		* @type {Number}
		*/
		this.width = width;

		/**
		* The height of the entire spatial index.
		* @type {Number}
		*/
		this.height = height;

		/**
		* The depth of the entire spatial index.
		* @type {Number}
		*/
		this.depth = depth;

		/**
		* The amount of cells along the x-axis.
		* @type {Number}
		*/
		this.cellsX = cellsX;

		/**
		* The amount of cells along the y-axis.
		* @type {Number}
		*/
		this.cellsY = cellsY;

		/**
		* The amount of cells along the z-axis.
		* @type {Number}
		*/
		this.cellsZ = cellsZ;

		this._halfWidth = this.width / 2;
		this._halfHeight = this.height / 2;
		this._halfDepth = this.depth / 2;

		this._min = new Vector3( - this._halfWidth, - this._halfHeight, - this._halfDepth );
		this._max = new Vector3( this._halfWidth, this._halfHeight, this._halfDepth );

		//

		const cellSizeX = this.width / this.cellsX;
		const cellSizeY = this.height / this.cellsY;
		const cellSizeZ = this.depth / this.cellsZ;

		for ( let i = 0; i < this.cellsX; i ++ ) {

			const x = ( i * cellSizeX ) - this._halfWidth;

			for ( let j = 0; j < this.cellsY; j ++ ) {

				const y = ( j * cellSizeY ) - this._halfHeight;

				for ( let k = 0; k < this.cellsZ; k ++ ) {

					const z = ( k * cellSizeZ ) - this._halfDepth;

					const min = new Vector3();
					const max = new Vector3();

					min.set( x, y, z );

					max.x = min.x + cellSizeX;
					max.y = min.y + cellSizeY;
					max.z = min.z + cellSizeZ;

					const aabb = new AABB( min, max );
					const cell = new Cell( aabb );

					this.cells.push( cell );

				}

			}

		}

	}

	/**
	* Updates the partitioning index of a given game entity.
	*
	* @param {GameEntity} entity - The entity to update.
	* @param {Number} currentIndex - The current partition index of the entity.
	* @return {Number} The new partitioning index for the given game entity.
	*/
	updateEntity( entity, currentIndex = - 1 ) {

		const newIndex = this.getIndexForPosition( entity.position );

		if ( currentIndex !== newIndex ) {

			this.addEntityToPartition( entity, newIndex );

			if ( currentIndex !== - 1 ) {

				this.removeEntityFromPartition( entity, currentIndex );

			}

		}

		return newIndex;

	}

	/**
	* Adds an entity to a specific partition.
	*
	* @param {GameEntity} entity - The entity to add.
	* @param {Number} index - The partition index.
	* @return {CellSpacePartitioning} A reference to this spatial index.
	*/
	addEntityToPartition( entity, index ) {

		const cell = this.cells[ index ];
		cell.add( entity );

		return this;

	}

	/**
	* Removes an entity from a specific partition.
	*
	* @param {GameEntity} entity - The entity to remove.
	* @param {Number} index - The partition index.
	* @return {CellSpacePartitioning} A reference to this spatial index.
	*/
	removeEntityFromPartition( entity, index ) {

		const cell = this.cells[ index ];
		cell.remove( entity );

		return this;

	}

	/**
	* Computes the partition index for the given position vector.
	*
	* @param {Vector3} position - The given position.
	* @return {Number} The partition index.
	*/
	getIndexForPosition( position ) {

		clampedPosition.copy( position ).clamp( this._min, this._max );

		let indexX = Math.abs( Math.floor( ( this.cellsX * ( clampedPosition.x + this._halfWidth ) ) / this.width ) );
		let indexY = Math.abs( Math.floor( ( this.cellsY * ( clampedPosition.y + this._halfHeight ) ) / this.height ) );
		let indexZ = Math.abs( Math.floor( ( this.cellsZ * ( clampedPosition.z + this._halfDepth ) ) / this.depth ) );

		// handle index overflow

		if ( indexX === this.cellsX ) indexX = this.cellsX - 1;
		if ( indexY === this.cellsY ) indexY = this.cellsY - 1;
		if ( indexZ === this.cellsZ ) indexZ = this.cellsZ - 1;

		// calculate final index

		return ( indexX * this.cellsY * this.cellsZ ) + ( indexY * this.cellsZ ) + indexZ;

	}

	/**
	* Performs a query to the spatial index according the the given position and
	* radius. The method approximates the query position and radius with an AABB and
	* then performs an intersection test with all non-empty cells in order to determine
	* relevant partitions. Stores the result in the given result array.
	*
	* @param {Vector3} position - The given query position.
	* @param {Number} radius - The given query radius.
	* @param {Array<Any>} result - The result array.
	* @return {Array<Any>} The result array.
	*/
	query( position, radius, result ) {

		const cells = this.cells;

		result.length = 0;

		// approximate range with an AABB which allows fast intersection test

		aabb.min.copy( position ).subScalar( radius );
		aabb.max.copy( position ).addScalar( radius );

		// test all non-empty cells for an intersection

		for ( let i = 0, l = cells.length; i < l; i ++ ) {

			const cell = cells[ i ];

			if ( cell.empty() === false && cell.intersects( aabb ) === true ) {

				result.push( ...cell.entries );

			}

		}

		return result;

	}

	/**
	* Removes all entities from all partitions.
	*
	* @return {CellSpacePartitioning} A reference to this spatial index.
	*/
	makeEmpty() {

		const cells = this.cells;

		for ( let i = 0, l = cells.length; i < l; i ++ ) {

			cells[ i ].makeEmpty();

		}

		return this;

	}

	/**
	* Adds a polygon to the spatial index. A polygon is approximated with an AABB.
	*
	* @param {Polygon} polygon - The polygon to add.
	* @return {CellSpacePartitioning} A reference to this spatial index.
	*/
	addPolygon( polygon ) {

		const cells = this.cells;

		polygon.getContour( contour );

		aabb.fromPoints( contour );

		for ( let i = 0, l = cells.length; i < l; i ++ ) {

			const cell = cells[ i ];

			if ( cell.intersects( aabb ) === true ) {

				cell.add( polygon );

			}

		}

		return this;

	}

	/**
	 * Transforms this instance into a JSON object.
	 *
	 * @return {Object} The JSON object.
	 */
	toJSON() {

		const json = {
			type: this.constructor.name,
			cells: new Array(),
			width: this.width,
			height: this.height,
			depth: this.depth,
			cellsX: this.cellsX,
			cellsY: this.cellsY,
			cellsZ: this.cellsZ,
			_halfWidth: this._halfWidth,
			_halfHeight: this._halfHeight,
			_halfDepth: this._halfDepth,
			_min: this._min.toArray( new Array() ),
			_max: this._max.toArray( new Array() )
		};

		for ( let i = 0, l = this.cells.length; i < l; i ++ ) {

			json.cells.push( this.cells[ i ].toJSON() );

		}

		return json;

	}

	/**
	 * Restores this instance from the given JSON object.
	 *
	 * @param {Object} json - The JSON object.
	 * @return {CellSpacePartitioning} A reference to this spatial index.
	 */
	fromJSON( json ) {

		this.cells.length = 0;

		this.width = json.width;
		this.height = json.height;
		this.depth = json.depth;
		this.cellsX = json.cellsX;
		this.cellsY = json.cellsY;
		this.cellsZ = json.cellsZ;

		this._halfWidth = json._halfWidth;
		this._halfHeight = json._halfHeight;
		this._halfDepth = json._halfHeight;

		this._min.fromArray( json._min );
		this._max.fromArray( json._max );

		for ( let i = 0, l = json.cells.length; i < l; i ++ ) {

			this.cells.push( new Cell().fromJSON( json.cells[ i ] ) );

		}

		return this;

	}

	/**
	* Restores UUIDs with references to GameEntity objects.
	*
	* @param {Map<String,GameEntity>} entities - Maps game entities to UUIDs.
	* @return {CellSpacePartitioning} A reference to this cell space portioning.
	*/
	resolveReferences( entities ) {

		for ( let i = 0, l = this.cells.length; i < l; i ++ ) {

			this.cells[ i ].resolveReferences( entities );

		}

		return this;

	}

}

/**
* Class for representing the memory information about a single game entity.
*
* @author {@link https://github.com/Mugen87|Mugen87}
*/
class MemoryRecord {

	/**
	* Constructs a new memory record.
	*
	* @param {GameEntity} entity - The game entity that is represented by this memory record.
	*/
	constructor( entity = null ) {

		/**
		* The game entity that is represented by this memory record.
		* @type {?GameEntity}
		* @default null
		*/
		this.entity = entity;

		/**
		* Records the time the entity became visible. Useful in combination with a reaction time
		* in order to prevent immediate actions.
		* @type {Number}
		* @default - Infinity
		*/
		this.timeBecameVisible = - Infinity;

		/**
		* Records the time the entity was last sensed (e.g. seen or heard). Used to determine
		* if a game entity can "remember" this record or not.
		* @type {Number}
		* @default - Infinity
		*/
		this.timeLastSensed = - Infinity;

		/**
		* Marks the position where the opponent was last sensed.
		* @type {Vector3}
		*/
		this.lastSensedPosition = new Vector3();

		/**
		* Whether this game entity is visible or not.
		* @type {Boolean}
		* @default false
		*/
		this.visible = false;

	}

	/**
	* Transforms this instance into a JSON object.
	*
	* @return {Object} The JSON object.
	*/
	toJSON() {

		return {
			type: this.constructor.name,
			entity: this.entity.uuid,
			timeBecameVisible: this.timeBecameVisible.toString(),
			timeLastSensed: this.timeLastSensed.toString(),
			lastSensedPosition: this.lastSensedPosition.toArray( new Array() ),
			visible: this.visible
		};

	}

	/**
	* Restores this instance from the given JSON object.
	*
	* @param {Object} json - The JSON object.
	* @return {MemoryRecord} A reference to this memory record.
	*/
	fromJSON( json ) {

		this.entity = json.entity; // uuid
		this.timeBecameVisible = parseFloat( json.timeBecameVisible );
		this.timeLastSensed = parseFloat( json.timeLastSensed );
		this.lastSensedPosition.fromArray( json.lastSensedPosition );
		this.visible = json.visible;

		return this;

	}

	/**
	* Restores UUIDs with references to GameEntity objects.
	*
	* @param {Map<String,GameEntity>} entities - Maps game entities to UUIDs.
	* @return {MemoryRecord} A reference to this memory record.
	*/
	resolveReferences( entities ) {

		this.entity = entities.get( this.entity ) || null;

		return this;

	}

}

/**
* Class for representing the memory system of a game entity. It is used for managing,
* filtering, and remembering sensory input.
*
* @author {@link https://github.com/Mugen87|Mugen87}
*/
class MemorySystem {

	/**
	* Constructs a new memory system.
	*
	* @param {GameEntity} owner - The game entity that owns this memory system.
	*/
	constructor( owner = null ) {

		/**
		* The game entity that owns this memory system.
		* @type {?GameEntity}
		* @default null
		*/
		this.owner = owner;

		/**
		* Used to simulate memory of sensory events. It contains {@link MemoryRecord memory records}
		* of all relevant game entities in the environment. The records are usually update by
		* the owner of the memory system.
		* @type {Array<MemoryRecord>}
		*/
		this.records = new Array();

		/**
		* Same as {@link MemorySystem#records} but used for fast access via the game entity.
		* @type {Map<GameEntity,MemoryRecord>}
		*/
		this.recordsMap = new Map();

		/**
		* Represents the duration of the game entities short term memory in seconds.
		* When a bot requests a list of all recently sensed game entities, this value
		* is used to determine if the bot is able to remember a game entity or not.
		* @type {Number}
		* @default 1
		*/
		this.memorySpan = 1;

	}

	/**
	* Returns the memory record of the given game entity.
	*
	* @param {GameEntity} entity - The game entity.
	* @return {MemoryRecord} The memory record for this game entity.
	*/
	getRecord( entity ) {

		return this.recordsMap.get( entity );

	}

	/**
	* Creates a memory record for the given game entity.
	*
	* @param {GameEntity} entity - The game entity.
	* @return {MemorySystem} A reference to this memory system.
	*/
	createRecord( entity ) {

		const record = new MemoryRecord( entity );

		this.records.push( record );
		this.recordsMap.set( entity, record );

		return this;

	}

	/**
	* Deletes the memory record for the given game entity.
	*
	* @param {GameEntity} entity - The game entity.
	* @return {MemorySystem} A reference to this memory system.
	*/
	deleteRecord( entity ) {

		const record = this.getRecord( entity );
		const index = this.records.indexOf( record );

		this.records.splice( index, 1 );
		this.recordsMap.delete( entity );

		return this;

	}

	/**
	* Returns true if there is a memory record for the given game entity.
	*
	* @param {GameEntity} entity - The game entity.
	* @return {Boolean} Whether the game entity has a memory record or not.
	*/
	hasRecord( entity ) {

		return this.recordsMap.has( entity );

	}

	/**
	* Removes all memory records from the memory system.
	*
	* @return {MemorySystem} A reference to this memory system.
	*/
	clear() {

		this.records.length = 0;
		this.recordsMap.clear();

		return this;

	}

	/**
	* Determines all valid memory record and stores the result in the given array.
	*
	* @param {Number} currentTime - The current elapsed time.
	* @param {Array<MemoryRecord>} result - The result array.
	* @return {Array<MemoryRecord>} The result array.
	*/
	getValidMemoryRecords( currentTime, result ) {

		const records = this.records;

		result.length = 0;

		for ( let i = 0, l = records.length; i < l; i ++ ) {

			const record = records[ i ];

			if ( ( currentTime - record.timeLastSensed ) <= this.memorySpan ) {

				result.push( record );

			}

		}

		return result;

	}

	/**
	* Transforms this instance into a JSON object.
	*
	* @return {Object} The JSON object.
	*/
	toJSON() {

		const json = {
			type: this.constructor.name,
			owner: this.owner.uuid,
			records: new Array(),
			memorySpan: this.memorySpan
		};

		const records = this.records;

		for ( let i = 0, l = records.length; i < l; i ++ ) {

			const record = records[ i ];
			json.records.push( record.toJSON() );

		}

		return json;

	}

	/**
	* Restores this instance from the given JSON object.
	*
	* @param {Object} json - The JSON object.
	* @return {MemorySystem} A reference to this memory system.
	*/
	fromJSON( json ) {

		this.owner = json.owner; // uuid
		this.memorySpan = json.memorySpan;

		const recordsJSON = json.records;

		for ( let i = 0, l = recordsJSON.length; i < l; i ++ ) {

			const recordJSON = recordsJSON[ i ];
			const record = new MemoryRecord().fromJSON( recordJSON );

			this.records.push( record );

		}

		return this;

	}

	/**
	* Restores UUIDs with references to GameEntity objects.
	*
	* @param {Map<String,GameEntity>} entities - Maps game entities to UUIDs.
	* @return {MemorySystem} A reference to this memory system.
	*/
	resolveReferences( entities ) {

		this.owner = entities.get( this.owner ) || null;

		// records

		const records = this.records;

		for ( let i = 0, l = records.length; i < l; i ++ ) {

			const record = 	records[ i ];

			record.resolveReferences( entities );
			this.recordsMap.set( record.entity, record );

		}

		return this;

	}

}

const toPoint = new Vector3();
const direction = new Vector3();
const ray = new Ray();
const intersectionPoint = new Vector3();
const worldPosition = new Vector3();

/**
 * Class for representing the vision component of a game entity.
 *
 * @author {@link https://github.com/Mugen87|Mugen87}
 */
class Vision {

	/**
	 * Constructs a new vision object.
	 *
	 * @param {GameEntity} owner - The owner of this vision instance.
	 */
	constructor( owner = null ) {

		/**
		 * The game entity that owns this vision instance.
		 * @type {?GameEntity}
		* @default null
		 */
		this.owner = owner;

		/**
		 * The field of view in radians.
		 * @type {Number}
		 * @default π
		 */
		this.fieldOfView = Math.PI;

		/**
		 * The visual range in world units.
		 * @type {Number}
		 * @default Infinity
		 */
		this.range = Infinity;

		/**
		 * An array of obstacles. An obstacle is a game entity that
		 * implements the {@link GameEntity#lineOfSightTest} method.
		 * @type {Array<GameEntity>}
		 */
		this.obstacles = new Array();

	}

	/**
	 * Adds an obstacle to this vision instance.
	 *
	 * @param {GameEntity} obstacle - The obstacle to add.
	 * @return {Vision} A reference to this vision instance.
	 */
	addObstacle( obstacle ) {

		this.obstacles.push( obstacle );

		return this;

	}

	/**
	 * Removes an obstacle from this vision instance.
	 *
	 * @param {GameEntity} obstacle - The obstacle to remove.
	 * @return {Vision} A reference to this vision instance.
	 */
	removeObstacle( obstacle ) {

		const index = this.obstacles.indexOf( obstacle );
		this.obstacles.splice( index, 1 );

		return this;

	}

	/**
	 * Performs a line of sight test in order to determine if the given point
	 * in 3D space is visible for the game entity.
	 *
	 * @param {Vector3} point - The point to test.
	 * @return {Boolean} Whether the given point is visible or not.
	 */
	visible( point ) {

		const owner = this.owner;
		const obstacles = this.obstacles;

		owner.getWorldPosition( worldPosition );

		// check if point lies within the game entity's visual range

		toPoint.subVectors( point, worldPosition );
		const distanceToPoint = toPoint.length();

		if ( distanceToPoint > this.range ) return false;

		// next, check if the point lies within the game entity's field of view

		owner.getWorldDirection( direction );

		const angle = direction.angleTo( toPoint );

		if ( angle > ( this.fieldOfView * 0.5 ) ) return false;

		// the point lies within the game entity's visual range and field
		// of view. now check if obstacles block the game entity's view to the given point.

		ray.origin.copy( worldPosition );
		ray.direction.copy( toPoint ).divideScalar( distanceToPoint || 1 ); // normalize

		for ( let i = 0, l = obstacles.length; i < l; i ++ ) {

			const obstacle = obstacles[ i ];

			const intersection = obstacle.lineOfSightTest( ray, intersectionPoint );

			if ( intersection !== null ) {

				// if an intersection point is closer to the game entity than the given point,
				// something is blocking the game entity's view

				const squaredDistanceToIntersectionPoint = intersectionPoint.squaredDistanceTo( worldPosition );

				if ( squaredDistanceToIntersectionPoint <= ( distanceToPoint * distanceToPoint ) ) return false;

			}

		}

		return true;

	}

	/**
	 * Transforms this instance into a JSON object.
	 *
	 * @return {Object} The JSON object.
	 */
	toJSON() {

		const json = {
			type: this.constructor.name,
			owner: this.owner.uuid,
			fieldOfView: this.fieldOfView,
			range: this.range.toString()
		};

		json.obstacles = new Array();

		for ( let i = 0, l = this.obstacles.length; i < l; i ++ ) {

			const obstacle = this.obstacles[ i ];
			json.obstacles.push( obstacle.uuid );

		}

		return json;

	}

	/**
	 * Restores this instance from the given JSON object.
	 *
	 * @param {Object} json - The JSON object.
	 * @return {Vision} A reference to this vision.
	 */
	fromJSON( json ) {

		this.owner = json.owner;
		this.fieldOfView = json.fieldOfView;
		this.range = parseFloat( json.range );

		for ( let i = 0, l = json.obstacles.length; i < l; i ++ ) {

			const obstacle = json.obstacles[ i ];
			this.obstacles.push( obstacle );

		}

		return this;

	}

	/**
	 * Restores UUIDs with references to GameEntity objects.
	 *
	 * @param {Map<String,GameEntity>} entities - Maps game entities to UUIDs.
	 * @return {Vision} A reference to this vision.
	 */
	resolveReferences( entities ) {

		this.owner = entities.get( this.owner ) || null;

		const obstacles = this.obstacles;

		for ( let i = 0, l = obstacles.length; i < l; i ++ ) {

			obstacles[ i ] = entities.get( obstacles[ i ] );

		}

		return this;

	}

}

const translation = new Vector3();
const predictedPosition = new Vector3();
const normalPoint = new Vector3();
const lineSegment = new LineSegment();
const closestNormalPoint = new Vector3();

/**
* This steering behavior produces a force that keeps a vehicle close to its path. It is intended
* to use it in combination with {@link FollowPathBehavior} in order to realize a more strict path following.
*
* @author {@link https://github.com/Mugen87|Mugen87}
* @augments SteeringBehavior
*/
class OnPathBehavior extends SteeringBehavior {

	/**
	* Constructs a new on path behavior.
	*
	* @param {Path} path - The path to stay close to.
	* @param {Number} radius - Defines the width of the path. With a smaller radius, the vehicle will have to follow the path more closely.
	* @param {Number} predictionFactor - Determines how far the behavior predicts the movement of the vehicle.
	*/
	constructor( path = new Path(), radius = 0.1, predictionFactor = 1 ) {

		super();

		/**
		* The path to stay close to.
		* @type {Path}
		*/
		this.path = path;

		/**
		* Defines the width of the path. With a smaller radius, the vehicle will have to follow the path more closely.
		* @type {Number}
		* @default 0.1
		*/
		this.radius = radius;

		/**
		* Determines how far the behavior predicts the movement of the vehicle.
		* @type {Number}
		* @default 1
		*/
		this.predictionFactor = predictionFactor;

		// internal behaviors

		this._seek = new SeekBehavior();

	}

	/**
	* Calculates the steering force for a single simulation step.
	*
	* @param {Vehicle} vehicle - The game entity the force is produced for.
	* @param {Vector3} force - The force/result vector.
	* @param {Number} delta - The time delta.
	* @return {Vector3} The force/result vector.
	*/
	calculate( vehicle, force /*, delta */ ) {

		const path = this.path;

		// predicted future position

		translation.copy( vehicle.velocity ).multiplyScalar( this.predictionFactor );
		predictedPosition.addVectors( vehicle.position, translation );

		// compute closest line segment and normal point. the normal point is computed by projecting
		// the predicted position of the vehicle on a line segment.

		let minDistance = Infinity;

		let l = path._waypoints.length;

		// handle looped paths differently since they have one line segment more

		l = ( path.loop === true ) ? l : l - 1;

		for ( let i = 0; i < l; i ++ ) {

			lineSegment.from = path._waypoints[ i ];

			// the last waypoint needs to be handled differently for a looped path.
			// connect the last point with the first one in order to create the last line segment

			if ( path.loop === true && i === ( l - 1 ) ) {

				lineSegment.to = path._waypoints[ 0 ];

			} else {

				lineSegment.to = path._waypoints[ i + 1 ];

			}

			lineSegment.closestPointToPoint( predictedPosition, true, normalPoint );

			const distance = predictedPosition.squaredDistanceTo( normalPoint );

			if ( distance < minDistance ) {

				minDistance = distance;
				closestNormalPoint.copy( normalPoint );

			}

		}

		// seek towards the projected point on the closest line segment if
		// the predicted position of the vehicle is outside the valid range.
		// also ensure that the path length is greater than zero when performing a seek

		if ( minDistance > ( this.radius * this.radius ) && path._waypoints.length > 1 ) {

			this._seek.target = closestNormalPoint;
			this._seek.calculate( vehicle, force );

		}

		return force;

	}

	/**
	* Transforms this instance into a JSON object.
	*
	* @return {Object} The JSON object.
	*/
	toJSON() {

		const json = super.toJSON();

		json.path = this.path.toJSON();
		json.radius = this.radius;
		json.predictionFactor = this.predictionFactor;

		return json;

	}

	/**
	* Restores this instance from the given JSON object.
	*
	* @param {Object} json - The JSON object.
	* @return {OnPathBehavior} A reference to this behavior.
	*/
	fromJSON( json ) {

		super.fromJSON( json );

		this.path.fromJSON( json.path );
		this.radius = json.radius;
		this.predictionFactor = json.predictionFactor;

		return this;

	}

}

/**
* Base class for representing tasks. A task is an isolated unit of work that is
* processed in an asynchronous way. Tasks are managed within a {@link TaskQueue task queue}.
*
* @author {@link https://github.com/robp94|robp94}
*/
class Task {

	/**
	* This method represents the actual unit of work.
	* Must be implemented by all concrete tasks.
	*/
	execute() {}

}

/**
* This class is used for task management. Tasks are processed in an asynchronous
* way when there is idle time within a single simulation step or after a defined amount
* of time (deadline). The class is a wrapper around {@link https://w3.org/TR/requestidlecallback|requestidlecallback()},
* a JavaScript API for cooperative scheduling of background tasks.
*
* @author {@link https://github.com/robp94|robp94}
*/
class TaskQueue {

	/**
	* Constructs a new task queue.
	*/
	constructor() {

		/**
		* A list of pending tasks.
		* @type {Array<Task>}
		* @readonly
		*/
		this.tasks = new Array();

		/**
		* Used to control the asynchronous processing.
		* - timeout: After this amount of time (in ms), a scheduled task is executed even if
		* doing so risks causing a negative performance impact (e.g. bad frame time).
		* @type {Object}
		*/
		this.options = {
			timeout: 1000 // ms
		};

		//

		this._active = false;
		this._handler = runTaskQueue.bind( this );
		this._taskHandle = 0;

	}

	/**
	* Adds the given task to the task queue.
	*
	* @param {Task} task - The task to add.
	* @return {TaskQueue} A reference to this task queue.
	*/
	enqueue( task ) {

		this.tasks.push( task );

		return this;

	}

	/**
	* Updates the internal state of the task queue. Should be called
	* per simulation step.
	*
	* @return {TaskQueue} A reference to this task queue.
	*/
	update() {

		if ( this.tasks.length > 0 ) {

			if ( this._active === false ) {

				this._taskHandle = requestIdleCallback( this._handler, this.options );
				this._active = true;

			}

		} else {

			this._active = false;

		}

		return this;

	}

}

/**
* This function controls the processing of tasks. It schedules tasks when there
* is idle time at the end of a simulation step.
*
* @param {Object} deadline - This object contains a function which returns
* a number indicating how much time remains for task processing.
*/
function runTaskQueue( deadline ) {

	const tasks = this.tasks;

	while ( deadline.timeRemaining() > 0 && tasks.length > 0 ) {

		const task = tasks[ 0 ];

		task.execute();

		tasks.shift();

	}

	if ( tasks.length > 0 ) {

		this._taskHandle = requestIdleCallback( this._handler, this.options );
		this._active = true;

	} else {

		this._taskHandle = 0;
		this._active = false;

	}

}

export { AABB, AStar, AlignmentBehavior, ArriveBehavior, BFS, BVH, BVHNode, BoundingSphere, Face as CHFace, Vertex as CHVertex, VertexList as CHVertexList, Cell, CellSpacePartitioning, CohesionBehavior, CompositeGoal, ConvexHull, Corridor, CostTable, DFS, Dijkstra, Edge, EntityManager, EvadeBehavior, EventDispatcher, FleeBehavior, FollowPathBehavior, FuzzyAND, FuzzyCompositeTerm, FuzzyFAIRLY, FuzzyModule, FuzzyOR, FuzzyRule, FuzzySet, FuzzyTerm, FuzzyVERY, FuzzyVariable, GameEntity, Goal, GoalEvaluator, Graph, GraphUtils, HalfEdge, HeuristicPolicyDijkstra, HeuristicPolicyEuclid, HeuristicPolicyEuclidSquared, HeuristicPolicyManhattan, InterposeBehavior, LeftSCurveFuzzySet, LeftShoulderFuzzySet, LineSegment, Logger, MathUtils, Matrix3, Matrix4, MemoryRecord, MemorySystem, MeshGeometry, MessageDispatcher, MovingEntity, NavEdge, NavMesh, NavMeshLoader, NavNode, Node, NormalDistFuzzySet, OBB, ObstacleAvoidanceBehavior, OffsetPursuitBehavior, OnPathBehavior, Path, Plane, Polygon, Polyhedron, PriorityQueue, PursuitBehavior, Quaternion, Ray, RectangularTriggerRegion, Regulator, RightSCurveFuzzySet, RightShoulderFuzzySet, SAT, SeekBehavior, SeparationBehavior, SingletonFuzzySet, Smoother, SphericalTriggerRegion, State, StateMachine, SteeringBehavior, SteeringManager, Task, TaskQueue, Telegram, Think, Time, TriangularFuzzySet, Trigger, TriggerRegion, Vector3, Vehicle, Vision, WanderBehavior, WorldUp };
