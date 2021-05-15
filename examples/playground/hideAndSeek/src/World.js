/**
 * @author Mugen87 / https://github.com/Mugen87
 */

import * as YUKA from '../../../../build/yuka.module.js';
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.109/build/three.module.js';
import { AssetManager } from './AssetManager.js';
import { Bullet } from './Bullet.js';
import { Enemy } from './Enemy.js';
import { Player } from './Player.js';
import { Ground } from './Ground.js';
import { CustomObstacle } from './CustomObstacle.js';
import { FirstPersonControls } from './FirstPersonControls.js';

const intersection = {
	point: new YUKA.Vector3(),
	normal: new YUKA.Vector3()
};
const target = new YUKA.Vector3();

class World {

	constructor() {

		this.maxBulletHoles = 48;
		this.enemyCount = 3;
		this.minSpawningDistance = 10;

		this.entityManager = new YUKA.EntityManager();
		this.time = new YUKA.Time();

		this.camera = null;
		this.scene = null;
		this.renderer = null;
		this.mixer = null;
		this.audios = new Map();
		this.animations = new Map();

		this.player = null;
		this.controls = null;

		this.enemies = new Array();
		this.obstacles = new Array();
		this.bulletHoles = new Array();
		this.spawningPoints = new Array();
		this.usedSpawningPoints = new Set();

		this.assetManager = new AssetManager();

		this.hits = 0;
		this.playingTime = 60; // 60s

		this.ui = {
			intro: document.getElementById( 'intro' ),
			crosshairs: document.getElementById( 'crosshairs' ),
			loadingScreen: document.getElementById( 'loading-screen' ),
			playingTime: document.getElementById( 'playingTime' ),
			hits: document.getElementById( 'hits' ),
			menu_start: document.getElementById( 'start' ),
			menu_gameover: document.getElementById( 'gameover' ),
			menu_hits: document.getElementById( 'gameover_hits' ),
		};

		this.started = false;
		this.gameOver = false;
		this.debug = false;

		this._onWindowResize = onWindowResize.bind( this );
		this._onIntroClick = onIntroClick.bind( this );
		this._animate = animate.bind( this );

	}

	init() {

		this.assetManager.init().then( () => {

			this._initScene();
			this._initPlayer();
			this._initControls();
			this._initGround();
			this._initObstacles();
			this._initSpawningPoints();
			this._initUI();

			this._animate();

		} );

	}

	update() {

		const delta = this.time.update().getDelta();

		// add enemies if necessary

		const enemies = this.enemies;

		if ( enemies.length < this.enemyCount ) {

			for ( let i = enemies.length, l = this.enemyCount; i < l; i ++ ) {

				this.addEnemy();

			}

		}

		// update UI

		if ( this.started === true && this.gameOver === false ) {

			this.playingTime -= delta;

			this.refreshUI();

			if ( this.playingTime < 0 ) {

				this.gameOver = true;
				this.controls.exit();

				this.ui.menu_start.style.display = 'none';
				this.ui.menu_gameover.style.display = 'block';
				this.ui.menu_hits.textContent = this.hits;

			}

		}

		//

		this.controls.update( delta );

		this.entityManager.update( delta );

		if ( this.mixer ) this.mixer.update( delta );

		this.renderer.render( this.scene, this.camera );

	}

	add( entity ) {

		this.entityManager.add( entity );

		if ( entity._renderComponent !== null ) {

			this.scene.add( entity._renderComponent );

		}

		if ( entity.geometry ) {

			this.obstacles.push( entity );

		}

		if ( entity instanceof Enemy ) {

			this.enemies.push( entity );

		}

	}

	remove( entity ) {

		this.entityManager.remove( entity );

		if ( entity._renderComponent !== null ) {

			this.scene.remove( entity._renderComponent );

		}

		if ( entity.geometry ) {

			const index = this.obstacles.indexOf( entity );

			if ( index !== - 1 ) this.obstacles.splice( index, 1 );

		}

		if ( entity instanceof Enemy ) {

			const index = this.enemies.indexOf( entity );

			if ( index !== - 1 ) this.enemies.splice( index, 1 );

			this.usedSpawningPoints.delete( entity.spawningPoint );

		}

	}

	addBullet( owner, ray ) {

		const bulletLine = this.assetManager.models.get( 'bulletLine' ).clone();

		const bullet = new Bullet( owner, ray );
		bullet.setRenderComponent( bulletLine, sync );

		this.add( bullet );

	}

