/**
 * @author Mugen87 / https://github.com/Mugen87
 */

import * as THREE from '../../../lib/three.module.js';

function createConvexHullHelper( convexHull ) {

	const faces = convexHull.faces;

	var positions = [];
	var colors = [];
	var centroids = [];

	const color = new THREE.Color();

	for ( let i = 0; i < faces.length; i ++ ) {

		const face = faces[ i ];
		const centroid = face.centroid;
		let edge = face.edge;
		const edges = [];

		color.setHex( Math.random() * 0xffffff );

		centroids.push( centroid.x, centroid.y, centroid.z );

		do {

			edges.push( edge );

			edge = edge.next;

		} while ( edge !== face.edge );

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

	// convex hull

	const convexGeometry = new THREE.BufferGeometry();
	convexGeometry.addAttribute( 'position', new THREE.Float32BufferAttribute( positions, 3 ) );
	convexGeometry.addAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );

	const convexMaterial = new THREE.MeshBasicMaterial( { vertexColors: THREE.VertexColors, transparent: true, opacity: 0.5 } );
	const mesh = new THREE.Mesh( convexGeometry, convexMaterial );

	// centroids

	const centroidGeometry = new THREE.BufferGeometry();
	centroidGeometry.addAttribute( 'position', new THREE.Float32BufferAttribute( centroids, 3 ) );

	const centroidMaterial = new THREE.PointsMaterial( { color: 0xffff00, size: 0.25 } );
	const pointCloud = new THREE.Points( centroidGeometry, centroidMaterial );

	mesh.add( pointCloud );

	//

	return mesh;

}


export { createConvexHullHelper };
