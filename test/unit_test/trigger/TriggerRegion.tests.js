/**
 * @author Mugen87 / https://github.com/Mugen87
 */

const expect = require( 'chai' ).expect;
const YUKA = require( '../../../build/yuka.js' );

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

} );