	addBulletHole( position, normal, audio ) {

		const bulletHole = this.assetManager.models.get( 'bulletHole' ).clone();
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

	addEnemy() {

		const renderComponent = this.assetManager.models.get( 'enemy' ).clone();

		const enemyMaterial = new THREE.MeshStandardMaterial( { color: 0xee0808, side: THREE.DoubleSide, transparent: true } );
		enemyMaterial.onBeforeCompile = function ( shader ) {

			shader.uniforms.alpha = { value: 0 };
			shader.uniforms.direction = { value: new THREE.Vector3() };
			shader.vertexShader = 'uniform float alpha;\n' + shader.vertexShader;
			shader.vertexShader = 'attribute vec3 scatter;\n' + shader.vertexShader;
			shader.vertexShader = 'attribute float extent;\n' + shader.vertexShader;
			shader.vertexShader = shader.vertexShader.replace(
				'#include <begin_vertex>',
				[
					'vec3 transformed = vec3( position );',
					'transformed += normalize( scatter ) * alpha * extent;',
				].join( '\n' )
			);

			enemyMaterial.userData.shader = shader;

		};

		renderComponent.material = enemyMaterial;

		const vertices = renderComponent.geometry.attributes.position.array;
		const geometry = new YUKA.MeshGeometry( vertices );

		const enemy = new Enemy( geometry );
		enemy.boundingRadius = renderComponent.geometry.boundingSphere.radius;
		enemy.setRenderComponent( renderComponent, sync );

		// compute spawning point

		let spawningPoint = null;

		const minSqDistance = this.minSpawningDistance * this.minSpawningDistance;

		do {

			const spawningPointIndex = Math.ceil( Math.random() * this.spawningPoints.length - 1 );
			spawningPoint = this.spawningPoints[ spawningPointIndex ];

			// only pick the spawning point if it is not in use and far enough away from the player

		} while ( this.usedSpawningPoints.has( spawningPoint ) === true || spawningPoint.squaredDistanceTo( this.player.position ) < minSqDistance );

		this.usedSpawningPoints.add( spawningPoint );

		enemy.position.copy( spawningPoint );
		enemy.spawningPoint = spawningPoint;

		this.add( enemy );

	}

	intersectRay( ray, intersectionPoint, normal = null ) {

		const obstacles = this.obstacles;
		let minDistance = Infinity;
		let closestObstacle = null;

		for ( let i = 0, l = obstacles.length; i < l; i ++ ) {

			const obstalce = obstacles[ i ];

			if ( obstalce.geometry.intersectRay( ray, obstalce.worldMatrix, false, intersection.point, intersection.normal ) !== null ) {

				const squaredDistance = intersection.point.squaredDistanceTo( ray.origin );

				if ( squaredDistance < minDistance ) {

					minDistance = squaredDistance;
					closestObstacle = obstalce;

					intersectionPoint.copy( intersection.point );
					if ( normal ) normal.copy( intersection.normal );

				}

			}

		}

		return ( closestObstacle === null ) ? null : closestObstacle;

	}

	refreshUI() {

		this.ui.playingTime.textContent = Math.ceil( this.playingTime );
		this.ui.hits.textContent = this.hits;

	}

	_initScene() {

		// camera

		this.camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 200 );
		this.camera.matrixAutoUpdate = false;
		this.camera.add( this.assetManager.listener );

		// audios

		this.audios = this.assetManager.audios;

		// scene

		this.scene = new THREE.Scene();
		this.scene.background = new THREE.Color( 0xa0a0a0 );
		this.scene.fog = new THREE.Fog( 0xa0a0a0, 20, 150 );

		// lights

		const hemiLight = new THREE.HemisphereLight( 0xffffff, 0x444444, 0.8 );
		hemiLight.position.set( 0, 100, 0 );
		hemiLight.matrixAutoUpdate = false;
		hemiLight.updateMatrix();
		this.scene.add( hemiLight );

		const dirLight = new THREE.DirectionalLight( 0xffffff, 0.8 );
		dirLight.position.set( 20, 25, 25 );
		dirLight.matrixAutoUpdate = false;
		dirLight.updateMatrix();
		dirLight.castShadow = true;
		dirLight.shadow.camera.top = 25;
		dirLight.shadow.camera.bottom = - 25;
		dirLight.shadow.camera.left = - 30;
		dirLight.shadow.camera.right = 30;
		dirLight.shadow.camera.near = 0.1;
		dirLight.shadow.camera.far = 100;
		dirLight.shadow.mapSize.x = 2048;
		dirLight.shadow.mapSize.y = 2048;
		this.scene.add( dirLight );

		if ( this.debug ) this.scene.add( new THREE.CameraHelper( dirLight.shadow.camera ) );

		// renderer

		this.renderer = new THREE.WebGLRenderer( { antialias: true } );
		this.renderer.setSize( window.innerWidth, window.innerHeight );
		this.renderer.shadowMap.enabled = true;
		this.renderer.gammaOutput = true;
		document.body.appendChild( this.renderer.domElement );

		// listeners

		window.addEventListener( 'resize', this._onWindowResize, false );
		this.ui.intro.addEventListener( 'click', this._onIntroClick, false );

	}

