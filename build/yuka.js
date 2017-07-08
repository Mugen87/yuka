(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.YUKA = global.YUKA || {})));
}(this, (function (exports) { 'use strict';

/**
 * @author Mugen87 / https://github.com/Mugen87
 */

class EntityManager {

	constructor () {

		this.entities = [];

	}

	add ( entity ) {

		this.entities.push( entity );

		return this;

	}

	remove ( entity ) {

		const index = this.entities.indexOf( entity );

		this.entities.splice( index, 1 );

		return this;

	}

	update ( delta ) {

		for ( let entity of this.entities ) {

			entity.update( delta );

		}

		return this;

	}

}

/**
 * @author Mugen87 / https://github.com/Mugen87
 */

class GameEntity {

	constructor () {

		this.id = GameEntity.__nextId ++;

	}

	update () {

	}

}

GameEntity.__nextId = 0;

/**
 * @author Mugen87 / https://github.com/Mugen87
 */

class State {

	enter () {

		console.warn( 'YUKA.State: .enter() must be implemented in derived class.' );

	}

	execute () {

		console.warn( 'YUKA.State: .execute() must be implemented in derived class.' );

	}

	exit () {

		console.warn( 'YUKA.State: .exit() must be implemented in derived class.' );

	}

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

		this.previousState = this.currentState;

		this.currentState.exit( this.owner );

		this.currentState = newState;

		this.currentState.enter( this.owner );

	}

	revertToPrevoiusState () {

		this.changeState( this.previousState );

	}

	inState ( state ) {

		return ( state === this.currentState );

	}

}

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

exports.EntityManager = EntityManager;
exports.GameEntity = GameEntity;
exports.State = State;
exports.StateMachine = StateMachine;
exports.Vector3 = Vector3;
exports.Matrix4 = Matrix4;

Object.defineProperty(exports, '__esModule', { value: true });

})));
