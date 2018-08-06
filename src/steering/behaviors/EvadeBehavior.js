/**
 * @author Mugen87 / https://github.com/Mugen87
 */

import { SteeringBehavior } from '../SteeringBehavior.js';
import { FleeBehavior } from './FleeBehavior.js';
import { Vector3 } from '../../math/Vector3.js';

const displacement = new Vector3();
const newPuruserVelocity = new Vector3();
const predcitedPosition = new Vector3();

class EvadeBehavior extends SteeringBehavior {

	constructor( pursuer = null, panicDistance = 10, predictionFactor = 1 ) {

		super();

		this.pursuer = pursuer;
		this.panicDistance = panicDistance;
		this.predictionFactor = predictionFactor;

		// internal behaviors

		this._flee = new FleeBehavior();

	}

	calculate( vehicle, force /*, delta */ ) {

		const pursuer = this.pursuer;

		displacement.subVectors( pursuer.position, vehicle.position );

		let lookAheadTime = displacement.length() / ( vehicle.maxSpeed + pursuer.getSpeed() );
		lookAheadTime *= this.predictionFactor; // tweak the magnitude of the prediction

		// calculate new velocity and predicted future position

		newPuruserVelocity.copy( pursuer.velocity ).multiplyScalar( lookAheadTime );
		predcitedPosition.addVectors( pursuer.position, newPuruserVelocity );

		// now flee away from predicted future position of the pursuer

		this._flee.target = predcitedPosition;
		this._flee.panicDistance = this.panicDistance;
		this._flee.calculate( vehicle, force );

	}

}

export { EvadeBehavior };
