/**
* Base class for graph nodes.
*
* @author {@link https://github.com/Mugen87|Mugen87}
*/
class Node {

	/**
	* Constructs a new node.
	*
	* @param {Number} index - The unique index of this node.
	*/
	constructor( index = - 1 ) {

		/**
		* The unique index of this node. The default value *-1* means invalid index.
		* @type {Number}
		* @default -1
		*/
		this.index = index;

	}

	/**
	* Transforms this instance into a JSON object.
	*
	* @return {Object} The JSON object.
	*/
	toJSON() {

		return {
			type: this.constructor.name,
			index: this.index
		};

	}

	/**
	* Restores this instance from the given JSON object.
	*
	* @param {Object} json - The JSON object.
	* @return {Node} A reference to this node.
	*/
	fromJSON( json ) {

		this.index = json.index;
		return this;

	}

}

export { Node };
