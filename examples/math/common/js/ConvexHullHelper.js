/**
 * @author Mugen87 / https://github.com/Mugen87
 */

import * as THREE from '../../../lib/three.module.js';

function createConvexHullHelper( convexHull ) {

	const faces = convexHull.faces;

	var vertices = [];

	for ( let i = 0; i < faces.length; i ++ ) {

		const face = faces[ i ];
		let edge = face.edge;

		do {

			const vertex = edge.vertex;

			vertices.push( vertex.x, vertex.y, vertex.z );

			edge = edge.next;

		} while ( edge !== face.edge );

	}

	console.log( vertices.length / 3 );

	const geometry = new THREE.BufferGeometry();
	geometry.addAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );

	const material = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe: true } );
	const mesh = new THREE.Mesh( geometry, material );

	return mesh;

}


export { createConvexHullHelper };
