/**
 * @author Mugen87 / https://github.com/Mugen87
 */

import { EventDispatcher, Vector3, Logger } from '../../../../build/yuka.module.js';
import world from './World.js';

const PI05 = Math.PI / 2;
const direction = new Vector3();
const velocity = new Vector3();

let currentSign = 1;
let elapsedTime = 0;

class FirstPersonControls extends EventDispatcher {

	constructor( owner = null ) {

		super();

		this.owner = owner;

		this.movementX = 0; // mouse left/right
		this.movementY = 0; // mouse up/down

		this.acceleration = 80;
		this.brakingPower = 10;
		this.lookingSpeed = 1;
		this.headMovement = 0.8;

		this.input = {
			forward: false,
			backward: false,
			right: false,
			left: false
		};

		this._mouseDownHandler = onMouseDown.bind( this );
		this._mouseMoveHandler = onMouseMove.bind( this );
		this._pointerlockChangeHandler = onPointerlockChange.bind( this );
		this._pointerlockErrorHandler = onPointerlockError.bind( this );
		this._keyDownHandler = onKeyDown.bind( this );
		this._keyUpHandler = onKeyUp.bind( this );

	}

	connect() {

		document.addEventListener( 'mousedown', this._mouseDownHandler, false );
		document.addEventListener( 'mousemove', this._mouseMoveHandler, false );
		document.addEventListener( 'pointerlockchange', this._pointerlockChangeHandler, false );
		document.addEventListener( 'pointerlockerror', this._pointerlockErrorHandler, false );
		document.addEventListener( 'keydown', this._keyDownHandler, false );
		document.addEventListener( 'keyup', this._keyUpHandler, false );

		document.body.requestPointerLock();

	}

	disconnect() {

		document.removeEventListener( 'mousedown', this._mouseDownHandler, false );
		document.removeEventListener( 'mousemove', this._mouseMoveHandler, false );
		document.removeEventListener( 'pointerlockchange', this._pointerlockChangeHandler, false );
		document.removeEventListener( 'pointerlockerror', this._pointerlockErrorHandler, false );
		document.removeEventListener( 'keydown', this._keyDownHandler, false );
		document.removeEventListener( 'keyup', this._keyUpHandler, false );

	}

	exit() {

		document.exitPointerLock();

		this.input.forward = false;
		this.input.backward = false;
		this.input.right = false;
		this.input.left = false;

		this.owner.velocity.set( 0, 0, 0 );

	}

	update( delta ) {

		const input = this.input;
		const owner = this.owner;

		velocity.x -= velocity.x * this.brakingPower * delta;
		velocity.z -= velocity.z * this.brakingPower * delta;

		direction.z = Number( input.forward ) - Number( input.backward );
		direction.x = Number( input.left ) - Number( input.right );
		direction.normalize();

		if ( input.forward || input.backward ) velocity.z -= direction.z * this.acceleration * delta;
		if ( input.left || input.right ) velocity.x -= direction.x * this.acceleration * delta;

		owner.velocity.copy( velocity ).applyRotation( owner.rotation );

		//

		const speed = owner.getSpeed();
		elapsedTime += delta * speed; // scale delta with movement speed

		const motion = Math.sin( elapsedTime * this.headMovement );

		this._updateHead( motion );
		this._updateWeapon( motion );

	}

	setRotation( yaw, pitch ) {

		this.movementX = yaw;
		this.movementY = pitch;

		this.owner.rotation.fromEuler( 0, this.movementX, 0 );
		this.owner.head.rotation.fromEuler( this.movementY, 0, 0 );

	}

	_updateHead( motion ) {

		const owner = this.owner;
		const headContainer = owner.headContainer;

		// some simple head bobbing

		headContainer.position.x = motion * 0.14;
		headContainer.position.y = Math.abs( motion ) * 0.12;

		//

		const sign = Math.sign( Math.cos( elapsedTime * this.headMovement ) );

		if ( sign < currentSign ) {

			currentSign = sign;

			const audio = world.audios.get( 'step1' );
			if ( audio.isPlaying === true ) audio.stop();
			audio.play();

		}

		if ( sign > currentSign ) {

			currentSign = sign;

			const audio = world.audios.get( 'step2' );
			if ( audio.isPlaying === true ) audio.stop();
			audio.play();

		}

	}

	_updateWeapon( motion ) {

		const owner = this.owner;
		const weaponContainer = owner.weaponContainer;

		weaponContainer.position.x = motion * 0.005;
		weaponContainer.position.y = Math.abs( motion ) * 0.002;

	}

}

// handler

function onMouseDown( event ) {

	if ( event.which === 1 ) {

		this.owner.weapon.shoot();

	}

}

function onMouseMove( event ) {

	this.movementX -= event.movementX * 0.001 * this.lookingSpeed;
	this.movementY -= event.movementY * 0.001 * this.lookingSpeed;

	this.movementY = Math.max( - PI05, Math.min( PI05, this.movementY ) );

	this.owner.rotation.fromEuler( 0, this.movementX, 0 ); // yaw
	this.owner.head.rotation.fromEuler( this.movementY, 0, 0 ); // pitch

}

function onPointerlockChange() {

	if ( document.pointerLockElement === document.body ) {

		this.dispatchEvent( { type: 'lock' } );

	} else {

		this.disconnect();

		this.dispatchEvent( { type: 'unlock' } );

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

		case 82: // r
			this.owner.weapon.reload();
			break;

	}

}

function onKeyUp( event ) {

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

export { FirstPersonControls };
