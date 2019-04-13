/**
 * @author Mugen87 / https://github.com/Mugen87
 * @author robp94 / https://github.com/robp94
 */

const expect = require( 'chai' ).expect;
const YUKA = require( '../../../build/yuka.js' );

const ConvexHull = YUKA.ConvexHull;
const Face = YUKA.CHFace;
const Vertex = YUKA.CHVertex;
const VertexList = YUKA.CHVertexList;
const Vector3 = YUKA.Vector3;

const points = [
	new Vector3( 1, 1, 1 ),
	new Vector3( 4, - 1, 4 ),
	new Vector3( 3, 6, - 3 ),
	new Vector3( - 7, - 5, 0 ),
	new Vector3( 2, 9, 19 ),
	new Vector3( 7, 4, 8 ),
	new Vector3( 14, - 14, 2 ),
	new Vector3( - 9, 1, 11 ),
	new Vector3( 0, 14, - 8 )
];

describe( 'ConvexHull', function () {

	describe( '#constructor()', function () {

		it( 'should create an object with correct default values', function () {

			const convexHull = new ConvexHull();
			expect( convexHull.faces ).to.be.of.an( 'array' );
			expect( convexHull._tolerance ).to.equal( - 1 );
			expect( convexHull._vertices ).to.be.of.an( 'array' );
			expect( convexHull._assigned ).to.be.an.instanceof( VertexList );
			expect( convexHull._unassigned ).to.be.an.instanceof( VertexList );
			expect( convexHull._newFaces ).to.be.of.an( 'array' );

		} );

	} );

	describe( '#fromPoints()', function () {

		it( 'should compute a convex hull that encloses the given set of points', function () {

			const convexHull = new ConvexHull().fromPoints( points );

			expect( convexHull.faces ).to.have.lengthOf( 8 );

		} );

	} );

	describe( '#_reset()', function () {

		it( 'should reset the internal properties to their default values', function () {

			const convexHull = new ConvexHull();

			convexHull._tolerance = Number.EPSILON;
			convexHull._vertices.push( new Vertex() );
			convexHull._assigned.append( new Vertex() );
			convexHull._unassigned.append( new Vertex() );
			convexHull._newFaces.push( new Face() );

			convexHull._reset();

			expect( convexHull._tolerance ).to.equal( - 1 );
			expect( convexHull._vertices ).to.have.lengthOf( 0 );
			expect( convexHull._assigned.head ).to.be.null;
			expect( convexHull._assigned.tail ).to.be.null;
			expect( convexHull._unassigned.head ).to.be.null;
			expect( convexHull._unassigned.tail ).to.be.null;
			expect( convexHull._newFaces ).to.have.lengthOf( 0 );

		} );

	} );

} );
