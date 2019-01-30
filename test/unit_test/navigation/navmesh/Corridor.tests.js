/**
 * @author Mugen87 / https://github.com/Mugen87
 */

const expect = require( 'chai' ).expect;
const YUKA = require( '../../../../build/yuka.js' );

const Corridor = YUKA.Corridor;
const Vector3 = YUKA.Vector3;

//

describe( 'Corridor', function () {

	describe( '#constructor()', function () {

		it( 'should create an object with correct default values', function () {

			const corridor = new Corridor();

			expect( corridor ).to.have.a.property( 'portalEdges' ).that.is.an( 'array' );

		} );

	} );

	describe( '#push()', function () {

		it( 'should use the given points to create a new portal edge and add it to the internal data structure', function () {

			const corridor = new Corridor();
			const left = new Vector3();
			const right = new Vector3( 1, 1, 1 );

			corridor.push( left, right );

			expect( corridor.portalEdges ).to.have.lengthOf( 1 );
			expect( corridor.portalEdges[ 0 ].left ).to.equal( left );
			expect( corridor.portalEdges[ 0 ].right ).to.equal( right );

		} );

	} );

	describe( '#generate()', function () {

		it( 'should generate the shortest path through the portal edges', function () {

			const corridor = new Corridor();

			const from = new Vector3();
			const to = new Vector3( 10, 0, 0 );

			corridor.push( from, from ); // at the beginning and ending, it's important to push the same object as left and right vertex
			corridor.push( new Vector3( 3, 0, - 5 ), new Vector3( 3, 0, - 7 ) );
			corridor.push( new Vector3( 6, 0, 7 ), new Vector3( 6, 0, 5 ) );
			corridor.push( new Vector3( 8, 0, - 10 ), new Vector3( 8, 0, 10 ) );
			corridor.push( to, to );

			const path = corridor.generate();

			expect( path ).to.have.lengthOf( 4 );
			expect( path[ 0 ] ).to.deep.equal( new Vector3() );
			expect( path[ 1 ] ).to.deep.equal( new Vector3( 3, 0, - 5 ) );
			expect( path[ 2 ] ).to.deep.equal( new Vector3( 6, 0, 5 ) );
			expect( path[ 3 ] ).to.deep.equal( new Vector3( 10, 0, 0 ) );

		} );

		it( 'should generate the a path with unique waypoints', function () {

			const corridor = new Corridor();

			const from = new Vector3();
			const to = new Vector3( 10, 0, 0 );

			corridor.push( from, from );
			corridor.push( new Vector3( 3, 0, - 5 ), new Vector3( 3, 0, - 7 ) );
			corridor.push( new Vector3( 3, 0, - 5 ), new Vector3( 3.5, 0, - 7 ) );
			corridor.push( new Vector3( 3, 0, - 5 ), new Vector3( 3.75, 0, - 7 ) );
			corridor.push( new Vector3( 6, 0, 7 ), new Vector3( 6, 0, 5 ) );
			corridor.push( new Vector3( 8, 0, - 10 ), new Vector3( 8, 0, 10 ) );
			corridor.push( to, to );

			const path = corridor.generate();

			expect( path ).to.have.lengthOf( 4 );
			expect( path[ 0 ] ).to.deep.equal( new Vector3() );
			expect( path[ 1 ] ).to.deep.equal( new Vector3( 3, 0, - 5 ) ); // (3, 0, - 5) should be only once in the array of waypoints
			expect( path[ 2 ] ).to.deep.equal( new Vector3( 6, 0, 5 ) );
			expect( path[ 3 ] ).to.deep.equal( new Vector3( 10, 0, 0 ) );

		} );

	} );

} );
