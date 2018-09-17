/**
 * @author Mugen87 / https://github.com/Mugen87
 */

import { Vector3 } from '../math/Vector3.js';

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

export { SteeringManager };
