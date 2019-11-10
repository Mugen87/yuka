/**
 * @author Mugen87 / https://github.com/Mugen87
 * @author robp94 / https://github.com/robp94
 */

const expect = require( 'chai' ).expect;
const should = require( 'chai' ).should();
const YUKA = require( '../../../build/yuka.js' );

const ConvexHull = YUKA.ConvexHull;
const HalfEdge = YUKA.HalfEdge;
const Face = YUKA.CHFace;
const Vertex = YUKA.CHVertex;
const VertexList = YUKA.CHVertexList;
const Plane = YUKA.Plane;
const Matrix4 = YUKA.Matrix4;
const Vector3 = YUKA.Vector3;
const AABB = YUKA.AABB;

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
			expect( convexHull.mergeFaces ).to.equal( true );
			expect( convexHull._tolerance ).to.equal( - 1 );
			expect( convexHull._vertices ).to.be.of.an( 'array' );
			expect( convexHull._assigned ).to.be.an.instanceof( VertexList );
			expect( convexHull._unassigned ).to.be.an.instanceof( VertexList );

		} );

	} );

	describe( '#fromPoints()', function () {

		it( 'should compute a convex hull that encloses the given set of points', function () {

			const convexHull = new ConvexHull().fromPoints( points );

			expect( convexHull.faces ).to.have.lengthOf( 8 );

		} );

		it( 'should print a warning if less than four points are provided', function () {

			YUKA.Logger.setLevel( YUKA.Logger.LEVEL.SILENT );

			new ConvexHull().fromPoints( [] );
			new ConvexHull().fromPoints( [ new Vector3() ] );
			new ConvexHull().fromPoints( [ new Vector3(), new Vector3() ] );
			new ConvexHull().fromPoints( [ new Vector3(), new Vector3(), new Vector3() ] );

		} );

	} );

	describe( '#containsPoint()', function () {

		const convexHull = new ConvexHull().fromPoints( points );

		it( 'should return true if a point is inside the convex hull', function () {

			const point = new Vector3();

			expect( convexHull.containsPoint( point ) ).to.be.true;

		} );

		it( 'should return true if a point is exactly on the convex hull', function () {

			const point1 = new Vector3( 0, 14, - 8 ); // vertex of a face
			const point2 = new Vector3( 7, 0, - 3 ); // point on a face edge
			const point3 = new Vector3( 7, 2, 2.5 ); // point on face (center)

			expect( convexHull.containsPoint( point1 ) ).to.be.true;
			expect( convexHull.containsPoint( point2 ) ).to.be.true;
			expect( convexHull.containsPoint( point3 ) ).to.be.true;

		} );

		it( 'should return false if a point is outside the convex hull', function () {

			const point = new Vector3( 14, - 15, 2 );

			expect( convexHull.containsPoint( point ) ).to.be.false;

		} );

	} );

	describe( '#intersectsAABB()', function () {

		const convexHull = new ConvexHull().fromPoints( points );

		it( 'should return true if this convex hull does intersect with the AABB', function () {

			const aabb = new AABB().fromCenterAndSize( new Vector3( 0, 0, 0 ), new Vector3( 2, 2, 2 ) );

			expect( convexHull.intersectsAABB( aabb ) ).to.be.true;

		} );

		it( 'should update the internal polyhedron if the AABB changes', function () {

			const aabb = new AABB().fromCenterAndSize( new Vector3( 0, 0, 0 ), new Vector3( 2, 2, 2 ) );
			const matrix = new Matrix4().setPosition( new Vector3( 0, 20, 0 ) );

			expect( convexHull.intersectsAABB( aabb ) ).to.be.true;

			aabb.applyMatrix4( matrix );

			expect( convexHull.intersectsAABB( aabb ) ).to.be.false;

		} );

	} );

	describe( '#intersectsConvexHull()', function () {

		const convexHull = new ConvexHull().fromPoints( points );

		it( 'should return true if this convex hull does intersect with the given one', function () {

			const points2 = [
				new Vector3( 7, 7, 7 ),
				new Vector3( 7, 7, 5 ),
				new Vector3( 7, 5, 7 ),
				new Vector3( 7, 5, 5 ),
				new Vector3( 5, 7, 7 ),
				new Vector3( 5, 7, 5 ),
				new Vector3( 5, 5, 7 ),
				new Vector3( 5, 5, 5 )
			];

			const convexHull2 = new ConvexHull().fromPoints( points2 );

			expect( convexHull.intersectsConvexHull( convexHull2 ) ).to.be.true;

		} );

		it( 'should return false if this convex hull does not intersect with the given one', function () {

			const points2 = [
				new Vector3( 10, 10, 10 ),
				new Vector3( 10, 10, 8 ),
				new Vector3( 10, 8, 10 ),
				new Vector3( 10, 8, 8 ),
				new Vector3( 8, 10, 10 ),
				new Vector3( 8, 10, 8 ),
				new Vector3( 8, 8, 10 ),
				new Vector3( 8, 8, 8 )
			];

			const convexHull2 = new ConvexHull().fromPoints( points2 );

			expect( convexHull.intersectsConvexHull( convexHull2 ) ).to.be.false;

		} );

	} );

	describe( '#_reset()', function () {

		it( 'should reset the internal properties to their default values', function () {

			const convexHull = new ConvexHull();

			convexHull._vertices.push( new Vertex() );
			convexHull._assigned.append( new Vertex() );
			convexHull._unassigned.append( new Vertex() );

			convexHull._reset();

			expect( convexHull._vertices ).to.have.lengthOf( 0 );
			expect( convexHull._assigned.head ).to.be.null;
			expect( convexHull._assigned.tail ).to.be.null;
			expect( convexHull._unassigned.head ).to.be.null;
			expect( convexHull._unassigned.tail ).to.be.null;

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

	describe( '#_computeInitialHull()', function () {

		it( 'should compute the initial convex hull (the first major step of the algorithm)', function () {

			const convexHull = new ConvexHull();

			// prepare vertices

			for ( let i = 0, l = points.length; i < l; i ++ ) {

				convexHull._vertices.push( new Vertex( points[ i ] ) );

			}

			// compute initial hull

			convexHull._computeInitialHull();


			// verify

			expect( convexHull.faces ).to.have.lengthOf( 4 ); // initial tetrahedron

			const face1 = convexHull.faces[ 0 ];
			const face2 = convexHull.faces[ 1 ];
			const face3 = convexHull.faces[ 2 ];
			const face4 = convexHull.faces[ 3 ];

			expect( face1.edge.vertex ).to.deep.equal( new Vector3( 14, - 14, 2 ) );
			expect( face2.edge.vertex ).to.deep.equal( new Vector3( - 7, - 5, 0 ) );
			expect( face3.edge.vertex ).to.deep.equal( new Vector3( - 7, - 5, 0 ) );
			expect( face4.edge.vertex ).to.deep.equal( new Vector3( - 7, - 5, 0 ) );

			// two points are still no part of the hull

			expect( convexHull._assigned.first().face ).to.equal( face1 );
			expect( convexHull._assigned.first().point ).to.deep.equal( new Vector3( 7, 4, 8 ) );

			expect( convexHull._assigned.last().face ).to.equal( face3 );
			expect( convexHull._assigned.last().point ).to.deep.equal( new Vector3( - 9, 1, 11 ) );

		} );

		it( 'should compute the initial convex hull if the fourth point is on the different of the tetrahedron its ground plane', function () {

			const convexHull = new ConvexHull();

			const points = [
				new Vector3( 1, 1, 1 ),
				new Vector3( 4, - 1, 4 ),
				new Vector3( 3, 6, - 3 ),
				new Vector3( - 7, - 20, 0 ), // y-component changed
				new Vector3( 2, 9, 19 ),
				new Vector3( 7, 4, 8 ),
				new Vector3( 14, - 14, 2 ),
				new Vector3( - 9, 1, 11 ),
				new Vector3( 0, 14, - 8 )
			];

			// prepare vertices

			for ( let i = 0, l = points.length; i < l; i ++ ) {

				convexHull._vertices.push( new Vertex( points[ i ] ) );

			}

			// compute initial hull

			convexHull._computeInitialHull();


			// verify

			expect( convexHull.faces ).to.have.lengthOf( 4 ); // initial tetrahedron

			const face1 = convexHull.faces[ 0 ];
			const face2 = convexHull.faces[ 1 ];
			const face3 = convexHull.faces[ 2 ];
			const face4 = convexHull.faces[ 3 ];

			expect( face1.edge.vertex ).to.deep.equal( new Vector3( - 7, - 20, 0 ) );
			expect( face2.edge.vertex ).to.deep.equal( new Vector3( 14, - 14, 2 ) );
			expect( face3.edge.vertex ).to.deep.equal( new Vector3( 14, - 14, 2 ) );
			expect( face4.edge.vertex ).to.deep.equal( new Vector3( 14, - 14, 2 ) );

			// two points are still no part of the hull

			expect( convexHull._assigned.first().face ).to.equal( face3 );
			expect( convexHull._assigned.first().point ).to.deep.equal( new Vector3( 7, 4, 8 ) );

			expect( convexHull._assigned.last().face ).to.equal( face1 );
			expect( convexHull._assigned.last().point ).to.deep.equal( new Vector3( - 9, 1, 11 ) );

		} );

		it( 'should use the correct extreme points in all three dimensions', function () {

			const convexHull = new ConvexHull();

			const points = [
				new Vector3( 1, 2, 25 ),
				new Vector3( 9, 1, 4 ),
				new Vector3( 3, 6, - 3 ),
				new Vector3( - 7, - 4, - 20 )
			];

			// prepare vertices

			for ( let i = 0, l = points.length; i < l; i ++ ) {

				convexHull._vertices.push( new Vertex( points[ i ] ) );

			}

			// compute initial hull

			convexHull._computeInitialHull();

			// verify

			expect( convexHull.faces[ 0 ].edge.vertex ).to.deep.equal( new Vector3( - 7, - 4, - 20 ) );
			expect( convexHull.faces[ 1 ].edge.vertex ).to.deep.equal( new Vector3( 3, 6, - 3 ) );
			expect( convexHull.faces[ 2 ].edge.vertex ).to.deep.equal( new Vector3( 3, 6, - 3 ) );
			expect( convexHull.faces[ 3 ].edge.vertex ).to.deep.equal( new Vector3( 3, 6, - 3 ) );

		} );

		it( 'should throw an exception if all extreme points lie in a single plane', function () {

			const convexHull = new ConvexHull();

			const points = [
				new Vector3( 1, 1, 0 ),
				new Vector3( 1, 1, 0 ),
				new Vector3( 1, - 1, 0 ),
				new Vector3( 1, - 1, 0 ),
				new Vector3( - 1, 1, 0 ),
				new Vector3( - 1, 1, 0 ),
				new Vector3( - 1, - 1, 0 ),
				new Vector3( - 1, - 1, 0 )
			];

			// prepare vertices

			for ( let i = 0, l = points.length; i < l; i ++ ) {

				convexHull._vertices.push( new Vertex( points[ i ] ) );

			}

			// compute initial hull

			should.throw( () => convexHull._computeInitialHull() );

		} );

	} );

	describe( '#_computeHorizon()', function () {

		it( 'should compute the horizon from the given parameters', function () {

			const convexHull = new ConvexHull();

			// prepare vertices

			for ( let i = 0, l = points.length; i < l; i ++ ) {

				convexHull._vertices.push( new Vertex( points[ i ] ) );

			}

			// compute initial hull

			convexHull._computeInitialHull();

			// compute the horizon for the first vertex addition

			const vertex = convexHull._nextVertexToAdd();
			const face = vertex.face;
			const horizon = [];

			convexHull._computeHorizon( vertex.point, null, face, horizon );

			// verify

			expect( horizon ).to.have.lengthOf( 3 );

			const halfEdge1 = horizon[ 0 ];
			const halfEdge2 = horizon[ 1 ];
			const halfEdge3 = horizon[ 2 ];

			expect( halfEdge1.vertex ).to.deep.equal( new Vector3( 14, - 14, 2 ) );
			expect( halfEdge2.vertex ).to.deep.equal( new Vector3( 0, 14, - 8 ) );
			expect( halfEdge3.vertex ).to.deep.equal( new Vector3( 2, 9, 19 ) );

			expect( face.active ).to.be.false;
			expect( face.outside ).to.be.null;

			expect( convexHull._unassigned.first() ).to.equal( vertex );

		} );

		it( 'should only use active faces to build the horizon', function () {

			const convexHull = new ConvexHull();

			// prepare vertices

			for ( let i = 0, l = points.length; i < l; i ++ ) {

				convexHull._vertices.push( new Vertex( points[ i ] ) );

			}

			// compute initial hull

			convexHull._computeInitialHull();

			// compute the horizon for the first vertex addition

			const vertex = convexHull._nextVertexToAdd();
			const face = vertex.face;
			const horizon = [];

			face.edge.twin.polygon.active = false;

			convexHull._computeHorizon( vertex.point, null, face, horizon );

			// verify

			expect( horizon ).to.have.lengthOf( 2 );

		} );

	} );

	describe( '#_updateFaces()', function () {

		it( 'should ensure that no deleted or merged faces are part of the convex hull', function () {

			const convexHull = new ConvexHull();

			const face1 = new Face();
			const face2 = new Face();
			face2.active = false;

			convexHull.faces.push( face1, face2 );
			convexHull._updateFaces();

			// verify

			expect( convexHull.faces ).to.include( face1 );
			expect( convexHull.faces ).to.not.include( face2 );

		} );

	} );

	describe( '#_addVertexToFace()', function () {

		it( 'should add a vertex to the given face', function () {

			const convexHull = new ConvexHull();

			const face = new Face();
			const vertex = new Vertex();

			convexHull._addVertexToFace( vertex, face );

			expect( vertex.face ).to.equal( face );
			expect( face.outside ).to.equal( vertex );
			expect( convexHull._assigned.first() ).to.equal( vertex );

		} );

		it( 'should ensure that the outside property of face always points to the first added vertex', function () {

			const convexHull = new ConvexHull();

			const face = new Face();
			const vertex1 = new Vertex();
			const vertex2 = new Vertex();

			convexHull._addVertexToFace( vertex1, face );
			convexHull._addVertexToFace( vertex2, face );

			expect( vertex1.face ).to.equal( face );
			expect( face.outside ).to.equal( vertex1 );

		} );

		it( 'should ensure that the last added vertex is always the last in the vertex section of the assigned vertex list', function () {

			const convexHull = new ConvexHull();

			const face = new Face();
			const vertex1 = new Vertex();
			const vertex2 = new Vertex();

			convexHull._addVertexToFace( vertex1, face );
			convexHull._addVertexToFace( vertex2, face );

			expect( vertex1.prev ).to.be.null;
			expect( vertex1.next ).to.equal( vertex2 );
			expect( vertex2.prev ).to.equal( vertex1 );
			expect( vertex2.next ).to.be.null;

			// use first() and last() since we have only a single face

			expect( convexHull._assigned.first() ).to.equal( vertex1 );
			expect( convexHull._assigned.last() ).to.equal( vertex2 );

		} );

	} );

	describe( '#_nextVertexToAdd()', function () {

		it( 'should pick the first face from the assigned list and return the farthest vertex that face can see', function () {

			const convexHull = new ConvexHull();

			const face = new Face(
				new Vector3( 0, 0, 0 ),
				new Vector3( 0, 0, 1 ),
				new Vector3( 1, 0, 1 )
			); // CCW order

			const vertex1 = new Vertex( new Vector3( 0, 1, 0 ) );
			const vertex2 = new Vertex( new Vector3( 0, 2, 0 ) );
			const vertex3 = new Vertex( new Vector3( 0, 1.5, 0 ) );
			const vertex4 = new Vertex( new Vector3( 0, 3, 0 ) );

			convexHull._addVertexToFace( vertex1, face );
			convexHull._addVertexToFace( vertex2, face );
			convexHull._addVertexToFace( vertex3, face );
			convexHull._addVertexToFace( vertex4, new Face() ); // assign different face

			const vertex = convexHull._nextVertexToAdd();

			expect( vertex ).to.equal( vertex2 );

		} );

		it( 'should return null if all vertices lie behind the face', function () {

			const convexHull = new ConvexHull();

			const face = new Face(
				new Vector3( 0, 0, 0 ),
				new Vector3( 0, 0, 1 ),
				new Vector3( 1, 0, 1 )
			); // CCW order

			const vertex1 = new Vertex( new Vector3( 0, - 1, 0 ) );
			const vertex2 = new Vertex( new Vector3( 0, - 2, 0 ) );

			convexHull._addVertexToFace( vertex1, face );
			convexHull._addVertexToFace( vertex2, face );

			const vertex = convexHull._nextVertexToAdd();

			expect( vertex ).to.be.null;

		} );

		it( 'should return null if the assigned list is empty', function () {

			const convexHull = new ConvexHull();
			const vertex = convexHull._nextVertexToAdd();
			expect( vertex ).to.be.null;

		} );

	} );

	describe( '#_resolveUnassignedPoints()', function () {

		it( 'should try to assign all unassigned points to a newly created face farthest away', function () {

			const convexHull = new ConvexHull();

			const face1 = new Face(
				new Vector3( 0, 0, 0 ),
				new Vector3( 0, 0, 1 ),
				new Vector3( 1, 0, 1 )
			);

			const face2 = new Face(
				new Vector3( 0, 0, 2 ),
				new Vector3( 0, 1, 2 ),
				new Vector3( 1, 1, 2 )
			);

			const newFaces = [ face1, face2 ];

			const vertex = new Vertex( new Vector3( 0, 2, 0 ) );
			convexHull._unassigned.append( vertex );

			convexHull._resolveUnassignedPoints( newFaces );

			expect( vertex.face ).to.equal( face1 );
			expect( face1.outside ).to.equal( vertex );
			expect( face2.outside ).to.be.null;

		} );

		it( 'should only assign vertices to visible faces', function () {

			const convexHull = new ConvexHull();

			const face = new Face(
				new Vector3( 0, 0, 0 ),
				new Vector3( 0, 0, 1 ),
				new Vector3( 1, 0, 1 )
			);
			face.active = false;

			const newFaces = [ face ];

			const vertex = new Vertex( new Vector3( 0, 2, 0 ) );
			convexHull._unassigned.append( vertex );

			convexHull._resolveUnassignedPoints( newFaces );

			expect( vertex.face ).to.be.null;
			expect( face.outside ).to.be.null;

		} );

		it( 'should do thing if the unassigned list is empty', function () {

			const convexHull = new ConvexHull();

			const face = new Face(
				new Vector3( 0, 0, 0 ),
				new Vector3( 0, 0, 1 ),
				new Vector3( 1, 0, 1 )
			);
			face.active = false;

			const newFaces = [ face ];

			convexHull._resolveUnassignedPoints( newFaces );

			expect( face.outside ).to.be.null;

		} );

	} );

	describe( '#_removeVertexFromFace()', function () {

		it( 'should remove a vertex from the given face', function () {

			const convexHull = new ConvexHull();

			const face = new Face();
			const vertex1 = new Vertex();
			const vertex2 = new Vertex();

			convexHull._addVertexToFace( vertex1, face );
			convexHull._addVertexToFace( vertex2, face );
			convexHull._removeVertexFromFace( vertex2, face );
			convexHull._removeVertexFromFace( vertex1, face );

			expect( vertex1.face ).to.be.null;
			expect( vertex2.face ).to.be.null;
			expect( face.outside ).to.be.null;
			expect( convexHull._assigned.empty() ).to.be.true;

		} );

		it( 'should set the outside reference of the face to the next visible vertex', function () {

			const convexHull = new ConvexHull();

			const face = new Face();
			const vertex1 = new Vertex();
			const vertex2 = new Vertex();

			convexHull._addVertexToFace( vertex1, face );
			convexHull._addVertexToFace( vertex2, face );

			expect( face.outside ).to.equal( vertex1 );
			expect( convexHull._assigned.first() ).to.equal( vertex1 );
			expect( convexHull._assigned.last() ).to.equal( vertex2 );

			convexHull._removeVertexFromFace( vertex1, face );

			expect( vertex1.face ).to.be.null;
			expect( face.outside ).to.equal( vertex2 );
			expect( convexHull._assigned.first() ).to.equal( vertex2 );
			expect( convexHull._assigned.last() ).to.equal( vertex2 );

		} );

	} );

	describe( '#_removeAllVerticesFromFace()', function () {

		it( 'should remove a all vertices from the given face', function () {

			const convexHull = new ConvexHull();

			const face = new Face();
			const vertex1 = new Vertex();
			const vertex2 = new Vertex();

			convexHull._addVertexToFace( vertex1, face );
			convexHull._addVertexToFace( vertex2, face );

			convexHull._removeAllVerticesFromFace( face );

			expect( vertex1.face ).to.be.null;
			expect( vertex2.face ).to.be.null;
			expect( face.outside ).to.be.null;

			expect( convexHull._assigned.empty() ).to.be.true;

		} );

		it( 'should do nothing if the face has no vertices', function () {

			const convexHull = new ConvexHull();

			const face = new Face();
			convexHull._removeAllVerticesFromFace( face );
			expect( face.outside ).to.be.null;

		} );

	} );

	describe( '#_addAdjoiningFace()', function () {

		it( 'should add a face connecting the given point with the given half edge', function () {

			const convexHull = new ConvexHull();

			const vertex = new Vertex( new Vector3( 0, 0, 0 ) );

			const halfEdge1 = new HalfEdge( new Vector3( 0, 0, 1 ) );
			const halfEdge2 = new HalfEdge( new Vector3( 1, 0, 1 ) );
			const halfEdge3 = new HalfEdge( new Vector3( 1, 0, 1 ) );
			halfEdge1.prev = halfEdge2;
			halfEdge1.twin = halfEdge3;

			convexHull._addAdjoiningFace( vertex, halfEdge1 );

			expect( convexHull.faces ).to.have.lengthOf( 1 );

			const face = convexHull.faces[ 0 ];

			// check if the face is correctly linked to the existing half edge of the twin's face

			expect( face.getEdge( - 1 ).twin ).to.equal( halfEdge3 );

		} );

	} );

	describe( '#_addNewFaces()', function () {

		it( 'should add new faces to the convex hull enclosing the given vertex along the horizon', function () {

			const convexHull = new ConvexHull();

			const vertex = new Vertex( new Vector3( 7, 4, 8 ) );

			const halfEdge1 = new HalfEdge( new Vector3( 0, 14, - 8 ) );
			const halfEdge2 = new HalfEdge( new Vector3( 2, 9, 19 ) );
			const halfEdge3 = new HalfEdge( new Vector3( 14, - 14, 2 ) );

			halfEdge1.prev = new HalfEdge( new Vector3( 14, - 14, 2 ) );
			halfEdge2.prev = new HalfEdge( new Vector3( 0, 14, - 8 ) );
			halfEdge3.prev = new HalfEdge( new Vector3( 2, 9, 19 ) );

			halfEdge1.twin = new HalfEdge();
			halfEdge2.twin = new HalfEdge();
			halfEdge3.twin = new HalfEdge();

			const horizon = [ halfEdge1, halfEdge2, halfEdge3 ];

			convexHull._addNewFaces( vertex, horizon );

			expect( convexHull.faces ).to.have.lengthOf( 3 );

			const face1 = convexHull.faces[ 0 ];
			const face2 = convexHull.faces[ 1 ];
			const face3 = convexHull.faces[ 2 ];

			// check if the side edges are correctly linked

			expect( face1.edge.twin ).to.equal( face2.edge.next );
			expect( face1.edge.next.twin ).to.equal( face3.edge );
			expect( face2.edge.twin ).to.equal( face3.edge.next );
			expect( face2.edge.next.twin ).to.equal( face1.edge );
			expect( face3.edge.twin ).to.equal( face1.edge.next );
			expect( face3.edge.next.twin ).to.equal( face2.edge );

		} );

	} );

	describe( '#_postprocessHull()', function () {

		it( 'should merge faces if the resulting ones are still convex and coplanar, ', function () {

			const points = [
				new Vector3( 1, 1, 1 ),
				new Vector3( 1, 1, - 1 ),
				new Vector3( 1, - 1, 1 ),
				new Vector3( 1, - 1, - 1 ),
				new Vector3( - 1, 1, 1 ),
				new Vector3( - 1, 1, - 1 ),
				new Vector3( - 1, - 1, 1 ),
				new Vector3( - 1, - 1, - 1 )
			];

			const convexHull = new ConvexHull().fromPoints( points );

			expect( convexHull.faces ).to.have.lengthOf( 6 );

		} );

		it( 'should not merge faces if the respective flag is set to false, ', function () {

			const points = [
				new Vector3( 1, 1, 1 ),
				new Vector3( 1, 1, - 1 ),
				new Vector3( 1, - 1, 1 ),
				new Vector3( 1, - 1, - 1 ),
				new Vector3( - 1, 1, 1 ),
				new Vector3( - 1, 1, - 1 ),
				new Vector3( - 1, - 1, 1 ),
				new Vector3( - 1, - 1, - 1 )
			];

			const convexHull = new ConvexHull();
			convexHull.mergeFaces = false;
			convexHull.fromPoints( points );

			expect( convexHull.faces ).to.have.lengthOf( 12 );

		} );

	} );

	describe( '#_mergePossible()', function () {

		const convexHull = new ConvexHull();

		const points3 = [
			new Vector3( 0, 0, 0 ),
			new Vector3( 1, 0, 0 ),
			new Vector3( 1, 0, - 1 ),
			new Vector3( 0, 0, - 1 ),
		];

		const points4 = [
			new Vector3( 1, 0, 0 ),
			new Vector3( 0, 0, 0 ),
			new Vector3( 0.5, 0, 1 )
		];

		const p1 = new YUKA.Polygon().fromContour( points3 );
		const p2 = new YUKA.Polygon().fromContour( points4 );

		// in a convex hull, all half edges have twins (there are no border edges)

		let e = p1.edge;

		do {

			e.twin = new HalfEdge();
			e = e.next;

		} while ( e !== p1.edge );

		e = p2.edge;

		do {

			e.twin = new HalfEdge();
			e = e.next;

		} while ( e !== p2.edge );

		// set real twins (a single connection between two convex regions)

		p1.edge.next.linkOpponent( p2.edge.next );

		it( 'should return true if two convex regions can be merged along the given half edge', function () {

			// set real twins

			expect( convexHull._mergePossible( p1.edge.next ) ).to.be.true;

		} );

		it( 'should return false if two convex regions share more than two twins', function () {

			// add an additional connection

			p1.edge.linkOpponent( p2.edge.prev );

			expect( convexHull._mergePossible( p1.edge.next ) ).to.be.false;

		} );

	} );

} );

describe( 'Face', function () {

	describe( '#constructor()', function () {

		it( 'should create a Face with the given values', function () {

			const face = new Face( new Vector3( 1, 0, 0 ), new Vector3( 1, 0, 1 ), new Vector3( 0, 0, 0 ) );

			// default values

			expect( face.outside ).to.be.null;
			expect( face.active ).to.be.true;

			// create from contour and compute centroid

			expect( face.centroid ).to.not.be.equal( new Vector3() );
			expect( face.edge ).to.be.not.null;
			expect( face.plane ).to.be.not.equal( new Plane() );

		} );

	} );

	describe( '#getEdge()', function () {

		it( 'should return the edge at position i', function () {

			const face = new Face( new Vector3( 1, 0, 0 ), new Vector3( 1, 0, 1 ), new Vector3( 0, 0, 0 ) );

			const edge = face.getEdge( 1 );
			expect( edge ).to.be.equal( face.edge.next );

		} );

		it( 'should return the edge at position -i', function () {

			const face = new Face( new Vector3( 1, 0, 0 ), new Vector3( 1, 0, 1 ), new Vector3( 0, 0, 0 ) );

			const edge = face.getEdge( - 1 );
			expect( edge ).to.be.equal( face.edge.prev );

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
			const vertex = new Vertex();

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
			const vertex = new Vertex();

			vertexList.tail = vertex;
			expect( vertexList.last() ).to.be.equal( vertex );

		} );

	} );

	describe( '#clear()', function () {

		it( 'should clear the list', function () {

			const vertexList = new VertexList();
			const vertex = new Vertex();

			vertexList.head = vertexList.tail = vertex;

			vertexList.clear();

			expect( vertexList.head ).to.be.null;
			expect( vertexList.tail ).to.be.null;

		} );

	} );

	describe( '#append()', function () {

		it( 'should append a vertex to the list', function () {

			const vertexList = new VertexList();
			const vertex = new Vertex();
			const vertexNew = new Vertex();

			vertexList.head = vertexList.tail = vertex;

			vertexList.append( vertexNew );

			expect( vertexNew.prev ).to.be.equal( vertex );
			expect( vertexNew.next ).to.be.null;

			expect( vertex.prev ).to.be.null;
			expect( vertex.next ).to.be.equal( vertexNew );

			expect( vertexList.head ).to.be.equal( vertex );
			expect( vertexList.tail ).to.be.equal( vertexNew );

		} );

		it( 'should ensure the first vertex of the list is the head and tail', function () {

			const vertexList = new VertexList();
			const vertexNew = new Vertex();

			vertexList.append( vertexNew );

			expect( vertexNew.prev ).to.be.null;
			expect( vertexNew.next ).to.be.null;

			expect( vertexList.head ).to.be.equal( vertexNew );
			expect( vertexList.tail ).to.be.equal( vertexNew );

		} );

	} );

	describe( '#insertAfter()', function () {

		it( 'should insert a vertex after the defined target vertex', function () {

			const vertexList = new VertexList();
			const vertex1 = new Vertex();
			const vertex2 = new Vertex();
			const vertexNew = new Vertex();

			vertexList.append( vertex1 );
			vertexList.append( vertex2 );

			vertexList.insertAfter( vertex1, vertexNew );

			expect( vertex1.prev ).to.be.null;
			expect( vertex1.next ).to.be.equal( vertexNew );
			expect( vertexNew.prev ).to.be.equal( vertex1 );
			expect( vertexNew.next ).to.be.equal( vertex2 );
			expect( vertex2.prev ).to.be.equal( vertexNew );
			expect( vertex2.next ).to.be.null;

			expect( vertexList.head ).to.be.equal( vertex1 );
			expect( vertexList.tail ).to.be.equal( vertex2 );

		} );

		it( 'should insert a vertex after the defined target vertex (target is tail of list)', function () {

			const vertexList = new VertexList();
			const vertex1 = new Vertex();
			const vertex2 = new Vertex();
			const vertexNew = new Vertex();

			vertexList.append( vertex1 );
			vertexList.append( vertex2 );

			vertexList.insertAfter( vertex2, vertexNew );

			expect( vertex1.prev ).to.be.null;
			expect( vertex1.next ).to.be.equal( vertex2 );
			expect( vertex2.prev ).to.be.equal( vertex1 );
			expect( vertex2.next ).to.be.equal( vertexNew );
			expect( vertexNew.prev ).to.be.equal( vertex2 );
			expect( vertexNew.next ).to.be.equal( null );

			expect( vertexList.head ).to.be.equal( vertex1 );
			expect( vertexList.tail ).to.be.equal( vertexNew );


		} );

	} );

	describe( '#appendChain()', function () {

		it( 'should append a single vertex to the list, like append()', function () {

			const vertexList = new VertexList();
			const vertex = new Vertex();
			const vertexNew = new Vertex();

			vertexList.head = vertexList.tail = vertex;

			vertexList.appendChain( vertexNew );

			expect( vertex.prev ).to.be.null;
			expect( vertex.next ).to.be.equal( vertexNew );
			expect( vertexNew.prev ).to.be.equal( vertex );
			expect( vertexNew.next ).to.be.null;

			expect( vertexList.head ).to.be.equal( vertex );
			expect( vertexList.tail ).to.be.equal( vertexNew );

		} );

		it( 'should ensure the first vertex of the list is the head and tail, like append()', function () {

			const vertexList = new VertexList();
			const vertexNew = new Vertex();

			vertexList.appendChain( vertexNew );

			expect( vertexNew.prev ).to.be.null;
			expect( vertexNew.next ).to.be.null;

			expect( vertexList.head ).to.be.equal( vertexNew );
			expect( vertexList.tail ).to.be.equal( vertexNew );

		} );

		it( 'should append a chain of vertices to the list', function () {

			const vertexList = new VertexList();
			const vertex = new Vertex();
			const vertex1 = new Vertex();
			const vertex2 = new Vertex();

			vertex1.next = vertex2;
			vertex2.prev = vertex1;

			vertexList.append( vertex );
			vertexList.appendChain( vertex1 );

			expect( vertex.prev ).to.be.null;
			expect( vertex.next ).to.be.equal( vertex1 );
			expect( vertex1.prev ).to.be.equal( vertex );
			expect( vertex1.next ).to.be.equal( vertex2 );
			expect( vertex2.prev ).to.be.equal( vertex1 );
			expect( vertex2.next ).to.be.null;

		} );

	} );

	describe( '#remove()', function () {

		it( 'should remove a vertex from the list', function () {

			const vertexList = new VertexList();
			const vertex1 = new Vertex();
			const vertex2 = new Vertex();
			const vertexToRemove = new Vertex();

			vertexList.append( vertex1 );
			vertexList.append( vertexToRemove );
			vertexList.append( vertex2 );

			vertexList.remove( vertexToRemove );

			expect( vertex1.prev ).to.be.null;
			expect( vertex1.next ).to.be.equal( vertex2 );

			expect( vertex2.prev ).to.be.equal( vertex1 );
			expect( vertex2.next ).to.be.null;

			expect( vertexToRemove.prev ).to.be.null;
			expect( vertexToRemove.next ).to.be.null;

		} );

		it( 'should remove a vertex from the list and adjust head and tail if necessary', function () {

			const vertexList = new VertexList();
			const vertexToRemove = new Vertex();

			vertexList.append( vertexToRemove );
			vertexList.remove( vertexToRemove );

			expect( vertexList.head ).to.be.null;
			expect( vertexList.tail ).to.be.null;

		} );

	} );

	describe( '#removeChain()', function () {

		it( 'should remove a chain of vertices from the list', function () {

			const vertexList = new VertexList();
			const vertex1 = new Vertex();
			const vertex2 = new Vertex();
			const vertexToRemove1 = new Vertex();
			const vertexToRemove2 = new Vertex();

			vertexList.append( vertex1 );
			vertexList.append( vertexToRemove1 );
			vertexList.append( vertexToRemove2 );
			vertexList.append( vertex2 );

			vertexList.removeChain( vertexToRemove1, vertexToRemove2 );

			expect( vertex1.prev ).to.be.null;
			expect( vertex1.next ).to.be.equal( vertex2 );

			expect( vertex2.prev ).to.be.equal( vertex1 );
			expect( vertex2.next ).to.be.null;

			expect( vertexToRemove1.prev ).to.be.null;
			expect( vertexToRemove2.next ).to.be.null;

		} );

		it( 'should remove a chain of vertices from the list and adjust head and tail if necessary', function () {

			const vertexList = new VertexList();

			const vertexToRemove1 = new Vertex();
			const vertexToRemove2 = new Vertex();

			vertexList.append( vertexToRemove1 );
			vertexList.append( vertexToRemove2 );

			vertexList.removeChain( vertexToRemove1, vertexToRemove2 );

			expect( vertexList.head ).to.be.null;
			expect( vertexList.tail ).to.be.null;

		} );

	} );

	describe( '#empty()', function () {

		it( 'should return true if the list is empty', function () {

			const vertexList = new VertexList();
			const vertex = new Vertex();

			expect( vertexList.empty() ).to.be.true;

			vertexList.append( vertex );

			expect( vertexList.empty() ).to.be.false;

		} );

	} );

} );
