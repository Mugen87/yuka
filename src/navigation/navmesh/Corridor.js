import { MathUtils } from '../../math/MathUtils.js';

/**
* A corridor is a sequence of portal edges representing a walkable way within a navigation mesh. The class is able
* to find the shortest path through this corridor as a sequence of waypoints. It's an implementation of the so called
* {@link http://digestingduck.blogspot.com/2010/03/simple-stupid-funnel-algorithm.html Funnel Algorithm}. Read
* the paper {@link https://aaai.org/Papers/AAAI/2006/AAAI06-148.pdf Efficient Triangulation-Based Pathfinding} for
* more detailed information.
*
* @author {@link https://github.com/Mugen87|Mugen87}
* @author {@link https://github.com/robp94|robp94}
*/
class Corridor {

	/**
	* Creates a new corridor.
	*/
	constructor() {

		/**
		* The portal edges of the corridor.
		* @type {Array<Object>}
		*/
		this.portalEdges = new Array();

	}

	/**
	* Adds a portal edge defined by its left and right vertex to this corridor.
	*
	* @param {Vector3} left - The left point (origin) of the portal edge.
	* @param {Vector3} right - The right point (destination) of the portal edge.
	* @return {Corridor} A reference to this corridor.
	*/
	push( left, right ) {

		this.portalEdges.push( {
			left: left,
			right: right
		} );

		return this;

	}

	/**
	* Generates the shortest path through the corridor as an array of 3D vectors.
	*
	* @return {Array<Vector3>} An array of 3D waypoints.
	*/
	generate() {

		const portalEdges = this.portalEdges;
		const path = new Array();

		// init scan state

		let portalApex, portalLeft, portalRight;
		let apexIndex = 0, leftIndex = 0, rightIndex = 0;

		portalApex = portalEdges[ 0 ].left;
		portalLeft = portalEdges[ 0 ].left;
		portalRight = portalEdges[ 0 ].right;

		// add start point

		path.push( portalApex );

		for ( let i = 1, l = portalEdges.length; i < l; i ++ ) {

			const left = portalEdges[ i ].left;
			const right = portalEdges[ i ].right;

			// update right vertex

			if ( MathUtils.area( portalApex, portalRight, right ) <= 0 ) {

				if ( portalApex === portalRight || MathUtils.area( portalApex, portalLeft, right ) > 0 ) {

					// tighten the funnel

					portalRight = right;
					rightIndex = i;

				} else {

					// right over left, insert left to path and restart scan from portal left point

					path.push( portalLeft );

					// make current left the new apex

					portalApex = portalLeft;
					apexIndex = leftIndex;

					// review eset portal

					portalLeft = portalApex;
					portalRight = portalApex;
					leftIndex = apexIndex;
					rightIndex = apexIndex;

					// restart scan

					i = apexIndex;

					continue;

				}

			}

			// update left vertex

			if ( MathUtils.area( portalApex, portalLeft, left ) >= 0 ) {

				if ( portalApex === portalLeft || MathUtils.area( portalApex, portalRight, left ) < 0 ) {

					// tighten the funnel

					portalLeft = left;
					leftIndex = i;

				} else {

					// left over right, insert right to path and restart scan from portal right point

					path.push( portalRight );

					// make current right the new apex

					portalApex = portalRight;
					apexIndex = rightIndex;

					// reset portal

					portalLeft = portalApex;
					portalRight = portalApex;
					leftIndex = apexIndex;
					rightIndex = apexIndex;

					// restart scan

					i = apexIndex;

					continue;

				}

			}

		}

		if ( ( path.length === 0 ) || ( path[ path.length - 1 ] !== portalEdges[ portalEdges.length - 1 ].left ) ) {

			// append last point to path

			path.push( portalEdges[ portalEdges.length - 1 ].left );

		}

		return path;

	}

}

export { Corridor };
