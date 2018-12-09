/**
 * @license
 * The MIT License
 *
 * Copyright © 2018 Yuka authors
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
 *
 */

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.YUKA = {})));
}(this, (function (exports) { 'use strict';

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
			* @type GameEntity
			*/
			this.sender = sender;

			/**
			* The receiver.
			* @type GameEntity
			*/
			this.receiver = receiver;

			/**
			* The actual message.
			* @type String
			*/
			this.message = message;

			/**
			* A time value in millisecond used to delay the message dispatching.
			* @type Number
			*/
			this.delay = delay;

			/**
			* An object for custom data.
			* @type Object
			*/
			this.data = data;

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
			* @type Array
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
		* @param  {Number} delta - The time delta.
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

	}

	const candidates = [];

	/**
	* This class is used for managing all central objects of a game like
	* game entities and triggers.
	*
	* @author {@link https://github.com/Mugen87|Mugen87}
	*/
	class EntityManager {

		/**
		* Constructs a new entity manager.
		*/
		constructor() {

			/**
			* A list of {@link GameEntity game entities }.
			* @type Array
			*/
			this.entities = new Array();

			/**
			* A list of {@link Trigger triggers }.
			* @type Array
			*/
			this.triggers = new Array();

			/**
			* A reference to a spatial index.
			* @type CellSpacePartitioning
			* @default null
			*/
			this.spatialIndex = null;

			this._entityMap = new Map(); // for fast ID access
			this._indexMap = new Map(); // used by spatial indices
			this._started = new Set(); // used to control the call of GameEntity.start()
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
			this._entityMap.set( entity.id, entity );

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

			this._entityMap.delete( entity.id );
			this._started.delete( entity );

			entity.manager = null;

			return this;

		}

		/**
		* Adds a trigger to this entity manager.
		*
		* @param {Trigger} trigger - The trigger to add.
		* @return {EntityManager} A reference to this entity manager.
		*/
		addTrigger( trigger ) {

			this.triggers.push( trigger );

			return this;

		}

		/**
		* Removes a trigger to this entity manager.
		*
		* @param {Trigger} trigger - The trigger to remove.
		* @return {EntityManager} A reference to this entity manager.
		*/
		removeTrigger( trigger ) {

			const index = this.triggers.indexOf( trigger );
			this.triggers.splice( index, 1 );

			return this;

		}

		/**
		* Clears the internal state of this entity manager.
		*
		* @return {EntityManager} A reference to this entity manager.
		*/
		clear() {

			this.entities.length = 0;
			this.triggers.length = 0;

			this._entityMap.clear();
			this._started.clear();

			this._messageDispatcher.clear();

			return this;

		}

		/**
		* Returns an entity by the given ID. If no game entity is found, *null*
		* is returned.
		*
		* @param {Number} id - The id of the game entity.
		* @return {GameEntity} The found game entity.
		*/
		getEntityById( id ) {

			return this._entityMap.get( id ) || null;

		}

		/**
		* Returns an entity by the given name. If no game entity is found, *null*
		* is returned. This method is more expensive than {@link GameEntity#getEntityById}
		* and should not be used in each simlation step. Instead, it should be used once
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
		* game entities, triggers and delayed messages.
		*
		* @param {Number} delta - The time delta.
		* @return {EntityManager} A reference to this entity manager.
		*/
		update( delta ) {

			const entities = this.entities;
			const triggers = this.triggers;

			// update entities

			for ( let i = ( entities.length - 1 ); i >= 0; i -- ) {

				const entity = entities[ i ];

				this.updateEntity( entity, delta );

			}

			// update triggers

			for ( let i = ( triggers.length - 1 ); i >= 0; i -- ) {

				const trigger = triggers[ i ];

				this.updateTrigger( trigger, delta );

			}

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

				//

				if ( this._started.has( entity ) === false ) {

					entity.start();

					this._started.add( entity );

				}

				//

				entity.update( delta );
				entity.updateWorldMatrix();

				//

				const children = entity.children;

				for ( let i = ( children.length - 1 ); i >= 0; i -- ) {

					const child = children[ i ];

					this.updateEntity( child, delta );

				}

				//

				if ( this.spatialIndex !== null ) {

					let currentIndex = this._indexMap.get( entity ) || - 1;
					currentIndex = this.spatialIndex.updateEntity( entity, currentIndex );
					this._indexMap.set( entity, currentIndex );

				}

				//

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
		* Updates a single trigger.
		*
		* @param {Trigger} trigger - The trigger to update.
		* @return {EntityManager} A reference to this entity manager.
		*/
		updateTrigger( trigger, delta ) {

			if ( trigger.active === true ) {

				trigger.update( delta );

				const entities = this.entities;

				for ( let i = ( entities.length - 1 ); i >= 0; i -- ) {

					const entity = entities[ i ];

					if ( entity.active === true ) {

						trigger.check( entity );

					}

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
		* @param {Function} listener - The event listener to add.
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

	/**
	* Class with various math helpers.
	*
	* @author {@link https://github.com/Mugen87|Mugen87}
	*/
	class MathUtils {

		/**
		* Ensures the given scalar value is within a given min/max range.
		*
		* @param {Number} value - The value to clamp.
		* @param {min} value - The min value.
		* @param {max} value - The max value.
		* @return {Number} The clamped value.
		*/
		static clamp( value, min, max ) {

			return Math.max( min, Math.min( max, value ) );

		}

		/**
		* Computes a random integer value within a given min/max range.
		*
		* @param {min} value - The min value.
		* @param {max} value - The max value.
		* @return {Number} The random integer value.
		*/
		static randInt( min, max ) {

			return min + Math.floor( Math.random() * ( max - min + 1 ) );

		}

		/**
		* Computes a random float value within a given min/max range.
		*
		* @param {min} value - The min value.
		* @param {max} value - The max value.
		* @return {Number} The random float value.
		*/
		static randFloat( min, max ) {

			return min + Math.random() * ( max - min );

		}

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
			* @type Number
			*/
			this.x = x;

			/**
			* The y component.
			* @type Number
			*/
			this.y = y;

			/**
			* The z component.
			* @type Number
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
		* Substracts the given 3D vector from this 3D vector.
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
		* Substracts the given scalar from this 3D vector.
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
		* Substracts two given 3D vectors and stores the result in this 3D vector.
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

			const theta = this.dot( v ) / ( Math.sqrt( this.squaredLength() * v.squaredLength() ) );

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
		* Computes the manhatten length of this 3D vector.
		*
		* @return {Number} The manhatten length of this 3D vector.
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
		* Computes the manhatten distance between this 3D vector and the given one.
		*
		* @param {Vector3} v - A 3D vector.
		* @return {Number} The manhatten distance between two 3D vectors.
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
		* @param {Array} array - An array.
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
		* @param {Array} array - An array.
		* @param {Number} offset - An optional offset.
		* @return {Array} The array with the 3D vector components.
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

	const WorldUp = new Vector3( 0, 1, 0 );

	const localRight = new Vector3();
	const worldRight = new Vector3();
	const perpWorldUp = new Vector3();
	const temp = new Vector3();

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
			* @type Array
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
		* Transforms this matrix to an indentiy matrix.
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
		* Sets the elements of this matrix from an array.
		*
		* @param {Array} array - An array.
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
		* @param {Array} array - An array.
		* @param {Number} offset - An optional offset.
		* @return {Array} The array with the elements of the matrix.
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

	const matrix = new Matrix3();

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
			* @type Number
			*/
			this.x = x;

			/**
			* The y component.
			* @type Number
			*/
			this.y = y;

			/**
			* The z component.
			* @type Number
			*/
			this.z = z;

			/**
			* The w component.
			* @type Number
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
		* @return {Boolean} Whether the given quaternion already represents the target rotation.
		*/
		rotateTo( q, step ) {

			const angle = this.angleTo( q );

			if ( angle < 0.0001 ) return true;

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

			matrix.lookAt( localForward, targetDirection, localUp );
			this.fromMatrix3( matrix );

		}

		/**
		* Spherically interpolates between this quaternion and the given quaternion by t.
		* The parameter t is clamped to the range [0, 1].
		*
		* @param {Quaternion} q - The target rotation.
		* @param {Number} t - The interpolation paramter.
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
		* Sets the components of this quaternion from the an euler angle.
		*
		* @param {Number} x - Rotation around x axis in radians.
		* @param {Number} y - Rotation around y axis in radians.
		* @param {Number} z - Rotation around z axis in radians.
		* @return {Quaternion} A reference to this quaternion.
		*/
		fromEuler( x, y, z ) {

			const c1 = Math.cos( x / 2 );
			const c2 = Math.cos( y / 2 );
			const c3 = Math.cos( z / 2 );

			const s1 = Math.sin( x / 2 );
			const s2 = Math.sin( y / 2 );
			const s3 = Math.sin( z / 2 );

			this.x = s1 * c2 * c3 + c1 * s2 * s3;
			this.y = c1 * s2 * c3 - s1 * c2 * s3;
			this.z = c1 * c2 * s3 + s1 * s2 * c3;
			this.w = c1 * c2 * c3 - s1 * s2 * s3;

			return this;

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
		* @param {Array} array - An array.
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
		* @param {Array} array - An array.
		* @param {Number} offset - An optional offset.
		* @return {Array} The array with the quaternion components.
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
			* @type Array
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
		* Transforms this matrix to an indentiy matrix.
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

			if ( det === 0 ) {

				Logger.warn( 'YUKA.Matrix4: .getInverse() can not invert matrix, determinant is 0.' );
				return this.identity();

			}

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
		* Sets the elements of this matrix from an array.
		*
		* @param {Array} array - An array.
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
		* @param {Array} array - An array.
		* @param {Number} offset - An optional offset.
		* @return {Array} The array with the elements of the matrix.
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

	let nextId = 0;

	const targetRotation = new Quaternion();
	const targetDirection = new Vector3();

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
			* The unique ID of this game entity.
			* @type Number
			*/
			this.id = nextId ++;

			/**
			* The name of this game entity.
			* @type String
			*/
			this.name = '';

			/**
			* Whether this game entity is active or not.
			* @type Boolean
			* @default true
			*/
			this.active = true;

			/**
			* The child entities of this game entity.
			* @type Array
			*/
			this.children = new Array();

			/**
			* A reference to the parent entity of this game entity.
			* Automatically set when added to a {@link GameEntity}.
			* @type GameEntity
			* @default null
			*/
			this.parent = null;

			/**
			* A list of neighbors of this game entity.
			* @type Array
			*/
			this.neighbors = new Array();

			/**
			* Game entities within this radius are considered as neighbors of this entity.
			* @type Number
			* @default 1
			*/
			this.neighborhoodRadius = 1;

			/**
			* Whether the neighborhood of this game entity is updated or not.
			* @type Boolean
			* @default false
			*/
			this.updateNeighborhood = false;

			/**
			* The position of this game entity.
			* @type Vector3
			*/
			this.position = new Vector3();

			/**
			* The rotation of this game entity.
			* @type Quaternion
			*/
			this.rotation = new Quaternion();

			/**
			* The scaling of this game entity.
			* @type Vector3
			*/
			this.scale = new Vector3( 1, 1, 1 );

			/**
			* The default forward vector of this game entity.
			* @type Vector3
			* @default (0,0,1)
			*/
			this.forward = new Vector3( 0, 0, 1 );

			/**
			* The default up vector of this game entity.
			* @type Vector3
			* @default (0,1,0)
			*/
			this.up = new Vector3( 0, 1, 0 );

			/**
			* The bounding radius of this game entity in world units.
			* @type Number
			* @default 0
			*/
			this.boundingRadius = 0;

			/**
			* The maximum turn rate of this game entity in radians per seconds.
			* @type Number
			* @default π
			*/
			this.maxTurnRate = Math.PI;

			/**
			* A transformation matrix representing the local space of this game entity.
			* @type Matrix4
			*/
			this.matrix = new Matrix4();

			/**
			* A transformation matrix representing the world space of this game entity.
			* @type Matrix4
			*/
			this.worldMatrix = new Matrix4();

			/**
			* A reference to the entity manager of this game entity.
			* Automatically set when added to an {@link EntityManager}.
			* @type EntityManager
			* @default null
			*/
			this.manager = null;

			//

			this._cache = {
				position: new Vector3(),
				rotation: new Quaternion(),
				scale: new Vector3()
			};

			this._renderComponent = null;
			this._renderComponentCallback = null;

		}

		/**
		* Executed when this game entity is updated for the first time by its {@link EntityManager}.
		*
		* @return {GameEntity} A reference to this game entity.
		*/
		start() {}

		/**
		* Updates the internal state of this game entity. Normally called by {@link EntityManager#update}
		* in each simulation step.
		*
		* @param {Number} delta - The time delta.
		* @return {GameEntity} A reference to this game entity.
		*/
		update( /* delta */ ) {}


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

			targetDirection.subVectors( target, this.position ).normalize();

			this.rotation.lookAt( this.forward, targetDirection, this.up );

			return this;

		}

		/**
		* Given a target position, this method rotates the entity by an amount not
		* greater than {@link GameEntity#maxTurnRate} until it directly faces the target.
		*
		* @param {Vector3} target - The target position.
		* @param {Number} delta - The time delta.
		* @return {Boolean} Whether the entity is faced to the target or not.
		*/
		rotateTo( target, delta ) {

			targetDirection.subVectors( target, this.position ).normalize();
			targetRotation.lookAt( this.forward, targetDirection, this.up );

			return this.rotation.rotateTo( targetRotation, this.maxTurnRate * delta );

		}

		/**
		* Updates the transformation matrix representing the local space.
		*
		* @return {GameEntity} A reference to this game entity.
		*/
		updateMatrix() {

			const cache = this._cache;

			if ( cache.position.equals( this.position ) &&
					cache.rotation.equals( this.rotation ) &&
					cache.scale.equals( this.scale ) ) {

				return this;

			}

			this.matrix.compose( this.position, this.rotation, this.scale );

			cache.position.copy( this.position );
			cache.rotation.copy( this.rotation );
			cache.scale.copy( this.scale );

			return this;

		}

		/**
		* Updates the world matrix representing the world space.
		*
		* @param {Boolean} up - Whether to update the world matrices of the parents or not.
		* @param {Boolean} down - Whether to update the world matrices of the childs or not.
		* @return {GameEntity} A reference to this game entity.
		*/
		updateWorldMatrix( up = false, down = false ) {

			const parent = this.parent;
			const children = this.children;

			// update higher levels first

			if ( up === true && parent !== null ) {

				parent.updateWorldMatrix( true );

			}

			// update this entity

			this.updateMatrix();

			if ( parent === null ) {

				this.worldMatrix.copy( this.matrix );

			} else {

				this.worldMatrix.multiplyMatrices( this.parent.worldMatrix, this.matrix );

			}

			// update lower levels

			if ( down === true ) {

				for ( let i = 0, l = children.length; i < l; i ++ ) {

					const child = children[ i ];

					child.updateWorldMatrix( false, true );

				}

			}

			return this;

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

	}

	const vector = new Vector3();

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
			* @type Vector3
			*/
			this.min = min;

			/**
			* The maximum bounds of the AABB.
			* @type Vector3
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
		* Returns true if the given ABBB intersects this AABB.
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
		* Sets the values of the AABB from the given array of points.
		*
		* @param {Array} points - An array of 3D vectors representing points in 3D space.
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

	}

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
			* @type Vector3
			*/
			this.center = center;

			/**
			*  The radius of the bounding sphere.
			* @type Number
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

	}

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

			this.vertices = vertices;
			this.indices = indices;

			this.backfaceCulling = true;

			this.aabb = new AABB();
			this.boundingSphere = new BoundingSphere();

			this.computeBoundingVolume();

		}

		/**
		* Computes an AABB for this geometry.
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

	}

	const displacement = new Vector3();
	const target = new Vector3();

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
			* @type Vector3
			*/
			this.velocity = new Vector3();

			/**
			* The maximum speed at which this game entity may travel.
			* @type Number
			*/
			this.maxSpeed = 1;

			/**
			* Whether the orientation of this game entity will be updated based on the velocity or not.
			* @type Boolean
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

			displacement.copy( this.velocity ).multiplyScalar( delta );

			// calculate target position

			target.copy( this.position ).add( displacement );

			// update the orientation if the vehicle has a non zero velocity

			if ( this.updateOrientation && this.getSpeedSquared() > 0.00000001 ) {

				this.lookAt( target );

			}

			// update position

			this.position.copy( target );

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

			/**
			* The start time of this timer.
			* @type Number
			* @default 0
			*/
			this.startTime = 0;

			/**
			* The time stamp of the last simulation step.
			* @type Number
			* @default 0
			*/
			this.previousTime = 0;

			/**
			* The time stamp of the current simulation step.
			* @type Number
			* @default 0
			*/
			this.currentTime = 0;

		}

		/**
		* Returns the delta time in seconds for the current simulation step.
		*
		* @return {Number} The delta time in seconds.
		*/
		getDelta() {

			return ( this.currentTime - this.previousTime ) / 1000;

		}

		/**
		* Returns the elapsed time in seconds of this timer.
		*
		* @return {Number} The elapsed time in seconds.
		*/
		getElapsed() {

			return ( this.currentTime - this.startTime ) / 1000;

		}

		/**
		* Updates the internal state of this timer.
		*
		* @return {Time} A reference to this timer.
		*/
		update() {

			this.previousTime = this.currentTime;
			this.currentTime = this.now();

			return this;

		}

		/**
		* Returns a current time value in milliseconds.
		*
		* @return {Number} A current time value in milliseconds.
		*/
		now() {

			return ( typeof performance === 'undefined' ? Date : performance ).now();

		}

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
			* @type Number
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

			if ( this._time.currentTime >= this._nextUpdateTime ) {

				this._nextUpdateTime = this._time.currentTime + ( 1000 / this.updateFrequency );

				return true;

			}

			return false;

		}

	}

	/**
	* Base class for represeting a state in context of State-driven agent design.
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
			* @type GameEntity
			*/
			this.owner = owner;

			/**
			* The current state of the game entity.
			* @type State
			*/
			this.currentState = null;

			/**
			* The previous state of the game entity.
			* @type State
			*/
			this.previousState = null; // a reference to the last state the agent was in

			/**
			* This state logic is called every time the state machine is updated.
			* @type State
			*/
			this.globalState = null;

			/**
			* A map with all states of the state machine.
			* @type Map
			*/
			this.states = new Map();

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

		_change( state ) {

			this.previousState = this.currentState;

			this.currentState.exit( this.owner );

			this.currentState = state;

			this.currentState.enter( this.owner );

		}

	}

	/**
	* Base class for represeting a goal in context of Goal-driven agent design.
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
			* @type GameEntity
			*/
			this.owner = owner;

			/**
			* The status of this goal.
			* @type Status
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

				this.activate();

				this.status = Goal.STATUS.ACTIVE;

			}

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
	* Class represeting a composite goal. Essentially it's a goal which consists of subgoals.
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
			* @type Array
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

	}

	/**
	* Base class for represeting a goal evaluator in context of Goal-driven agent design.
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
			* @type Number
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

	}

	/**
	* Class for represeting the brain of a game entity.
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
			* @type Array
			*/
			this.evaluators = new Array();

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

			let bestDesirabilty = - 1;
			let bestEvaluator = null;

			// try to find the best top-level goal/strategy for the entity

			for ( let i = 0, l = evaluators.length; i < l; i ++ ) {

				const evaluator = evaluators[ i ];

				let desirabilty = evaluator.calculateDesirability( this.owner );
				desirabilty *= evaluator.characterBias;

				if ( desirabilty >= bestDesirabilty ) {

					bestDesirabilty = desirabilty;
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
			* @type Number
			* @default -1
			*/
			this.from = from;

			/**
			* The index of the *to* node.
			* @type Number
			* @default -1
			*/
			this.to = to;

			/**
			* The cost of this edge. This could be for example a distance or time value.
			* @type Number
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
			* @type Boolean
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
		* @param {Array} result - The result array.
		* @return {Array} The result array.
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
		* @param {Array} result - The result array.
		* @return {Array} The result array.
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
			* @type Number
			* @default -1
			*/
			this.index = index;

		}

	}

	/**
	* Class for representing a heuristic for graph search algorithms based
	* on the euclidian distance. The heuristic assumes that the node have
	* a *position* property of type {@link Vector3}.
	*
	* @author {@link https://github.com/Mugen87|Mugen87}
	*/
	class HeuristicPolicyEuclid {

		/**
		* Calculates the euclidian distance between two nodes.
		*
		* @param {Graph} grapj - The graph.
		* @param {Number} source - The index of the source node.
		* @param {Number} target - The index of the target node.
		* @return {Number} The euclidian distance between both nodes.
		*/
		static calculate( graph, source, target ) {

			const sourceNode = graph.getNode( source );
			const targetNode = graph.getNode( target );

			return sourceNode.position.distanceTo( targetNode.position );

		}

	}

	/**
	* Class for representing a heuristic for graph search algorithms based
	* on the squared euclidian distance. The heuristic assumes that the node
	* have a *position* property of type {@link Vector3}.
	*
	* @author {@link https://github.com/Mugen87|Mugen87}
	*/
	class HeuristicPolicyEuclidSquared {

		/**
		* Calculates the squared euclidian distance between two nodes.
		*
		* @param {Graph} grapj - The graph.
		* @param {Number} source - The index of the source node.
		* @param {Number} target - The index of the target node.
		* @return {Number} The squared euclidian distance between both nodes.
		*/
		static calculate( graph, source, target ) {

			const sourceNode = graph.getNode( source );
			const targetNode = graph.getNode( target );

			return sourceNode.position.squaredDistanceTo( targetNode.position );

		}

	}

	/**
	* Class for representing a heuristic for graph search algorithms based
	* on the manhatten distance. The heuristic assumes that the node
	* have a *position* property of type {@link Vector3}.
	*
	* @author {@link https://github.com/Mugen87|Mugen87}
	*/
	class HeuristicPolicyManhatten {

		/**
		* Calculates the manhatten distance between two nodes.
		*
		* @param {Graph} grapj - The graph.
		* @param {Number} source - The index of the source node.
		* @param {Number} target - The index of the target node.
		* @return {Number} The manhatten distance between both nodes.
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
		* @param {Graph} grapj - The graph.
		* @param {Number} source - The index of the source node.
		* @param {Number} target - The index of the target node.
		* @return {Number} The manhatten distance between both nodes.
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
			* @type Array
			*/
			this.data = new Array();

			/**
			* The length of the priority queue.
			* @type Number
			* @default 0
			*/
			this.length = 0;

			/**
			* The compare function used for sorting.
			* @type Function
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
		pop() {

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

			return this.data[ 0 ] || null;

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
			* @type Graph
			*/
			this.graph = graph;

			/**
			* The node index of the source node.
			* @type Number
			*/
			this.source = source;

			/**
			* The node index of the target node.
			* @type Number
			*/
			this.target = target;

			/**
			* Whether the search was successful or not.
			* @type Boolean
			* @default false
			*/
			this.found = false;

			/**
			* The heuristic of the search.
			* @type Object
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
		* @return {Array} The shortest path.
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
		* @return {Array} The search tree.
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


	function compare( a, b ) {

		return ( a.cost < b.cost ) ? - 1 : ( a.cost > b.cost ) ? 1 : 0;

	}

	/**
	* Implementation of Breadth First Search.
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
			* @type Graph
			*/
			this.graph = graph;

			/**
			* The node index of the source node.
			* @type Number
			*/
			this.source = source;

			/**
			* The node index of the target node.
			* @type Number
			*/
			this.target = target;

			/**
			* Whether the search was successful or not.
			* @type Boolean
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
						// because it ensures a maximum of N  edges are ever placed in the queue rather than E edges.
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
		* @return {Array} The shortest path.
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
		* @return {Array} The search tree.
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
	* Implementation of Depth First Search.
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
			* @type Graph
			*/
			this.graph = graph;

			/**
			* The node index of the source node.
			* @type Number
			*/
			this.source = source;

			/**
			* The node index of the target node.
			* @type Number
			*/
			this.target = target;

			/**
			* Whether the search was successful or not.
			* @type Boolean
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
		* @return {Array} The shortest path.
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
		* @return {Array} The search tree.
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
			* @type Graph
			*/
			this.graph = graph;

			/**
			* The node index of the source node.
			* @type Number
			*/
			this.source = source;

			/**
			* The node index of the target node.
			* @type Number
			*/
			this.target = target;

			/**
			* Whether the search was successful or not.
			* @type Boolean
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
		* @return {Array} The shortest path.
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
		* @return {Array} The search tree.
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


	function compare$1( a, b ) {

		return ( a.cost < b.cost ) ? - 1 : ( a.cost > b.cost ) ? 1 : 0;

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
			* @type Vector3
			*/
			this.from = from;

			/**
			* The end point of the line segment.
			* @type Vector3
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
		* Computes the clostest point on an infinite line defined by the line segment.
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

	const v1 = new Vector3();
	const v2 = new Vector3();

	/**
	* Class representing a plane in 3D space. The plane is specified in Hessian normal form.
	*
	* @author {@link https://github.com/Mugen87|Mugen87}
	*/
	class Plane {

		/**
		* Constructs a new plane with the given values. The sign of __Plane#constant__ determines the side of the plane on which the origin is located.
		*
		* @param {Vector3} normal - The normal vector of the plane.
		* @param {Number} constant - The distance of the plane from the origin.
		*/
		constructor( normal = new Vector3( 0, 0, 1 ), constant = 0 ) {

			/**
			* The normal vector of the plane.
			* @type Vector3
			*/
			this.normal = normal;

			/**
			* The distance of the plane from the origin.
			* @type Number
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

			v1.subVectors( c, b ).cross( v2.subVectors( a, b ) ).normalize();

			this.fromNormalAndCoplanarPoint( v1, a );

			return this;

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

	const v1$1 = new Vector3();
	const edge1 = new Vector3();
	const edge2 = new Vector3();
	const normal = new Vector3();

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
			* @type Vector3
			*/
			this.origin = origin;

			/**
			* The direction of the ray.
			* @type Vector3
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

			v1$1.subVectors( sphere.center, this.origin );
			const tca = v1$1.dot( this.direction );
			const d2 = v1$1.dot( v1$1 ) - tca * tca;
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
		* Performs a ray/AABB intersection test and stores the intersection point
		* to the given 3D vector. If no intersection is detected, *null* is returned.
		*
		* @param {BoundingSphere} sphere - A bounding sphere.
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
		* Performs a ray/triangle intersection test and stores the intersection point
		* to the given 3D vector. If no intersection is detected, *null* is returned.
		*
		* @param {Triangle} triangle - A triangle.
		* @param {Vector3} result - The result vector.
		* @return {Vector3} The result vector.
		*/
		intersectTriangle( triangle, backfaceCulling, result ) {

			// referenc: https://www.geometrictools.com/GTEngine/Include/Mathematics/GteIntrRay3Triangle3.h

			const a = triangle.a;
			const b = triangle.b;
			const c = triangle.c;

			edge1.subVectors( b, a );
			edge2.subVectors( c, a );
			normal.crossVectors( edge1, edge2 );

			let DdN = this.direction.dot( normal );
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

			v1$1.subVectors( this.origin, a );
			const DdQxE2 = sign * this.direction.dot( edge2.crossVectors( v1$1, edge2 ) );

			// b1 < 0, no intersection

			if ( DdQxE2 < 0 ) {

				return null;

			}

			const DdE1xQ = sign * this.direction.dot( edge1.cross( v1$1 ) );

			// b2 < 0, no intersection

			if ( DdE1xQ < 0 ) {

				return null;

			}

			// b1 + b2 > 1, no intersection

			if ( DdQxE2 + DdE1xQ > DdN ) {

				return null;

			}

			// line intersects triangle, check if ray does

			const QdN = - sign * v1$1.dot( normal );

			// t < 0, no intersection

			if ( QdN < 0 ) {

				return null;

			}

			// ray intersects triangle

			return this.at( QdN / DdN, result );

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
			* @type Vector3
			*/
			this.position = position;

			/**
			* Custom user data connected to this node.
			* @type Object
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

						if ( distanceSquared <= range ) {

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
	* to find the shortest path through this corridor as a sequence of waypoints.
	* Code is based on the following {@link https://github.com/nickjanssen/PatrolJS/blob/master/patrol.js implementation}.
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
			* @type Array
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
		* @return {Array} An array of 3D waypoints.
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

				if ( MathUtils.area( portalApex, portalRight, right ) <= 0.0 ) {

					if ( portalApex === portalRight || MathUtils.area( portalApex, portalLeft, right ) > 0.0 ) {

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

				if ( MathUtils.area( portalApex, portalLeft, left ) >= 0.0 ) {

					if ( portalApex === portalLeft || MathUtils.area( portalApex, portalRight, left ) < 0.0 ) {

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
	* Implementation of a half-edge data structure, also known as
	* {@link https://en.wikipedia.org/wiki/Doubly_connected_edge_list Doubly connected edge list}.
	*
	* @author {@link https://github.com/Mugen87|Mugen87}
	*/
	class HalfEdge {

		/**
		* Constructs a new half-edge.
		*
		* @param {Vector3} vertex - The (origin) vertex of this half-edge.
		*/
		constructor( vertex = new Vector3() ) {

			/**
			* The (origin) vertex of this half-edge.
			* @type Vector3
			*/
			this.vertex = vertex;

			/**
			* A reference to the next half-edge.
			* @type HalfEdge
			*/
			this.next = null;

			/**
			* A reference to the previous half-edge.
			* @type HalfEdge
			*/
			this.prev = null;

			/**
			* A reference to the opponent half-edge.
			* @type HalfEdge
			*/
			this.twin = null;

			/**
			* A reference to its polygon/face.
			* @type Polygon
			*/
			this.polygon = null;

			/**
			* The unique index of the vertex.
			* @type number
			*/
			this.nodeIndex = - 1;

		}

		/**
		* Returns the origin vertex of this half-edge.
		*
		* @return {Vector3} The origin vertex.
		*/
		from() {

			return this.vertex;

		}

		/**
		* Returns the destintation vertex of this half-edge.
		*
		* @return {Vector3} The destintation vertex.
		*/
		to() {

			return this.next ? this.next.vertex : null;

		}

		/**
		* Computes the length of this half-edge.
		*
		* @return {Number} The length of this half-edge.
		*/
		length() {

			const from = this.from();
			const to = this.to();

			if ( to !== null ) {

				return from.distanceTo( to );

			}

			return - 1;

		}

		/**
		* Computes the squared length of this half-edge.
		*
		* @return {Number} The squared length of this half-edge.
		*/
		squaredLength() {

			const from = this.from();
			const to = this.to();

			if ( to !== null ) {

				return from.squaredDistanceTo( to );

			}

			return - 1;

		}

	}

	const pointOnLineSegment = new Vector3();
	const closestPoint = new Vector3();
	const edgeDirection = new Vector3();
	const movementDirection = new Vector3();
	const newPosition = new Vector3();
	const lineSegment = new LineSegment();

	/**
	* Implementation of a navigation mesh. A navigation mesh is a network of convex polygons
	* which define the walkable areas of a game environment. A convex polygon allows unobstructed travel
	* from any point in the polygon to any other. This is useful because it enables the navigation mesh
	* to be represented using a graph where each node represents a convex polygon and their respective edges
	* represent the neighborly relations to other polygons. More compact navigation graphs leads
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
			* @type Graph
			*/
			this.graph = new Graph();
			this.graph.digraph = true;

			/**
			* The list of convex regions.
			* @type Array
			*/
			this.regions = new Array();

			/**
			* A reference to a spatial index.
			* @type CellSpacePartitioning
			* @default null
			*/
			this.spatialIndex = null;

			/**
			* The tolerance value for the coplanar test.
			* @type Number
			* @default 1e-3
			*/
			this.epsilonCoplanarTest = 1e-3;

			/**
			* The tolerance value for the containment test.
			* @type Number
			* @default 1
			*/
			this.epsilonContainsTest = 1;

		}

		/**
		* Creates the navigation mesh from an array of convex polygons.
		*
		* @param {Array} polygons - An array of convex polygons.
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

					if ( edge0.from().equals( edge1.to() ) && edge0.to().equals( edge1.from() ) ) {

						// twin found, set references

						edge0.twin = edge1;
						edge1.twin = edge0;

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

			// hald-edge data structure is now complete, begin build of convex regions

			this._buildRegions( sortedEdgeList );

			// ensure unique node indices for all twin edges

			this._buildNodeIndices();

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
		getClosestRegion( point ) {

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
		* of this method for complex navigation meshes can greatly reduced by using a spatial index.
		* If not convex region contains the point, *null* is returned.
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
		* Returns the shortest path that leads from the given start position to the end position.
		* The computational overhead of this method for complex navigation meshes can greatly
		* reduced by using a spatial index.
		*
		* @param {Vector3} from - The start/source position.
		* @param {Vector3} to - The end/destination position.
		* @return {Array} The shortest path as an array of points.
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

				// source and target are not in same region, peform search

				const source = this.regions.indexOf( fromRegion );
				const target = this.regions.indexOf( toRegion );

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

						region.getPortalEdgeTo( nextRegion, portalEdge );

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
		* movement is clamped along the contour of the navigation mesh.
		*
		* @param {Polygon} currentRegion - The current convex region of the game entity.
		* @param {Vector3} startPosition - The original start position of the entity for the current simulation step.
		* @param {Vector3} endPosition - The original end position of the entity for the current simulation step.
		* @param {Vector3} clampPosition - The clamped position of the entity for the current simulation step.
		* @return {Polygon} The new convex region the game entity is in.
		*/
		clampMovement( currentRegion, startPosition, endPosition, clampPosition ) {

			let newRegion = this.getRegionForPoint( endPosition, this.epsilonContainsTest );

			// endPosition lies outside navMesh

			if ( newRegion === null ) {

				if ( currentRegion === null ) throw new Error( 'YUKA.NavMesh.clampMovement(): No current region available.' );

				// determine closest edge in current convex region

				let closestEdge = null;
				let minDistance = Infinity;

				let edge = currentRegion.edge;

				do {

					// only consider border edges

					if ( edge.twin === null ) {

						lineSegment.set( edge.vertex, edge.next.vertex );
						const t = lineSegment.closestPointToPointParameter( startPosition );
						lineSegment.at( t, pointOnLineSegment );

						const distance = pointOnLineSegment.squaredDistanceTo( startPosition );

						if ( distance < minDistance ) {

							minDistance = distance;

							closestEdge = edge;
							closestPoint.copy( pointOnLineSegment );

						}

					}

					edge = edge.next;

				} while ( edge !== currentRegion.edge );

				// calculate movement and edge direction

				edgeDirection.subVectors( closestEdge.next.vertex, closestEdge.vertex ).normalize();
				const length = movementDirection.subVectors( endPosition, startPosition ).length();
				movementDirection.divideScalar( length );

				// this value influences the speed at which the entity moves along the edge

				const f = edgeDirection.dot( movementDirection );

				// calculate new position on the edge

				newPosition.copy( closestPoint ).add( edgeDirection.multiplyScalar( f * length ) );

				// the following value "t" tells us if the point exceeds the line segment

				lineSegment.set( closestEdge.vertex, closestEdge.next.vertex );
				const t = lineSegment.closestPointToPointParameter( newPosition, false );

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
		* partitons of the spatial index.
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

			//

			for ( let i = 0, l = regions.length; i < l; i ++ ) {

				const region = regions[ i ];

				region.computeCentroid();

			}

		}

		_buildNodeIndices() {

			const regions = this.regions;

			const indicesMap = new Map();
			let nextNodeIndex = 0;

			for ( let i = 0, l = regions.length; i < l; i ++ ) {

				const region = regions[ i ];

				let edge = region.edge;

				do {

					// only edges with a twin reference needs to be considered

					if ( edge.twin !== null && edge.nodeIndex === null ) {

						let nodeIndex = - 1;
						const position = edge.from();

						// check all existing entries

						for ( const [ index, pos ] of indicesMap.entries() ) {

							if ( position.equals( pos ) === true ) {

								// found, use the existing index

								nodeIndex = index;
								break;

							}

						}

						// if no suitable index was found, create a new one

						if ( nodeIndex === - 1 ) {

							nodeIndex = nextNodeIndex ++;
							indicesMap.set( nodeIndex, position );

						}

						// assign unique node index to edge

						edge.nodeIndex = nodeIndex;
						edge.twin.next.nodeIndex = nodeIndex;

					}

					edge = edge.next;

				} while ( edge !== region.edge );

			}

		}

		_buildGraph() {

			const graph = this.graph;
			const regions = this.regions;

			// for each region, the code creates an array of directly accessible node indices

			const regionNeighbourhood = new Array();

			for ( let i = 0, l = regions.length; i < l; i ++ ) {

				const region = regions[ i ];

				const regionIndices = new Array();
				regionNeighbourhood.push( regionIndices );

				let edge = region.edge;
				do {

					if ( edge.twin !== null ) {

						regionIndices.push( this.regions.indexOf( edge.twin.polygon ) );

						// add node to graph if necessary

						if ( graph.hasNode( this.regions.indexOf( edge.polygon ) ) === false ) {

							graph.addNode( new NavNode( this.regions.indexOf( edge.polygon ), edge.polygon.centroid ) );

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

	}

	//

	function descending( a, b ) {

		return ( a.cost < b.cost ) ? 1 : ( a.cost > b.cost ) ? - 1 : 0;

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
			* @type Vector3
			*/
			this.centroid = new Vector3();

			/**
			* A reference to the first half-edge of this polygon.
			* @type Vector3
			*/
			this.edge = null;

			/**
			* A plane abstraction of this polygon.
			* @type Plane
			*/
			this.plane = new Plane();

		}

		/**
		* Creates the polygon based on the given array of points in 3D space.
		* The method assumes the contour (the sequence of points) is defined
		* in CCW order.
		*
		* @param {Array} points - The array of points.
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

				if ( i === 0 ) {

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

				centroid.add( edge.from() );

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

				const v1 = edge.from();
				const v2 = edge.to();

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
		* @return {Boolean} Whether this polygon is convex or not.
		*/
		convex() {

			let edge = this.edge;

			do {

				const v1 = edge.from();
				const v2 = edge.to();
				const v3 = edge.next.to();

				if ( leftOn( v1, v2, v3 ) === false ) {

					return false;

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

				const distance = plane.distanceToPoint( edge.from() );

				if ( Math.abs( distance ) > epsilon ) {

					return false;

				}

				edge = edge.next;

			} while ( edge !== this.edge );

			return true;

		}

		/**
		* Determines the contour (sequence of points) of this polygon and
		* stores the result in the given array.
		*
		* @param {Array} result - The result array.
		* @return {Array} The result array.
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

		/**
		* Determines the portal edge that can be used to reach the
		* given polygon over its twin reference. The result is stored
		* in the given portal edge data structure.
		*
		* @param {Polygon} polygon - The array of points.
		* @param {Object} portalEdge - The portal edge.
		* @return {Object} The portal edge.
		*/
		getPortalEdgeTo( polygon, portalEdge ) {

			let edge = this.edge;

			do {

				if ( edge.twin !== null ) {

					if ( edge.twin.polygon === polygon ) {

						portalEdge.left = edge.vertex;
						portalEdge.right = edge.next.vertex;
						return portalEdge;

					}

				}

				edge = edge.next;

			} while ( edge !== this.edge );

			portalEdge.left = null;
			portalEdge.right = null;

			return portalEdge;

		}

	}

	// from the book "Computational Geometry in C, Joseph O'Rourke"

	function leftOn( a, b, c ) {

		return MathUtils.area( a, b, c ) >= 0;

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
		* @param {Object} options - The configuration object.
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

					if ( options.epsilonCoplanarTest ) navMesh.epsilonCoplanarTest = options.epsilonCoplanarTest;

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

				// non-indexed geometry

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

				const definitions = this.json[ type + ( type === 'mesh' ? 'es' : 's' ) ] || [];

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

				// assuming a single primitve

				const primitive = definition.primitives[ 0 ];

				if ( primitive.mode !== 4 ) {

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

	function extractUrlBase( url ) {

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
			* @type AABB
			*/
			this.aabb = aabb;

			/**
			* The list of entries which belong to this cell.
			* @type Array
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

	}

	const clampedPosition = new Vector3();
	const aabb = new AABB();
	const contour = new Array();

	/**
	* This class is used for cell-space partitioning, a basic approach for implementing
	* a spatial index. The 3D space is divided up into a number of cells. A cell contains a
	* list of references to all the entities it contains. Compared to other spatial indices like
	* octrees, the division of the 3D space is coarse and often not balanced but the computational
	* overhead for calculating the index of a specifc cell based on a position vector is very fast.
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
			* @type Array
			*/
			this.cells = new Array();

			/**
			* The width of the entire spatial index.
			* @type Number
			*/
			this.width = width;

			/**
			* The height of the entire spatial index.
			* @type Number
			*/
			this.height = height;

			/**
			* The depth of the entire spatial index.
			* @type Number
			*/
			this.depth = depth;

			/**
			* The amount of cells along the x-axis.
			* @type Number
			*/
			this.cellsX = cellsX;

			/**
			* The amount of cells along the y-axis.
			* @type Number
			*/
			this.cellsY = cellsY;

			/**
			* The amount of cells along the z-axis.
			* @type Number
			*/
			this.cellsZ = cellsZ;

			this._halfWidth = width / 2;
			this._halfHeight = height / 2;
			this._halfDepth = depth / 2;

			this._min = new Vector3( - this._halfWidth, - this._halfHeight, - this._halfDepth );
			this._max = new Vector3( this._halfWidth, this._halfHeight, this._halfDepth );

			//

			const cellSizeX = width / cellsX;
			const cellSizeY = height / cellsY;
			const cellSizeZ = depth / cellsZ;

			for ( let i = 0; i < cellsX; i ++ ) {

				const x = ( i * cellSizeX ) - this._halfWidth;

				for ( let j = 0; j < cellsY; j ++ ) {

					const y = ( j * cellSizeY ) - this._halfHeight;

					for ( let k = 0; k < cellsZ; k ++ ) {

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
		* Computes the parition index for the given position vector.
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
		* then performs an ntersection test with all non-empty cells in order to determine
		* relevant paritions. Stores the result in the given result array.
		*
		* @param {Vector3} position - The given query position.
		* @param {Number} radius - The given query radius.
		* @param {Array} result - The result array.
		* @return {Array} The result array.
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
			* @type GameEntity
			*/
			this.entity = entity;

			/**
			* Records the time the entity was last sensed (e.g. seen or heard). Used to determine
			* if a game entity can "remember" this record or not.
			* @type Number
			* @default - 1
			*/
			this.timeLastSensed = - 1;

			/**
			*	Marks the position where the opponent was last sensed.
			* @type Vector3
			*/
			this.lastSensedPosition = new Vector3();

			/**
			* Whether this game entity is visible or not.
			* @type Boolean
			* @default false
			*/
			this.visible = false;

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
			* @type GameEntity
			*/
			this.owner = owner;

			/**
			* Used to simulate memory of sensory events. It contains {@link MemoryRecord memory record}
			* of all relevant game entities in the environment. The records are usually update by
			* the owner of the memory system.
			* @type Array
			*/
			this.records = new Array();

			/**
			* Same as {@link MemorySystem#records} but used for fast access via the ID
			* of the game entity.
			* @type Map
			*/
			this.recordsMap = new Map();

			/**
			* Represents the duration of the game entities short term memory in seconds.
			* When a bot requests a list of all recently sensed game entities, this value
			* is used to determine if the bot is able to remember a game entity or not.
			* @type Number
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

			return this.recordsMap.get( entity.id );

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
			this.recordsMap.set( entity.id, record );

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
			this.recordsMap.delete( entity.id );

			return this;

		}

		/**
		* Returns true if there is a memory record for the given game entity.
		*
		* @param {GameEntity} entity - The game entity.
		* @return {Boolean} Whether the game entity has a memory record or not.
		*/
		hasRecord( entity ) {

			return this.recordsMap.has( entity.id );

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
		* @param {Array} result - The result array.
		* @return {Array} The result array.
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

	}

	const boundingSphere = new BoundingSphere();
	const triangle = { a: new Vector3(), b: new Vector3(), c: new Vector3() };
	const intersectionPointBoundingVolume = new Vector3();
	const rayLocal = new Ray();
	const plane = new Plane();
	const inverseMatrix = new Matrix4();

	/**
	* Class for representing an obstacle in 3D space.
	*
	* @author {@link https://github.com/Mugen87|Mugen87}
	* @augments GameEntity
	*/
	class Obstacle extends GameEntity {

		/**
		* Constructs a new obstacle.
		*
		* @param {MeshGeometry} geometry - A geometry representing a mesh.
		*/
		constructor( geometry = new MeshGeometry() ) {

			super();

			/**
			* Represents the geometry of this obstacle.
			* @type MeshGeometry
			*/
			this.geometry = geometry;

		}

		/**
		* Performs a ray intersection test with the geometry of the obstacle and stores
		* the intersection point in the given result vector. If no intersection is detected,
		* *null* is returned.
		*
		* @param {Ray} ray - The ray to test.
		* @param {Vector3} intersectionPoint - The intersection point.
		* @param {Vector3} normal - The normal vector of the respective triangle.
		* @return {Vector3} The result vector.
		*/
		intersectRay( ray, intersectionPoint, normal = null ) {

			const geometry = this.geometry;

			// check bounding sphere first in world space

			boundingSphere.copy( geometry.boundingSphere ).applyMatrix4( this.worldMatrix );

			if ( ray.intersectBoundingSphere( boundingSphere, intersectionPointBoundingVolume ) !== null ) {

				// transform the ray into the local space of the obstacle

				this.worldMatrix.getInverse( inverseMatrix );
				rayLocal.copy( ray ).applyMatrix4( inverseMatrix );

				// check AABB in local space since its more expensive to convert an AABB to world space than a bounding sphere

				if ( rayLocal.intersectAABB( geometry.aabb, intersectionPointBoundingVolume ) !== null ) {

					// now perform more expensive test with all triangles of the geometry

					const vertices = geometry.vertices;
					const indices = geometry.indices;

					if ( indices === null ) {

						// non-indexed geometry

						for ( let i = 0, l = vertices.length; i < l; i += 9 ) {

							triangle.a.set( vertices[ i ], vertices[ i + 1 ], vertices[ i + 2 ] );
							triangle.b.set( vertices[ i + 3 ], vertices[ i + 4 ], vertices[ i + 5 ] );
							triangle.c.set( vertices[ i + 6 ], vertices[ i + 7 ], vertices[ i + 8 ] );

							if ( rayLocal.intersectTriangle( triangle, geometry.backfaceCulling, intersectionPoint ) !== null ) {

								// transform intersection point back to world space

								intersectionPoint.applyMatrix4( this.worldMatrix );

								// compute normal of triangle in world space if necessary

								if ( normal !== null ) {

									plane.fromCoplanarPoints( triangle.a, triangle.b, triangle.c );
									normal.copy( plane.normal );
									normal.transformDirection( this.worldMatrix );

								}

								return intersectionPoint;

							}

						}

					} else {

						// indexed geometry

						for ( let i = 0, l = indices.length; i < l; i += 3 ) {

							const a = indices[ i ];
							const b = indices[ i + 1 ];
							const c = indices[ i + 2 ];

							const stride = 3;

							triangle.a.set( vertices[ ( a * stride ) ], vertices[ ( a * stride ) + 1 ], vertices[ ( a * stride ) + 2 ] );
							triangle.b.set( vertices[ ( b * stride ) ], vertices[ ( b * stride ) + 1 ], vertices[ ( b * stride ) + 2 ] );
							triangle.c.set( vertices[ ( c * stride ) ], vertices[ ( c * stride ) + 1 ], vertices[ ( c * stride ) + 2 ] );

							if ( rayLocal.intersectTriangle( triangle, geometry.backfaceCulling, intersectionPoint ) !== null ) {

								// transform intersection point back to world space

								intersectionPoint.applyMatrix4( this.worldMatrix );

								// compute normal of triangle in world space if necessary

								if ( normal !== null ) {

									plane.fromCoplanarPoints( triangle.a, triangle.b, triangle.c );
									normal.copy( plane.normal );
									normal.transformDirection( this.worldMatrix );

								}

								return intersectionPoint;

							}

						}

					}

				}

			}

			return null;

		}

	}

	const toPoint = new Vector3();
	const direction = new Vector3();
	const ray = new Ray();
	const intersectionPoint = new Vector3();

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
			* @type GameEntity
			*/
			this.owner = owner;

			/**
			* The field of view in radians.
			* @type Number
			* @default π/2
			*/
			this.fieldOfView = Math.PI;

			/**
			* The visual range in world units.
			* @type Number
			* @default Infinity
			*/
			this.range = Infinity;

			/**
			* An array of {@link Obstacle obstacles}.
			* @type Array
			*/
			this.obstacles = new Array();

		}

		/**
		* Adds an obstacle to this vision instance.
		*
		* @param {Obstacle} obstacle - The obstacle to add.
		* @return {Vision} A reference to this vision instance.
		*/
		addObstacle( obstacle ) {

			this.obstacles.push( obstacle );

			return this;

		}

		/**
		* Removes an obstacle from this vision instance.
		*
		* @param {Obstacle} obstacle - The obstacle to remove.
		* @return {Vision} A reference to this vision instance.
		*/
		removeObstacle( obstacle ) {

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

			// check if point lies within the game entity's visual range

			toPoint.subVectors( point, owner.position );
			const distanceToPoint = toPoint.length();

			if ( distanceToPoint > this.range ) return false;

			// next, check if the point lies within the game entity's field of view

			owner.getDirection( direction );

			const angle = direction.angleTo( toPoint );

			if ( angle > ( this.fieldOfView * 0.5 ) ) return false;

			// the point lies within the game entity's visual range and field
			// of view. now check if obstacles block the game entity's view to the given point.

			ray.origin.copy( owner.position );
			ray.direction.copy( toPoint ).divideScalar( distanceToPoint || 1 ); // normalize

			for ( let i = 0, l = obstacles.length; i < l; i ++ ) {

				const obstacle = obstacles[ i ];

				const intersection = obstacle.intersectRay( ray, intersectionPoint );

				if ( intersection !== null ) {

					// if an intersection point is closer to the game entity than the given point,
					// something is blocking the game entity's view

					const squaredDistanceToIntersectionPoint = intersectionPoint.squaredDistanceTo( owner.position );

					if ( squaredDistanceToIntersectionPoint <= ( distanceToPoint * distanceToPoint ) ) return false;

				}

			}

			return true;

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
			* @type Boolean
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

	}

	/**
	* This class can be used to smooth the result of a vector calculation. One use case
	* is the smoothing of the velocity vector of game entities in order to avoid a shaky
	* movements du to conflicting forces.
	*
	* @author {@link https://github.com/Mugen87|Mugen87}
	* @author {@link https://github.com/robp94|robp94}
	*/
	class Smoother {

		/**
		* Constructs a new smoother.
		*
		* @param  {Number} count - The amount of samples the smoother will use to average a vector.
		*/
		constructor( count = 10 ) {

			/**
			* The amount of samples the smoother will use to average a vector.
			* @type Number
			* @default 10
			*/
			this.count = count;

			this._history = []; // this holds the history
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

	}

	/**
	* Base class for all concrete steering behaviors. They produce a force that describes
	* where an agent should move and how fast it should travel to get there.
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
			* @type Boolean
			* @default true
			*/
			this.active = true;

			/**
			* Can be used to tweak the amount that a steering force contributes to the total steering force.
			* @type Number
			* @default 1
			*/
			this.weigth = 1;

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
		* @param  {Vehicle} vehicle - The vehicle that owns this steering manager.
		*/
		constructor( vehicle ) {

			/**
			* The vehicle that owns this steering manager.
			* @type Vehicle
			*/
			this.vehicle = vehicle;

			/**
			* A list of all steering behaviors.
			* @type Array
			*/
			this.behaviors = new Array();

			this._steeringForce = new Vector3(); // the calculated steering force per simulation step

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

					force.multiplyScalar( behavior.weigth );

					if ( this._accumulate( force ) === false ) return;

				}

			}

		}

	}

	const steeringForce = new Vector3();
	const displacement$1 = new Vector3();
	const acceleration = new Vector3();
	const target$1 = new Vector3();
	const velocitySmooth = new Vector3();

	/**
	* This type of game entity implements a special type of locomotion, the so called
	* *Vehicle Model*. The class uses basic physical metrics in order to implement a
	* realisitic movement.
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
			* The mass if the vehicle in kilogram.
			* @type Number
			* @default 1
			*/
			this.mass = 1;

			/**
			* The maximum force this entity can produce to power itself.
			* @type Number
			* @default 100
			*/
			this.maxForce = 100;

			/**
			* The steering manager of this vehicle.
			* @type SteeringManager
			*/
			this.steering = new SteeringManager( this );

			/**
			* An optional smoother to avoid shakiness due to conflicting steering behaviors.
			* @type Smoother
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

			displacement$1.copy( this.velocity ).multiplyScalar( delta );

			// calculate target position

			target$1.copy( this.position ).add( displacement$1 );

			// update the orientation if the vehicle has a non zero velocity

			if ( this.updateOrientation === true && this.smoother === null && this.getSpeedSquared() > 0.00000001 ) {

				this.lookAt( target$1 );

			}

			// update position

			this.position.copy( target$1 );

			// if smoothing is enabled, the orientation (not the position!) of the vehicle is
			// changed based on a post-processed velocity vector

			if ( this.updateOrientation === true && this.smoother !== null ) {

				this.smoother.calculate( this.velocity, velocitySmooth );

				displacement$1.copy( velocitySmooth ).multiplyScalar( delta );
				target$1.copy( this.position ).add( displacement$1 );

				this.lookAt( target$1 );

			}

			return this;

		}

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

	const desiredVelocity = new Vector3();
	const displacement$2 = new Vector3();

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
		*/
		constructor( target = new Vector3(), deceleration = 3 ) {

			super();

			/**
			* The target vector.
			* @type Vector3
			*/
			this.target = target;

			/**
			* The amount of deceleration.
			* @type Number
			* @default 3
			*/
			this.deceleration = deceleration;

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

			displacement$2.subVectors( target, vehicle.position );

			const distance = displacement$2.length();

			if ( distance > 0 ) {

				// calculate the speed required to reach the target given the desired deceleration

				let speed = distance / deceleration;

				// make sure the speed does not exceed the max

				speed = Math.min( speed, vehicle.maxSpeed );

				// from here proceed just like "seek" except we don't need to normalize
				// the "displacement" vector because we have already gone to the trouble
				// of calculating its length.

				desiredVelocity.copy( displacement$2 ).multiplyScalar( speed / distance );

				force.subVectors( desiredVelocity, vehicle.velocity );

			}

			return force;

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
			* @type Vector3
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

	const desiredVelocity$2 = new Vector3();

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
			* @type Vector3
			*/
			this.target = target;

			/**
			* The agent only flees from the target if it is inside this radius.
			* @type Number
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

				desiredVelocity$2.subVectors( vehicle.position, target ).normalize();

				// if target and vehicle position are identical, choose default velocity

				if ( desiredVelocity$2.squaredLength() === 0 ) {

					desiredVelocity$2.set( 0, 0, 1 );

				}

				desiredVelocity$2.multiplyScalar( vehicle.maxSpeed );

				force.subVectors( desiredVelocity$2, vehicle.velocity );

			}

			return force;

		}

	}

	const displacement$3 = new Vector3();
	const newPuruserVelocity = new Vector3();
	const predcitedPosition = new Vector3();

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
		* @param {Number} panicDistance -  The agent only flees from the pursuer if it is inside this radius.
		* @param {Number} predictionFactor -  This factor determines how far the vehicle predicts the movement of the pursuer.
		*/
		constructor( pursuer = null, panicDistance = 10, predictionFactor = 1 ) {

			super();

			/**
			* The agent to evade from.
			* @type MovingEntity
			* @default null
			*/
			this.pursuer = pursuer;

			/**
			* The agent only flees from the pursuer if it is inside this radius.
			* @type Number
			* @default 10
			*/
			this.panicDistance = panicDistance;

			/**
			* This factor determines how far the vehicle predicts the movement of the pursuer.
			* @type Number
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

			displacement$3.subVectors( pursuer.position, vehicle.position );

			let lookAheadTime = displacement$3.length() / ( vehicle.maxSpeed + pursuer.getSpeed() );
			lookAheadTime *= this.predictionFactor; // tweak the magnitude of the prediction

			// calculate new velocity and predicted future position

			newPuruserVelocity.copy( pursuer.velocity ).multiplyScalar( lookAheadTime );
			predcitedPosition.addVectors( pursuer.position, newPuruserVelocity );

			// now flee away from predicted future position of the pursuer

			this._flee.target = predcitedPosition;
			this._flee.panicDistance = this.panicDistance;
			this._flee.calculate( vehicle, force );

			return force;

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
			* @type MovingEntity
			*/
			this.path = path;

			/**
			* The distance the agent seeks for the next waypoint.
			* @type Number
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

	}

	const midPoint = new Vector3();
	const translation = new Vector3();
	const predcitedPosition1 = new Vector3();
	const predcitedPosition2 = new Vector3();

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
			* @type MovingEntity
			* @default null
			*/
			this.entity1 = entity1;

			/**
			* The second agent.
			* @type MovingEntity
			* @default null
			*/
			this.entity2 = entity2;

			/**
			* The amount of deceleration.
			* @type Number
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

			translation.copy( entity1.velocity ).multiplyScalar( time );
			predcitedPosition1.addVectors( entity1.position, translation );

			translation.copy( entity2.velocity ).multiplyScalar( time );
			predcitedPosition2.addVectors( entity2.position, translation );

			// calculate the mid point of these predicted positions

			midPoint.addVectors( predcitedPosition1, predcitedPosition2 ).multiplyScalar( 0.5 );

			// then steer to arrive at it

			this._arrive.deceleration = this.deceleration;
			this._arrive.target = midPoint;
			this._arrive.calculate( vehicle, force );

			return force;

		}

	}

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
		* @param {Array} obstacles - An Array with obstacle of type {@link GameEntity}.
		*/
		constructor( obstacles = new Array() ) {

			super();

			/**
			* An Array with obstacle of type {@link GameEntity}.
			* @type Array
			*/
			this.obstacles = obstacles;

			/**
			* This factor determines how much the vehicle decelerates if an intersection occurs.
			* @type Number
			* @default 0.2
			*/
			this.brakingWeight = 0.2;

			/**
			* Minimum length of the detection box used for intersection tests.
			* @type Number
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

			vehicle.matrix.getInverse( inverse );

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

	}

	const displacement$4 = new Vector3();
	const vehicleDirection = new Vector3();
	const evaderDirection = new Vector3();
	const newEvaderVelocity = new Vector3();
	const predcitedPosition$1 = new Vector3();

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
		* @param {Number} predictionFactor -  This factor determines how far the vehicle predicts the movement of the evader.
		*/
		constructor( evader = null, predictionFactor = 1 ) {

			super();

			/**
			* The agent to pursue.
			* @type MovingEntity
			* @default null
			*/
			this.evader = evader;

			/**
			* This factor determines how far the vehicle predicts the movement of the evader.
			* @type Number
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

			displacement$4.subVectors( evader.position, vehicle.position );

			// 1. if the evader is ahead and facing the agent then we can just seek for the evader's current position

			vehicle.getDirection( vehicleDirection );
			evader.getDirection( evaderDirection );

			// first condition: evader must be in front of the pursuer

			const evaderAhead = displacement$4.dot( vehicleDirection ) > 0;

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

			let lookAheadTime = displacement$4.length() / ( vehicle.maxSpeed + evader.getSpeed() );
			lookAheadTime *= this.predictionFactor; // tweak the magnitude of the prediction

			// calculate new velocity and predicted future position

			newEvaderVelocity.copy( evader.velocity ).multiplyScalar( lookAheadTime );
			predcitedPosition$1.addVectors( evader.position, newEvaderVelocity );

			// now seek to the predicted future position of the evader

			this._seek.target = predcitedPosition$1;
			this._seek.calculate( vehicle, force );

			return force;

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
		* @param {Numer} radius - The radius of the wander circle for the wander behavior.
		* @param {Numer} distance - The distance the wander circle is projected in front of the agent.
		* @param {Numer} jitter - The maximum amount of displacement along the sphere each frame.
		*/
		constructor( radius = 1, distance = 5, jitter = 5 ) {

			super();

			/**
			* The radius of the constraining circle for the wander behavior.
			* @type Number
			* @default 1
			*/
			this.radius = radius;

			/**
			* The distance the wander sphere is projected in front of the agent.
			* @type Number
			* @default 5
			*/
			this.distance = distance;

			/**
			* The maximum amount of displacement along the sphere each frame.
			* @type Number
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

	}

	//

	function generateRandomPointOnCircle( radius, target ) {

		const theta = Math.random() * Math.PI * 2;

		target.x = radius * Math.cos( theta );
		target.z = radius * Math.sin( theta );

	}

	/**
	 * Base class for represeting tasks. A task is an isolated unit of work that is
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
			 * @type Array
			 */
			this.tasks = new Array();

			/**
			 * Used to control the asynchronous processing.
			 *  - timeout: After this amount of time (in ms), a scheduled task is executed even if
			 *	  doing so risks causing a negative performance impact (e.g. bad frame time).
			 * @type Object
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

	/**
	* Base class for represeting trigger regions. It's a predefine region in 3D space,
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

	}

	const boundingSphereEntity = new BoundingSphere();

	/**
	* Class for represeting a rectangular trigger region as an AABB.
	*
	* @author {@link https://github.com/Mugen87|Mugen87}
	* @augments TriggerRegion
	*/
	class RectangularTriggerRegion extends TriggerRegion {

		/**
		* Constructs a new rectangular trigger region with the given values.
		*
		* @param {Vector3} min - The minimum bounds of the region.
		* @param {Vector3} max - The maximum bounds of the region.
		*/
		constructor( min = new Vector3(), max = new Vector3() ) {

			super();

			this._aabb = new AABB( min, max );

		}

		get min() {

			return this._aabb.min;

		}

		set min( min ) {

			this._aabb.min = min;

		}

		get max() {

			return this._aabb.max;

		}

		set max( max ) {

			this._aabb.max = max;

		}

		/**
		* Creates the new rectangular trigger region from a given position and size.
		*
		* @param {Vector3} position - The center position of the trigger region.
		* @param {Vector3} size - The size of the trigger region per axis.
		* @return {RectangularTriggerRegion} A reference to this trigger region.
		*/
		fromPositionAndSize( position, size ) {

			this._aabb.fromCenterAndSize( position, size );

			return this;

		}

		/**
		* Returns true if the bounding volume of the given game entity touches/intersects
		* the trigger region.
		*
		* @param {GameEntity} entity - The entity to test.
		* @return {Boolean} Whether this trigger touches the given game entity or not.
		*/
		touching( entity ) {

			boundingSphereEntity.set( entity.position, entity.boundingRadius );

			return this._aabb.intersectsBoundingSphere( boundingSphereEntity );

		}

	}

	const boundingSphereEntity$1 = new BoundingSphere();

	/**
	* Class for represeting a spherical trigger region as a bounding sphere.
	*
	* @author {@link https://github.com/Mugen87|Mugen87}
	* @augments TriggerRegion
	*/
	class SphericalTriggerRegion extends TriggerRegion {

		/**
		* Constructs a new spherical trigger region with the given values.
		*
		* @param {Vector3} position - The center position of the region.
		* @param {Number} radius - The radius of the region.
		*/
		constructor( position = new Vector3(), radius = 0 ) {

			super();

			this._boundingSphere = new BoundingSphere( position, radius );

		}

		get position() {

			return this._boundingSphere.center;

		}

		set position( position ) {

			this._boundingSphere.center = position;

		}

		get radius() {

			return this._boundingSphere.radius;

		}

		set radius( radius ) {

			this._boundingSphere.radius = radius;

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

			return this._boundingSphere.intersectsBoundingSphere( boundingSphereEntity$1 );

		}

	}

	/**
	* Base class for represeting triggers. A trigger generates an action if a game entity
	* touches its trigger region, a predefine region in 3D space.
	*
	* @author {@link https://github.com/Mugen87|Mugen87}
	*/
	class Trigger {

		/**
		* Constructs a new trigger with the given values.
		*
		* @param {TriggerRegion} region - The region of the trigger.
		*/
		constructor( region = new TriggerRegion() ) {

			/**
			* Whether this trigger is active or not.
			* @type Boolean
			* @default true
			*/
			this.active = true;

			/**
			* The region of the trigger.
			* @type TriggerRegion
			*/
			this.region = region;

		}

		/**
		* This method is called per simulation step for all game entities. If the game
		* entity touches the region of the trigger, the respective action is executed.
		*
		* @param {GameEntity} entity - The entity to test
		* @return {Trigger} A reference to this trigger.
		*/
		check( entity ) {

			if ( ( this.active === true ) && ( this.region.touching( entity ) === true ) ) {

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
		* Triggers can have internal states. This method is called per simulation step
		* and can be used to update the trigger.
		*
		* @param {Number} delta - The time delta value.
		* @return {Trigger} A reference to this trigger.
		*/
		update( /* delta */ ) {}

	}

	exports.EntityManager = EntityManager;
	exports.EventDispatcher = EventDispatcher;
	exports.GameEntity = GameEntity;
	exports.Logger = Logger;
	exports.MeshGeometry = MeshGeometry;
	exports.MessageDispatcher = MessageDispatcher;
	exports.MovingEntity = MovingEntity;
	exports.Regulator = Regulator;
	exports.Time = Time;
	exports.Telegram = Telegram;
	exports.State = State;
	exports.StateMachine = StateMachine;
	exports.CompositeGoal = CompositeGoal;
	exports.Goal = Goal;
	exports.GoalEvaluator = GoalEvaluator;
	exports.Think = Think;
	exports.Edge = Edge;
	exports.Graph = Graph;
	exports.Node = Node;
	exports.PriorityQueue = PriorityQueue;
	exports.AStar = AStar;
	exports.BFS = BFS;
	exports.DFS = DFS;
	exports.Dijkstra = Dijkstra;
	exports.AABB = AABB;
	exports.BoundingSphere = BoundingSphere;
	exports.LineSegment = LineSegment;
	exports.MathUtils = MathUtils;
	exports.Matrix3 = Matrix3;
	exports.Matrix4 = Matrix4;
	exports.Plane = Plane;
	exports.Quaternion = Quaternion;
	exports.Ray = Ray;
	exports.Vector3 = Vector3;
	exports.NavEdge = NavEdge;
	exports.NavNode = NavNode;
	exports.GraphUtils = GraphUtils;
	exports.Corridor = Corridor;
	exports.HalfEdge = HalfEdge;
	exports.NavMesh = NavMesh;
	exports.NavMeshLoader = NavMeshLoader;
	exports.Polygon = Polygon;
	exports.Cell = Cell;
	exports.CellSpacePartitioning = CellSpacePartitioning;
	exports.MemoryRecord = MemoryRecord;
	exports.MemorySystem = MemorySystem;
	exports.Obstacle = Obstacle;
	exports.Vision = Vision;
	exports.Path = Path;
	exports.Smoother = Smoother;
	exports.SteeringBehavior = SteeringBehavior;
	exports.SteeringManager = SteeringManager;
	exports.Vehicle = Vehicle;
	exports.AlignmentBehavior = AlignmentBehavior;
	exports.ArriveBehavior = ArriveBehavior;
	exports.CohesionBehavior = CohesionBehavior;
	exports.EvadeBehavior = EvadeBehavior;
	exports.FleeBehavior = FleeBehavior;
	exports.FollowPathBehavior = FollowPathBehavior;
	exports.InterposeBehavior = InterposeBehavior;
	exports.ObstacleAvoidanceBehavior = ObstacleAvoidanceBehavior;
	exports.PursuitBehavior = PursuitBehavior;
	exports.SeekBehavior = SeekBehavior;
	exports.SeparationBehavior = SeparationBehavior;
	exports.WanderBehavior = WanderBehavior;
	exports.Task = Task;
	exports.TaskQueue = TaskQueue;
	exports.RectangularTriggerRegion = RectangularTriggerRegion;
	exports.SphericalTriggerRegion = SphericalTriggerRegion;
	exports.TriggerRegion = TriggerRegion;
	exports.Trigger = Trigger;
	exports.HeuristicPolicyEuclid = HeuristicPolicyEuclid;
	exports.HeuristicPolicyEuclidSquared = HeuristicPolicyEuclidSquared;
	exports.HeuristicPolicyManhatten = HeuristicPolicyManhatten;
	exports.HeuristicPolicyDijkstra = HeuristicPolicyDijkstra;
	exports.WorldUp = WorldUp;

	Object.defineProperty(exports, '__esModule', { value: true });

})));
