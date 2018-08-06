/**
 * @author Mugen87 / https://github.com/Mugen87
 */

class Edge {

	constructor( from = - 1, to = - 1, cost = 0 ) {

		this.from = from;
		this.to = to;
		this.cost = cost;

	}

	copy( source ) {

		this.from = source.from;
		this.to = source.to;
		this.cost = source.cost;

		return this;

	}

	clone() {

		return new this.constructor().copy( this );

	}

}

export { Edge };
