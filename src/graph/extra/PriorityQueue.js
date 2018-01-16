/**
 * @author Mugen87 / https://github.com/Mugen87
 *
 * binary heap priority queue (see https://github.com/mourner/tinyqueue)
 */

class PriorityQueue {

	constructor( compare = defaultCompare ) {

		this.data = [];
		this.length = 0;
		this.compare = compare;

	}

	push( entry ) {

		this.data.push( entry );
		this.length ++;
		this._up( this.length - 1 );

	}

	pop() {

		if ( this.length === 0 ) return undefined;

		const top = this.data[ 0 ];
		this.length --;

		if ( this.length > 0 ) {

			this.data[ 0 ] = this.data[ this.length ];
			this._down( 0 );

		}

		this.data.pop();

		return top;

	}

	peek() {

		return this.data[ 0 ];

	}

	_up( index ) {

		const data = this.data;
		const compare = this.compare;
		const entry = data[ index ];

		while ( index > 0 ) {

			const parent = ( index - 1 ) >> 1;
			const current = data[ parent ];
			if ( compare( entry, current ) >= 0 ) break;
			data[ index ] = current;
			index = parent;

		}

		data[ index ] = entry;

	}

	_down( index ) {

		const data = this.data;
		const compare = this.compare;
		const entry = data[ index ];
		const halfLength = this.length >> 1;

		while ( index < halfLength ) {

			let left = ( index << 1 ) + 1;
			let right = left + 1;
			let best = data[ left ];

			if ( right < this.length && compare( data[ right ], best ) < 0 ) {

				left = right;
				best = data[ right ];

			}

			if ( compare( best, entry ) >= 0 ) break;

			data[ index ] = best;
			index = left;

		}


		data[ index ] = entry;

	}

}

function defaultCompare( a, b ) {

	return ( a < b ) ? - 1 : ( a > b ) ? 1 : 0;

}

export { PriorityQueue };
