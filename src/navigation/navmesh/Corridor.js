/**
 * @author robp94 / https://github.com/robp94
 * @author Mugen87 / https://github.com/Mugen8
 *
 * Reference: https://github.com/donmccurdy/three-pathfinding/blob/master/src/Channel.js
 *
 */

import { _Math } from '../../math/Math.js';

class Corridor {

	constructor() {

		this.portalEdges = new Array();

	}

	push( left, right ) {

		this.portalEdges.push( {
			left: left,
			right: right
		} );

	}

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

			if ( _Math.area( portalApex, portalRight, right ) <= 0.0 ) {

				if ( portalApex === portalRight || _Math.area( portalApex, portalLeft, right ) > 0.0 ) {

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

			if ( _Math.area( portalApex, portalLeft, left ) >= 0.0 ) {

				if ( portalApex === portalLeft || _Math.area( portalApex, portalRight, left ) < 0.0 ) {

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
