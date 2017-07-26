/**
 * @author Mugen87 / https://github.com/Mugen87
 */

import { SteeringBehavior } from './SteeringBehavior';
import { Flee } from './Flee';
import { Vector3 } from '../../Math/Vector3';

class Evade extends SteeringBehavior {

	constructor ( target , pursuer ) {

		super();

		this.target = target;
		this.pursuer = pursuer;

		// internal behaviors

		this._flee = new Flee();

	}

}

Object.assign( Evade.prototype, {

	calculate: function () {

		const displacement = new Vector3();
		const newPuruserVelocity = new Vector3();
		const predcitedPosition = new Vector3();

		return function calculate ( vehicle, force ) {

			const pursuer = this.pursuer;

			displacement.subVectors( pursuer.position, vehicle.position );

			const lookAheadTime = displacement.length() / ( vehicle.maxSpeed + pursuer.getSpeed() );

			// calculate new velocity and predicted future position

			newPuruserVelocity.copy( pursuer.velocity ).multiplyScalar( lookAheadTime );
			predcitedPosition.addVectors( pursuer.position, newPuruserVelocity );

			// now flee away from predicted future position of the pursuer

			this._flee.target = predcitedPosition;
			this._flee.calculate( vehicle, force );

		};

	} ()

} );

export { Evade };