	_initSpawningPoints() {

		const spawningPoints = this.spawningPoints;

		for ( let i = 0; i < 9; i ++ ) {

			const spawningPoint = new YUKA.Vector3();

			spawningPoint.x = 18 - ( ( i % 3 ) * 12 );
			spawningPoint.z = 18 - ( Math.floor( i / 3 ) * 12 );

			spawningPoints.push( spawningPoint );

		}

		if ( this.debug ) {

			const spawningPoints = this.spawningPoints;

			const spawningPointGeometry = new THREE.SphereBufferGeometry( 0.2 );
			const spawningPointMaterial = new THREE.MeshPhongMaterial( { color: 0x00ffff, depthWrite: false, depthTest: false, transparent: true } );

			for ( let i = 0, l = spawningPoints.length; i < l; i ++ ) {

				const mesh = new THREE.Mesh( spawningPointGeometry, spawningPointMaterial );
				mesh.position.copy( spawningPoints[ i ] );
				this.scene.add( mesh );

			}

		}

	}

	_initPlayer() {

		const player = new Player();
		player.position.set( 6, 0, 35 );
		player.head.setRenderComponent( this.camera, syncCamera );

		this.add( player );
		this.player = player;

		// weapon

		const weapon = player.weapon;
		const weaponMesh = this.assetManager.models.get( 'weapon' );
		weapon.setRenderComponent( weaponMesh, sync );
		this.scene.add( weaponMesh );

		weaponMesh.add( this.audios.get( 'shot' ) );
		weaponMesh.add( this.audios.get( 'shot_reload' ) );
		weaponMesh.add( this.audios.get( 'reload' ) );
		weaponMesh.add( this.audios.get( 'empty' ) );

		// animations

		this.mixer = new THREE.AnimationMixer( player.weapon );

		const shotClip = this.assetManager.animations.get( 'shot' );
		const shotAction = this.mixer.clipAction( shotClip );
		shotAction.loop = THREE.LoopOnce;

		this.animations.set( 'shot', shotAction );

		const reloadClip = this.assetManager.animations.get( 'reload' );
		const reloadAction = this.mixer.clipAction( reloadClip );
		reloadAction.loop = THREE.LoopOnce;

		this.animations.set( 'reload', reloadAction );

	}

	_initControls() {

		const player = this.player;

		this.controls = new FirstPersonControls( player );

		const intro = this.ui.intro;
		const crosshairs = this.ui.crosshairs;

		this.controls.addEventListener( 'lock', () => {

			intro.classList.add( 'hidden' );
			crosshairs.classList.remove( 'hidden' );

		} );

		this.controls.addEventListener( 'unlock', () => {

			intro.classList.remove( 'hidden' );
			crosshairs.classList.add( 'hidden' );

		} );

	}

	_initGround() {

		const groundMesh = this.assetManager.models.get( 'ground' );

		const vertices = groundMesh.geometry.attributes.position.array;
		const indices = groundMesh.geometry.index.array;

		const geometry = new YUKA.MeshGeometry( vertices, indices );
		const ground = new Ground( geometry );
		ground.setRenderComponent( groundMesh, sync );

		this.add( ground );

	}

	_initObstacles() {

		const obstacleMesh = this.assetManager.models.get( 'obstacle' );

		const vertices = obstacleMesh.geometry.attributes.position.array;
		const indices = obstacleMesh.geometry.index.array;

		const geometry = new YUKA.MeshGeometry( vertices, indices );

		for ( let i = 0; i < 16; i ++ ) {

			const mesh = obstacleMesh.clone();

			const obstacle = new CustomObstacle( geometry );

			const x = 24 - ( ( i % 4 ) * 12 );
			const z = 24 - ( Math.floor( i / 4 ) * 12 );

			obstacle.position.set( x, 0, z );
			obstacle.boundingRadius = 4;
			obstacle.setRenderComponent( mesh, sync );
			this.add( obstacle );

			if ( this.debug ) {

				const helperGeometry = new THREE.SphereBufferGeometry( obstacle.boundingRadius, 16, 16 );
				const helperMaterial = new THREE.MeshBasicMaterial( { color: 0xffffff, wireframe: true } );

				const helper = new THREE.Mesh( helperGeometry, helperMaterial );
				mesh.add( helper );

			}

		}

	}

	_initUI() {

		const loadingScreen = this.ui.loadingScreen;

		loadingScreen.classList.add( 'fade-out' );
		loadingScreen.addEventListener( 'transitionend', onTransitionEnd );

		this.refreshUI();

	}

}

function onTransitionEnd( event ) {

	event.target.remove();

}

function sync( entity, renderComponent ) {

	renderComponent.matrix.copy( entity.worldMatrix );

}

function syncCamera( entity, renderComponent ) {

	renderComponent.matrixWorld.copy( entity.worldMatrix );

}

function onWindowResize() {

	this.camera.aspect = window.innerWidth / window.innerHeight;
	this.camera.updateProjectionMatrix();

	this.renderer.setSize( window.innerWidth, window.innerHeight );

}

function onIntroClick() {

	if ( this.gameOver === false ) {

		this.controls.connect();
		this.started = true;

		const context = THREE.AudioContext.getContext();

		if ( context.state === 'suspended' ) context.resume();

	}

}

function animate() {

	requestAnimationFrame( this._animate );

	this.update();

}

export default new World();
