/**
 * @author Mugen87 / https://github.com/Mugen87
 */

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.109/build/three.module.js';

function createVisionHelper( vision, division = 8 ) {

	const fieldOfView = vision.fieldOfView;
	const range = vision.range;

	const geometry = new THREE.BufferGeometry();
	const material = new THREE.MeshBasicMaterial( { wireframe: true } );

	const mesh = new THREE.Mesh( geometry, material );

	const positions = [];

	const foV05 = fieldOfView / 2;
	const step = fieldOfView / division;

	// for now, let's create a simple helper that lies in the xz plane

	for ( let i = - foV05; i < foV05; i += step ) {

		positions.push( 0, 0, 0 );
		positions.push( Math.sin( i ) * range, 0, Math.cos( i ) * range );
		positions.push( Math.sin( i + step ) * range, 0, Math.cos( i + step ) * range );

	}

	geometry.addAttribute( 'position', new THREE.Float32BufferAttribute( positions, 3 ) );

	return mesh;

}


export { createVisionHelper };
