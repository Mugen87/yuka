/**
 * @author Mugen87 / https://github.com/Mugen87
 *
 */

const expect = require( 'chai' ).expect;
const YUKA = require( '../../../build/yuka.js' );

const Vehicle = YUKA.Vehicle;
const SteeringManager = YUKA.SteeringManager;

describe( 'Vehicle', function () {

	describe( '#constructor()', function () {

		it( 'should create an object with correct default values', function () {

			const vehicle = new Vehicle();
			expect( vehicle ).to.have.a.property( 'mass' ).that.is.equal( 1 );
			expect( vehicle ).to.have.a.property( 'maxForce' ).that.is.equal( 100 );
			expect( vehicle ).to.have.a.property( 'steering' ).that.is.an.instanceof( SteeringManager );

		} );

	} );

} );
