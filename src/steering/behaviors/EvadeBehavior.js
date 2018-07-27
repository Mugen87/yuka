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

	constructor( pursuer ) {

		super();

		this.pursuer = pursuer;

		// internal behaviors

		this._flee = new FleeBehavior();

	}

	calculate( vehicle, force /*, delta */ ) {

		const pursuer = this.pursuer;

		displacement.subVectors( pursuer.position, vehicle.position );

		const lookAheadTime = displacement.length() / ( vehicle.maxSpeed + pursuer.getSpeed() );

		// calculate new velocity and predicted future position

		newPuruserVelocity.copy( pursuer.velocity ).multiplyScalar( lookAheadTime );
		predcitedPosition.addVectors( pursuer.position, newPuruserVelocity );

		// now flee away from predicted future position of the pursuer

		this._flee.target = predcitedPosition;
		this._flee.calculate( vehicle, force );

	}

}

export { EvadeBehavior };
