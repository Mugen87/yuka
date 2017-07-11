/**
 * @author Mugen87 / https://github.com/Mugen87
 */

import { Vector3 } from '../Math/Vector3';

class SteeringBehaviors {

	constructor ( vehicle ) {

		this.vehicle = vehicle;
		this.target = new Vector3();

		this._steeringForce = new Vector3(); // the calculated steering force per simulation step
		this._behaviorFlag = 0; // bitmask for enable/disable behaviors

		// use these values to tweak the amount that each steering force
		// contributes to the total steering force

		this.weights = {
			seek: 1
		}

	}

	calculate ( delta, optionalTarget )  {

		const result = optionalTarget || new Vector3();

		this._calculatePrioritized( delta );

		return result.copy( this._steeringForce );

	}

	seekOn () {

		this._behaviorFlag |= SteeringBehaviors.TYPES.SEEK;

	}

	seekOff () {

		if ( this._isOn( SteeringBehaviors.TYPES.SEEK ) ) this._behaviorFlag ^= SteeringBehaviors.TYPES.SEEK;

	}

	// this method calculates how much of its max steering force the vehicle has
	// left to apply and then applies that amount of the force to add

	_accumulateForce ( forceToAdd ) {

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

	_on ( type ) {

		return ( this._behaviorFlag & type ) === type;

	}

}

Object.assign( SteeringBehaviors.prototype, {

	_calculatePrioritized: function () {

		const force = new Vector3();

		return function _calculatePrioritized ( delta ) {

			// seek

			if ( this._on( SteeringBehaviors.TYPES.SEEK ) ) {

				force.set( 0, 0, 0 );

				this._seek( this.target, force );

				force.multiplyScalar( this.weights.seek );

				if ( this._accumulateForce( force ) === false ) return;

			}

		};

	} (),

	_seek: function () {

		const desiredVelocity = new Vector3();

		return function _seek ( target, force ) {

			// First the desired velocity is calculated.
			// This is the velocity the agent would need to reach the target position in an ideal world.
			// It represents the vector from the agent to the target,
			// scaled to be the length of the maximum possible speed of the agent.

			desiredVelocity.subVectors( target, this.vehicle.position ).normalize();
			desiredVelocity.multiplyScalar( this.vehicle.maxSpeed );

			// The steering force returned by this method is the force required,
			// which when added to the agent’s current velocity vector gives the desired velocity.
			// To achieve this you simply subtract the agent’s current velocity from the desired velocity.

			force.subVectors( desiredVelocity, this.vehicle.velocity );

		};

	} ()

} );

SteeringBehaviors.TYPES = {
	NONE: 0,
	SEEK: 1
};

export { SteeringBehaviors };
