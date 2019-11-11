/**
 * @author Mugen87 / https://github.com/Mugen87
 */

const expect = require( 'chai' ).expect;
const YUKA = require( '../../../build/yuka.js' );
const TriggerJSONs = require( '../../files/TriggerJSONs.js' );

const TriggerRegion = YUKA.TriggerRegion;

describe( 'TriggerRegion', function () {

	describe( '#touching()', function () {

		it( 'should exist', function () {

			const region = new TriggerRegion();
			expect( region ).respondTo( 'touching' );

		} );

		it( 'should return "false" to indicate no contact with a game entity', function () {

			const region = new TriggerRegion();
			expect( region.touching() ).to.be.false;

		} );

	} );

	describe( '#update()', function () {

		it( 'should exist', function () {

			const region = new TriggerRegion();
			expect( region ).respondTo( 'update' );
			region.update();

		} );

	} );

	describe( '#toJSON()', function () {

		it( 'should serialize this instance to a JSON object', function () {

			const region = new TriggerRegion();

			const json = region.toJSON();

			expect( json ).to.be.deep.equal( TriggerJSONs.TriggerRegion );

		} );

	} );

	describe( '#fromJSON()', function () {

		it( 'should deserialize this instance from the given JSON object', function () {

			const region = new TriggerRegion();
			const region2 = new TriggerRegion().fromJSON( TriggerJSONs.TriggerRegion );

			expect( region2 ).to.be.deep.equal( region );

		} );

	} );

} );
