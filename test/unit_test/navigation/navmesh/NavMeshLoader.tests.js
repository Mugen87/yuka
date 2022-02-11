/**
 * @author Mugen87 / https://github.com/Mugen87
 */

const fs = require( 'fs' );
const path = require( 'path' );
const util = require( 'util' );
const expect = require( 'chai' ).expect;
const fetch = require( 'node-fetch' );

// provide implementation of browser APIs used in NavMeshLoader

global.fetch = fetch;
global.TextDecoder = util.TextDecoder;

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

		it( 'should be able to load a gltf file with no primitive mode definition', function ( done ) {

			const loader = new NavMeshLoader();
			const url = 'https://raw.githubusercontent.com/Mugen87/yuka/master/test/assets/navmesh/no-primitive-mode/navmesh.gltf';

			loader.load( url ).then( ( navMesh ) => {

				expect( navMesh ).is.an.instanceof( NavMesh );
				expect( navMesh.regions ).to.have.lengthOf( 2 );

				done();

			} );

		} );

		it( 'should use the options parameter to config the navmesh', function ( done ) {

			const loader = new NavMeshLoader();
			const url = 'https://raw.githubusercontent.com/Mugen87/yuka/master/test/assets/navmesh/glb-embedded/navmesh.glb';

			loader.load( url, { epsilonCoplanarTest: 0.5, mergeConvexRegions: false } ).then( ( navMesh ) => {

				expect( navMesh.epsilonCoplanarTest ).is.equal( 0.5 );
				expect( navMesh.mergeConvexRegions ).to.be.false;

				done();

			} );

		} );

		it( 'should reject the promise with an error if the URL das not exist', function ( done ) {

			const loader = new NavMeshLoader();
			const url = 'https://raw.githubusercontent.com/Mugen87/yuka/master/test/assets/navmesh/glb-embedded/error';

			YUKA.Logger.setLevel( YUKA.Logger.LEVEL.SILENT );

			loader.load( url ).then( () => {}, ( err ) =>{

				expect( err ).to.be.a( 'Error' );
				expect( err.message ).to.be.equal( 'Not Found' );
				done();

			} );

		} );

		it( 'should reject the promise with an error if the asset version is not supported', function ( done ) {

			const loader = new NavMeshLoader();
			const url = 'https://raw.githubusercontent.com/Mugen87/yuka/master/test/assets/navmesh/glb-embedded/navmeshUnsupportedAssetVersion.glb';

			YUKA.Logger.setLevel( YUKA.Logger.LEVEL.SILENT );

			loader.load( url ).then( ( ) => {}, ( err ) =>{

				expect( err ).to.be.a( 'Error' );
				expect( err.message ).to.be.equal( 'YUKA.NavMeshLoader: Unsupported asset version.' );
				done();

			} );

		} );

	} );

	describe( '#parse()', function () {

		it( 'should parse the given array buffer without using NavMeshLoader.load()', function ( done ) {

			const data = fs.readFileSync( path.join( __dirname, '../../../assets/navmesh/glb-embedded/navmesh.glb' ) );

			const loader = new NavMeshLoader();
			loader.parse( data.buffer ).then( ( navMesh ) => {

				expect( navMesh ).is.an.instanceof( NavMesh );
				expect( navMesh.regions ).to.have.lengthOf( 5 );
				expect( navMesh.graph.getNodeCount() ).is.equal( 5 );
				expect( navMesh.graph.getEdgeCount() ).is.equal( 8 );

				done();

			} );

		} );

	} );

} );
