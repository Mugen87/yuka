/**
* Base class for graph edges.
*
* @author {@link https://github.com/Mugen87|Mugen87}
*/
class Edge {

	/**
	* Constructs a new edge.
	*
	* @param {Number} from - The index of the from node.
	* @param {Number} to - The index of the to node.
	* @param {Number} cost - The cost of this edge.
	*/
	constructor( from = - 1, to = - 1, cost = 0 ) {

		/**
		* The index of the *from* node.
		* @type {Number}
		* @default -1
		*/
		this.from = from;

		/**
		* The index of the *to* node.
		* @type {Number}
		* @default -1
		*/
		this.to = to;

		/**
		* The cost of this edge. This could be for example a distance or time value.
		* @type {Number}
		* @default 0
		*/
		this.cost = cost;

	}

	/**
	* Copies all values from the given edge to this edge.
	*
	* @param {Edge} edge - The edge to copy.
	* @return {Edge} A reference to this edge.
	*/
	copy( edge ) {

		this.from = edge.from;
		this.to = edge.to;
		this.cost = edge.cost;

		return this;

	}

	/**
	* Creates a new edge and copies all values from this edge.
	*
	* @return {Edge} A new edge.
	*/
	clone() {

		return new this.constructor().copy( this );

	}

	/**
	* Transforms this instance into a JSON object.
	*
	* @return {Object} The JSON object.
	*/
	toJSON() {

		return {
			type: this.constructor.name,
			from: this.from,
			to: this.to,
			cost: this.cost
		};

	}

	/**
	* Restores this instance from the given JSON object.
	*
	* @param {Object} json - The JSON object.
	* @return {Edge} A reference to this edge.
	*/
	fromJSON( json ) {

		this.from = json.from;
		this.to = json.to;
		this.cost = json.cost;

		return this;

	}

}

export { Edge };
