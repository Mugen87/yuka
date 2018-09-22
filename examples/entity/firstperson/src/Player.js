/**
 * @author Mugen87 / https://github.com/Mugen87
 */

import { MovingEntity, GameEntity, Vector3, Logger } from '../../../../build/yuka.module.js';

const PI05 = Math.PI / 2;
const direction = new Vector3();
const velocity = new Vector3();

const startPosition = new Vector3();
const endPosition = new Vector3();

let currentSign = 1;
let elapsedTime = 0;

class Player extends MovingEntity {

	constructor() {

		super();

		this.movementX = 0; // mouse left/right
		this.movementY = 0; // mouse up/down

		this.input = {
			forward: false,
			backward: false,
			right: false,
			left: false
		};

		this.lookSpeed = 1;
		this.brakingPower = 10;
		this.headMovement = 1.5;
		this.height = 1;

		this.head = new GameEntity();
		this.add( this.head );

		this.onActive = null;
		this.onInactive = null;
		this.onAudio = null;

		this._mouseMoveHandler = onMouseMove.bind( this );
		this._pointerlockChangeHandler = onPointerlockChange.bind( this );
		this._pointerlockErrorHandler = onPointerlockError.bind( this );
		this._keyDownHandler = onKeyDown.bind( this );
		this._keyUpHandler = onKeyUp.bind( this );

		this.updateOrientation = false;
		this.navMesh = null;
		this.currentRegion = null;

	}

	connect() {

		document.addEventListener( 'mousemove', this._mouseMoveHandler, false );
		document.addEventListener( 'pointerlockchange', this._pointerlockChangeHandler, false );
		document.addEventListener( 'pointerlockerror', this._pointerlockErrorHandler, false );
		document.addEventListener( 'keydown', this._keyDownHandler, false );
		document.addEventListener( 'keyup', this._keyUpHandler, false );

		document.body.requestPointerLock();

	}

	disconnect() {

		document.removeEventListener( 'mousemove', this._mouseMoveHandler, false );
		document.removeEventListener( 'pointerlockchange', this._pointerlockChangeHandler, false );
		document.removeEventListener( 'pointerlockerror', this._pointerlockErrorHandler, false );
		document.removeEventListener( 'keydown', this._keyDownHandler, false );
		document.removeEventListener( 'keyup', this._keyUpHandler, false );

	}

	update( delta ) {

		const input = this.input;

		velocity.x -= velocity.x * this.brakingPower * delta;
		velocity.z -= velocity.z * this.brakingPower * delta;

		direction.z = Number( input.forward ) - Number( input.backward );
		direction.x = Number( input.left ) - Number( input.right );
		direction.normalize();

		if ( input.forward || input.backward ) velocity.z -= direction.z * this.maxSpeed * delta;
		if ( input.left || input.right ) velocity.x -= direction.x * this.maxSpeed * delta;

		this.velocity.copy( velocity ).applyRotation( this.rotation );

		//

		startPosition.copy( this.position );

		super.update( delta );

		endPosition.copy( this.position );

		// ensure the entity stays inside its navmesh

		this.currentRegion = this.navMesh.clampMovement(
			this.currentRegion,
			startPosition,
			endPosition,
			this.position
		);

		// adjust height of player

		const distance = this.currentRegion.plane.distanceToPoint( this.position );

		this.position.y -= distance * 0.2; // smooth transition

		//

		this._updateHead( delta );

	}

	setRotation( yaw, pitch ) {

		this.movementX = yaw;
		this.movementY = pitch;

		this.rotation.fromEuler( 0, this.movementX, 0 );
		this.head.rotation.fromEuler( this.movementY, 0, 0 );

	}

	_updateHead( delta ) {

		const head = this.head;

		// some simple head bobbing

		const speed = this.getSpeed();

		elapsedTime += delta * speed; // scale delta with movement speed

		const motion = Math.sin( elapsedTime * this.headMovement );

		head.position.y = Math.abs( motion ) * 0.06;
		head.position.x = motion * 0.08;

		//

		head.position.y += this.height;

		//

		const sign = Math.sign( Math.cos( elapsedTime * this.headMovement ) );

		if ( sign < currentSign ) {

			currentSign = sign;

			if ( this.onAudio ) this.onAudio( 'rightStep' );

		}

		if ( sign > currentSign ) {

			currentSign = sign;

			if ( this.onAudio ) this.onAudio( 'leftStep' );

		}

	}

}

// handler

function onMouseMove( event ) {

	this.movementX -= event.movementX * 0.001 * this.lookSpeed;
	this.movementY -= event.movementY * 0.001 * this.lookSpeed;

	this.movementY = Math.max( - PI05, Math.min( PI05, this.movementY ) );

	this.rotation.fromEuler( 0, this.movementX, 0 ); // yaw
	this.head.rotation.fromEuler( this.movementY, 0, 0 ); // pitch

}

function onPointerlockChange() {

	if ( document.pointerLockElement === document.body ) {

		if ( this.onActive ) this.onActive();

	} else {

		this.disconnect();

		if ( this.onInactive ) this.onInactive();

	}

}

function onPointerlockError() {

	Logger.warn( 'YUKA.Player: Unable to use Pointer Lock API.' );

}

function onKeyDown( event ) {

	switch ( event.keyCode ) {

		case 38: // up
		case 87: // w
			this.input.forward = true;
			break;

		case 37: // left
		case 65: // a
			this.input.left = true;
			break;

		case 40: // down
		case 83: // s
			this.input.backward = true;
			break;

		case 39: // right
		case 68: // d
			this.input.right = true;
			break;

	}

}

function onKeyUp() {

	switch ( event.keyCode ) {

		case 38: // up
		case 87: // w
			this.input.forward = false;
			break;

		case 37: // left
		case 65: // a
			this.input.left = false;
			break;

		case 40: // down
		case 83: // s
			this.input.backward = false;
			break;

		case 39: // right
		case 68: // d
			this.input.right = false;
			break;

	}

}


export { Player };
