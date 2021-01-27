/**
 * @author Mugen87 / https://github.com/Mugen87
 */

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.109/build/three.module.js';

function createBVHHelper( bvh, depth ) {

	const group = new THREE.Group();

	bvh.traverse( ( node ) => {

		const box3 = new THREE.Box3();

		box3.min.copy( node.boundingVolume.min );
		box3.max.copy( node.boundingVolume.max );

		const currentDepth = node.getDepth();
		const l = 0.2 + ( currentDepth / depth * 0.8 );

		const color = new THREE.Color().setHSL( 0.4, 1, l );
		const helper = new THREE.Box3Helper( box3, color );

		group.add( helper );

	} );

	return group;

}


export { createBVHHelper };
