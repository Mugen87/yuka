/**
 * @author Mugen87 / https://github.com/Mugen87
 */

const expect = require( 'chai' ).expect;
const YUKA = require( '../../../../build/yuka.js' );

const PriorityQueue = YUKA.PriorityQueue;

describe( 'PriorityQueue', function () {

	describe( '#constructor()', function () {

		it( 'should create an object with correct default values', function () {

			const priorityQueue = new PriorityQueue();
			expect( priorityQueue ).to.have.a.property( 'data' ).that.is.an( 'array' ).and.empty;
			expect( priorityQueue ).to.have.a.property( 'length' ).that.is.equal( 0 );
			expect( priorityQueue ).to.have.a.property( 'compare' ).that.is.a( 'function' );

		} );

		it( 'should apply the parameters to the new object', function () {

			const priorityQueue = new PriorityQueue( compare );
			expect( priorityQueue.compare ).to.equal( compare );

		} );

	} );

	describe( '#push()', function () {

		it( 'should push items to the priority queue', function () {

			const priorityQueue = new PriorityQueue( compare );
			const item1 = { cost: 0, index: 0 };
			const item2 = { cost: 1, index: 1 };
			const item3 = { cost: 2, index: 2 };

			priorityQueue.push( item1 );
			priorityQueue.push( item2 );
			priorityQueue.push( item3 );

			expect( priorityQueue.data.indexOf( item1 ) ).to.not.equal( - 1 );
			expect( priorityQueue.data.indexOf( item2 ) ).to.not.equal( - 1 );
			expect( priorityQueue.data.indexOf( item3 ) ).to.not.equal( - 1 );
			expect( priorityQueue.length ).to.equal( 3 );

		} );

	} );

	describe( '#pop()', function () {

		it( 'should return the item with the highest priority and remove it from the priority queue', function () {

			const priorityQueue = new PriorityQueue( compare );
			const item1 = { cost: 3, index: 0 };
			const item2 = { cost: 7, index: 1 };
			const item3 = { cost: 5, index: 2 };
			const item4 = { cost: 1, index: 2 };
			const item5 = { cost: 2, index: 2 };
			const item6 = { cost: 6, index: 2 };

			priorityQueue.push( item1 );
			priorityQueue.push( item2 );
			priorityQueue.push( item3 );
			priorityQueue.push( item4 );
			priorityQueue.push( item5 );
			priorityQueue.push( item6 );

			expect( priorityQueue.pop() ).to.equal( item4 );
			expect( priorityQueue.pop() ).to.equal( item5 );
			expect( priorityQueue.pop() ).to.equal( item1 );
			expect( priorityQueue.pop() ).to.equal( item3 );
			expect( priorityQueue.pop() ).to.equal( item6 );
			expect( priorityQueue.pop() ).to.equal( item2 );
			expect( priorityQueue.length ).to.equal( 0 );

		} );

		it( 'should return null if the priority queue is empty', function () {

			const priorityQueue = new PriorityQueue();

			expect( priorityQueue.pop() ).to.be.null;

		} );

	} );

	describe( '#peek()', function () {

		it( 'should return the first item in the priority queue without removal', function () {

			const priorityQueue = new PriorityQueue();
			const item = { cost: 1, index: 0 };

			priorityQueue.push( item );

			expect( priorityQueue.peek() ).to.equal( item );

		} );

		it( 'should return null if the priority queue is empty', function () {

			const priorityQueue = new PriorityQueue();

			expect( priorityQueue.peek() ).to.be.null;

		} );

	} );

} );

//

function compare( a, b ) {

	return ( a.cost < b.cost ) ? - 1 : ( a.cost > b.cost ) ? 1 : 0;

}
