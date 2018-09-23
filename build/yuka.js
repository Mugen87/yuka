(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.YUKA = {})));
}(this, (function (exports) { 'use strict';

	/**
	 * @author Mugen87 / https://github.com/Mugen87
	 */

	class Telegram {

		constructor( sender, receiver, message, delay, data ) {

			this.sender = sender;
			this.receiver = receiver;
			this.message = message;
			this.delay = delay;
			this.data = data;

		}

	}

	/**
	 * @author Mugen87 / https://github.com/Mugen87
	 */

	/* istanbul ignore next */

	class Logger {

		static setLevel( level ) {

			currentLevel = level;

		}

		static log( ...args ) {

			if ( currentLevel <= Logger.LEVEL.LOG ) console.log( ...args );

		}

		static warn( ...args ) {

			if ( currentLevel <= Logger.LEVEL.WARN ) console.warn( ...args );

		}

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
	 * @author Mugen87 / https://github.com/Mugen87
	 */

	class MessageDispatcher {

		constructor() {

			this.delayedTelegrams = new Array();

		}

		deliver( telegram ) {

			const receiver = telegram.receiver;

			if ( receiver.handleMessage( telegram ) === false ) {

				Logger.warn( 'YUKA.MessageDispatcher: Message not handled by receiver: %o', receiver );

			}

		}

		// send a message to another agent

		dispatch( sender, receiver, message, delay, data ) {

			const telegram = new Telegram( sender, receiver, message, delay, data );

			if ( delay <= 0 ) {

				this.deliver( telegram );

			} else {

				this.delayedTelegrams.push( telegram );

			}

		}

		// process delayed messages

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

		}

		clear() {

			this.delayedTelegrams.length = 0;

		}

	}

	/**
	 * @author Mugen87 / https://github.com/Mugen87
	 */

	const candidates = [];

	class EntityManager {

		constructor() {

			this.entities = new Array();
			this.triggers = new Array();
			this.spatialIndex = null;

			this._entityMap = new Map(); // for fast ID access
			this._indexMap = new Map(); // used by spatial indices
			this._started = new Set(); // used to control the call of GameEntity.start()
			this._messageDispatcher = new MessageDispatcher();

		}

		add( entity ) {

			this.entities.push( entity );
			this._entityMap.set( entity.id, entity );

			entity.manager = this;

			return this;

		}

		remove( entity ) {

			const index = this.entities.indexOf( entity );
			this.entities.splice( index, 1 );

			this._entityMap.delete( entity.id );
			this._started.delete( entity );

			entity.manager = null;

			return this;

		}

		addTrigger( trigger ) {

			this.triggers.push( trigger );

			return this;

		}

		removeTrigger( trigger ) {

			const index = this.triggers.indexOf( trigger );
			this.triggers.splice( index, 1 );

			return this;

		}

		clear() {

			this.entities.length = 0;
			this.triggers.length = 0;

			this._entityMap.clear();
			this._started.clear();

			this._messageDispatcher.clear();

		}

		getEntityById( id ) {

			return this._entityMap.get( id ) || null;

		}

		getEntityByName( name ) {

			const entities = this.entities;

			for ( let i = 0, l = entities.length; i < l; i ++ ) {

				const entity = entities[ i ];

				if ( entity.name === name ) return entity;

			}

			return null;

		}

		update( delta ) {

			const entities = this.entities;
			const triggers = this.triggers;

			// update entities

			for ( let i = 0, l = entities.length; i < l; i ++ ) {

				const entity = entities[ i ];

				this.updateEntity( entity, delta );

			}

			// update triggers

			for ( let i = 0, l = triggers.length; i < l; i ++ ) {

				const trigger = triggers[ i ];

				this.updateTrigger( trigger, delta );

			}

			// handle messaging

			this._messageDispatcher.dispatchDelayedMessages( delta );

		}

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

				for ( let i = 0, l = children.length; i < l; i ++ ) {

					const child = children[ i ];

					this.updateEntity( child );

				}

				//

				if ( this.spatialIndex !== null ) {

					let currentIndex = this._indexMap.get( entity ) || - 1;
					currentIndex = this.spatialIndex.updateEntity( entity, currentIndex );
					this._indexMap.set( entity, currentIndex );

				}

			}

		}

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

		}

		updateTrigger( trigger, delta ) {

			if ( trigger.active === true ) {

				trigger.update( delta );

				const entities = this.entities;

				for ( let i = 0, l = entities.length; i < l; i ++ ) {

					const entity = entities[ i ];

					if ( entity.active === true ) {

						trigger.check( entity );

					}

				}

			}

		}

		sendMessage( sender, receiver, message, delay, data ) {

			this._messageDispatcher.dispatch( sender, receiver, message, delay, data );

		}

	}

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

	/**
	 * @author Mugen87 / https://github.com/Mugen87
	 *
	 * Reference: https://github.com/mrdoob/three.js/blob/master/src/math/Vector3.js
	 *
	 */

	class Vector3 {

		constructor( x = 0, y = 0, z = 0 ) {

			this.x = x;
			this.y = y;
			this.z = z;

		}

		set( x, y, z ) {

			this.x = x;
			this.y = y;
			this.z = z;

			return this;

		}

		copy( v ) {

			this.x = v.x;
			this.y = v.y;
			this.z = v.z;

			return this;

		}

		clone() {

			return new this.constructor().copy( this );

		}

		add( v ) {

			this.x += v.x;
			this.y += v.y;
			this.z += v.z;

			return this;

		}

		addScalar( s ) {

			this.x += s;
			this.y += s;
			this.z += s;

			return this;

		}

		addVectors( a, b ) {

			this.x = a.x + b.x;
			this.y = a.y + b.y;
			this.z = a.z + b.z;

			return this;

		}

		sub( v ) {

			this.x -= v.x;
			this.y -= v.y;
			this.z -= v.z;

			return this;

		}

		subScalar( s ) {

			this.x -= s;
			this.y -= s;
			this.z -= s;

			return this;

		}

		subVectors( a, b ) {

			this.x = a.x - b.x;
			this.y = a.y - b.y;
			this.z = a.z - b.z;

			return this;

		}

		multiply( v ) {

			this.x *= v.x;
			this.y *= v.y;
			this.z *= v.z;

			return this;

		}

		multiplyScalar( s ) {

			this.x *= s;
			this.y *= s;
			this.z *= s;

			return this;

		}

		multiplyVectors( a, b ) {

			this.x = a.x * b.x;
			this.y = a.y * b.y;
			this.z = a.z * b.z;

			return this;

		}

		divide( v ) {

			this.x /= v.x;
			this.y /= v.y;
			this.z /= v.z;

			return this;

		}

		divideScalar( s ) {

			this.x /= s;
			this.y /= s;
			this.z /= s;

			return this;

		}

		divideVectors( a, b ) {

			this.x = a.x / b.x;
			this.y = a.y / b.y;
			this.z = a.z / b.z;

			return this;

		}

		clamp( min, max ) {

			this.x = Math.max( min.x, Math.min( max.x, this.x ) );
			this.y = Math.max( min.y, Math.min( max.y, this.y ) );
			this.z = Math.max( min.z, Math.min( max.z, this.z ) );

			return this;

		}

		min( v ) {

			this.x = Math.min( this.x, v.x );
			this.y = Math.min( this.y, v.y );
			this.z = Math.min( this.z, v.z );

			return this;

		}

		max( v ) {

			this.x = Math.max( this.x, v.x );
			this.y = Math.max( this.y, v.y );
			this.z = Math.max( this.z, v.z );

			return this;

		}

		dot( v ) {

			return ( this.x * v.x ) + ( this.y * v.y ) + ( this.z * v.z );

		}

		cross( v ) {

			const x = this.x, y = this.y, z = this.z;

			this.x = ( y * v.z ) - ( z * v.y );
			this.y = ( z * v.x ) - ( x * v.z );
			this.z = ( x * v.y ) - ( y * v.x );

			return this;

		}

		crossVectors( a, b ) {

			const ax = a.x, ay = a.y, az = a.z;
			const bx = b.x, by = b.y, bz = b.z;

			this.x = ( ay * bz ) - ( az * by );
			this.y = ( az * bx ) - ( ax * bz );
			this.z = ( ax * by ) - ( ay * bx );

			return this;

		}

		angleTo( v ) {

			const theta = this.dot( v ) / ( Math.sqrt( this.squaredLength() * v.squaredLength() ) );

			// clamp, to handle numerical problems

			return Math.acos( _Math.clamp( theta, - 1, 1 ) );

		}

		length() {

			return Math.sqrt( this.squaredLength() );

		}

		squaredLength() {

			return this.dot( this );

		}

		manhattanLength() {

			return Math.abs( this.x ) + Math.abs( this.y ) + Math.abs( this.z );

		}

		distanceTo( v ) {

			return Math.sqrt( this.squaredDistanceTo( v ) );

		}

		squaredDistanceTo( v ) {

			const dx = this.x - v.x, dy = this.y - v.y, dz = this.z - v.z;

			return ( dx * dx ) + ( dy * dy ) + ( dz * dz );

		}

		manhattanDistanceTo( v ) {

			const dx = this.x - v.x, dy = this.y - v.y, dz = this.z - v.z;

			return Math.abs( dx ) + Math.abs( dy ) + Math.abs( dz );

		}

		normalize() {

			return this.divideScalar( this.length() || 1 );

		}

		applyMatrix4( m ) {

			const x = this.x, y = this.y, z = this.z;
			const e = m.elements;

			const w = 1 / ( ( e[ 3 ] * x ) + ( e[ 7 ] * y ) + ( e[ 11 ] * z ) + e[ 15 ] );

			this.x = ( ( e[ 0 ] * x ) + ( e[ 4 ] * y ) + ( e[ 8 ] * z ) + e[ 12 ] ) * w;
			this.y = ( ( e[ 1 ] * x ) + ( e[ 5 ] * y ) + ( e[ 9 ] * z ) + e[ 13 ] ) * w;
			this.z = ( ( e[ 2 ] * x ) + ( e[ 6 ] * y ) + ( e[ 10 ] * z ) + e[ 14 ] ) * w;

			return this;

		}

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

		fromMatrix3Column( m, i ) {

			return this.fromArray( m.elements, i * 3 );

		}

		fromMatrix4Column( m, i ) {

			return this.fromArray( m.elements, i * 4 );

		}

		fromSpherical( radius, phi, theta ) {

			const sinPhiRadius = Math.sin( phi ) * radius;

			this.x = sinPhiRadius * Math.sin( theta );
			this.y = Math.cos( phi ) * radius;
			this.z = sinPhiRadius * Math.cos( theta );

			return this;

		}

		fromArray( array, offset = 0 ) {

			this.x = array[ offset + 0 ];
			this.y = array[ offset + 1 ];
			this.z = array[ offset + 2 ];

			return this;

		}

		toArray( array, offset = 0 ) {

			array[ offset + 0 ] = this.x;
			array[ offset + 1 ] = this.y;
			array[ offset + 2 ] = this.z;

			return array;

		}

		equals( v ) {

			return ( ( v.x === this.x ) && ( v.y === this.y ) && ( v.z === this.z ) );

		}

	}

	const WorldUp = new Vector3( 0, 1, 0 );

	/**
	 * @author Mugen87 / https://github.com/Mugen87
	 *
	 * Reference: https://github.com/mrdoob/three.js/blob/master/src/math/Matrix4.js
	 *
	 */

	const localRight = new Vector3();
	const worldRight = new Vector3();
	const perpWorldUp = new Vector3();
	const temp = new Vector3();

	class Matrix3 {

		constructor() {

			this.elements = [

				1, 0, 0,
				0, 1, 0,
				0, 0, 1

			];

		}

		set( n11, n12, n13, n21, n22, n23, n31, n32, n33 ) {

			const e = this.elements;

			e[ 0 ] = n11; e[ 3 ] = n12; e[ 6 ] = n13;
			e[ 1 ] = n21; e[ 4 ] = n22; e[ 7 ] = n23;
			e[ 2 ] = n31; e[ 5 ] = n32; e[ 8 ] = n33;

			return this;

		}

		copy( m ) {

			const e = this.elements;
			const me = m.elements;

			e[ 0 ] = me[ 0 ]; e[ 1 ] = me[ 1 ]; e[ 2 ] = me[ 2 ];
			e[ 3 ] = me[ 3 ]; e[ 4 ] = me[ 4 ]; e[ 5 ] = me[ 5 ];
			e[ 6 ] = me[ 6 ]; e[ 7 ] = me[ 7 ]; e[ 8 ] = me[ 8 ];

			return this;

		}

		clone() {

			return new this.constructor().copy( this );

		}

		identity() {

			this.set(

				1, 0, 0,
				0, 1, 0,
				0, 0, 1

			);

			return this;

		}

		multiply( m ) {

			return this.multiplyMatrices( this, m );

		}

		premultiply( m ) {

			return this.multiplyMatrices( m, this );

		}

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

		multiplyScalar( s ) {

			const e = this.elements;

			e[ 0 ] *= s; e[ 3 ] *= s; e[ 6 ] *= s;
			e[ 1 ] *= s; e[ 4 ] *= s; e[ 7 ] *= s;
			e[ 2 ] *= s; e[ 5 ] *= s; e[ 8 ] *= s;

			return this;

		}

		extractBasis( xAxis, yAxis, zAxis ) {

			xAxis.fromMatrix3Column( this, 0 );
			yAxis.fromMatrix3Column( this, 1 );
			zAxis.fromMatrix3Column( this, 2 );

			return this;

		}

		makeBasis( xAxis, yAxis, zAxis ) {

			this.set(
				xAxis.x, yAxis.x, zAxis.x,
				xAxis.y, yAxis.y, zAxis.y,
				xAxis.z, yAxis.z, zAxis.z
			);

			return this;

		}

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

		}

		transpose() {

			const e = this.elements;
			let t;

			t = e[ 1 ]; e[ 1 ] = e[ 3 ]; e[ 3 ] = t;
			t = e[ 2 ]; e[ 2 ] = e[ 6 ]; e[ 6 ] = t;
			t = e[ 5 ]; e[ 5 ] = e[ 7 ]; e[ 7 ] = t;

			return this;

		}

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

		fromArray( array, offset = 0 ) {

			const e = this.elements;

			for ( let i = 0; i < 9; i ++ ) {

				e[ i ] = array[ i + offset ];

			}

			return this;

		}

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

	/**
	 * @author Mugen87 / https://github.com/Mugen87
	 *
	 * Reference: https://github.com/mrdoob/three.js/blob/master/src/math/Quaternion.js
	 *
	 */

	const matrix = new Matrix3();

	class Quaternion {

		constructor( x = 0, y = 0, z = 0, w = 1 ) {

			this.x = x;
			this.y = y;
			this.z = z;
			this.w = w;

		}

		set( x, y, z, w ) {

			this.x = x;
			this.y = y;
			this.z = z;
			this.w = w;

			return this;

		}

		copy( q ) {

			this.x = q.x;
			this.y = q.y;
			this.z = q.z;
			this.w = q.w;

			return this;

		}

		clone() {

			return new this.constructor().copy( this );

		}

		inverse() {

			return this.conjugate().normalize();

		}

		conjugate() {

			this.x *= - 1;
			this.y *= - 1;
			this.z *= - 1;

			return this;

		}

		dot( q ) {

			return ( this.x * q.x ) + ( this.y * q.y ) + ( this.z * q.z ) + ( this.w * q.w );

		}

		length() {

			return Math.sqrt( this.squaredLength() );

		}

		squaredLength() {

			return this.dot( this );

		}

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

		multiply( q ) {

			return this.multiplyQuaternions( this, q );

		}

		premultiply( q ) {

			return this.multiplyQuaternions( q, this );

		}

		multiplyQuaternions( a, b ) {

			const qax = a.x, qay = a.y, qaz = a.z, qaw = a.w;
			const qbx = b.x, qby = b.y, qbz = b.z, qbw = b.w;

			this.x = ( qax * qbw ) + ( qaw * qbx ) + ( qay * qbz ) - ( qaz * qby );
			this.y = ( qay * qbw ) + ( qaw * qby ) + ( qaz * qbx ) - ( qax * qbz );
			this.z = ( qaz * qbw ) + ( qaw * qbz ) + ( qax * qby ) - ( qay * qbx );
			this.w = ( qaw * qbw ) - ( qax * qbx ) - ( qay * qby ) - ( qaz * qbz );

			return this;

		}

		angleTo( q ) {

			return 2 * Math.acos( Math.abs( _Math.clamp( this.dot( q ), - 1, 1 ) ) );

		}

		rotateTo( q, step ) {

			const angle = this.angleTo( q );

			if ( angle === 0 ) return this;

			const t = Math.min( 1, step / angle );

			this.slerp( q, t );

			return this;

		}

		lookAt( localForward, targetDirection, localUp ) {

			matrix.lookAt( localForward, targetDirection, localUp );
			this.fromMatrix3( matrix );

		}

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

		fromArray( array, offset = 0 ) {

			this.x = array[ offset + 0 ];
			this.y = array[ offset + 1 ];
			this.z = array[ offset + 2 ];
			this.w = array[ offset + 3 ];

			return this;

		}

		toArray( array, offset = 0 ) {

			array[ offset + 0 ] = this.x;
			array[ offset + 1 ] = this.y;
			array[ offset + 2 ] = this.z;
			array[ offset + 3 ] = this.w;

			return array;

		}

		equals( q ) {

			return ( ( q.x === this.x ) && ( q.y === this.y ) && ( q.z === this.z ) && ( q.w === this.w ) );

		}

	}

	/**
	 * @author Mugen87 / https://github.com/Mugen87
	 *
	 * Reference: https://github.com/mrdoob/three.js/blob/master/src/math/Matrix4.js
	 *
	 */

	class Matrix4 {

		constructor() {

			this.elements = [

				1, 0, 0, 0,
				0, 1, 0, 0,
				0, 0, 1, 0,
				0, 0, 0, 1

			];

		}

		set( n11, n12, n13, n14, n21, n22, n23, n24, n31, n32, n33, n34, n41, n42, n43, n44 ) {

			const e = this.elements;

			e[ 0 ] = n11; e[ 4 ] = n12; e[ 8 ] = n13; e[ 12 ] = n14;
			e[ 1 ] = n21; e[ 5 ] = n22; e[ 9 ] = n23; e[ 13 ] = n24;
			e[ 2 ] = n31; e[ 6 ] = n32; e[ 10 ] = n33; e[ 14 ] = n34;
			e[ 3 ] = n41; e[ 7 ] = n42; e[ 11 ] = n43; e[ 15 ] = n44;

			return this;

		}

		copy( m ) {

			const e = this.elements;
			const me = m.elements;

			e[ 0 ] = me[ 0 ]; e[ 1 ] = me[ 1 ]; e[ 2 ] = me[ 2 ]; e[ 3 ] = me[ 3 ];
			e[ 4 ] = me[ 4 ]; e[ 5 ] = me[ 5 ]; e[ 6 ] = me[ 6 ]; e[ 7 ] = me[ 7 ];
			e[ 8 ] = me[ 8 ]; e[ 9 ] = me[ 9 ]; e[ 10 ] = me[ 10 ]; e[ 11 ] = me[ 11 ];
			e[ 12 ] = me[ 12 ]; e[ 13 ] = me[ 13 ]; e[ 14 ] = me[ 14 ]; e[ 15 ] = me[ 15 ];

			return this;

		}

		clone() {

			return new this.constructor().copy( this );

		}

		identity() {

			this.set(

				1, 0, 0, 0,
				0, 1, 0, 0,
				0, 0, 1, 0,
				0, 0, 0, 1

			);

			return this;

		}

		extractBasis( xAxis, yAxis, zAxis ) {

			xAxis.fromMatrix4Column( this, 0 );
			yAxis.fromMatrix4Column( this, 1 );
			zAxis.fromMatrix4Column( this, 2 );

			return this;

		}

		makeBasis( xAxis, yAxis, zAxis ) {

			this.set(
				xAxis.x, yAxis.x, zAxis.x, 0,
				xAxis.y, yAxis.y, zAxis.y, 0,
				xAxis.z, yAxis.z, zAxis.z, 0,
				0, 0, 0, 1
			);

			return this;

		}

		multiply( m ) {

			return this.multiplyMatrices( this, m );

		}

		premultiply( m ) {

			return this.multiplyMatrices( m, this );

		}

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

		multiplyScalar( s ) {

			const e = this.elements;

			e[ 0 ] *= s; e[ 4 ] *= s; e[ 8 ] *= s; e[ 12 ] *= s;
			e[ 1 ] *= s; e[ 5 ] *= s; e[ 9 ] *= s; e[ 13 ] *= s;
			e[ 2 ] *= s; e[ 6 ] *= s; e[ 10 ] *= s; e[ 14 ] *= s;
			e[ 3 ] *= s; e[ 7 ] *= s; e[ 11 ] *= s; e[ 15 ] *= s;

			return this;

		}

		compose( position, quaternion, scale ) {

			this.fromQuaternion( quaternion );
			this.scale( scale );
			this.setPosition( position );

			return this;

		}

		scale( v ) {

			const e = this.elements;

			const x = v.x, y = v.y, z = v.z;

			e[ 0 ] *= x; e[ 4 ] *= y; e[ 8 ] *= z;
			e[ 1 ] *= x; e[ 5 ] *= y; e[ 9 ] *= z;
			e[ 2 ] *= x; e[ 6 ] *= y; e[ 10 ] *= z;
			e[ 3 ] *= x; e[ 7 ] *= y; e[ 11 ] *= z;

			return this;

		}

		setPosition( v ) {

			const e = this.elements;

			e[ 12 ] = v.x;
			e[ 13 ] = v.y;
			e[ 14 ] = v.z;

			return this;

		}

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

		getInverse( m ) {

			const e = this.elements;
			const me = m.elements;

			const n11 = me[ 0 ], n21 = me[ 1 ], n31 = me[ 2 ], n41 = me[ 3 ];
			const n12 = me[ 4 ], n22 = me[ 5 ], n32 = me[ 6 ], n42 = me[ 7 ];
			const n13 = me[ 8 ], n23 = me[ 9 ], n33 = me[ 10 ], n43 = me[ 11 ];
			const n14 = me[ 12 ], n24 = me[ 13 ], n34 = me[ 14 ], n44 = me[ 15 ];

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

			e[ 0 ] = t11 * detInv;
			e[ 1 ] = ( n24 * n33 * n41 - n23 * n34 * n41 - n24 * n31 * n43 + n21 * n34 * n43 + n23 * n31 * n44 - n21 * n33 * n44 ) * detInv;
			e[ 2 ] = ( n22 * n34 * n41 - n24 * n32 * n41 + n24 * n31 * n42 - n21 * n34 * n42 - n22 * n31 * n44 + n21 * n32 * n44 ) * detInv;
			e[ 3 ] = ( n23 * n32 * n41 - n22 * n33 * n41 - n23 * n31 * n42 + n21 * n33 * n42 + n22 * n31 * n43 - n21 * n32 * n43 ) * detInv;

			e[ 4 ] = t12 * detInv;
			e[ 5 ] = ( n13 * n34 * n41 - n14 * n33 * n41 + n14 * n31 * n43 - n11 * n34 * n43 - n13 * n31 * n44 + n11 * n33 * n44 ) * detInv;
			e[ 6 ] = ( n14 * n32 * n41 - n12 * n34 * n41 - n14 * n31 * n42 + n11 * n34 * n42 + n12 * n31 * n44 - n11 * n32 * n44 ) * detInv;
			e[ 7 ] = ( n12 * n33 * n41 - n13 * n32 * n41 + n13 * n31 * n42 - n11 * n33 * n42 - n12 * n31 * n43 + n11 * n32 * n43 ) * detInv;

			e[ 8 ] = t13 * detInv;
			e[ 9 ] = ( n14 * n23 * n41 - n13 * n24 * n41 - n14 * n21 * n43 + n11 * n24 * n43 + n13 * n21 * n44 - n11 * n23 * n44 ) * detInv;
			e[ 10 ] = ( n12 * n24 * n41 - n14 * n22 * n41 + n14 * n21 * n42 - n11 * n24 * n42 - n12 * n21 * n44 + n11 * n22 * n44 ) * detInv;
			e[ 11 ] = ( n13 * n22 * n41 - n12 * n23 * n41 - n13 * n21 * n42 + n11 * n23 * n42 + n12 * n21 * n43 - n11 * n22 * n43 ) * detInv;

			e[ 12 ] = t14 * detInv;
			e[ 13 ] = ( n13 * n24 * n31 - n14 * n23 * n31 + n14 * n21 * n33 - n11 * n24 * n33 - n13 * n21 * n34 + n11 * n23 * n34 ) * detInv;
			e[ 14 ] = ( n14 * n22 * n31 - n12 * n24 * n31 - n14 * n21 * n32 + n11 * n24 * n32 + n12 * n21 * n34 - n11 * n22 * n34 ) * detInv;
			e[ 15 ] = ( n12 * n23 * n31 - n13 * n22 * n31 + n13 * n21 * n32 - n11 * n23 * n32 - n12 * n21 * n33 + n11 * n22 * n33 ) * detInv;

			return this;

		}

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

		fromArray( array, offset = 0 ) {

			const e = this.elements;

			for ( let i = 0; i < 16; i ++ ) {

				e[ i ] = array[ i + offset ];

			}

			return this;

		}

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

		equals( m ) {

			const e = this.elements;
			const me = m.elements;

			for ( let i = 0; i < 16; i ++ ) {

				if ( e[ i ] !== me[ i ] ) return false;

			}

			return true;

		}

	}

	/**
	 * @author Mugen87 / https://github.com/Mugen87
	 */

	let nextId = 0;

	const targetRotation = new Quaternion();
	const targetDirection = new Vector3();

	class GameEntity {

		constructor() {

			this.id = nextId ++;
			this.name = '';

			this.active = true;

			this.cache = {
				position: new Vector3(),
				rotation: new Quaternion(),
				scale: new Vector3()
			};

			this.children = new Array();
			this.parent = null;

			this.neighbors = new Array();
			this.neighborhoodRadius = 1;
			this.updateNeighborhood = false;

			this.position = new Vector3();
			this.rotation = new Quaternion();
			this.scale = new Vector3( 1, 1, 1 );

			this.forward = new Vector3( 0, 0, 1 );
			this.up = new Vector3( 0, 1, 0 );

			this.boundingRadius = 0;
			this.maxTurnRate = Math.PI;

			this.matrix = new Matrix4();
			this.worldMatrix = new Matrix4();

			this.manager = null;

		}

		// lifecycle callbacks

		start() {}

		update( /* delta */ ) {}

		//

		add( entity ) {

			if ( entity.parent !== null ) {

				entity.parent.remove( entity );

			}

			this.children.push( entity );
			entity.parent = this;

			return this;

		}

		remove( entity ) {

			const index = this.children.indexOf( entity );
			this.children.splice( index, 1 );

			entity.parent = null;

			return this;

		}

		getDirection( result ) {

			return result.copy( this.forward ).applyRotation( this.rotation ).normalize();

		}

		// directly rotates the entity so it faces the target

		lookAt( target ) {

			targetDirection.subVectors( target, this.position ).normalize();

			this.rotation.lookAt( this.forward, targetDirection, this.up );

			return this;

		}

		// given a target position, this method rotates the entity by an amount not
		// greater than maxTurnRate until it directly faces the target

		rotateTo( target, deltaTime ) {

			targetDirection.subVectors( target, this.position ).normalize();
			targetRotation.lookAt( this.forward, targetDirection, this.up );

			this.rotation.rotateTo( targetRotation, this.maxTurnRate * deltaTime );

			return this;

		}

		// updates the internal transformation matrix if necessary

		updateMatrix() {

			const cache = this.cache;

			if ( cache.position.equals( this.position ) &&
					cache.rotation.equals( this.rotation ) &&
					cache.scale.equals( this.scale ) ) {

				return;

			}

			this.matrix.compose( this.position, this.rotation, this.scale );

			cache.position.copy( this.position );
			cache.rotation.copy( this.rotation );
			cache.scale.copy( this.scale );

		}

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

		}

		// messaging

		handleMessage() {

			return false;

		}

		sendMessage( receiver, message, delay = 0, data = null ) {

			if ( this.manager !== null ) {

				this.manager.sendMessage( this, receiver, message, delay, data );

			} else {

				Logger.error( 'YUKA.GameEntity: The game entity must be added to a manager in order to send a message.' );

			}

		}

	}

	/**
	 * @author Mugen87 / https://github.com/Mugen87
	 */

	const displacement = new Vector3();
	const target = new Vector3();

	class MovingEntity extends GameEntity {

		constructor() {

			super();

			this.velocity = new Vector3();
			this.maxSpeed = 1; // the maximum speed at which this entity may travel

			this.updateOrientation = true;

		}

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

		}

		getSpeed() {

			return this.velocity.length();

		}

		getSpeedSquared() {

			return this.velocity.squaredLength();

		}

	}

	/**
	 * @author Mugen87 / https://github.com/Mugen87
	 */

	class Time {

		constructor() {

			this.startTime = 0;

			this.previousTime = 0;
			this.currentTime = 0;

		}

		getDelta() {

			return ( this.currentTime - this.previousTime ) / 1000;

		}

		getElapsed() {

			return ( this.currentTime - this.startTime ) / 1000;

		}

		update() {

			this.previousTime = this.currentTime;
			this.currentTime = this.now();

			return this;

		}

		now() {

			return ( typeof performance === 'undefined' ? Date : performance ).now();

		}

	}

	/**
	 * @author Mugen87 / https://github.com/Mugen87
	 */

	class Regulator {

		constructor( updateFrequency = 0 ) {

			this.updateFrequency = updateFrequency; // updates per second

			this._time = new Time();

			this._nextUpdateTime = 0;

		}

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
	 * @author Mugen87 / https://github.com/Mugen87
	 */

	class State {

		enter() {}

		execute() {}

		exit() {}

		onMessage() {

			return false;

		}

	}

	/**
	 * @author Mugen87 / https://github.com/Mugen87
	 */

	class StateMachine {

		constructor( owner ) {

			this.owner = owner; // a reference to the agent that owns this instance
			this.currentState = null; // the current state of the agent
			this.previousState = null; // a reference to the last state the agent was in
			this.globalState = null; // this state logic is called every time the FSM is updated

			this.states = new Map();

		}

		update() {

			if ( this.globalState !== null ) {

				this.globalState.execute( this.owner );

			}

			if ( this.currentState !== null ) {

				this.currentState.execute( this.owner );

			}

		}

		add( id, state ) {

			if ( state instanceof State ) {

				this.states.set( id, state );

			} else {

				Logger.warn( 'YUKA.StateMachine: .add() needs a parameter of type "YUKA.State".' );

			}

		}

		remove( id ) {

			this.states.delete( id );

		}

		get( id ) {

			return this.states.get( id );

		}

		changeTo( id ) {

			const state = this.get( id );

			this._change( state );

		}

		revert() {

			this._change( this.previousState );

		}

		in( id ) {

			const state = this.get( id );

			return ( state === this.currentState );

		}

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
	 * @author Mugen87 / https://github.com/Mugen87
	 */

	class Goal {

		constructor( owner = null ) {

			this.owner = owner; // a reference to the agent that owns this instance
			this.status = Goal.STATUS.INACTIVE;

		}

		addSubgoal( /* goal */ ) {

			Logger.warn( 'YUKA.Goal: Unable to add goal to atomic goals.' );

		}

		//

		activate() {} // logic to run when the goal is activated

		execute() {} // logic to run each update step

		terminate() {} // logic to run when the goal is satisfied

		// goals can handle messages. Many don't though, so this defines a default behavior

		handleMessage( /* telegram */ ) {

			return false;

		}

		//

		active() {

			return this.status === Goal.STATUS.ACTIVE;

		}

		inactive() {

			return this.status === Goal.STATUS.INACTIVE;

		}

		completed() {

			return this.status === Goal.STATUS.COMPLETED;

		}

		failed() {

			return this.status === Goal.STATUS.FAILED;

		}

		//

		replanIfFailed() {

			if ( this.failed() === true ) {

				this.status = Goal.STATUS.INACTIVE;

			}

			return this;

		}

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
	 * @author Mugen87 / https://github.com/Mugen87
	 */

	class CompositeGoal extends Goal {

		constructor( owner = null ) {

			super( owner );

			this.subgoals = new Array(); // used as a stack (LIFO)

		}

		// subgoal related methods

		addSubgoal( goal ) {

			this.subgoals.push( goal );

			return this;

		}

		clearSubgoals() {

			const subgoals = this.subgoals;

			for ( let i = 0, l = subgoals.length; i < l; i ++ ) {

				const subgoal = subgoals[ i ];

				subgoal.terminate();

			}

			subgoals.length = 0;

			return this;

		}

		currentSubgoal() {

			const length = this.subgoals.length;

			if ( length > 0 ) {

				return this.subgoals[ length - 1 ];

			} else {

				return null;

			}

		}

		executeSubgoals() {

			const subgoals = this.subgoals;

			// remove all completed and failed goals from the back of the subgoal list

			for ( let i = subgoals.length - 1; i >= 0; i -- ) {

				const subgoal = subgoals[ i ];

				if ( ( subgoal.completed() === true ) || ( subgoal.failed() === true ) ) {

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

				// if subgoal is completed but more subgoals are in the list, return 'active'
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

		hasSubgoals() {

			return this.subgoals.length > 0;

		}

		// messaging

		handleMessage( telegram ) {

			const subgoal = this.currentSubgoal();

			if ( subgoal !== null ) {

				return subgoal.handleMessage( telegram );

			}

			return false;

		}

	}

	/**
	 * @author Mugen87 / https://github.com/Mugen87
	 */

	class GoalEvaluator {

		constructor( characterBias = 1 ) {

			// when the desirability score for a goal has been evaluated, it is multiplied
			// by this value. It can be used to create bots with preferences based upon
			// their personality
			this.characterBias = characterBias;

		}

		calculateDesirability( /* entity */ ) {

			// returns a score between 0 and 1 representing the desirability of a goal

			return 0;

		}

		setGoal( /* entity */ ) {}

	}

	/**
	 * @author Mugen87 / https://github.com/Mugen87
	 */

	class Think extends CompositeGoal {

		constructor( owner = null ) {

			super( owner );

			this.evaluators = new Array();

		}

		activate() {

			this.arbitrate();

		}

		execute() {

			this.activateIfInactive();

			const subgoalStatus = this.executeSubgoals();

			if ( subgoalStatus === Goal.STATUS.COMPLETED || subgoalStatus === Goal.STATUS.FAILED ) {

				this.status = Goal.STATUS.INACTIVE;

			}

		}

		terminate() {

			this.clearSubgoals();

		}

		addEvaluator( evaluator ) {

			this.evaluators.push( evaluator );

			return this;

		}

		removeEvaluator( evaluator ) {

			const index = this.evaluators.indexOf( evaluator );
			this.evaluators.splice( index, 1 );

			return this;

		}

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
	 * @author Mugen87 / https://github.com/Mugen87
	 */

	class Edge {

		constructor( from = - 1, to = - 1, cost = 0 ) {

			this.from = from;
			this.to = to;
			this.cost = cost;

		}

		copy( source ) {

			this.from = source.from;
			this.to = source.to;
			this.cost = source.cost;

			return this;

		}

		clone() {

			return new this.constructor().copy( this );

		}

	}

	/**
	 * @author Mugen87 / https://github.com/Mugen87
	 */

	class Graph {

		constructor() {

			this.digraph = false;

			this._nodes = new Map();
			this._edges = new Map(); // adjacency list for each node

		}

		addNode( node ) {

			const index = node.index;

			this._nodes.set( index, node );
			this._edges.set( index, new Array() );

			return this;

		}

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

		getNode( index ) {

			return this._nodes.get( index ) || null;

		}

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

		getNodes( result ) {

			result.length = 0;
			result.push( ...this._nodes.values() );

			return this;

		}

		getEdgesOfNode( index, result ) {

			const edges = this._edges.get( index );

			if ( edges !== undefined ) {

				result.length = 0;
				result.push( ...edges );

			}

			return this;

		}

		getNodeCount() {

			return this._nodes.size;

		}

		getEdgeCount() {

			let count = 0;

			for ( const edges of this._edges.values() ) {

				count += edges.length;

			}

			return count;

		}

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

		hasNode( index ) {

			return this._nodes.has( index );

		}

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

		clear() {

			this._nodes.clear();
			this._edges.clear();

			return this;

		}

	}

	/**
	 * @author Mugen87 / https://github.com/Mugen87
	 */

	class Node {

		constructor( index = - 1 ) {

			this.index = index;

		}

	}

	/**
	 * @author Mugen87 / https://github.com/Mugen87
	 */

	class HeuristicPolicyEuclid {

		static calculate( graph, source, target ) {

			const sourceNode = graph.getNode( source );
			const targetNode = graph.getNode( target );

			return sourceNode.position.distanceTo( targetNode.position );

		}

	}

	class HeuristicPolicyEuclidSquared {

		static calculate( graph, source, target ) {

			const sourceNode = graph.getNode( source );
			const targetNode = graph.getNode( target );

			return sourceNode.position.squaredDistanceTo( targetNode.position );

		}

	}

	class HeuristicPolicyManhatten {

		static calculate( graph, source, target ) {

			const sourceNode = graph.getNode( source );
			const targetNode = graph.getNode( target );

			return sourceNode.position.manhattanDistanceTo( targetNode.position );

		}

	}

	class HeuristicPolicyDijkstra {

		static calculate( /* graph, source, target */ ) {

			return 0;

		}

	}

	/**
	 * @author Mugen87 / https://github.com/Mugen87
	 *
	 * binary heap priority queue (see https://github.com/mourner/tinyqueue)
	 */

	class PriorityQueue {

		constructor( compare = defaultCompare ) {

			this.data = new Array();
			this.length = 0;
			this.compare = compare;

		}

		push( item ) {

			this.data.push( item );
			this.length ++;
			this._up( this.length - 1 );

		}

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
	 * @author Mugen87 / https://github.com/Mugen87
	 */

	class AStar {

		constructor( graph = null, source = - 1, target = - 1 ) {

			this.graph = graph;
			this.source = source;
			this.target = target;
			this.heuristic = HeuristicPolicyEuclid;
			this.found = false;

			this._cost = new Map(); // contains the "real" accumulative cost to a node
			this._shortestPathTree = new Map();
			this._searchFrontier = new Map();

		}

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

		getSearchTree() {

			return [ ...this._shortestPathTree.values() ];

		}

		clear() {

			this.found = false;

			this._cost.clear();
			this._shortestPathTree.clear();
			this._searchFrontier.clear();

		}

	}


	function compare( a, b ) {

		return ( a.cost < b.cost ) ? - 1 : ( a.cost > b.cost ) ? 1 : 0;

	}

	/**
	 * @author Mugen87 / https://github.com/Mugen87
	 */

	class BFS {

		constructor( graph = null, source = - 1, target = - 1 ) {

			this.graph = graph;
			this.source = source;
			this.target = target;
			this.found = false;

			this._route = new Map(); // this holds the route taken to the target
			this._visited = new Set(); // holds the visited nodes

			this._spanningTree = new Set(); // for debugging purposes

		}

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

		getSearchTree() {

			return [ ...this._spanningTree ];

		}

		clear() {

			this.found = false;

			this._route.clear();
			this._visited.clear();
			this._spanningTree.clear();

		}

	}

	/**
	 * @author Mugen87 / https://github.com/Mugen87
	 */

	class DFS {

		constructor( graph = null, source = - 1, target = - 1 ) {

			this.graph = graph;
			this.source = source;
			this.target = target;
			this.found = false;

			this._route = new Map(); // this holds the route taken to the target
			this._visited = new Set(); // holds the visited nodes

			this._spanningTree = new Set(); // for debugging purposes

		}

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

		getSearchTree() {

			return [ ...this._spanningTree ];

		}

		clear() {

			this.found = false;

			this._route.clear();
			this._visited.clear();
			this._spanningTree.clear();

		}

	}

	/**
	 * @author Mugen87 / https://github.com/Mugen87
	 */

	class Dijkstra {

		constructor( graph = null, source = - 1, target = - 1 ) {

			this.graph = graph;
			this.source = source;
			this.target = target;
			this.found = false;

			this._cost = new Map(); // total cost of the bast path so far for a given node
			this._shortestPathTree = new Map();
			this._searchFrontier = new Map();

		}

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

		getSearchTree() {

			return [ ...this._shortestPathTree.values() ];

		}

		clear() {

			this.found = false;

			this._cost.clear();
			this._shortestPathTree.clear();
			this._searchFrontier.clear();

		}

	}


	function compare$1( a, b ) {

		return ( a.cost < b.cost ) ? - 1 : ( a.cost > b.cost ) ? 1 : 0;

	}

	/**
	 * @author Mugen87 / https://github.com/Mugen87
	 *
	 * Reference: https://github.com/mrdoob/three.js/blob/master/src/math/Box3.js
	 *
	 */

	const vector = new Vector3();

	class AABB {

		constructor( min = new Vector3( Infinity, Infinity, Infinity ), max = new Vector3( - Infinity, - Infinity, - Infinity ) ) {

			this.min = min;
			this.max = max;

		}

		set( min, max ) {

			this.min = min;
			this.max = max;

			return this;

		}

		copy( aabb ) {

			this.min.copy( aabb.min );
			this.max.copy( aabb.max );

			return this;

		}

		clone() {

			return new this.constructor().copy( this );

		}

		clampPoint( point, result ) {

			result.copy( point ).clamp( this.min, this.max );

			return this;

		}

		containsPoint( point ) {

			return point.x < this.min.x || point.x > this.max.x ||
				point.y < this.min.y || point.y > this.max.y ||
				point.z < this.min.z || point.z > this.max.z ? false : true;

		}

		expand( point ) {

			this.min.min( point );
			this.max.max( point );

			return this;

		}

		intersectsAABB( aabb ) {

			return aabb.max.x < this.min.x || aabb.min.x > this.max.x ||
				aabb.max.y < this.min.y || aabb.min.y > this.max.y ||
				aabb.max.z < this.min.z || aabb.min.z > this.max.z ? false : true;

		}

		intersectsBoundingSphere( sphere ) {

			// find the point on the AABB closest to the sphere center

			this.clampPoint( sphere.center, vector );

			// if that point is inside the sphere, the AABB and sphere intersect.

			return vector.squaredDistanceTo( sphere.center ) <= ( sphere.radius * sphere.radius );

		}

		fromCenterAndSize( center, size ) {

			vector.copy( size ).multiplyScalar( 0.5 ); // compute half size

			this.min.copy( center ).sub( vector );
			this.max.copy( center ).add( vector );

			return this;

		}

		fromPoints( points ) {

			this.min.set( Infinity, Infinity, Infinity );
			this.max.set( - Infinity, - Infinity, - Infinity );

			for ( let i = 0, l = points.length; i < l; i ++ ) {

				this.expand( points[ i ] );

			}

			return this;

		}

		equals( aabb ) {

			return ( aabb.min.equals( this.min ) ) && ( aabb.max.equals( this.max ) );

		}

	}

	/**
	 * @author Mugen87 / https://github.com/Mugen87
	 *
	 * Reference: https://github.com/mrdoob/three.js/blob/master/src/math/Sphere.js
	 *
	 */

	class BoundingSphere {

		constructor( center = new Vector3(), radius = 0 ) {

			this.center = center;
			this.radius = radius;

		}

		set( center, radius ) {

			this.center = center;
			this.radius = radius;

			return this;

		}

		copy( sphere ) {

			this.center.copy( sphere.center );
			this.radius = sphere.radius;

			return this;

		}

		clone() {

			return new this.constructor().copy( this );

		}

		containsPoint( point ) {

			return ( point.squaredDistanceTo( this.center ) <= ( this.radius * this.radius ) );

		}

		intersectsBoundingSphere( sphere ) {

			const radius = this.radius + sphere.radius;

			return ( sphere.center.squaredDistanceTo( this.center ) <= ( radius * radius ) );

		}

		equals( sphere ) {

			return ( sphere.center.equals( this.center ) ) && ( sphere.radius === this.radius );

		}

	}

	/**
	 * @author Mugen87 / https://github.com/Mugen87
	 *
	 * Reference: https://github.com/mrdoob/three.js/blob/master/src/math/Line3.js
	 *
	 */

	const p1 = new Vector3();
	const p2 = new Vector3();

	class LineSegment {

		constructor( from = new Vector3(), to = new Vector3() ) {

			this.from = from;
			this.to = to;

		}

		set( from, to ) {

			this.from = from;
			this.to = to;

			return this;

		}

		copy( lineSegment ) {

			this.from.copy( lineSegment.from );
			this.to.copy( lineSegment.to );

			return this;

		}

		clone() {

			return new this.constructor().copy( this );

		}

		delta( result ) {

			return result.subVectors( this.to, this.from );

		}

		at( t, result ) {

			return this.delta( result ).multiplyScalar( t ).add( this.from );

		}

		closestPointToPoint( point, clampToLine, result ) {

			const t = this.closestPointToPointParameter( point, clampToLine );

			return this.at( t, result );

		}

		closestPointToPointParameter( point, clampToLine = true ) {

			p1.subVectors( point, this.from );
			p2.subVectors( this.to, this.from );

			const dotP2P2 = p2.dot( p2 );
			const dotP2P1 = p2.dot( p1 );

			let t = dotP2P1 / dotP2P2;

			if ( clampToLine ) t = _Math.clamp( t, 0, 1 );

			return t;

		}

		equals( lineSegment ) {

			return lineSegment.from.equals( this.from ) && lineSegment.to.equals( this.to );

		}

	}

	/**
	 * @author Mugen87 / https://github.com/Mugen87
	 *
	 * Reference: https://github.com/mrdoob/three.js/blob/master/src/math/Plane.js
	 *
	 */

	const v1 = new Vector3();
	const v2 = new Vector3();

	class Plane {

		constructor( normal = new Vector3( 0, 0, 1 ), constant = 0 ) {

			this.normal = normal;
			this.constant = constant;

		}

		set( normal, constant ) {

			this.normal = normal;
			this.constant = constant;

			return this;

		}

		copy( plane ) {

			this.normal.copy( plane.normal );
			this.constant = plane.constant;

			return this;

		}

		clone() {

			return new this.constructor().copy( this );

		}

		distanceToPoint( point ) {

			return this.normal.dot( point ) + this.constant;

		}

		fromNormalAndCoplanarPoint( normal, point ) {

			this.normal.copy( normal );
			this.constant = - point.dot( this.normal );

			return this;

		}

		fromCoplanarPoints( a, b, c ) {

			v1.subVectors( c, b ).cross( v2.subVectors( a, b ) ).normalize();

			this.fromNormalAndCoplanarPoint( v1, a );

			return this;

		}

		equals( plane ) {

			return plane.normal.equals( this.normal ) && plane.constant === this.constant;

		}

	}

	/**
	 * @author Mugen87 / https://github.com/Mugen87
	 *
	 * Reference: https://github.com/mrdoob/three.js/blob/master/src/math/Ray.js
	 *
	 */

	const v1$1 = new Vector3();

	class Ray {

		constructor( origin = new Vector3(), direction = new Vector3() ) {

			this.origin = origin;
			this.direction = direction;

		}

		set( origin, direction ) {

			this.origin = origin;
			this.direction = direction;

			return this;

		}

		copy( ray ) {

			this.origin.copy( ray.origin );
			this.direction.copy( ray.direction );

			return this;

		}

		clone() {

			return new this.constructor().copy( this );

		}

		at( t, result ) {

			//t has to be zero or positive
			return result.copy( this.direction ).multiplyScalar( t ).add( this.origin );

		}

		intersectSphere( sphere, result ) {

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

		equals( ray ) {

			return ray.origin.equals( this.origin ) && ray.direction.equals( this.direction );

		}

	}

	/**
	 * @author Mugen87 / https://github.com/Mugen87
	 */

	class NavEdge extends Edge {

		constructor( from = - 1, to = - 1, cost = 0 ) {

			super( from, to, cost );

		}

	}

	/**
	 * @author Mugen87 / https://github.com/Mugen87
	 */

	class NavNode extends Node {

		constructor( index = - 1, position = new Vector3(), userData = {} ) {

			super( index );

			this.position = position;
			this.userData = userData;

		}

	}

	/**
	 * @author Mugen87 / https://github.com/Mugen87
	 */

	class GraphUtils {

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
	 * @author robp94 / https://github.com/robp94
	 * @author Mugen87 / https://github.com/Mugen8
	 *
	 * Reference: https://github.com/donmccurdy/three-pathfinding/blob/master/src/Channel.js
	 *
	 */

	class Corridor {

		constructor() {

			this.portalEdges = new Array();

		}

		push( left, right ) {

			this.portalEdges.push( {
				left: left,
				right: right
			} );

		}

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

				if ( _Math.area( portalApex, portalRight, right ) <= 0.0 ) {

					if ( portalApex === portalRight || _Math.area( portalApex, portalLeft, right ) > 0.0 ) {

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

				if ( _Math.area( portalApex, portalLeft, left ) >= 0.0 ) {

					if ( portalApex === portalLeft || _Math.area( portalApex, portalRight, left ) < 0.0 ) {

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
	 * @author Mugen87 / https://github.com/Mugen87
	 *
	 * https://en.wikipedia.org/wiki/Doubly_connected_edge_list
	 *
	 */

	class HalfEdge {

		constructor( vertex = new Vector3() ) {

			this.vertex = vertex;
			this.next = null;
			this.prev = null;
			this.twin = null;
			this.polygon = null;

			this.nodeIndex = - 1;

		}

		from() {

			return this.vertex;

		}

		to() {

			return this.next ? this.next.vertex : null;

		}

		length() {

			const from = this.from();
			const to = this.to();

			if ( to !== null ) {

				return from.distanceTo( to );

			}

			return - 1;

		}

		squaredLength() {

			const from = this.from();
			const to = this.to();

			if ( to !== null ) {

				return from.squaredDistanceTo( to );

			}

			return - 1;

		}

	}

	/**
	 * @author Mugen87 / https://github.com/Mugen87
	 * @author robp94 / https://github.com/robp94
	 */

	const pointOnLineSegment = new Vector3();
	const closestPoint = new Vector3();
	const edgeDirection = new Vector3();
	const movementDirection = new Vector3();
	const newPosition = new Vector3();
	const lineSegment = new LineSegment();

	class NavMesh {

		constructor() {

			this.graph = new Graph();
			this.graph.digraph = true;

			this.regions = new Array();
			this.spatialIndex = null;

			this.epsilonCoplanarTest = 1e-3;
			this.epsilonContainsTest = 1;

		}

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

		clear() {

			this.graph.clear();
			this.regions.length = 0;
			this.spatialIndex = null;

			return this;

		}

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

		getRandomRegion() {

			const regions = this.regions;

			let index = Math.floor( Math.random() * ( regions.length ) );

			if ( index === regions.length ) index = regions.length - 1;

			return regions[ index ];

		}

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
	 * @author Mugen87 / https://github.com/Mugen87
	 * @author robp94 / https://github.com/robp94
	 */

	class Polygon {

		constructor() {

			this.centroid = new Vector3();
			this.edge = null;
			this.plane = new Plane();

		}

		fromContour( points ) {

			// create edges from points (assuming CCW order)

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

		getContour( result ) {

			let edge = this.edge;

			result.length = 0;

			do {

				result.push( edge.vertex );

				edge = edge.next;

			} while ( edge !== this.edge );

			return result;

		}

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

		return _Math.area( a, b, c ) >= 0;

	}

	/**
	 * @author Mugen87 / https://github.com/Mugen87
	 */

	class NavMeshLoader {

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
	 * @author Mugen87 / https://github.com/Mugen87
	 */

	class Cell {

		constructor( aabb = new AABB() ) {

			this.aabb = aabb;
			this.entries = new Array();

		}

		add( entry ) {

			this.entries.push( entry );

			return this;

		}

		remove( entry ) {

			const index = this.entries.indexOf( entry );
			this.entries.splice( index, 1 );

			return this;

		}

		makeEmpty() {

			this.entries.length = 0;

			return this;

		}

		empty() {

			return this.entries.length === 0;

		}

		intersects( aabb ) {

			return this.aabb.intersectsAABB( aabb );

		}

	}

	/**
	 * @author Mugen87 / https://github.com/Mugen87
	 */

	const clampedPosition = new Vector3();
	const aabb = new AABB();
	const contour = new Array();

	class CellSpacePartitioning {

		constructor( width, height, depth, cellsX, cellsY, cellsZ ) {

			this.cells = new Array();

			this.width = width;
			this.height = height;
			this.depth = depth;

			this.halfWidth = width / 2;
			this.halfHeight = height / 2;
			this.halfDepth = depth / 2;

			this.min = new Vector3( - this.halfWidth, - this.halfHeight, - this.halfDepth );
			this.max = new Vector3( this.halfWidth, this.halfHeight, this.halfDepth );

			this.cellsX = cellsX;
			this.cellsY = cellsY;
			this.cellsZ = cellsZ;

			//

			const cellSizeX = width / cellsX;
			const cellSizeY = height / cellsY;
			const cellSizeZ = depth / cellsZ;

			for ( let i = 0; i < cellsX; i ++ ) {

				const x = ( i * cellSizeX ) - this.halfWidth;

				for ( let j = 0; j < cellsY; j ++ ) {

					const y = ( j * cellSizeY ) - this.halfHeight;

					for ( let k = 0; k < cellsZ; k ++ ) {

						const z = ( k * cellSizeZ ) - this.halfDepth;

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

		addEntityToPartition( entity, index ) {

			const cell = this.cells[ index ];
			cell.add( entity );

			return this;

		}

		removeEntityFromPartition( entity, index ) {

			const cell = this.cells[ index ];
			cell.remove( entity );

			return this;

		}

		getIndexForPosition( position ) {

			clampedPosition.copy( position ).clamp( this.min, this.max );

			let indexX = Math.abs( Math.floor( ( this.cellsX * ( clampedPosition.x + this.halfWidth ) ) / this.width ) );
			let indexY = Math.abs( Math.floor( ( this.cellsY * ( clampedPosition.y + this.halfHeight ) ) / this.height ) );
			let indexZ = Math.abs( Math.floor( ( this.cellsZ * ( clampedPosition.z + this.halfDepth ) ) / this.depth ) );

			// handle index overflow

			if ( indexX === this.cellsX ) indexX = this.cellsX - 1;
			if ( indexY === this.cellsY ) indexY = this.cellsY - 1;
			if ( indexZ === this.cellsZ ) indexZ = this.cellsZ - 1;

			// calculate final index

			return ( indexX * this.cellsY * this.cellsZ ) + ( indexY * this.cellsZ ) + indexZ;

		}

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

		makeEmpty() {

			const cells = this.cells;

			for ( let i = 0, l = cells.length; i < l; i ++ ) {

				cells[ i ].makeEmpty();

			}

			return this;

		}

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
	 * @author Mugen87 / https://github.com/Mugen87
	 */

	class Path {

		constructor() {

			this.loop = false;
			this._waypoints = new Array();
			this._index = 0;

		}

		add( waypoint ) {

			this._waypoints.push( waypoint );

			return this;

		}

		clear() {

			this._waypoints.length = 0;
			this._index = 0;

			return this;

		}

		finished() {

			const lastIndex = this._waypoints.length - 1;

			return ( this.loop === true ) ? false : ( this._index === lastIndex );

		}

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

		current() {

			return this._waypoints[ this._index ];

		}

	}

	/**
	 * @author Mugen87 / https://github.com/Mugen87
	 * @author robp94 / https://github.com/robp94
	 */

	class Smoother {

		constructor( count = 10 ) {

			this.count = count; // how many samples the smoother will use to average a value
			this._history = []; // this holds the history
			this._slot = 0; // the current sample slot

			// initialize history with Vector3s

			for ( let i = 0; i < this.count; i ++ ) {

				this._history[ i ] = new Vector3();

			}

		}

		update( value, average ) {

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

		}

	}

	/**
	 * @author Mugen87 / https://github.com/Mugen87
	 */

	class SteeringBehavior {

		constructor() {

			this.active = true;

			// use this value to tweak the amount that a steering force
			// contributes to the total steering force

			this.weigth = 1;

		}

		calculate() {}

	}

	/**
	 * @author Mugen87 / https://github.com/Mugen87
	 */

	const force = new Vector3();

	class SteeringManager {

		constructor( vehicle ) {

			this.vehicle = vehicle;
			this.behaviors = new Array();

			this._steeringForce = new Vector3(); // the calculated steering force per simulation step

		}

		add( behavior ) {

			this.behaviors.push( behavior );

			return this;

		}

		remove( behavior ) {

			const index = this.behaviors.indexOf( behavior );
			this.behaviors.splice( index, 1 );

			return this;

		}

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

	/**
	 * @author Mugen87 / https://github.com/Mugen87
	 * @author robp94 / https://github.com/robp94
	 */

	const steeringForce = new Vector3();
	const displacement$1 = new Vector3();
	const acceleration = new Vector3();
	const target$1 = new Vector3();
	const velocitySmooth = new Vector3();

	class Vehicle extends MovingEntity {

		constructor() {

			super();

			this.mass = 1;
			this.maxForce = 100; // the maximum force this entity can produce to power itself (think rockets and thrust)

			this.steering = new SteeringManager( this );

			this.smoother = null; // can be used to avoid shakiness due to conflicting steering behaviors

		}

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

				this.smoother.update( this.velocity, velocitySmooth );

				displacement$1.copy( velocitySmooth ).multiplyScalar( delta );
				target$1.copy( this.position ).add( displacement$1 );

				this.lookAt( target$1 );

			}

		}

	}

	/**
	 * @author Mugen87 / https://github.com/Mugen87
	 */

	const averageDirection = new Vector3();
	const direction = new Vector3();

	class AlignmentBehavior extends SteeringBehavior {

		constructor() {

			super();

		}

		calculate( vehicle, force /*, delta */ ) {

			averageDirection.set( 0, 0, 0 );

			const neighbors = vehicle.neighbors;

			// iterate over all neighbors to calculate the average direction vector

			for ( let i = 0, l = neighbors.length; i < l; i ++ ) {

				const neighbor = neighbors[ i ];

				neighbor.getDirection( direction );

				averageDirection.add( direction );

			}

			if ( neighbors.length > 0 ) {

				averageDirection.divideScalar( neighbors.length );

				// produce a force to align the vehicle's heading

				vehicle.getDirection( direction );
				force.subVectors( averageDirection, direction );

			}

		}

	}

	/**
	 * @author Mugen87 / https://github.com/Mugen87
	 */

	const desiredVelocity = new Vector3();
	const displacement$2 = new Vector3();

	class ArriveBehavior extends SteeringBehavior {

		constructor( target = new Vector3(), deceleration = 3 ) {

			super();

			this.target = target;
			this.deceleration = deceleration;

		}

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

		}

	}

	/**
	 * @author Mugen87 / https://github.com/Mugen87
	 */

	const desiredVelocity$1 = new Vector3();

	class SeekBehavior extends SteeringBehavior {

		constructor( target = new Vector3() ) {

			super();

			this.target = target;

		}

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

			force.subVectors( desiredVelocity$1, vehicle.velocity );

		}

	}

	/**
	 * @author Mugen87 / https://github.com/Mugen87
	 */

	const centerOfMass = new Vector3();

	class CohesionBehavior extends SteeringBehavior {

		constructor() {

			super();

			// internal behaviors

			this._seek = new SeekBehavior();

		}

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

		}

	}

	/**
	 * @author Mugen87 / https://github.com/Mugen87
	 */

	const desiredVelocity$2 = new Vector3();

	class FleeBehavior extends SteeringBehavior {

		constructor( target = new Vector3(), panicDistance = 10 ) {

			super();

			this.target = target;
			this.panicDistance = panicDistance;

		}

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

		}

	}

	/**
	 * @author Mugen87 / https://github.com/Mugen87
	 */

	const displacement$3 = new Vector3();
	const newPuruserVelocity = new Vector3();
	const predcitedPosition = new Vector3();

	class EvadeBehavior extends SteeringBehavior {

		constructor( pursuer = null, panicDistance = 10, predictionFactor = 1 ) {

			super();

			this.pursuer = pursuer;
			this.panicDistance = panicDistance;
			this.predictionFactor = predictionFactor;

			// internal behaviors

			this._flee = new FleeBehavior();

		}

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

		}

	}

	/**
	 * @author Mugen87 / https://github.com/Mugen87
	 */

	class FollowPathBehavior extends SteeringBehavior {

		constructor( path = new Path(), nextWaypointDistance = 1 ) {

			super();

			this.path = path; // list of waypoints to follow
			this.nextWaypointDistance = nextWaypointDistance; // the distance a waypoint is set to the new target

			// internal behaviors

			this._arrive = new ArriveBehavior();
			this._seek = new SeekBehavior();

		}

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

		}

	}

	/**
	 * @author Mugen87 / https://github.com/Mugen87
	 */

	const midPoint = new Vector3();
	const translation = new Vector3();
	const predcitedPosition1 = new Vector3();
	const predcitedPosition2 = new Vector3();

	class InterposeBehavior extends SteeringBehavior {

		constructor( entity1 = null, entity2 = null, deceleration = 3 ) {

			super();

			this.entity1 = entity1;
			this.entity2 = entity2;
			this.deceleration = deceleration;

			// internal behaviors

			this._arrive = new ArriveBehavior();

		}

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

		}

	}

	/**
	 * @author Mugen87 / https://github.com/Mugen87
	 * @author robp94 / https://github.com/robp94
	 */

	const inverse = new Matrix4();
	const localPositionOfObstacle = new Vector3();
	const localPositionOfClosestObstacle = new Vector3();
	const intersectionPoint = new Vector3();
	const boundingSphere = new BoundingSphere();

	// this will be later used for a ray/sphere intersection test

	const ray = new Ray( new Vector3( 0, 0, 0 ), new Vector3( 0, 0, 1 ) );

	class ObstacleAvoidanceBehavior extends SteeringBehavior {

		constructor( obstacles = new Array() ) {

			super();

			this.obstacles = obstacles;
			this.brakingWeight = 0.2;
			this.dBoxMinLength = 4; // minimum length of the detection box

		}

		calculate( vehicle, force /*, delta */ ) {

			const obstacles = this.obstacles;

			// this will keep track of the closest intersecting obstacle

			let closestObstacle = null;

			// this will be used to track the distance to the closest obstacle

			let distanceToClosestObstacle = Infinity;

			// the detection box length is proportional to the agent's velocity

			const dBoxLength = this.dBoxMinLength + ( vehicle.getSpeed() / vehicle.maxSpeed ) * this.dBoxMinLength;

			inverse.getInverse( vehicle.matrix );

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

						boundingSphere.center.copy( localPositionOfObstacle );
						boundingSphere.radius = expandedRadius;

						ray.intersectSphere( boundingSphere, intersectionPoint );

						// compare distances

						if ( intersectionPoint.z < distanceToClosestObstacle ) {

							// save new minimum distance

							distanceToClosestObstacle = intersectionPoint.z;

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

		}

	}

	/**
	 * @author Mugen87 / https://github.com/Mugen87
	 */

	const displacement$4 = new Vector3();
	const vehicleDirection = new Vector3();
	const evaderDirection = new Vector3();
	const newEvaderVelocity = new Vector3();
	const predcitedPosition$1 = new Vector3();

	class PursuitBehavior extends SteeringBehavior {

		constructor( evader = null, predictionFactor = 1 ) {

			super();

			this.evader = evader;
			this.predictionFactor = predictionFactor;

			// internal behaviors

			this._seek = new SeekBehavior();

		}

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
				return;

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

		}

	}

	/**
	 * @author Mugen87 / https://github.com/Mugen87
	 */

	const toAgent = new Vector3();

	class SeparationBehavior extends SteeringBehavior {

		constructor() {

			super();

		}

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

		}

	}

	/**
	 * @author Mugen87 / https://github.com/Mugen87
	 */

	const targetWorld = new Vector3();
	const randomDisplacement = new Vector3();

	// this behavior only produces a 2D force (XZ)

	class WanderBehavior extends SteeringBehavior {

		constructor( radius = 1, distance = 5, jitter = 5 ) {

			super();

			this.radius = radius; // the radius of the constraining circle for the wander behavior
			this.distance = distance; // the distance the wander sphere is projected in front of the agent
			this.jitter = jitter; // the maximum amount of displacement along the sphere each frame

			this._targetLocal = new Vector3();

			generateRandomPointOnCircle( this.radius, this._targetLocal );

		}

		calculate( vehicle, force, delta ) {

			// this behavior is dependent on the update rate, so this line must be
			// included when using time independent frame rate

			const jitterThisTimeSlice = this.jitter * delta;

			// prepare random vector

			randomDisplacement.x = _Math.randFloat( - 1, 1 ) * jitterThisTimeSlice;
			randomDisplacement.z = _Math.randFloat( - 1, 1 ) * jitterThisTimeSlice;

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

		}

	}

	//

	function generateRandomPointOnCircle( radius, target ) {

		const theta = Math.random() * Math.PI * 2;

		target.x = radius * Math.cos( theta );
		target.z = radius * Math.sin( theta );

	}

	/**
	 * @author Mugen87 / https://github.com/Mugen87
	 */

	class TriggerRegion {

		touching( /* entity */ ) {

			return false;

		}

	}

	/**
	 * @author Mugen87 / https://github.com/Mugen87
	 */

	const boundingSphereEntity = new BoundingSphere();

	class RectangularTriggerRegion extends TriggerRegion {

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

		fromPositionAndSize( position, size ) {

			this._aabb.fromCenterAndSize( position, size );

			return this;

		}

		touching( entity ) {

			boundingSphereEntity.set( entity.position, entity.boundingRadius );

			return this._aabb.intersectsBoundingSphere( boundingSphereEntity );


		}

	}

	/**
	 * @author Mugen87 / https://github.com/Mugen87
	 */

	const boundingSphereEntity$1 = new BoundingSphere();

	class SphericalTriggerRegion extends TriggerRegion {

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

		touching( entity ) {

			boundingSphereEntity$1.set( entity.position, entity.boundingRadius );

			return this._boundingSphere.intersectsBoundingSphere( boundingSphereEntity$1 );


		}

	}

	/**
	 * @author Mugen87 / https://github.com/Mugen87
	 */

	class Trigger {

		constructor( region = new TriggerRegion() ) {

			this.active = true;
			this.region = region;

		}

		check( entity ) {

			if ( ( this.active === true ) && ( this.region.touching( entity ) === true ) ) {

				this.execute( entity );

			}

		}

		execute( /* entity */ ) {}

		update( /* delta */ ) {}

	}

	exports.EntityManager = EntityManager;
	exports.GameEntity = GameEntity;
	exports.Logger = Logger;
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
	exports.Math = _Math;
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
