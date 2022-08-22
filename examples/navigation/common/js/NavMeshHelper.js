/**
 * @author Mugen87 / https://github.com/Mugen87
 */

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.109/build/three.module.js';

function createConvexRegionHelper( navMesh ) {

	const regions = navMesh.regions;

	const geometry = new THREE.BufferGeometry();
	const material = new THREE.MeshBasicMaterial( { vertexColors: THREE.VertexColors } );

	const mesh = new THREE.Mesh( geometry, material );

	const positions = [];
	const colors = [];

	const color = new THREE.Color();

	for ( let region of regions ) {

		// one color for each convex region

		color.setHex( Math.random() * 0xffffff );

		// count edges

		let edge = region.edge;
		const edges = [];

		do {

			edges.push( edge );

			edge = edge.next;

		} while ( edge !== region.edge );

		// triangulate

		const triangleCount = ( edges.length - 2 );

		for ( let i = 1, l = triangleCount; i <= l; i ++ ) {

			const v1 = edges[ 0 ].vertex;
			const v2 = edges[ i + 0 ].vertex;
			const v3 = edges[ i + 1 ].vertex;

			positions.push( v1.x, v1.y, v1.z );
			positions.push( v2.x, v2.y, v2.z );
			positions.push( v3.x, v3.y, v3.z );

			colors.push( color.r, color.g, color.b );
			colors.push( color.r, color.g, color.b );
			colors.push( color.r, color.g, color.b );

		}

	}

	geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( positions, 3 ) );
	geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );

	return mesh;

}


export { createConvexRegionHelper };
