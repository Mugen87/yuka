/**
 * @author robp94 / https://github.com/robp94
 */

import { Task } from '../../../../build/yuka.module.js';

class PathPlannerTask extends Task {

	constructor( planner, vehicle, from, to, callback ) {

		super();

		this.callback = callback;
		this.planner = planner;
		this.vehicle = vehicle;
		this.from = from;
		this.to = to;

	}

	execute() {

		const path = this.planner.navMesh.findPath( this.from, this.to );

		this.callback( this.vehicle, path );

	}

}

export { PathPlannerTask };
