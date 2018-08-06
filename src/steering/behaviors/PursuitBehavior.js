/**
 * @author Mugen87 / https://github.com/Mugen87
 */

import { SteeringBehavior } from '../SteeringBehavior.js';
import { SeekBehavior } from './SeekBehavior.js';
import { Vector3 } from '../../math/Vector3.js';

const displacement = new Vector3();
const vehicleDirection = new Vector3();
const evaderDirection = new Vector3();
const newEvaderVelocity = new Vector3();
const predcitedPosition = new Vector3();

class PursuitBehavior extends SteeringBehavior {

	constructor( evader = null, predictionFactor = 1 ) {

		super();

		this.evader = evader;
		this.predictionFactor = predictionFactor;

		// internal behaviors

		this._seek = new SeekBehavior();

	}

	calculate( vehicle, force /*, delta */ ) {

		const evader = this.evader;

		displacement.subVectors( evader.position, vehicle.position );

		// 1. if the evader is ahead and facing the agent then we can just seek for the evader's current position

		vehicle.getDirection( vehicleDirection );
		evader.getDirection( evaderDirection );

		// first condition: evader must be in front of the pursuer

		const evaderAhead = displacement.dot( vehicleDirection ) > 0;

		// second condition: evader must almost directly facing the agent

		const facing = vehicleDirection.dot( evaderDirection ) < - 0.95;

		if ( evaderAhead === true && facing === true ) {

			this._seek.target = evader.position;
			this._seek.calculate( vehicle, force );
			return;

		}

		// 2. evader not considered ahead so we predict where the evader will be

		// the lookahead time is proportional to the distance between the evader
		// and the pursuer. and is inversely proportional to the sum of the
		// agent's velocities

		let lookAheadTime = displacement.length() / ( vehicle.maxSpeed + evader.getSpeed() );
		lookAheadTime *= this.predictionFactor; // tweak the magnitude of the prediction

		// calculate new velocity and predicted future position

		newEvaderVelocity.copy( evader.velocity ).multiplyScalar( lookAheadTime );
		predcitedPosition.addVectors( evader.position, newEvaderVelocity );

		// now seek to the predicted future position of the evader

		this._seek.target = predcitedPosition;
		this._seek.calculate( vehicle, force );

	}

}

export { PursuitBehavior };
