/**
 * @author Mugen87 / https://github.com/Mugen87
 */

import { SteeringBehavior } from '../SteeringBehavior.js';
import { LineSegment } from '../../math/LineSegment.js';
import { Vector3 } from '../../math/Vector3.js';

const desiredVelocity = new Vector3();
const edgeDirection = new Vector3();
const vehicleDirection = new Vector3();
const translation = new Vector3();
const newPosition = new Vector3();
const lineSegment = new LineSegment();

class StayInNavMeshBehavior extends SteeringBehavior {

	constructor( navMesh = null ) {

		super();

		this.navMesh = navMesh;

		this._currentRegion = null;

	}

	calculate( vehicle, force, delta ) {

		const navMesh = this.navMesh;

		if ( this._currentRegion === null ) {

			this._currentRegion = navMesh.getRegionForPoint( vehicle.position );

		}

		//

		translation.copy( vehicle.velocity ).multiplyScalar( delta );
		newPosition.copy( vehicle.position ).add( translation );

		const nextRegion = navMesh.getRegionForPoint( newPosition );

		if ( nextRegion === null ) {

			// produce a force that keeps the vehicle inside the navMesh

			// calculate the closest vertex to the vehicle's position in the current region
			// and save the corresponding edge

			let closestEdge = null;
			let minDistance = Infinity;

			let edge = this._currentRegion.edge;

			do {

				// only investigate border edges

				if ( edge.twin === null ) {

					const distance = vehicle.position.squaredDistanceTo( edge.from() );

					if ( distance < minDistance ) {

						minDistance = distance;

						closestEdge = edge;

					}

				}

				edge = edge.next;

			} while ( edge !== this._currentRegion.edge );

			// calculate the distance to the outgoing and incoming edge of the closest vertex

			const p0 = closestEdge.vertex;
			const p1 = closestEdge.next.vertex;
			const p2 = closestEdge.prev.vertex;

			//

			lineSegment.from = p0;
			lineSegment.to = p1;

			const d1 = lineSegment.squaredDistanceToPoint( vehicle.position );

			lineSegment.from = p2;
			lineSegment.to = p0;

			const d2 = lineSegment.squaredDistanceToPoint( vehicle.position );

			// choose the closest edge and calculate a normalized vector that
			// represents the direction of the edge

			if ( d1 <= d2 ) {

				edgeDirection.subVectors( closestEdge.next.vertex, closestEdge.vertex ).normalize();

			} else {

				edgeDirection.subVectors( closestEdge.vertex, closestEdge.prev.vertex ).normalize();

			}

			// the dot product between the vehicle's direction and the edge direction
			// will influence the direction and amount of the final force

			vehicle.getDirection( vehicleDirection );
			let f = edgeDirection.dot( vehicleDirection );

			f = ( f >= 0 ) ? 1 : - 1;

			desiredVelocity.copy( edgeDirection ).multiplyScalar( vehicle.maxSpeed * f );
			force.subVectors( desiredVelocity, vehicle.velocity );

			return;

		} else {

			this._currentRegion = nextRegion;

			// produce no force

		}

	}

}

export { StayInNavMeshBehavior };
