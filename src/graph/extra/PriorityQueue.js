/**
 * Class for representing a binary heap priority queue that enables
 * more efficient sorting of arrays. The implementation is based on
 * {@link https://github.com/mourner/tinyqueue tinyqueue}.
 *
 * @author {@link https://github.com/Mugen87|Mugen87}
 */
class PriorityQueue {

	/**
	* Constructs a new priority queue.
	*
	* @param {Function} compare - The compare function used for sorting.
	*/
	constructor( compare = defaultCompare ) {

		/**
		* The data items of the priority queue.
		* @type {Array<Object>}
		*/
		this.data = new Array();

		/**
		* The length of the priority queue.
		* @type {Number}
		* @default 0
		*/
		this.length = 0;

		/**
		* The compare function used for sorting.
		* @type {Function}
		* @default defaultCompare
		*/
		this.compare = compare;

	}

	/**
	* Pushes an item to the priority queue.
	*
	* @param {Object} item - The item to add.
	*/
	push( item ) {

		this.data.push( item );
		this.length ++;
		this._up( this.length - 1 );

	}

	/**
	* Returns the item with the highest priority and removes
	* it from the priority queue.
	*
	* @return {Object} The item with the highest priority.
	*/
	pop() {

		if ( this.length === 0 ) return null;

		const top = this.data[ 0 ];
		this.length --;

		if ( this.length > 0 ) {

			this.data[ 0 ] = this.data[ this.length ];
			this._down( 0 );

		}

		this.data.pop();

		return top;

	}

	/**
	* Returns the item with the highest priority without removal.
	*
	* @return {Object} The item with the highest priority.
	*/
	peek() {

		return this.data[ 0 ] || null;

	}

	_up( index ) {

		const data = this.data;
		const compare = this.compare;
		const item = data[ index ];

		while ( index > 0 ) {

			const parent = ( index - 1 ) >> 1;
			const current = data[ parent ];
			if ( compare( item, current ) >= 0 ) break;
			data[ index ] = current;
			index = parent;

		}

		data[ index ] = item;

	}

	_down( index ) {

		const data = this.data;
		const compare = this.compare;
		const item = data[ index ];
		const halfLength = this.length >> 1;

		while ( index < halfLength ) {

			let left = ( index << 1 ) + 1;
			let right = left + 1;
			let best = data[ left ];

			if ( right < this.length && compare( data[ right ], best ) < 0 ) {

				left = right;
				best = data[ right ];

			}

			if ( compare( best, item ) >= 0 ) break;

			data[ index ] = best;
			index = left;

		}


		data[ index ] = item;

	}

}

/* istanbul ignore next */

function defaultCompare( a, b ) {

	return ( a < b ) ? - 1 : ( a > b ) ? 1 : 0;

}

export { PriorityQueue };
