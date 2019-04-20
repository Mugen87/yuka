/**
* A lookup table representing the cost associated from traveling from one
* node to every other node in the navgiation mesh's graph.
*
* @author {@link https://github.com/Mugen87|Mugen87}
*/
class CostTable {

	/**
	* Creates a new cost table.
	*/
	constructor() {

		this._nodeMap = new Map();

	}

	/**
	* Inits the cost table for the given navigation mesh.
	*
	* @param {NavMesh} navMesh - The navigation mesh.
	* @return {CostTable} A reference to this cost table.
	*/
	init( navMesh ) {

		const graph = navMesh.graph;
		const nodes = new Array();

		this.clear();

		// iterate over all nodes

		graph.getNodes( nodes );

		for ( let i = 0, il = nodes.length; i < il; i ++ ) {

			const from = nodes[ i ];

			// compute the distance to all other nodes

			for ( let j = 0, jl = nodes.length; j < jl; j ++ ) {

				const to = nodes[ j ];

				const path = navMesh.findPath( from.position, to.position );
				const cost = computeDistanceOfPath( path );

				this.set( from.index, to.index, cost );

			}

		}

		return this;

	}

	/**
	* Clears the cost table.
	*
	* @return {CostTable} A reference to this cost table.
	*/
	clear() {

		this._nodeMap.clear();

		return this;

	}

	/**
	* Sets the cost for the given pair of navigation nodes.
	*
	* @param {Number} from - The start node index.
	* @param {Number} to - The destintation node index.
	* @param {Number} cost - The cost.
	* @return {CostTable} A reference to this cost table.
	*/
	set( from, to, cost ) {

		const nodeMap = this._nodeMap;

		if ( nodeMap.has( from ) === false ) nodeMap.set( from, new Map() );

		const nodeCostMap = nodeMap.get( from );

		nodeCostMap.set( to, cost );

		return this;

	}

	/**
	* Returns the cost for the given pair of navigation nodes.
	*
	* @param {Number} from - The start node index.
	* @param {Number} to - The destintation node index.
	* @return {Number} The cost.
	*/
	get( from, to ) {

		const nodeCostMap = this._nodeMap.get( from );

		return nodeCostMap.get( to );

	}

	/**
	* Returns the size of the cost table (amount of entries).
	*
	* @return {Number} The size of the cost table.
	*/
	size() {

		return this._nodeMap.size;

	}

	/**
	* Transforms this instance into a JSON object.
	*
	* @return {Object} The JSON object.
	*/
	toJSON() {

		const json = {
			nodes: new Array()
		};

		for ( let [ key, value ] of this._nodeMap.entries() ) {

			json.nodes.push( { index: key, costs: Array.from( value ) } );

		}

		return json;

	}

	/**
	* Restores this instance from the given JSON object.
	*
	* @param {Object} json - The JSON object.
	* @return {CostTable} A reference to this cost table.
	*/
	fromJSON( json ) {

		const nodes = json.nodes;

		for ( let i = 0, l = nodes.length; i < l; i ++ ) {

			const node = nodes[ i ];

			const index = node.index;
			const costs = new Map( node.costs );

			this._nodeMap.set( index, costs );

		}

		return this;

	}

}

//

function computeDistanceOfPath( path ) {

	let distance = 0;

	for ( let i = 0, l = ( path.length - 1 ); i < l; i ++ ) {

		const from = path[ i ];
		const to = path[ i + 1 ];

		distance += from.distanceTo( to );

	}

	return distance;

}

export { CostTable };
