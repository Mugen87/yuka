/**
 * @author Mugen87 / https://github.com/Mugen87
 */

import * as YUKA from '../../../../build/yuka.module.js';
import * as THREE from '../../../lib/three.module.js';

class World {

	constructor() {

		this.entityManager = new YUKA.EntityManager();
		this.time = new YUKA.Time();
		this.scene = null;

		this.maxCollectibles = 5;
		this.collectibles = new Array();
		this.renderComponents = new Map();

		this._setupRenderComponents();

	}

	add( entity ) {

		this.entityManager.add( entity );

		if ( entity._renderComponent !== null ) {

			this.scene.add( entity._renderComponent );

		}

	}

	remove( entity ) {

		this.entityManager.remove( entity );

		if ( entity._renderComponent !== null ) {

			this.scene.remove( entity._renderComponent );

		}

	}

	update() {

		// check collectibles

		if ( this.collectibles.length < this.maxCollectibles ) {

			const collectiblesToAdd = this.maxCollectibles - this.collectibles.length;

			for ( let i = 0; i < collectiblesToAdd; i ++ ) {

				this.addCollectible();

			}

		}

		const delta = this.time.update().getDelta();

		this.entityManager.update( delta );

	}

	addCollectible() {

		const collectible = new YUKA.GameEntity();
		const mesh = this.renderComponents.get( 'collectible' ).clone();
		collectible.setRenderComponent( mesh, sync );

		collectible.position.x = Math.random() * 15 - 7.5;
		collectible.position.z = Math.random() * 15 - 7.5;

		if ( collectible.position.x < 1 && collectible.position.x > - 1 ) collectible.position.x += 1;
		if ( collectible.position.z < 1 && collectible.position.y > - 1 ) collectible.position.z += 1;

		this.collectibles.push( collectible );
		this.add( collectible );

	}

	removeCollectible( collectible ) {

		this.remove( collectible );

		const index = this.collectibles.indexOf( collectible );
		this.collectibles.splice( index, 1 );

	}

	_setupRenderComponents() {

		const collectibleGeometry = new THREE.BoxBufferGeometry( 0.2, 0.2, 0.2 );
		collectibleGeometry.translate( 0, 0.1, 0 );
		const collectibleMaterial = new THREE.MeshBasicMaterial( { color: 0x040404 } );

		const collectibleMesh = new THREE.Mesh( collectibleGeometry, collectibleMaterial );
		collectibleMesh.matrixAutoUpdate = false;
		collectibleMesh.castShadow = true;

		this.renderComponents.set( 'collectible', collectibleMesh );

	}

}

function sync( entity, renderComponent ) {

	renderComponent.matrix.copy( entity.matrix );

}

export default new World();
