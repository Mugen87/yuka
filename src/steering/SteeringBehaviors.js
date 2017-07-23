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
		this.path = null; // list of waypoints to follow
		this.nextWaypointDistance = 1; // the distance a waypoint is set to the new target

		this.targetAgent = null; // can be used to keep track of friend, pursuer or prey

		// use these values to tweak the amount that each steering force
		// contributes to the total steering force

		this.weights = {
			seek: 1,
			flee : 1,
			arrive : 1,
			pursuit: 1,
			evade: 1,
			followPath: 1
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

			// evade

			if ( this.evadeOn() === true ) {

				force.set( 0, 0 , 0 );

				this._evade( force, this.targetAgent );

				force.multiplyScalar( this.weights.evade );

				if ( this._accumulateForce( force ) === false ) return;

			}

			// flee

			if ( this.fleeOn() === true ) {

				force.set( 0, 0, 0 );

				this._flee( force, this.target );

				force.multiplyScalar( this.weights.flee );

				if ( this._accumulateForce( force ) === false ) return;

			}

			// seek

			if ( this.seekOn() === true ) {

				force.set( 0, 0, 0 );

				this._seek( force, this.target );

				force.multiplyScalar( this.weights.seek );

				if ( this._accumulateForce( force ) === false ) return;

			}

			// arrive

			if ( this.arriveOn() === true ) {

				force.set( 0, 0, 0 );

				this._arrive( force, this.target, this.deceleration );

				force.multiplyScalar( this.weights.arrive );

				if ( this._accumulateForce( force ) === false ) return;

			}

			// pursuit

			if ( this.pursuitOn() === true ) {

				force.set( 0, 0 , 0 );

				this._pursuit( force, this.targetAgent );

				force.multiplyScalar( this.weights.pursuit );

				if ( this._accumulateForce( force ) === false ) return;

			}

			// follow path

			if ( this.followPathOn() === true ) {

				force.set( 0, 0 , 0 );

				this._followPath( force );

				force.multiplyScalar( this.weights.followPath );

				if ( this._accumulateForce( force ) === false ) return;

			}

		};

	} (),

	_seek: function () {

		const desiredVelocity = new Vector3();

		return function _seek ( force, target ) {

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

		return function _flee ( force, target ) {

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

		return function _arrive ( force, target, deceleration = 3 ) {

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

	} (),

	_pursuit: function () {

		const displacement = new Vector3();
		const vehicleDirection = new Vector3();
		const evaderDirection = new Vector3();
		const newEvaderVelocity = new Vector3();
		const predcitedPosition = new Vector3();

		return function _pursuit ( force, evader ) {

			const vehicle = this.vehicle;

			if ( evader === null ) {

				console.error( 'YUKA.SteeringBehaviors: Target agent not defined for behavior "pursuit" and entity %o.', vehicle );
				return;

			}

			displacement.subVectors( evader.position, vehicle.position );

			// 1. if the evader is ahead and facing the agent then we can just seek for the evader's current position

			vehicle.getDirection( vehicleDirection );
			evader.getDirection( evaderDirection );

			// first condition: evader must be in front of the pursuer

			const evaderAhead = displacement.dot( vehicleDirection ) > 0;

			// second condition: evader must almost directly facing the agent

			const facing = vehicleDirection.dot( evaderDirection ) < - 0.95;

			if ( evaderAhead === true && facing === true ) {

				this._seek( force, evader.position );
				return;

			}

			// 2. evader not considered ahead so we predict where the evader will be

			// the lookahead time is proportional to the distance between the evader
			// and the pursuer. and is inversely proportional to the sum of the
			// agent's velocities

			const lookAheadTime = displacement.length() / ( vehicle.maxSpeed + evader.getSpeed() );

			// calculate new velocity and predicted future position

			newEvaderVelocity.copy( evader.velocity ).multiplyScalar( lookAheadTime );
			predcitedPosition.addVectors( evader.position, newEvaderVelocity );

			// now seek to the predicted future position of the evader

			this._seek( force, predcitedPosition );

		};

	} (),

	_evade: function () {

		const displacement = new Vector3();
		const newPuruserVelocity = new Vector3();
		const predcitedPosition = new Vector3();

		return function _evade ( force, pursuer ) {

			const vehicle = this.vehicle;

			if ( pursuer === null ) {

				console.error( 'YUKA.SteeringBehaviors: Target agent not defined for behavior "evade" and entity %o.', vehicle );
				return;

			}

			displacement.subVectors( pursuer.position, vehicle.position );

			const lookAheadTime = displacement.length() / ( vehicle.maxSpeed + pursuer.getSpeed() );

			// calculate new velocity and predicted future position

			newPuruserVelocity.copy( pursuer.velocity ).multiplyScalar( lookAheadTime );
			predcitedPosition.addVectors( pursuer.position, newPuruserVelocity );

			// now flee away from predicted future position of the pursuer

			this._flee( force, predcitedPosition );

		};

	} (),

	_followPath: function ( force ) {

		const vehicle = this.vehicle;
		const path = this.path;

		// calculate distance in square space from current waypoint to vehicle

		var distanceSq = path.current().distanceToSquared( vehicle.position );

		// move to next waypoint if close enough to current target

		if ( distanceSq < ( this.nextWaypointDistance * this.nextWaypointDistance ) ) {

			path.advance();

		}

		if ( path.finished() === true ) {

			this._arrive( force, path.current() );

		} else {

			this._seek( force, path.current() );

		}

	}

} );

// public API

Object.assign( SteeringBehaviors.prototype, SteeringInterface );

export { SteeringBehaviors };
