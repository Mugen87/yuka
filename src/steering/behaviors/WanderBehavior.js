/**
 * @author Mugen87 / https://github.com/Mugen87
 */

import { SteeringBehavior } from '../SteeringBehavior';
import { Vector3 } from '../../Math/Vector3';
import { _Math } from '../../Math/Math';

class WanderBehavior extends SteeringBehavior {

	constructor ( radius = 2, distance = 10, jitter = 20 ) {

		super();

		this.radius = radius; // the radius of the constraining circle for the wander behavior
		this.distance = distance; // the distance the wander sphere is projected in front of the agent
		this.jitter = jitter; // the maximum amount of displacement along the sphere each frame

		this._target = new Vector3();

		this._setup();

	}

	_setup () {

		var theta = Math.random() * Math.PI * 2;

		// setup a vector to a target position on the wander sphere
		// target lies always in the XZ plane

		this._target.x = this.radius * Math.cos( theta );
		this._target.z = this.radius * Math.sin( theta );

	}

}

Object.assign( WanderBehavior.prototype, {

	calculate: function () {

		const targetWorldSpace = new Vector3();
		const randomDisplacement = new Vector3();
		const distanceVector = new Vector3();

		return function calculate ( vehicle, force, delta ) {

			// this behavior is dependent on the update rate, so this line must be
			// included when using time independent frame rate

			const jitterThisTimeSlice = this.jitter * delta;

			// prepare random vector

			randomDisplacement.x = _Math.randFloat( - 1, 1 ) * jitterThisTimeSlice;
			randomDisplacement.z = _Math.randFloat( - 1, 1 ) * jitterThisTimeSlice;

			// add random vector to the target's position

			this._target.add( randomDisplacement );

			// re-project this new vector back onto a unit sphere

			this._target.normalize();

			// increase the length of the vector to the same as the radius of the wander sphere

			this._target.multiplyScalar( this.radius );

			// move the target into a position wanderDist in front of the agent

			distanceVector.z = this.distance;
			targetWorldSpace.addVectors( this._target, distanceVector );

			// project the target into world space

			targetWorldSpace.applyMatrix4( vehicle.matrix );

			// and steer towards it

			force.subVectors( targetWorldSpace, vehicle.position );

		};

	} ()

} );

export { WanderBehavior };
