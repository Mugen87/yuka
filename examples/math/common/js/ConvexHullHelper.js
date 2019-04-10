/**
 * @author Mugen87 / https://github.com/Mugen87
 */

import * as THREE from '../../../lib/three.module.js';

function createConvexHullHelper( convexHull ) {

	const faces = convexHull.faces;

	var vertices = [];
	var centroids = [];

	for ( let i = 0; i < faces.length; i ++ ) {

		const face = faces[ i ];
		const centroid = face.centroid;
		let edge = face.edge;

		centroids.push( centroid.x, centroid.y, centroid.z );

		do {

			const vertex = edge.vertex;

			vertices.push( vertex.x, vertex.y, vertex.z );

			edge = edge.next;

		} while ( edge !== face.edge );

	}

	// convex hull

	const convexGeometry = new THREE.BufferGeometry();
	convexGeometry.addAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );

	const convexMaterial = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe: true } );
	const mesh = new THREE.Mesh( convexGeometry, convexMaterial );

	// centroids

	const centroidGeometry = new THREE.BufferGeometry();
	centroidGeometry.addAttribute( 'position', new THREE.Float32BufferAttribute( centroids, 3 ) );

	const centroidMaterial = new THREE.PointsMaterial( { color: 0xffff00, size: 0.5 } );
	const pointCloud = new THREE.Points( centroidGeometry, centroidMaterial );

	mesh.add( pointCloud );

	//

	return mesh;

}


export { createConvexHullHelper };
