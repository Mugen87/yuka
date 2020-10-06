import { Logger } from '../../core/Logger.js';
import { Vector3 } from '../../math/Vector3.js';
import { Polygon } from '../../math/Polygon.js';
import { NavMesh } from './NavMesh.js';

/**
* Class for loading navigation meshes as glTF assets. The loader supports
* *glTF* and *glb* files, embedded buffers, index and non-indexed geometries.
* Interleaved geometry data are not yet supported.
*
* @author {@link https://github.com/Mugen87|Mugen87}
*/
class NavMeshLoader {

	/**
	* Loads a {@link NavMesh navigation mesh} from the given URL. The second parameter can be used
	* to influence the parsing of the navigation mesh.
	*
	* @param {String} url - The URL of the glTF asset.
	* @param {Object} options - The (optional) configuration object.
	* @return {Promise} A promise representing the loading and parsing process.
	*/
	load( url, options ) {

		return new Promise( ( resolve, reject ) => {

			fetch( url )

				.then( response => {

					if ( response.status >= 200 && response.status < 300 ) {

						return response.arrayBuffer();

					} else {

						const error = new Error( response.statusText || response.status );
						error.response = response;
						return Promise.reject( error );

					}

				} )

				.then( ( arrayBuffer ) => {

					return this.parse( arrayBuffer, url, options );

				} )

				.then( ( data ) => {

					resolve( data );

				} )

				.catch( ( error ) => {

					Logger.error( 'YUKA.NavMeshLoader: Unable to load navigation mesh.', error );

					reject( error );

				} );

		} );

	}

	/**
	* Use this method if you are loading the contents of a navmesh not via {@link NavMeshLoader#load}.
	* This is for example useful in a node environment.
	*
	* It's mandatory to use glb files with embedded buffer data if you are going to load nav meshes
	* in node.js.
	*
	* @param {ArrayBuffer} arrayBuffer - The array buffer.
	* @param {String} url - The (optional) URL.
	* @param {Object} options - The (optional) configuration object.
	* @return {Promise} A promise representing the parsing process.
	*/
	parse( arrayBuffer, url, options ) {

		const parser = new Parser();
		const decoder = new TextDecoder();
		let data;

		const magic = decoder.decode( new Uint8Array( arrayBuffer, 0, 4 ) );

		if ( magic === BINARY_EXTENSION_HEADER_MAGIC ) {

			parser.parseBinary( arrayBuffer );

			data = parser.extensions.get( 'BINARY' ).content;

		} else {

			data = decoder.decode( new Uint8Array( arrayBuffer ) );

		}

		const json = JSON.parse( data );

		if ( json.asset === undefined || json.asset.version[ 0 ] < 2 ) {

			throw new Error( 'YUKA.NavMeshLoader: Unsupported asset version.' );

		} else {

			const path = extractUrlBase( url );

			return parser.parse( json, path, options );

		}

	}

}

class Parser {

	constructor() {

		this.json = null;
		this.path = null;
		this.cache = new Map();
		this.extensions = new Map();

	}

	parse( json, path, options ) {

		this.json = json;
		this.path = path;

		// read the first mesh in the glTF file

		return this.getDependency( 'mesh', 0 ).then( ( data ) => {

			// parse the raw geometry data into a bunch of polygons

			const polygons = this.parseGeometry( data );

			// create and config navMesh

			const navMesh = new NavMesh();

			if ( options ) {

				if ( options.epsilonCoplanarTest !== undefined ) navMesh.epsilonCoplanarTest = options.epsilonCoplanarTest;
				if ( options.mergeConvexRegions !== undefined ) navMesh.mergeConvexRegions = options.mergeConvexRegions;

			}

			// use polygons to setup the nav mesh

			return navMesh.fromPolygons( polygons );

		} );

	}

	parseGeometry( data ) {

		const index = data.index;
		const position = data.position;

		const vertices = new Array();
		const polygons = new Array();

		// vertices

		for ( let i = 0, l = position.length; i < l; i += 3 ) {

			const v = new Vector3();

			v.x = position[ i + 0 ];
			v.y = position[ i + 1 ];
			v.z = position[ i + 2 ];

			vertices.push( v );

		}

		// polygons

		if ( index ) {

			// indexed geometry

			for ( let i = 0, l = index.length; i < l; i += 3 ) {

				const a = index[ i + 0 ];
				const b = index[ i + 1 ];
				const c = index[ i + 2 ];

				const contour = [ vertices[ a ], vertices[ b ], vertices[ c ] ];

				const polygon = new Polygon().fromContour( contour );

				polygons.push( polygon );

			}

		} else {

			// non-indexed geometry //todo test

			for ( let i = 0, l = vertices.length; i < l; i += 3 ) {

				const contour = [ vertices[ i + 0 ], vertices[ i + 1 ], vertices[ i + 2 ] ];

				const polygon = new Polygon().fromContour( contour );

				polygons.push( polygon );

			}

		}

		return polygons;

	}

	getDependencies( type ) {

		const cache = this.cache;

		let dependencies = cache.get( type );

		if ( ! dependencies ) {

			const definitions = this.json[ type + ( type === 'mesh' ? 'es' : 's' ) ] || new Array();

			dependencies = Promise.all( definitions.map( ( definition, index ) => {

				return this.getDependency( type, index );

			} ) );

			cache.set( type, dependencies );

		}

		return dependencies;

	}

