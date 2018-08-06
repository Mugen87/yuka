/**
 * @author Mugen87 / https://github.com/Mugen87
 */

import { SteeringBehavior } from '../SteeringBehavior.js';
import { Path } from '../Path.js';
import { SeekBehavior } from './SeekBehavior.js';
import { ArriveBehavior } from './ArriveBehavior.js';

class FollowPathBehavior extends SteeringBehavior {

	constructor( path = new Path(), nextWaypointDistance = 1 ) {

		super();

		this.path = path; // list of waypoints to follow
		this.nextWaypointDistance = nextWaypointDistance; // the distance a waypoint is set to the new target

		// internal behaviors

		this._arrive = new ArriveBehavior();
		this._seek = new SeekBehavior();

	}

	calculate( vehicle, force /*, delta */ ) {

		const path = this.path;

		// calculate distance in square space from current waypoint to vehicle

		const distanceSq = path.current().squaredDistanceTo( vehicle.position );

		// move to next waypoint if close enough to current target

		if ( distanceSq < ( this.nextWaypointDistance * this.nextWaypointDistance ) ) {

			path.advance();

		}

		const target = path.current();

		if ( path.finished() === true ) {

			this._arrive.target = target;
			this._arrive.calculate( vehicle, force );

		} else {

			this._seek.target = target;
			this._seek.calculate( vehicle, force );

		}

	}

}

export { FollowPathBehavior };
