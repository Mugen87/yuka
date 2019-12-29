import { Graph } from '../../graph/core/Graph.js';
import { NavNode } from '../core/NavNode.js';
import { NavEdge } from '../core/NavEdge.js';
import { Vector3 } from '../../math/Vector3.js';

/**
* Class with graph helpers.
*
* @author {@link https://github.com/Mugen87|Mugen87}
*/
class GraphUtils {

	/**
	* Generates a navigation graph with a planar grid layout based on the given parameters.
	*
	* @param {Number} size - The size (width and depth) in x and z direction
	* @param {Number} segments - The amount of segments in x and z direction.
	* @return {Graph} The new graph.
	*/
	static createGridLayout( size, segments ) {

		const graph = new Graph();
		graph.digraph = true;

		const halfSize = size / 2;
		const segmentSize = size / segments;

		// nodes

		let index = 0;

		for ( let i = 0; i <= segments; i ++ ) {

			const z = ( i * segmentSize ) - halfSize;

			for ( let j = 0; j <= segments; j ++ ) {

				const x = ( j * segmentSize ) - halfSize;

				const position = new Vector3( x, 0, z );

				const node = new NavNode( index, position );

				graph.addNode( node );

				index ++;

			}

		}

		// edges

		const count = graph.getNodeCount();
		const range = Math.pow( segmentSize + ( segmentSize / 2 ), 2 );

		for ( let i = 0; i < count; i ++ ) {

			const node = graph.getNode( i );

			// check distance to all other nodes

			for ( let j = 0; j < count; j ++ ) {

				if ( i !== j ) {

					const neighbor = graph.getNode( j );

					const distanceSquared = neighbor.position.squaredDistanceTo( node.position );

					if ( distanceSquared <= range ) {

						const distance = Math.sqrt( distanceSquared );

						const edge = new NavEdge( i, j, distance );

						graph.addEdge( edge );

					}

				}

			}

		}

		return graph;

	}

}

export { GraphUtils };
