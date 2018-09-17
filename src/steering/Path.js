/**
 * @author Mugen87 / https://github.com/Mugen87
 */

class Path {

	constructor() {

		this.loop = false;
		this._waypoints = new Array();
		this._index = 0;

	}

	add( waypoint ) {

		this._waypoints.push( waypoint );

		return this;

	}

	clear() {

		this._waypoints.length = 0;
		this._index = 0;

		return this;

	}

	finished() {

		const lastIndex = this._waypoints.length - 1;

		return ( this.loop === true ) ? false : ( this._index === lastIndex );

	}

	advance() {

		this._index ++;

		if ( ( this._index === this._waypoints.length ) ) {

			if ( this.loop === true ) {

				this._index = 0;

			} else {

				this._index --;

			}

		}

		return this;

	}

	current() {

		return this._waypoints[ this._index ];

	}

}

export { Path };
