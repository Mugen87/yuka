/**
 * @author Mugen87 / https://github.com/Mugen87
 */

import { SteeringBehavior } from './SteeringBehavior';
import { Seek } from './Seek';
import { Arrive } from './Arrive';

class FollowPath extends SteeringBehavior {

	constructor ( path ) {

		super();

		this.path = path; // list of waypoints to follow
		this.nextWaypointDistance = 1; // the distance a waypoint is set to the new target

		// internal behaviors

		this._seek = new Seek();
		this._arrive = new Arrive();

	}

	calculate ( vehicle, force ) {

		const path = this.path;
		const nextWaypointDistance = this.nextWaypointDistance;

		// calculate distance in square space from current waypoint to vehicle

		var distanceSq = path.current().distanceToSquared( vehicle.position );

		// move to next waypoint if close enough to current target

		if ( distanceSq < ( nextWaypointDistance * nextWaypointDistance ) ) {

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

export { FollowPath };