	getDependency( type, index ) {

		const cache = this.cache;
		const key = type + ':' + index;

		let dependency = cache.get( key );

		if ( dependency === undefined ) {

			switch ( type ) {

				case 'accessor':
					dependency = this.loadAccessor( index );
					break;

				case 'buffer':
					dependency = this.loadBuffer( index );
					break;

				case 'bufferView':
					dependency = this.loadBufferView( index );
					break;

				case 'mesh':
					dependency = this.loadMesh( index );
					break;

				default:
					throw new Error( 'Unknown type: ' + type );

			}

			cache.set( key, dependency );

		}

		return dependency;

	}

	loadBuffer( index ) {

		const json = this.json;
		const definition = json.buffers[ index ];

		if ( definition.uri === undefined && index === 0 ) {

			return Promise.resolve( this.extensions.get( 'BINARY' ).body );

		}

		return new Promise( ( resolve, reject ) => {

			const url = resolveURI( definition.uri, this.path );

			fetch( url )

				.then( response => {

					return response.arrayBuffer();

				} )

				.then( ( arrayBuffer ) => {

					resolve( arrayBuffer );

				} ).catch( ( error ) => {

					Logger.error( 'YUKA.NavMeshLoader: Unable to load buffer.', error );

					reject( error );

				} );

		} );

	}

	loadBufferView( index ) {

		const json = this.json;

		const definition = json.bufferViews[ index ];

		return this.getDependency( 'buffer', definition.buffer ).then( ( buffer ) => {

			const byteLength = definition.byteLength || 0;
			const byteOffset = definition.byteOffset || 0;
			return buffer.slice( byteOffset, byteOffset + byteLength );

		} );

	}

	loadAccessor( index ) {

		const json = this.json;
		const definition = json.accessors[ index ];

		return this.getDependency( 'bufferView', definition.bufferView ).then( ( bufferView ) => {

			const itemSize = WEBGL_TYPE_SIZES[ definition.type ];
			const TypedArray = WEBGL_COMPONENT_TYPES[ definition.componentType ];
			const byteOffset = definition.byteOffset || 0;

			return new TypedArray( bufferView, byteOffset, definition.count * itemSize );

		} );

	}

	loadMesh( index ) {

		const json = this.json;
		const definition = json.meshes[ index ];

		return this.getDependencies( 'accessor' ).then( ( accessors ) => {

			// assuming a single primitive

			const primitive = definition.primitives[ 0 ];

			if ( primitive.mode !== undefined && primitive.mode !== 4 ) {

				throw new Error( 'YUKA.NavMeshLoader: Invalid geometry format. Please ensure to represent your geometry as triangles.' );

			}

			return {
				index: accessors[ primitive.indices ],
				position: accessors[ primitive.attributes.POSITION ],
				normal: accessors[ primitive.attributes.NORMAL ]
			};

		} );

	}

	parseBinary( data ) {

		const chunkView = new DataView( data, BINARY_EXTENSION_HEADER_LENGTH );
		let chunkIndex = 0;

		const decoder = new TextDecoder();
		let content = null;
		let body = null;

		while ( chunkIndex < chunkView.byteLength ) {

			const chunkLength = chunkView.getUint32( chunkIndex, true );
			chunkIndex += 4;

			const chunkType = chunkView.getUint32( chunkIndex, true );
			chunkIndex += 4;

			if ( chunkType === BINARY_EXTENSION_CHUNK_TYPES.JSON ) {

				const contentArray = new Uint8Array( data, BINARY_EXTENSION_HEADER_LENGTH + chunkIndex, chunkLength );
				content = decoder.decode( contentArray );

			} else if ( chunkType === BINARY_EXTENSION_CHUNK_TYPES.BIN ) {

				const byteOffset = BINARY_EXTENSION_HEADER_LENGTH + chunkIndex;
				body = data.slice( byteOffset, byteOffset + chunkLength );

			}

			chunkIndex += chunkLength;

		}

		this.extensions.set( 'BINARY', { content: content, body: body } );

	}

}

// helper functions

function extractUrlBase( url = '' ) {

	const index = url.lastIndexOf( '/' );

	if ( index === - 1 ) return './';

	return url.substr( 0, index + 1 );

}

function resolveURI( uri, path ) {

	if ( typeof uri !== 'string' || uri === '' ) return '';

	if ( /^(https?:)?\/\//i.test( uri ) ) return uri;

	if ( /^data:.*,.*$/i.test( uri ) ) return uri;

	if ( /^blob:.*$/i.test( uri ) ) return uri;

	return path + uri;

}

//

const WEBGL_TYPE_SIZES = {
	'SCALAR': 1,
	'VEC2': 2,
	'VEC3': 3,
	'VEC4': 4,
	'MAT2': 4,
	'MAT3': 9,
	'MAT4': 16
};

const WEBGL_COMPONENT_TYPES = {
	5120: Int8Array,
	5121: Uint8Array,
	5122: Int16Array,
	5123: Uint16Array,
	5125: Uint32Array,
	5126: Float32Array
};

const BINARY_EXTENSION_HEADER_MAGIC = 'glTF';
const BINARY_EXTENSION_HEADER_LENGTH = 12;
const BINARY_EXTENSION_CHUNK_TYPES = { JSON: 0x4E4F534A, BIN: 0x004E4942 };

export { NavMeshLoader };
