(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.YUKA = global.YUKA || {})));
}(this, (function (exports) { 'use strict';

/**
 * @author Mugen87 / https://github.com/Mugen87
 */

class Telegram {

	constructor ( senderId, receiverId, message, data, delay ) {

		this.senderId = senderId;
		this.receiverId = receiverId;
		this.message = message;
		this.data = data;
		this.delay = delay;

	}

}

/**
 * @author Mugen87 / https://github.com/Mugen87
 */

class MessageDispatcher {

	constructor ( entityManager ) {

		this.delayedTelegrams = new Array();
		this.entityManager = entityManager;

	}

	deliver ( receiver, telegram ) {

		if ( receiver.handleMessage( telegram ) === false ) {

			console.warn( 'YUKA.MessageDispatcher: Message not handled by receiver: %o', receiver );

		}

	}

	// send a message to another agent

	dispatch ( sender, receiver, message, delay, data ) {

		const telegram = new Telegram( sender.id, receiver.id, message, data, 0 );

		if ( delay <= 0 ) {

			this.deliver( receiver, telegram );

		} else {

			telegram.delay = delay;

			this.delayedTelegrams.push( telegram );

		}

	}

	// process delayed messages

	dispatchDelayedMessages ( delta ) {

		let i = this.delayedTelegrams.length;

		while ( i -- ) {

			const telegram = this.delayedTelegrams[ i ];

			telegram.delay -= delta;

			if ( telegram.delay <= 0 ) {

				const receiver = this.entityManager.getEntityById( telegram.receiverId );

				this.deliver( receiver, telegram );

				this.delayedTelegrams.pop();

			}

		}

	}


}

/**
 * @author Mugen87 / https://github.com/Mugen87
 */

class EntityManager {

	constructor () {

		this.entities = new Map();
		this.messageDispatcher = new MessageDispatcher( this );

	}

	add ( entity ) {

		this.entities.set( entity.id, entity );

		entity.addEventListener( 'message', this.onMessage, this );

		return this;

	}

	remove ( entity ) {

		this.entities.delete( entity.id );

		entity.removeEventListener( 'message', this.onMessage );

		return this;

	}

	getEntityById ( id ) {

		return this.entities.get( id );

	}

	update ( delta ) {

		for ( let entity of this.entities.values() ) {

			entity.update( delta );

		}

		this.messageDispatcher.dispatchDelayedMessages( delta );

	}

	onMessage ( event ) {

		const sender = event.target;
		const receiver = event.receiver;
		const message = event.message;
		const delay = event.delay;
		const data = event.data;

		this.messageDispatcher.dispatch( sender, receiver, message, delay, data );

	}

}

/**
 * @author Mugen87 / https://github.com/Mugen87
 */

class EventDispatcher {

	constructor () {

		this.listeners = {};

	}

	addEventListener ( type, listener, scope ) {

		const listeners = this.listeners;

		if ( listeners[ type ] === undefined ) {

			listeners[ type ] = [];

		}

		if ( listeners[ type ].indexOf( listener ) === - 1 ) {

			listener.scope = scope;

			listeners[ type ].push( listener );

		}

	}

	hasEventListener ( type, listener ) {

		const listeners = this.listeners;

		return listeners[ type ] !== undefined && listeners[ type ].indexOf( listener ) !== - 1;

	}

	removeEventListener ( type, listener ) {

		const listeners = this.listeners;
		const listenerArray = listeners[ type ];

		if ( listenerArray !== undefined ) {

			const index = listenerArray.indexOf( listener );

			if ( index !== - 1 ) {

				listenerArray.splice( index, 1 );

			}

		}

	}

	dispatchEvent ( event ) {

		const listeners = this.listeners;
		const listenerArray = listeners[ event.type ];

		if ( listenerArray !== undefined ) {

			event.target = this;

			const array = listenerArray.slice( 0 );

			for ( let i = 0, l = array.length; i < l; i ++ ) {

				const listener = array[ i ];

				listener.call( listener.scope || this, event );

			}

		}

	}

}

/**
 * @author Mugen87 / https://github.com/Mugen87
 */

class GameEntity extends EventDispatcher {

	constructor () {

		super();

		this.id = GameEntity.__nextId ++;
		this.name = '';

	}

	update () {

		console.warn( 'YUKA.GameEntity: .update() must be implemented in derived class.' );

	}

	sendMessage ( receiver, message, delay = 0, data = null ) {

		const event = {
			type: 'message',
			receiver: receiver,
			message: message,
			delay: delay,
			data: data
		};

		this.dispatchEvent( event );

	}

	handleMessage () {

		return false;

	}

}

GameEntity.__nextId = 0;

/**
 * @author Mugen87 / https://github.com/Mugen87
 */

class Vector3 {

	constructor ( x = 0, y = 0, z = 0 ) {

		this.x = x;
		this.y = y;
		this.z = z;

	}

	set ( x, y, z ) {

		this.x = x;
		this.y = y;
		this.z = z;

		return this;

	}

	copy ( v ) {

		this.x = v.x;
		this.y = v.y;
		this.z = v.z;

		return this;

	}

	add ( v ) {

		this.x += v.x;
		this.y += v.y;
		this.z += v.z;

		return this;

	}

	addScalar ( s ) {

		this.x += s;
		this.y += s;
		this.z += s;

		return this;

	}

	addVectors ( a, b ) {

		this.x = a.x + b.x;
		this.y = a.y + b.y;
		this.z = a.z + b.z;

		return this;

	}

	sub ( v ) {

		this.x -= v.x;
		this.y -= v.y;
		this.z -= v.z;

		return this;

	}

	subScalar ( s ) {

		this.x -= s;
		this.y -= s;
		this.z -= s;

		return this;

	}

	subVectors ( a, b ) {

		this.x = a.x - b.x;
		this.y = a.y - b.y;
		this.z = a.z - b.z;

		return this;

	}

	multiply ( v ) {

		this.x *= v.x;
		this.y *= v.y;
		this.z *= v.z;

		return this;

	}

	multiplyScalar ( s ) {

		this.x *= s;
		this.y *= s;
		this.z *= s;

		return this;

	}

	multiplyVectors ( a, b ) {

		this.x = a.x * b.x;
		this.y = a.y * b.y;
		this.z = a.z * b.z;

		return this;

	}

	divide ( v ) {

		this.x /= v.x;
		this.y /= v.y;
		this.z /= v.z;

		return this;

	}

	divideScalar ( s ) {

		this.x /= s;
		this.y /= s;
		this.z /= s;

		return this;

	}

	divideVectors ( a, b ) {

		this.x = a.x / b.x;
		this.y = a.y / b.y;
		this.z = a.z / b.z;

		return this;

	}

	dot ( v ) {

		return ( this.x * v.x ) + ( this.y * v.y ) + ( this.z * v.z );

	}

	cross ( v ) {

		const x = this.x, y = this.y, z = this.z;

		this.x = ( y * v.z ) - ( z * v.y );
		this.y = ( z * v.x ) - ( x * v.z );
		this.z = ( x * v.y ) - ( y * v.x );

		return this;

	}

	crossVectors ( a, b ) {

		const ax = a.x, ay = a.y, az = a.z;
		const bx = b.x, by = b.y, bz = b.z;

		this.x = ( ay * bz ) - ( az * by );
		this.y = ( az * bx ) - ( ax * bz );
		this.z = ( ax * by ) - ( ay * bx );

		return this;

	}

	length () {

		return Math.sqrt( this.lengthSquared() );

	}

	lengthSquared () {

		return this.dot( this );

	}

	distanceTo ( v ) {

		return Math.sqrt( this.distanceToSquared( v ) );

	}

	distanceToSquared ( v ) {

		const dx = this.x - v.x, dy = this.y - v.y, dz = this.z - v.z;

		return ( dx * dx ) + ( dy * dy ) + ( dz * dz );

	}

	normalize () {

		return this.divideScalar( this.length() || 1 );

	}

	applyMatrix4 ( m ) {

		const x = this.x, y = this.y, z = this.z;
		const e = m.elements;

		const w = 1 / ( ( e[ 3 ] * x ) + ( e[ 7 ] * y ) + ( e[ 11 ] * z ) + e[ 15 ] );

		this.x = ( ( e[ 0 ] * x ) + ( e[ 4 ] * y ) + ( e[ 8 ]  * z ) + e[ 12 ] ) * w;
		this.y = ( ( e[ 1 ] * x ) + ( e[ 5 ] * y ) + ( e[ 9 ]  * z ) + e[ 13 ] ) * w;
		this.z = ( ( e[ 2 ] * x ) + ( e[ 6 ] * y ) + ( e[ 10 ] * z ) + e[ 14 ] ) * w;

		return this;

	}

	applyQuaternion ( q ) {

		const x = this.x, y = this.y, z = this.z;
		const qx = q.x, qy = q.y, qz = q.z, qw = q.w;

		// calculate quat * vector

		const ix =  qw * x + qy * z - qz * y;
		const iy =  qw * y + qz * x - qx * z;
		const iz =  qw * z + qx * y - qy * x;
		const iw = - qx * x - qy * y - qz * z;

		// calculate result * inverse quat

		this.x = ix * qw + iw * - qx + iy * - qz - iz * - qy;
		this.y = iy * qw + iw * - qy + iz * - qx - ix * - qz;
		this.z = iz * qw + iw * - qz + ix * - qy - iy * - qx;

		return this;

	}

	equals ( v ) {

		return ( ( v.x === this.x ) && ( v.y === this.y ) && ( v.z === this.z ) );

	}

	setFromMatrixColumn ( m, i ) {

		return this.fromArray( m.elements, i * 4 );

	}

	fromArray ( array, offset ) {

		if ( offset === undefined ) offset = 0;

		this.x = array[ offset + 0 ];
		this.y = array[ offset + 1 ];
		this.z = array[ offset + 2 ];

		return this;

	}

}

/**
 * @author Mugen87 / https://github.com/Mugen87
 */

class MovingEntity extends GameEntity {

	constructor () {

		super();

		this.velocity = new Vector3();
		this.mass = 1;
		this.maxSpeed = 1; // the maximum speed at which this entity may travel
		this.maxForce = 100; // the maximum force this entity can produce to power itself (think rockets and thrust)
		this.maxTurnRate = Math.PI; // the maximum rate (radians per second) at which this vehicle can rotate

	}

	getSpeed () {

		return this.velocity.length();

	}

	getSpeedSquared () {

		return this.velocity.lengthSquared();

	}

}

/**
 * @author Mugen87 / https://github.com/Mugen87
 */

class State {

	enter () {}

	execute () {

		console.warn( 'YUKA.State: .execute() must be implemented in derived class.' );

	}

	exit () {}

	onMessage () { return false; }

}

/**
 * @author Mugen87 / https://github.com/Mugen87
 */

class StateMachine {

	constructor ( owner ) {

		this.owner = owner; // a reference to the agent that owns this instance
		this.currentState = null; // the current state of the agent
		this.previousState = null; // a reference to the last state the agent was in
		this.globalState = null; // this state logic is called every time the FSM is updated

	}

	update () {

		if ( this.globalState !== null ) {

			this.globalState.execute( this.owner );

		}

		if ( this.currentState !== null ) {

			this.currentState.execute( this.owner );

		}

	}

	changeState ( newState ) {

		if ( newState instanceof State ) {

			this.previousState = this.currentState;

			this.currentState.exit( this.owner );

			this.currentState = newState;

			this.currentState.enter( this.owner );

		} else {

			console.warn( 'YUKA.StateMachine: .changeState() needs a parameter of type "YUKA.State".' );

		}

	}

	revertToPrevoiusState () {

		this.changeState( this.previousState );

	}

	inState ( state ) {

		return ( state === this.currentState );

	}

	handleMessage ( telegram ) {

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

}

/**
 * @author Mugen87 / https://github.com/Mugen87
 */

 class Matrix4 {

 	constructor () {

		this.elements = [

			1, 0, 0, 0,
			0, 1, 0, 0,
			0, 0, 1, 0,
			0, 0, 0, 1

		];

 	}

	set ( n11, n12, n13, n14, n21, n22, n23, n24, n31, n32, n33, n34, n41, n42, n43, n44 ) {

		const e = this.elements;

		e[ 0 ] = n11; e[ 4 ] = n12; e[ 8 ] = n13; e[ 12 ] = n14;
		e[ 1 ] = n21; e[ 5 ] = n22; e[ 9 ] = n23; e[ 13 ] = n24;
		e[ 2 ] = n31; e[ 6 ] = n32; e[ 10 ] = n33; e[ 14 ] = n34;
		e[ 3 ] = n41; e[ 7 ] = n42; e[ 11 ] = n43; e[ 15 ] = n44;

		return this;

	}

	identity () {

		this.set(

			1, 0, 0, 0,
			0, 1, 0, 0,
			0, 0, 1, 0,
			0, 0, 0, 1

		);

		return this;

	}

	extractBasis ( xAxis, yAxis, zAxis ) {

		xAxis.setFromMatrixColumn( this, 0 );
		yAxis.setFromMatrixColumn( this, 1 );
		zAxis.setFromMatrixColumn( this, 2 );

		return this;

	}

	makeBasis ( xAxis, yAxis, zAxis ) {

		this.set(
			xAxis.x, yAxis.x, zAxis.x, 0,
			xAxis.y, yAxis.y, zAxis.y, 0,
			xAxis.z, yAxis.z, zAxis.z, 0,
			0,       0,       0,       1
		);

		return this;

	}

	multiply ( m ) {

		return this.multiplyMatrices( this, m );

	}

	premultiply ( m ) {

		return this.multiplyMatrices( m, this );

	}

	multiplyMatrices ( a, b ) {

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

		e[ 0 ]  = ( a11 * b11 ) + ( a12 * b21 ) + ( a13 * b31 ) + ( a14 * b41 );
		e[ 4 ]  = ( a11 * b12 ) + ( a12 * b22 ) + ( a13 * b32 ) + ( a14 * b42 );
		e[ 8 ]  = ( a11 * b13 ) + ( a12 * b23 ) + ( a13 * b33 ) + ( a14 * b43 );
		e[ 12 ] = ( a11 * b14 ) + ( a12 * b24 ) + ( a13 * b34 ) + ( a14 * b44 );

		e[ 1 ]  = ( a21 * b11 ) + ( a22 * b21 ) + ( a23 * b31 ) + ( a24 * b41 );
		e[ 5 ]  = ( a21 * b12 ) + ( a22 * b22 ) + ( a23 * b32 ) + ( a24 * b42 );
		e[ 9 ]  = ( a21 * b13 ) + ( a22 * b23 ) + ( a23 * b33 ) + ( a24 * b43 );
		e[ 13 ] = ( a21 * b14 ) + ( a22 * b24 ) + ( a23 * b34 ) + ( a24 * b44 );

		e[ 2 ]  = ( a31 * b11 ) + ( a32 * b21 ) + ( a33 * b31 ) + ( a34 * b41 );
		e[ 6 ]  = ( a31 * b12 ) + ( a32 * b22 ) + ( a33 * b32 ) + ( a34 * b42 );
		e[ 10 ] = ( a31 * b13 ) + ( a32 * b23 ) + ( a33 * b33 ) + ( a34 * b43 );
		e[ 14 ] = ( a31 * b14 ) + ( a32 * b24 ) + ( a33 * b34 ) + ( a34 * b44 );

		e[ 3 ]  = ( a41 * b11 ) + ( a42 * b21 ) + ( a43 * b31 ) + ( a44 * b41 );
		e[ 7 ]  = ( a41 * b12 ) + ( a42 * b22 ) + ( a43 * b32 ) + ( a44 * b42 );
		e[ 11 ] = ( a41 * b13 ) + ( a42 * b23 ) + ( a43 * b33 ) + ( a44 * b43 );
		e[ 15 ] = ( a41 * b14 ) + ( a42 * b24 ) + ( a43 * b34 ) + ( a44 * b44 );

		return this;

	}

 }

/**
 * @author Mugen87 / https://github.com/Mugen87
 */

class Quaternion {

	constructor ( x = 0, y = 0, z = 0, w = 1 ) {

		this.x = x;
		this.y = y;
		this.z = z;

	}

	set ( x, y, z, w ) {

		this.x = x;
		this.y = y;
		this.z = z;
		this.w = w;

		return this;

	}

	copy ( q ) {

		this.x = q.x;
		this.y = q.y;
		this.z = q.z;
		this.w = q.w;

		return this;

	}

	inverse () {

		return this.conjugate().normalize();

	}

	conjugate () {

		this.x *= - 1;
		this.y *= - 1;
		this.z *= - 1;

		return this;

	}

	dot ( q ) {

		return ( this.x * q.x ) + ( this.y * q.y ) + ( this.z * q.z ) + ( this.w * q.w );

	}

	length () {

		return Math.sqrt( this.lengthSquared() );

	}

	lengthSquared () {

		return this.dot( this );

	}

	normalize () {

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

	multiply ( q ) {

		return this.multiplyQuaternions( this, q );

	}

	premultiply ( q ) {

		return this.multiplyQuaternions( q, this );

	}

	multiplyQuaternions ( a, b ) {

		const qax = a.x, qay = a.y, qaz = a.z, qaw = a.w;
		const qbx = b.x, qby = b.y, qbz = b.z, qbw = b.w;

		this.x = ( qax * qbw ) + ( qaw * qbx ) + ( qay * qbz ) - ( qaz * qby );
		this.y = ( qay * qbw ) + ( qaw * qby ) + ( qaz * qbx ) - ( qax * qbz );
		this.z = ( qaz * qbw ) + ( qaw * qbz ) + ( qax * qby ) - ( qay * qbx );
		this.w = ( qaw * qbw ) - ( qax * qbx ) - ( qay * qby ) - ( qaz * qbz );

		return this;

	}

	slerp ( q, t ) {

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

	equals ( q ) {

		return ( ( q.x === this.x ) && ( q.y === this.y ) && ( q.z === this.z ) && ( q.w === this.w ) );

	}

	fromArray ( array, offset ) {

		if ( offset === undefined ) offset = 0;

		this.x = array[ offset + 0 ];
		this.y = array[ offset + 1 ];
		this.z = array[ offset + 2 ];
		this.w = array[ offset + 3 ];

		return this;

	}

}

exports.EntityManager = EntityManager;
exports.GameEntity = GameEntity;
exports.MovingEntity = MovingEntity;
exports.State = State;
exports.StateMachine = StateMachine;
exports.Matrix4 = Matrix4;
exports.Quaternion = Quaternion;
exports.Vector3 = Vector3;

Object.defineProperty(exports, '__esModule', { value: true });

})));
