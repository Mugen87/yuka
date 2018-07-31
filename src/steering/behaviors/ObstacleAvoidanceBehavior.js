/**
 * @author Mugen87 / https://github.com/Mugen87
 */

import { SteeringBehavior } from '../SteeringBehavior.js';
import { SeekBehavior } from './SeekBehavior.js';
import { Vector3 } from '../../math/Vector3.js';
import { Matrix4 } from '../../math/Matrix4.js';
import { Ray } from '../../math/Ray.js';

const inverse = new Matrix4();
const localPositionOfObstacle = new Vector3();
const localPositionOfClosestObstacle = new Vector3();
const intersectionPoint = new Vector3();

// this will be later used for a ray/sphere intersection test

const ray = new Ray( new Vector3( 0, 0, 0 ), new Vector3( 0, 0, 1 ) );

class ObstacleAvoidanceBehavior extends SteeringBehavior {

	constructor( entityManager ) {

		super();

		this.entityManager = entityManager;
		this.weigth = 3; // this behavior needs a higher value in order to prioritize the produced force
		this.dBoxMinLength = 5; // minimum length of the detection box

		this._waypoint = null;

		// internal behaviors

		this._seek = new SeekBehavior();

	}

	calculate( vehicle, force /*, delta */ ) {

		// this will keep track of the closest intersecting obstacle

		let closestObstacle = null;

		// this will be used to track the distance to the closest obstacle

		let distanceToClosestObstacle = Infinity;

		// the obstacles in the game world

		const obstacles = this.entityManager.entities.values();

		// the detection box length is proportional to the agent's velocity

		const dBoxLength = this.dBoxMinLength + ( vehicle.getSpeed() / vehicle.maxSpeed ) * this.dBoxMinLength;

		inverse.getInverse( vehicle.matrix );

		for ( let obstacle of obstacles ) {

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

					ray.intersectSphere( localPositionOfObstacle, expandedRadius, intersectionPoint );

					// compare distances

					if ( intersectionPoint.z < distanceToClosestObstacle ) {

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

		// if there an obstacle was detected, calculate a proper waypoint next to the obstacle

		if ( closestObstacle !== null ) {

			this._waypoint = localPositionOfClosestObstacle.clone();

			// check if it's better to steer left or right next to the obstacle

			const sign = Math.sign( localPositionOfClosestObstacle.x );

			this._waypoint.x -= ( closestObstacle.boundingRadius + vehicle.boundingRadius ) * sign;

			this._waypoint.applyMatrix4( vehicle.matrix );

		}

		// proceed if there is an active waypoint

		if ( this._waypoint !== null ) {

			const distanceSq = this._waypoint.squaredDistanceTo( vehicle.position );

			// if we are close enough, delete the current waypoint

			if ( distanceSq < 1 ) {

				this._waypoint = null;

			} else {

				// otherwise steer towards it

				this._seek.target = this._waypoint;
				this._seek.calculate( vehicle, force );

			}

		}

	}

}

export { ObstacleAvoidanceBehavior };
