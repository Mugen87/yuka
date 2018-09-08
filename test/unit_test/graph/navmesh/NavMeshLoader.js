/**
 * @author Mugen87 / https://github.com/Mugen87
 */

const expect = require( 'chai' ).expect;
const fetch = require( 'node-fetch' );
const TextDecoder = require( 'text-encoding' ).TextDecoder;

// provide implementing of browser APIs used in NavMeshLoader

global.fetch = fetch;
global.TextDecoder = TextDecoder;

const YUKA = require( '../../../../build/yuka.js' );

const NavMeshLoader = YUKA.NavMeshLoader;
const NavMesh = YUKA.NavMesh;

//

describe( 'NavMeshLoader', function () {

	describe( '#load()', function () {

		it( 'should return a promise that resolves if the navigation mesh with the given URL is successfully loaded', function ( done ) {

			const loader = new NavMeshLoader();

			loader.load( 'https://raw.githubusercontent.com/Mugen87/yuka/master/test/assets/navmesh/basic/navmesh.gltf' ).then( ( navMesh ) => {

				expect( navMesh ).is.an.instanceof( NavMesh );

				done();

			} );

		} );

	} );

} );
