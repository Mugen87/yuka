/**
 * @author Mugen87 / https://github.com/Mugen87
 */

import * as THREE from '../../../lib/three.module.js';

function createConvexRegionHelper( navMesh ) {

	const group = new THREE.Group();
	const regions = navMesh.regions;

	for ( let region of regions ) {

		const points = [];

		let edge = region.edge;

		do {

			const p = new THREE.Vector2();
			const vertex = edge.from();
			p.x = vertex.x;
			p.y = - vertex.z;

			points.push( p );

			edge = edge.next;

		} while ( edge !== region.edge );

		// shape generation

		const shape = new THREE.Shape( points );

		const geometry = new THREE.ShapeBufferGeometry( shape );
		const color = new THREE.Color().setHSL( 0.3 + 0.7 * Math.random(), Math.random(), 0.4 );
		const material = new THREE.MeshBasicMaterial( { color: color } );

		const mesh = new THREE.Mesh( geometry, material );
		group.add( mesh );

	}

	group.rotation.x = Math.PI * - 0.5;

	return group;

}


export { createConvexRegionHelper };
