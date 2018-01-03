/**
 * @author Mugen87 / https://github.com/Mugen87
 */

class GraphHelper {

	static generateGridLayout( size, segments ) {

		const graph = new YUKA.Graph();
		graph.digraph = true;

		const halfSize = size / 2;
		const segmentSize = size / segments;

		// nodes

		let index = 0;

		for ( let i = 0; i < segments; i ++ ) {

			const z = ( i * segmentSize ) - halfSize;

			for ( let j = 0; j < segments; j ++ ) {

				const x = ( j * segmentSize ) - halfSize;

				const position = new YUKA.Vector3( x, 0, z );

				const node = new YUKA.NavNode( index, position );

				graph.addNode( node );

				index ++;

			}

		}

		// edges

		const count = graph.getNodeCount();
		const segmentSizeSquared = ( segmentSize * segmentSize ) + Number.EPSILON;

		for ( let i = 0; i < count; i ++ ) {

			const node = graph.getNode( i );

			// check distance to all other nodes

			for ( let j = 0; j < count; j ++ ) {

				if ( i !== j ) {

					const neighbor = graph.getNode( j );

					const distanceSquared = neighbor.position.distanceToSquared( node.position );

					if ( distanceSquared <= segmentSizeSquared ) {

						const distance = Math.sqrt( distanceSquared );

						const edge = new YUKA.NavEdge( i, j, distance );

						graph.addEdge( edge );

					}

				}

			}

		}

		return graph;

	}

}
