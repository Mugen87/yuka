/**
 * @author Mugen87 / https://github.com/Mugen87
 */

const expect = require( 'chai' ).expect;
const YUKA = require( '../../../../build/yuka.js' );

const InterposeBehavior = YUKA.InterposeBehavior;
const ArriveBehavior = YUKA.ArriveBehavior;
const Vector3 = YUKA.Vector3;
const Vehicle = YUKA.Vehicle;

describe( 'InterposeBehavior', function () {

	describe( '#constructor()', function () {

		it( 'should create an object with correct default values', function () {

			const interposeBehavior = new InterposeBehavior();
			expect( interposeBehavior ).to.have.a.property( 'entity1' ).that.is.null;
			expect( interposeBehavior ).to.have.a.property( 'entity2' ).that.is.null;
			expect( interposeBehavior ).to.have.a.property( 'deceleration' ).that.is.equal( 3 );
			expect( interposeBehavior ).to.have.a.property( '_arrive' ).that.is.an.instanceof( ArriveBehavior );

		} );

		it( 'should apply the parameters to the new object', function () {

			const entity1 = new Vehicle();
			const entity2 = new Vehicle();
			const interposeBehavior = new InterposeBehavior( entity1, entity2, 2 );
			expect( interposeBehavior.entity1 ).to.equal( entity1 );
			expect( interposeBehavior.entity2 ).to.equal( entity2 );
			expect( interposeBehavior.deceleration ).to.equal( 2 );

		} );

	} );

	describe( '#calculate()', function () {

		it( 'should seek to the point between both entites (midpoint)', function () {

			const vehicle = new Vehicle();
			const entity1 = new Vehicle();
			const entity2 = new Vehicle();
			const force = new Vector3();

			entity1.position.set( 0, 10, - 1 );
			entity2.position.set( 0, 10, 1 );

			entity1.velocity.set( 0, 1, 1 );
			entity2.velocity.set( 0, 1, 1 );

			const interposeBehavior = new InterposeBehavior( entity1, entity2 );

			interposeBehavior.calculate( vehicle, force );

			expect( force.x ).to.closeTo( 0, Number.EPSILON );
			expect( force.y ).to.closeTo( 0.8944271909999159, Number.EPSILON );
			expect( force.z ).to.closeTo( 0.4472135954999579, Number.EPSILON );

		} );

		it( 'should use the deceleration property to reduce the force when the vehicle gets close to the midpoint', function () {

			const vehicle = new Vehicle();
			const entity1 = new Vehicle();
			const entity2 = new Vehicle();
			const force = new Vector3();

			entity1.position.set( 0, 1, - 1 );
			entity2.position.set( 0, 1, 1 );

			entity1.velocity.set( 0, 1, 1 );
			entity2.velocity.set( 0, 1, 1 );

			const interposeBehavior = new InterposeBehavior( entity1, entity2, 4 );

			interposeBehavior.calculate( vehicle, force );

			expect( force.x ).to.closeTo( 0, Number.EPSILON );
			expect( force.y ).to.closeTo( 0.5, Number.EPSILON );
			expect( force.z ).to.closeTo( 0.25, Number.EPSILON );

		} );

	} );

} );
