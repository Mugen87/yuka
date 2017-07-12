/**
 * @author Mugen87 / https://github.com/Mugen87
 */

import { Vector3 } from '../Math/Vector3';
import { SteeringInterface } from './SteeringInterface';

class SteeringBehaviors {

	constructor ( vehicle ) {

		this.vehicle = vehicle;
		this.target = new Vector3();
		this.panicDistance = 10; // for flee and evade behavior
		this.deceleration = 3; // for arrive behavior

		// use these values to tweak the amount that each steering force
		// contributes to the total steering force

		this.weights = {
			seek: 1,
			flee : 1,
			arrive : 1
		};

		this._steeringForce = new Vector3(); // the calculated steering force per simulation step
		this._behaviorFlag = 0; // bitmask for enable/disable behaviors

	}

	_calculate ( delta, optionalTarget )  {

		const result = optionalTarget || new Vector3();

		this._calculatePrioritized( delta );

		return result.copy( this._steeringForce );

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

}

Object.assign( SteeringBehaviors.prototype, {

	_calculatePrioritized: function () {

		const force = new Vector3();

		return function _calculatePrioritized ( delta ) {

			// reset steering force

			this._steeringForce.set( 0, 0, 0 );

			// flee

			if ( this.fleeOn() === true ) {

				force.set( 0, 0, 0 );

				this._flee( this.target, force );

				force.multiplyScalar( this.weights.flee );

				if ( this._accumulateForce( force ) === false ) return;

			}

			// seek

			if ( this.seekOn() === true ) {

				force.set( 0, 0, 0 );

				this._seek( this.target, force );

				force.multiplyScalar( this.weights.seek );

				if ( this._accumulateForce( force ) === false ) return;

			}

			// arrive

			if ( this.arriveOn() === true ) {

				force.set( 0, 0, 0 );

				this._arrive( this.target, force, this.deceleration );

				force.multiplyScalar( this.weights.arrive );

				if ( this._accumulateForce( force ) === false ) return;

			}

		};

	} (),

	_seek: function () {

		const desiredVelocity = new Vector3();

		return function _seek ( target, force ) {

			const vehicle = this.vehicle;

			// First the desired velocity is calculated.
			// This is the velocity the agent would need to reach the target position in an ideal world.
			// It represents the vector from the agent to the target,
			// scaled to be the length of the maximum possible speed of the agent.

			desiredVelocity.subVectors( target, vehicle.position ).normalize();
			desiredVelocity.multiplyScalar( vehicle.maxSpeed );

			// The steering force returned by this method is the force required,
			// which when added to the agent’s current velocity vector gives the desired velocity.
			// To achieve this you simply subtract the agent’s current velocity from the desired velocity.

			force.subVectors( desiredVelocity, vehicle.velocity );

		};

	} (),

	_flee: function () {

		const desiredVelocity = new Vector3();

		return function _flee ( target, force ) {

			const vehicle = this.vehicle;

			// only flee if the target is within panic distance

			const distanceToTargetSq = vehicle.position.distanceToSquared( target );

			if ( distanceToTargetSq < ( this.panicDistance * this.panicDistance ) ) {

				// from here, the only difference compared to seek is that the desired
				// velocity is calculated using a vector pointing in the opposite direction

				desiredVelocity.subVectors( vehicle.position, target ).normalize();

				// if target and vehicle position are identical, choose default velocity

				if ( desiredVelocity.lengthSquared() === 0 ) {

					desiredVelocity.set( 0, 0, 1 );

				}

				desiredVelocity.multiplyScalar( vehicle.maxSpeed );

				force.subVectors( desiredVelocity, vehicle.velocity );

			}

		};

	} (),

	_arrive: function () {

		const desiredVelocity = new Vector3();
		const displacement = new Vector3();

		return function _arrive ( target, force, deceleration ) {

			const vehicle = this.vehicle;

			displacement.subVectors( target, vehicle.position );

			const distance = displacement.length();

			if ( distance > 0 ) {

				// calculate the speed required to reach the target given the desired deceleration

				let speed = distance / deceleration;

				// make sure the speed does not exceed the max

				speed = Math.min( speed, vehicle.maxSpeed );

				// from here proceed just like "seek" except we don't need to normalize
				// the "displacement" vector because we have already gone to the trouble
				// of calculating its length.

				desiredVelocity.copy( displacement ).multiplyScalar( speed / distance );

				force.subVectors( desiredVelocity, vehicle.velocity );

			}

		};

	} ()

} );

// public API

Object.assign( SteeringBehaviors.prototype, SteeringInterface );

export { SteeringBehaviors };
