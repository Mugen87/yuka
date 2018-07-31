/**
 * @author Mugen87 / https://github.com/Mugen87
 */

import { SteeringBehavior, Vector3, ArriveBehavior, EvadeBehavior } from '../../../../build/yuka.module.js';

const hidingSpot = new Vector3();
const bestHidingSpot = new Vector3();
const offset = new Vector3();

class HideBehavior extends SteeringBehavior {

	constructor( entityManager, pursuer, distanceFromHidingSpot = 1, deceleration = 2 ) {

		super();

		this.entityManager = entityManager;
		this.pursuer = pursuer;
		this.distanceFromHidingSpot = distanceFromHidingSpot;
		this.deceleration = deceleration;

		this._arrive = new ArriveBehavior();
		this._evade = new EvadeBehavior();

	}

	calculate( vehicle, force /*, delta */ ) {

		let closestDistanceSquared = Infinity;

		const obstacles = this.entityManager.entities.values();

		for ( let obstacle of obstacles ) {

			if ( obstacle.isObstacle ) {

				this._getHidingPosition( obstacle, this.pursuer, hidingSpot );

				const squaredDistance = hidingSpot.squaredDistanceTo( vehicle.position );

				if ( squaredDistance < closestDistanceSquared ) {

					closestDistanceSquared = squaredDistance;

					bestHidingSpot.copy( hidingSpot );

				}

			}

		}

		if ( closestDistanceSquared === Infinity ) {

			// if no suitable obstacles found then evade the pursuer

			this._evade.pursuer = this.pursuer;
			this._evade.calculate( vehicle, force );

		} else {

			this._arrive.deceleration = this.deceleration;
			this._arrive.target = bestHidingSpot;
			this._arrive.calculate( vehicle, force );

		}

	}

	_getHidingPosition( obstacle, pursuer, hidingSpot ) {

		// calculate the ideal spacing of the vehicle to the hiding spot

		const spacing = obstacle.boundingRadius + this.distanceFromHidingSpot;

		// calculate the heading toward the object from the pursuer

		offset.subVectors( obstacle.position, pursuer.position ).normalize();

		// scale it to size

		offset.multiplyScalar( spacing );

		// add the offset to the obstacles position to get the hiding spot

		hidingSpot.addVectors( obstacle.position, offset );

	}

}

export { HideBehavior };
