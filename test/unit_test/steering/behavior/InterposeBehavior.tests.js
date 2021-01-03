/**
 * @author Mugen87 / https://github.com/Mugen87
 */

const expect = require( 'chai' ).expect;
const YUKA = require( '../../../../build/yuka.js' );
const SteeringJSONs = require( '../../../files/SteeringJSONs.js' );


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

		it( 'should seek to the point between both entities (midpoint)', function () {

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

	describe( '#toJSON()', function () {

		it( 'should serialize this instance to a JSON object', function () {

			const interposeBehavior = new InterposeBehavior( null, null, 1 );
			const json = interposeBehavior.toJSON();

			expect( json ).to.deep.equal( SteeringJSONs.InterposeBehavior );

		} );

	} );

	describe( '#fromJSON()', function () {

		it( 'should deserialize this instance from the given JSON object', function () {

			const interposeBehavior1 = new InterposeBehavior( null, null, 1 );
			const interposeBehavior2 = new InterposeBehavior().fromJSON( SteeringJSONs.InterposeBehavior );

			expect( interposeBehavior1 ).to.deep.equal( interposeBehavior2 );

		} );

	} );

	describe( '#resolveReferences()', function () {

		it( 'should restore the references to other entities', function () {

			const entity1 = new Vehicle();
			const entity2 = new Vehicle();

			const behavior1 = new InterposeBehavior( entity1, entity2 );
			const behavior2 = new InterposeBehavior();

			//set ids
			entity1._uuid = '4C06581E-448A-4557-835E-7A9D2CE20D30';
			entity2._uuid = '52A33A16-6843-4C98-9A8E-9FCEA255A481';

			//set references
			behavior2.entity1 = entity1.uuid;
			behavior2.entity2 = entity2.uuid;

			const map = new Map();
			map.set( entity1.uuid, entity1 );
			map.set( entity2.uuid, entity2 );

			behavior2.resolveReferences( map );

			expect( behavior2 ).to.deep.equal( behavior1 );

		} );

		it( 'should set the entities to null if the mapping is missing', function () {

			const behavior = new InterposeBehavior();
			behavior.entity1 = '4C06581E-448A-4557-835E-7A9D2CE20D30';
			behavior.entity2 = '52A33A16-6843-4C98-9A8E-9FCEA255A481';

			behavior.resolveReferences( new Map() );

			expect( behavior.entity1 ).to.be.null;
			expect( behavior.entity2 ).to.be.null;

		} );

	} );

} );
