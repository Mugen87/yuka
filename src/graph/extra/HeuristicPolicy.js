/**
 * @author Mugen87 / https://github.com/Mugen87
 */

class HeuristicPolicyEuclid {

	static calculate( graph, source, target ) {

		const sourceNode = graph.getNode( source );
		const targetNode = graph.getNode( target );

		return sourceNode.position.distanceTo( targetNode.position );

	}

}

class HeuristicPolicyEuclidSquared {

	static calculate( graph, source, target ) {

		const sourceNode = graph.getNode( source );
		const targetNode = graph.getNode( target );

		return sourceNode.position.squaredDistanceTo( targetNode.position );

	}

}

class HeuristicPolicyManhatten {

	static calculate( graph, source, target ) {

		const sourceNode = graph.getNode( source );
		const targetNode = graph.getNode( target );

		return sourceNode.position.manhattanDistanceTo( targetNode.position );

	}

}

class HeuristicPolicyDijkstra {

	static calculate( /* graph, source, target */ ) {

		return 0;

	}

}

export {
	HeuristicPolicyEuclid,
	HeuristicPolicyEuclidSquared,
	HeuristicPolicyManhatten,
	HeuristicPolicyDijkstra
};
