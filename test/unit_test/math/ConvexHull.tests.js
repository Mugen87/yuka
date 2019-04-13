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

	describe( '#_computeExtremes()', function () {

		it( 'should compute the extreme values for a given set of vertices', function () {

			const convexHull = new ConvexHull();

			// prepare vertices

			for ( let i = 0, l = points.length; i < l; i ++ ) {

				convexHull._vertices.push( new Vertex( points[ i ] ) );

			}

			// compute extreme values

			const extremes = convexHull._computeExtremes();
			const min = extremes.min;
			const max = extremes.max;

			// verify

			expect( min.x.point ).to.deep.equal( new Vector3( - 9, 1, 11 ) ); // point with minimum x value
			expect( min.y.point ).to.deep.equal( new Vector3( 14, - 14, 2 ) ); // point with minimum y value
			expect( min.z.point ).to.deep.equal( new Vector3( 0, 14, - 8 ) ); // point with minimum z value

			expect( max.x.point ).to.deep.equal( new Vector3( 14, - 14, 2 ) ); // point with maximum x value
			expect( max.y.point ).to.deep.equal( new Vector3( 0, 14, - 8 ) ); // point with maximum y value
			expect( max.z.point ).to.deep.equal( new Vector3( 2, 9, 19 ) ); // point with maximum z value

			expect( convexHull._tolerance ).to.closeTo( 3.1308289294429414e-14, Number.EPSILON );

		} );

	} );

	describe( '#_updateFaces()', function () {

		it( 'should ensure that no deleted or merged faces are part of the convex hull', function () {

			const convexHull = new ConvexHull();

			const face1 = new Face();
			face1.flag = 0; // visible
			const face2 = new Face();
			face2.flag = 1; // deleted
			const face3 = new Face();
			face3.flag = 2; // merged

			convexHull.faces.push( face1, face2, face3 );
			convexHull._updateFaces();

			// verify

			expect( convexHull.faces ).to.include( face1 );
			expect( convexHull.faces ).to.not.include( [ face2, face3 ] );

		} );

	} );

} );

describe( 'Vertex', function () {

	describe( '#constructor()', function () {

		it( 'should create a Vertex with the given values', function () {

			const vertex = new Vertex( new Vector3( 1, 1, 1 ) );

			expect( vertex.point ).to.deep.equal( new Vector3( 1, 1, 1 ) );
			expect( vertex.prev ).to.be.null;
			expect( vertex.next ).to.be.null;
			expect( vertex.face ).to.be.null;

		} );

	} );

} );

describe( 'VertexList', function () {

	describe( '#constructor()', function () {

		it( 'should create a VertexList with the default values', function () {

			const vertexList = new VertexList();

			expect( vertexList.head ).to.be.null;
			expect( vertexList.tail ).to.be.null;

		} );

	} );

	describe( '#first()', function () {

		it( 'should return null if the list is empty', function () {

			const vertexList = new VertexList();

			expect( vertexList.first() ).to.be.null;

		} );

		it( 'should return the head of the list', function () {

			const vertexList = new VertexList();
			const vertex = new Vertex( new Vector3() );

			vertexList.head = vertex;
			expect( vertexList.first() ).to.be.equal( vertex );

		} );

	} );

	describe( '#last()', function () {

		it( 'should return null if the list is empty', function () {

			const vertexList = new VertexList();

			expect( vertexList.last() ).to.be.null;

		} );

		it( 'should return the tail of the list', function () {

			const vertexList = new VertexList();
			const vertex = new Vertex( new Vector3() );

			vertexList.tail = vertex;
			expect( vertexList.last() ).to.be.equal( vertex );

		} );

	} );

	describe( '#clear()', function () {

		it( 'should clear the list', function () {

			const vertexList = new VertexList();
			const vertex = new Vertex( new Vector3() );

			vertexList.head = vertexList.tail = vertex;

			vertexList.clear();

			expect( vertexList.head ).to.be.null;
			expect( vertexList.tail ).to.be.null;

		} );

	} );

	describe( '#append()', function () {

		it( 'should append vertex to the list', function () {

			const vertexList = new VertexList();
			const vertex = new Vertex( new Vector3() );
			const vertexNew = new Vertex( new Vector3( 1, 0, 0 ) );

			vertexList.head = vertexList.tail = vertex;

			vertexList.append( vertexNew );

			expect( vertexNew.prev ).to.be.equal( vertex );
			expect( vertexNew.next ).to.be.null;

			expect( vertex.next ).to.be.equal( vertexNew );

			expect( vertexList.tail ).to.be.equal( vertexNew );

		} );

		it( 'should append vertex to the list, at the beginning if the list is empty', function () {

			const vertexList = new VertexList();
			const vertexNew = new Vertex( new Vector3( 1, 0, 0 ) );

			vertexList.append( vertexNew );

			expect( vertexNew.prev ).to.be.null;
			expect( vertexNew.next ).to.be.null;

			expect( vertexList.head ).to.be.equal( vertexNew );
			expect( vertexList.tail ).to.be.equal( vertexNew );

		} );

	} );

	describe( '#insertBefore()', function () {

		it( 'should insert vertex before target', function () {

			const vertexList = new VertexList();
			const vertex = new Vertex( new Vector3() );
			const vertex1 = new Vertex( 1, 0, 0 );
			const vertexNew = new Vertex( 1, 1, 1 );

			vertexList.append( vertex );
			vertexList.append( vertex1 );

			vertexList.insertBefore( vertex1, vertexNew );
			expect( vertex.next ).to.be.equal( vertexNew );
			expect( vertexNew.prev ).to.be.equal( vertex );
			expect( vertexNew.next ).to.be.equal( vertex1 );
			expect( vertex1.prev ).to.be.equal( vertexNew );

			expect( vertexList.head ).to.be.equal( vertex );
			expect( vertexList.tail ).to.be.equal( vertex1 );


		} );

		it( 'should insert vertex before target (target is head of list)', function () {

			const vertexList = new VertexList();
			const vertex = new Vertex( new Vector3() );
			const vertex1 = new Vertex( 1, 0, 0 );
			const vertexNew = new Vertex( 1, 1, 1 );

			vertexList.append( vertex );
			vertexList.append( vertex1 );

			vertexList.insertBefore( vertex, vertexNew );

			expect( vertexNew.prev ).to.be.null;
			expect( vertexNew.next ).to.be.equal( vertex );
			expect( vertex.prev ).to.be.equal( vertexNew );
			expect( vertex.next ).to.be.equal( vertex1 );
			expect( vertex1.prev ).to.be.equal( vertex );

			expect( vertexList.head ).to.be.equal( vertexNew );
			expect( vertexList.tail ).to.be.equal( vertex1 );


		} );

	} );

	//todo appendChain, remove, removeChain

	describe( '#empty()', function () {

		it( 'should return if the list is empty or not', function () {

			const vertexList = new VertexList();
			const vertex = new Vertex( new Vector3() );

			expect( vertexList.empty() ).to.be.true;

			vertexList.append( vertex );

			expect( vertexList.empty() ).to.be.false;

		} );

	} );

} );
