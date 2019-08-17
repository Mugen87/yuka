/**
* Class for representing a heuristic for graph search algorithms based
* on the euclidean distance. The heuristic assumes that the node have
* a *position* property of type {@link Vector3}.
*
* @author {@link https://github.com/Mugen87|Mugen87}
*/
class HeuristicPolicyEuclid {

	/**
	* Calculates the euclidean distance between two nodes.
	*
	* @param {Graph} graph - The graph.
	* @param {Number} source - The index of the source node.
	* @param {Number} target - The index of the target node.
	* @return {Number} The euclidean distance between both nodes.
	*/
	static calculate( graph, source, target ) {

		const sourceNode = graph.getNode( source );
		const targetNode = graph.getNode( target );

		return sourceNode.position.distanceTo( targetNode.position );

	}

}

/**
* Class for representing a heuristic for graph search algorithms based
* on the squared euclidean distance. The heuristic assumes that the node
* have a *position* property of type {@link Vector3}.
*
* @author {@link https://github.com/Mugen87|Mugen87}
*/
class HeuristicPolicyEuclidSquared {

	/**
	* Calculates the squared euclidean distance between two nodes.
	*
	* @param {Graph} graph - The graph.
	* @param {Number} source - The index of the source node.
	* @param {Number} target - The index of the target node.
	* @return {Number} The squared euclidean distance between both nodes.
	*/
	static calculate( graph, source, target ) {

		const sourceNode = graph.getNode( source );
		const targetNode = graph.getNode( target );

		return sourceNode.position.squaredDistanceTo( targetNode.position );

	}

}

/**
* Class for representing a heuristic for graph search algorithms based
* on the manhattan distance. The heuristic assumes that the node
* have a *position* property of type {@link Vector3}.
*
* @author {@link https://github.com/Mugen87|Mugen87}
*/
class HeuristicPolicyManhattan {

	/**
	* Calculates the manhattan distance between two nodes.
	*
	* @param {Graph} graph - The graph.
	* @param {Number} source - The index of the source node.
	* @param {Number} target - The index of the target node.
	* @return {Number} The manhattan distance between both nodes.
	*/
	static calculate( graph, source, target ) {

		const sourceNode = graph.getNode( source );
		const targetNode = graph.getNode( target );

		return sourceNode.position.manhattanDistanceTo( targetNode.position );

	}

}

/**
* Class for representing a heuristic for graph search algorithms based
* on Dijkstra's algorithm.
*
* @author {@link https://github.com/Mugen87|Mugen87}
*/
class HeuristicPolicyDijkstra {

	/**
	* This heuristic always returns *0*. The {@link AStar} algorithm
	* behaves with this heuristic exactly like {@link Dijkstra}
	*
	* @param {Graph} graph - The graph.
	* @param {Number} source - The index of the source node.
	* @param {Number} target - The index of the target node.
	* @return {Number} The value 0.
	*/
	static calculate( /* graph, source, target */ ) {

		return 0;

	}

}

export {
	HeuristicPolicyEuclid,
	HeuristicPolicyEuclidSquared,
	HeuristicPolicyManhattan,
	HeuristicPolicyDijkstra
};
