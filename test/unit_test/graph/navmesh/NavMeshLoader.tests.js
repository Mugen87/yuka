/**
 * @author Mugen87 / https://github.com/Mugen87
 */

const expect = require( 'chai' ).expect;
const fetch = require( 'node-fetch' );
const TextDecoder = require( 'text-encoding' ).TextDecoder;

// provide implementation of browser APIs used in NavMeshLoader

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
			const url = 'https://raw.githubusercontent.com/Mugen87/yuka/master/test/assets/navmesh/gltf/navmesh.gltf';

			loader.load( url ).then( ( navMesh ) => {

				expect( navMesh ).is.an.instanceof( NavMesh );
				expect( navMesh.regions ).to.have.lengthOf( 5 );
				expect( navMesh.graph.getNodeCount() ).is.equal( 5 );
				expect( navMesh.graph.getEdgeCount() ).is.equal( 8 );

				done();

			} );

		} );

		// it's not possible with node-fetch to load a glTF file with embedded buffers since this fetch
		// does not accept data URLs as input parameter.

		it( 'should be able to load a glb file', function ( done ) {

			const loader = new NavMeshLoader();
			const url = 'https://raw.githubusercontent.com/Mugen87/yuka/master/test/assets/navmesh/glb/navmesh.glb';

			loader.load( url ).then( ( navMesh ) => {

				expect( navMesh ).is.an.instanceof( NavMesh );
				expect( navMesh.regions ).to.have.lengthOf( 5 );
				expect( navMesh.graph.getNodeCount() ).is.equal( 5 );
				expect( navMesh.graph.getEdgeCount() ).is.equal( 8 );

				done();

			} );

		} );

		// it's possible to test glb files with embedded buffers since NavMeshLoader
		// does not use fetch to return the buffer data in this case

		it( 'should be able to load a glb file with embedded buffer data', function ( done ) {

			const loader = new NavMeshLoader();
			const url = 'https://raw.githubusercontent.com/Mugen87/yuka/master/test/assets/navmesh/glb-embedded/navmesh.glb';

			loader.load( url ).then( ( navMesh ) => {

				expect( navMesh ).is.an.instanceof( NavMesh );
				expect( navMesh.regions ).to.have.lengthOf( 5 );
				expect( navMesh.graph.getNodeCount() ).is.equal( 5 );
				expect( navMesh.graph.getEdgeCount() ).is.equal( 8 );

				done();

			} );

		} );

		it( 'should use the options parameter to config the navmesh', function ( done ) {

			const loader = new NavMeshLoader();
			const url = 'https://raw.githubusercontent.com/Mugen87/yuka/master/test/assets/navmesh/glb-embedded/navmesh.glb';

			loader.load( url, { epsilonCoplanarTest: 0.5 } ).then( ( navMesh ) => {

				expect( navMesh.epsilonCoplanarTest ).is.equal( 0.5 );

				done();

			} );

		} );

	} );

} );
