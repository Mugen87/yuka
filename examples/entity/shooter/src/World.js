/**
 * @author Mugen87 / https://github.com/Mugen87
 */

import { Vector3 } from '../../../../build/yuka.module.js';
import * as THREE from '../../../lib/three.module.js';
import { Bullet } from './Bullet.js';

const closestPoint = new Vector3();
const target = new Vector3();

class World {

	constructor() {

		this.maxBulletHoles = 20;

		this.entityManager = null;
		this.scene = null;

		this.obstacles = new Array();
		this.bulletHoles = new Array();
		this.renderComponents = new Map();

		this._setupRenderComponents();

	}

	add( entity ) {

		this.entityManager.add( entity );

		if ( entity._renderComponent !== null ) {

			this.scene.add( entity._renderComponent );

		}

		if ( entity.geometry ) {

			this.obstacles.push( entity );

		}

	}

	remove( entity ) {

		this.entityManager.remove( entity );

		if ( entity._renderComponent !== null ) {

			this.scene.remove( entity._renderComponent );

		}

		if ( entity.geometry ) {

			const index = this.obstacles.indexOf( entity.geometry );

			if ( index !== - 1 ) this.obstacles.splice( index, 1 );


		}

	}

	addBullet( owner, ray ) {

		const renderComponent = this.renderComponents.get( 'bulletLine' ).clone();

		const bullet = new Bullet( owner, ray );
		bullet.setRenderComponent( renderComponent, sync );

		this.add( bullet );

	}

	addBulletHole( position, normal, audio ) {

		const bulletHole = this.renderComponents.get( 'bulletHole' ).clone();
		bulletHole.add( audio );

		const s = 1 + ( Math.random() * 0.5 );
		bulletHole.scale.set( s, s, s );

		bulletHole.position.copy( position );
		target.copy( position ).add( normal );
		bulletHole.updateMatrix();
		bulletHole.lookAt( target.x, target.y, target.z );
		bulletHole.updateMatrix();

		if ( this.bulletHoles.length >= this.maxBulletHoles ) {

			const toRemove = this.bulletHoles.shift();
			this.scene.remove( toRemove );

		}

		this.bulletHoles.push( bulletHole );
		this.scene.add( bulletHole );

	}

	intersectRay( ray, intersectionPoint, normal = null ) {

		const obstacles = this.obstacles;
		let minDistance = Infinity;
		let closestObstacle = null;

		for ( let i = 0, l = obstacles.length; i < l; i ++ ) {

			const obstalce = obstacles[ i ];

			if ( obstalce.intersectRay( ray, intersectionPoint, normal ) !== null ) {

				const squaredDistance = intersectionPoint.squaredDistanceTo( ray.origin );

				if ( squaredDistance < minDistance ) {

					minDistance = squaredDistance;
					closestPoint.copy( intersectionPoint );
					closestObstacle = obstalce;

				}

			}

		}

		return ( closestObstacle === null ) ? null : closestObstacle;

	}

	_setupRenderComponents() {

		const loader = new THREE.TextureLoader();

		// bullet hole

		const texture = loader.load( 'model/bulletHole.png' );
		texture.minFilter = THREE.LinearFilter;
		const bulletHoleGeometry = new THREE.PlaneBufferGeometry( 0.1, 0.1 );
		const bulletHoleMaterial = new THREE.MeshLambertMaterial( { map: texture, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: - 4 } );

		const bulletHole = new THREE.Mesh( bulletHoleGeometry, bulletHoleMaterial );
		bulletHole.matrixAutoUpdate = false;

		this.renderComponents.set( 'bulletHole', bulletHole );

		// bullet line

		const bulletLineGeometry = new THREE.BufferGeometry();
		const bulletLineMaterial = new THREE.LineBasicMaterial( { color: 0xfbf8e6 } );

		bulletLineGeometry.setFromPoints( [ new THREE.Vector3(), new THREE.Vector3( 0, 0, - 1 ) ] );

		const bulletLine = new THREE.LineSegments( bulletLineGeometry, bulletLineMaterial );
		bulletLine.matrixAutoUpdate = false;

		this.renderComponents.set( 'bulletLine', bulletLine );

	}

}

function sync( entity, renderComponent ) {

	renderComponent.matrix.copy( entity.worldMatrix );

}

export default new World();
