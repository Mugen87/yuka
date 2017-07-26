/**
 * @author Mugen87 / https://github.com/Mugen87
 */

import { SteeringBehavior } from '../SteeringBehavior';
import { SeekBehavior } from './SeekBehavior';
import { ArriveBehavior } from './ArriveBehavior';

class FollowPathBehavior extends SteeringBehavior {

	constructor ( path ) {

		super();

		this.path = path; // list of waypoints to follow
		this._nextWaypointDistance = 1; // the distance a waypoint is set to the new target

		// internal behaviors

		this._seek = new SeekBehavior();
		this._arrive = new ArriveBehavior();

	}

	calculate ( vehicle, force ) {

		const path = this.path;
		const nextWaypointDistance = this._nextWaypointDistance;

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

export { FollowPathBehavior };
