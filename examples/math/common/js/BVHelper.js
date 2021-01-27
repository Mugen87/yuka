/**
 * @author Mugen87 / https://github.com/Mugen87
 */

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.109/build/three.module.js';
import * as YUKA from '../../../../build/yuka.module.js';

function createSphereHelper( boundingSphere ) {

	const geometry = new THREE.SphereBufferGeometry( boundingSphere.radius, 16, 16 );
	const material = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe: true } );
	const mesh = new THREE.Mesh( geometry, material );

	mesh.position.copy( boundingSphere.center );

	return mesh;

}

function createAABBHelper( aabb ) {

	const center = aabb.getCenter( new YUKA.Vector3() );
	const size = aabb.getSize( new YUKA.Vector3() );

	const geometry = new THREE.BoxBufferGeometry( size.x, size.y, size.z );
	const material = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe: true } );
	const mesh = new THREE.Mesh( geometry, material );

	mesh.position.copy( center );

	return mesh;

}

function createOBBHelper( obb ) {

	const center = obb.center;
	const size = new YUKA.Vector3().copy( obb.halfSizes ).multiplyScalar( 2 );
	const rotation = new YUKA.Quaternion().fromMatrix3( obb.rotation );

	const geometry = new THREE.BoxBufferGeometry( size.x, size.y, size.z );
	const material = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe: true } );
	const mesh = new THREE.Mesh( geometry, material );

	mesh.position.copy( center );
	mesh.quaternion.copy( rotation );

	return mesh;

}

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

	const convexMaterial = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe: true } );
	const mesh = new THREE.Mesh( convexGeometry, convexMaterial );

	// centroids (useful for debugging)

	// const centroidGeometry = new THREE.BufferGeometry();
	// centroidGeometry.addAttribute( 'position', new THREE.Float32BufferAttribute( centroids, 3 ) );

	// const centroidMaterial = new THREE.PointsMaterial( { color: 0xffff00, size: 0.25 } );
	// const pointCloud = new THREE.Points( centroidGeometry, centroidMaterial );

	// mesh.add( pointCloud );

	//

	return mesh;

}

export { createSphereHelper, createAABBHelper, createOBBHelper, createConvexHullHelper };
