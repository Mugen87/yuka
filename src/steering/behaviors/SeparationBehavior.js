/**
 * @author Mugen87 / https://github.com/Mugen87
 */

import { SteeringBehavior } from '../SteeringBehavior.js';
import { Vector3 } from '../../math/Vector3.js';

const toAgent = new Vector3();

class SeparationBehavior extends SteeringBehavior {

	constructor() {

		super();

	}

	calculate( vehicle, force /*, delta */ ) {

		const neighbors = vehicle.neighbors;

		for ( let i = 0, l = neighbors.length; i < l; i ++ ) {

			const neighbor = neighbors[ i ];

			toAgent.subVectors( vehicle.position, neighbor.position );

			let length = toAgent.length();

			// handle zero length if both vehicles have the same position

			if ( length === 0 ) length = 0.0001;

			// scale the force inversely proportional to the agents distance from its neighbor

			toAgent.normalize().divideScalar( length );

			force.add( toAgent );

		}

	}

}

export { SeparationBehavior };
