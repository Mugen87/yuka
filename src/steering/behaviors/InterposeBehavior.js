/**
 * @author Mugen87 / https://github.com/Mugen87
 */

import { SteeringBehavior } from '../SteeringBehavior.js';
import { ArriveBehavior } from './ArriveBehavior.js';
import { Vector3 } from '../../math/Vector3.js';

const midPoint = new Vector3();
const translation = new Vector3();
const predcitedPosition1 = new Vector3();
const predcitedPosition2 = new Vector3();

class InterposeBehavior extends SteeringBehavior {

	constructor( entity1, entity2, deceleration = 3 ) {

		super();

		this.entity1 = entity1;
		this.entity2 = entity2;
		this.deceleration = deceleration;

		// internal behaviors

		this._arrive = new ArriveBehavior();

	}

	calculate( vehicle, force /*, delta */ ) {

		const entity1 = this.entity1;
		const entity2 = this.entity2;

		// first we need to figure out where the two entities are going to be
		// in the future. This is approximated by determining the time
		// taken to reach the mid way point at the current time at max speed

		midPoint.addVectors( entity1.position, entity2.position ).multiplyScalar( 0.5 );
		const time = vehicle.position.distanceTo( midPoint ) / vehicle.maxSpeed;

		// now we have the time, we assume that entity 1 and entity 2 will
		// continue on a straight trajectory and extrapolate to get their future positions

		translation.copy( entity1.velocity ).multiplyScalar( time );
		predcitedPosition1.addVectors( entity1.position, translation );

		translation.copy( entity2.velocity ).multiplyScalar( time );
		predcitedPosition2.addVectors( entity2.position, translation );

		// calculate the mid point of these predicted positions

		midPoint.addVectors( predcitedPosition1, predcitedPosition2 ).multiplyScalar( 0.5 );

		// then steer to arrive at it

		this._arrive.deceleration = this.deceleration;
		this._arrive.target = midPoint;
		this._arrive.calculate( vehicle, force );

	}

}

export { InterposeBehavior };
