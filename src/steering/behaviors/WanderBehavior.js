/**
 * @author Mugen87 / https://github.com/Mugen87
 */

import { SteeringBehavior } from '../SteeringBehavior.js';
import { Vector3 } from '../../Math/Vector3.js';
import { _Math } from '../../Math/Math.js';

const targetWorld = new Vector3();
const randomDisplacement = new Vector3();

class WanderBehavior extends SteeringBehavior {

	constructor( radius = 1, distance = 5, jitter = 5 ) {

		super();

		this.radius = radius; // the radius of the constraining circle for the wander behavior
		this.distance = distance; // the distance the wander sphere is projected in front of the agent
		this.jitter = jitter; // the maximum amount of displacement along the sphere each frame

		this._targetLocal = new Vector3();

		this._setup();

	}

	calculate( vehicle, force, delta ) {

		// this behavior is dependent on the update rate, so this line must be
		// included when using time independent frame rate

		const jitterThisTimeSlice = this.jitter * delta;

		// prepare random vector

		randomDisplacement.x = _Math.randFloat( - 1, 1 ) * jitterThisTimeSlice;
		randomDisplacement.z = _Math.randFloat( - 1, 1 ) * jitterThisTimeSlice;

		// add random vector to the target's position

		this._targetLocal.add( randomDisplacement );

		// re-project this new vector back onto a unit sphere

		this._targetLocal.normalize();

		// increase the length of the vector to the same as the radius of the wander sphere

		this._targetLocal.multiplyScalar( this.radius );

		// move the target into a position wanderDist in front of the agent

		targetWorld.copy( this._targetLocal );
		targetWorld.z += this.distance;

		// project the target into world space

		targetWorld.applyMatrix4( vehicle.matrix );

		// and steer towards it

		force.subVectors( targetWorld, vehicle.position );

	}

	_setup() {

		var theta = Math.random() * Math.PI * 2;

		// setup a vector to a target position on the wander sphere
		// target lies always in the XZ plane

		this._targetLocal.x = this.radius * Math.cos( theta );
		this._targetLocal.z = this.radius * Math.sin( theta );

	}

}

export { WanderBehavior };
