import { Vector3 } from '../math/Vector3.js';

/**
* Class for representing a walkable path.
*
* @author {@link https://github.com/Mugen87|Mugen87}
*/
class Path {

	/**
	* Constructs a new path.
	*/
	constructor() {

		/**
		* Whether this path is looped or not.
		* @type {Boolean}
		*/
		this.loop = false;

		this._waypoints = new Array();
		this._index = 0;

	}

	/**
	* Adds the given waypoint to this path.
	*
	* @param {Vector3} waypoint - The waypoint to add.
	* @return {Path} A reference to this path.
	*/
	add( waypoint ) {

		this._waypoints.push( waypoint );

		return this;

	}

	/**
	* Clears the internal state of this path.
	*
	* @return {Path} A reference to this path.
	*/
	clear() {

		this._waypoints.length = 0;
		this._index = 0;

		return this;

	}

	/**
	* Returns the current active waypoint of this path.
	*
	* @return {Vector3} The current active waypoint.
	*/
	current() {

		return this._waypoints[ this._index ];

	}

	/**
	* Returns true if this path is not looped and the last waypoint is active.
	*
	* @return {Boolean} Whether this path is finished or not.
	*/
	finished() {

		const lastIndex = this._waypoints.length - 1;

		return ( this.loop === true ) ? false : ( this._index === lastIndex );

	}

	/**
	* Makes the next waypoint of this path active. If the path is looped and
	* {@link Path#finished} returns true, the path starts from the beginning.
	*
	* @return {Path} A reference to this path.
	*/
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

	/**
	* Transforms this instance into a JSON object.
	*
	* @return {Object} The JSON object.
	*/
	toJSON() {

		const data = {
			type: this.constructor.name,
			loop: this.loop,
			_waypoints: new Array(),
			_index: this._index
		};

		// waypoints

		const waypoints = this._waypoints;

		for ( let i = 0, l = waypoints.length; i < l; i ++ ) {

			const waypoint = waypoints[ i ];
			data._waypoints.push( waypoint.toArray( new Array() ) );

		}

		return data;

	}

	/**
	* Restores this instance from the given JSON object.
	*
	* @param {Object} json - The JSON object.
	* @return {Path} A reference to this path.
	*/
	fromJSON( json ) {

		this.loop = json.loop;
		this._index = json._index;

		// waypoints

		const waypointsJSON = json._waypoints;

		for ( let i = 0, l = waypointsJSON.length; i < l; i ++ ) {

			const waypointJSON = waypointsJSON[ i ];
			this._waypoints.push( new Vector3().fromArray( waypointJSON ) );

		}

		return this;

	}

}

export { Path };
