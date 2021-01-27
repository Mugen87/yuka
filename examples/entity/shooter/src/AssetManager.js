/**
 * @author Mugen87 / https://github.com/Mugen87
 */

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.109/build/three.module.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.109/examples/jsm/loaders/GLTFLoader.js';

class AssetManager {

	constructor() {

		this.loadingManager = new THREE.LoadingManager();

		this.audioLoader = new THREE.AudioLoader( this.loadingManager );
		this.textureLoader = new THREE.TextureLoader( this.loadingManager );
		this.gltfLoader = new GLTFLoader( this.loadingManager );

		this.listener = new THREE.AudioListener();

		this.animations = new Map();
		this.audios = new Map();
		this.models = new Map();

	}

	init() {

		this._loadAudios();
		this._loadModels();
		this._loadAnimations();

		const loadingManager = this.loadingManager;

		return new Promise( ( resolve ) => {

			loadingManager.onLoad = () => {

				resolve();

			};

		} );

	}

	_loadAudios() {

		const audioLoader = this.audioLoader;
		const audios = this.audios;
		const listener = this.listener;

		const step1 = new THREE.Audio( listener );
		const step2 = new THREE.Audio( listener );
		const shot = new THREE.PositionalAudio( listener );
		const reload = new THREE.PositionalAudio( listener );
		const impact1 = new THREE.PositionalAudio( listener );
		const impact2 = new THREE.PositionalAudio( listener );
		const impact3 = new THREE.PositionalAudio( listener );
		const impact4 = new THREE.PositionalAudio( listener );
		const impact5 = new THREE.PositionalAudio( listener );
		const empty = new THREE.PositionalAudio( listener );

		shot.setVolume( 0.3 );
		reload.setVolume( 0.1 );
		empty.setVolume( 0.3 );

		audioLoader.load( './audio/step1.ogg', buffer => step1.setBuffer( buffer ) );
		audioLoader.load( './audio/step2.ogg', buffer => step2.setBuffer( buffer ) );
		audioLoader.load( './audio/shot.ogg', buffer => shot.setBuffer( buffer ) );
		audioLoader.load( './audio/reload.ogg', buffer => reload.setBuffer( buffer ) );
		audioLoader.load( './audio/impact1.ogg', buffer => impact1.setBuffer( buffer ) );
		audioLoader.load( './audio/impact2.ogg', buffer => impact2.setBuffer( buffer ) );
		audioLoader.load( './audio/impact3.ogg', buffer => impact3.setBuffer( buffer ) );
		audioLoader.load( './audio/impact4.ogg', buffer => impact4.setBuffer( buffer ) );
		audioLoader.load( './audio/impact5.ogg', buffer => impact5.setBuffer( buffer ) );
		audioLoader.load( './audio/empty.ogg', buffer => empty.setBuffer( buffer ) );

		audios.set( 'step1', step1 );
		audios.set( 'step2', step2 );
		audios.set( 'shot', shot );
		audios.set( 'reload', reload );
		audios.set( 'impact1', impact1 );
		audios.set( 'impact2', impact2 );
		audios.set( 'impact3', impact3 );
		audios.set( 'impact4', impact4 );
		audios.set( 'impact5', impact5 );
		audios.set( 'empty', empty );

	}

	_loadModels() {

		const gltfLoader = this.gltfLoader;
		const textureLoader = this.textureLoader;
		const models = this.models;

		// target

		gltfLoader.load( './model/target.glb', ( gltf ) => {

			const targetMesh = gltf.scene.getObjectByName( 'LowPoly003__0' );
			targetMesh.geometry.scale( 0.5, 0.5, 0.5 );
			targetMesh.geometry.rotateX( Math.PI * 0.5 );
			targetMesh.geometry.rotateY( Math.PI );
			targetMesh.geometry.rotateZ( Math.PI );
			targetMesh.matrixAutoUpdate = false;
			targetMesh.castShadow = true;

			models.set( 'target', targetMesh );

		} );

		// weapon

		gltfLoader.load( './model/gun.glb', ( gltf ) => {

			const weaponMesh = gltf.scene.getObjectByName( 'BaseMesh' ).children[ 0 ];
			weaponMesh.geometry.scale( 0.1, 0.1, 0.1 );
			weaponMesh.geometry.rotateX( Math.PI * - 0.5 );
			weaponMesh.geometry.rotateY( Math.PI * 0.5 );
			weaponMesh.matrixAutoUpdate = false;

			models.set( 'weapon', weaponMesh );

			//

			const texture = textureLoader.load( 'model/muzzle.png' );

			const material = new THREE.SpriteMaterial( { map: texture } );
			const sprite = new THREE.Sprite( material );

			sprite.position.set( 0, 0.13, - 0.4 );
			sprite.scale.set( 0.3, 0.3, 0.3 );
			sprite.visible = false;

			models.set( 'muzzle', sprite );
			weaponMesh.add( sprite );

		} );

		// bullet hole

		const texture = textureLoader.load( 'model/bulletHole.png' );
		texture.minFilter = THREE.LinearFilter;
		const bulletHoleGeometry = new THREE.PlaneBufferGeometry( 0.1, 0.1 );
		const bulletHoleMaterial = new THREE.MeshLambertMaterial( { map: texture, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: - 4 } );

		const bulletHole = new THREE.Mesh( bulletHoleGeometry, bulletHoleMaterial );
		bulletHole.matrixAutoUpdate = false;

		models.set( 'bulletHole', bulletHole );

		// bullet line

		const bulletLineGeometry = new THREE.BufferGeometry();
		const bulletLineMaterial = new THREE.LineBasicMaterial( { color: 0xfbf8e6 } );

		bulletLineGeometry.setFromPoints( [ new THREE.Vector3(), new THREE.Vector3( 0, 0, - 1 ) ] );

		const bulletLine = new THREE.LineSegments( bulletLineGeometry, bulletLineMaterial );
		bulletLine.matrixAutoUpdate = false;

		models.set( 'bulletLine', bulletLine );

		// ground

		const groundGeometry = new THREE.PlaneBufferGeometry( 200, 200 );
		groundGeometry.rotateX( - Math.PI / 2 );
		const groundMaterial = new THREE.MeshPhongMaterial( { color: 0x999999 } );

		const groundMesh = new THREE.Mesh( groundGeometry, groundMaterial );
		groundMesh.matrixAutoUpdate = false;
		groundMesh.receiveShadow = true;

		models.set( 'ground', groundMesh );

	}

	_loadAnimations() {

		const animations = this.animations;

		// manually create some keyframes for testing

		let positionKeyframes, rotationKeyframes;
		let q0, q1, q2;

		// shot

		positionKeyframes = new THREE.VectorKeyframeTrack( '.position', [ 0, 0.05, 0.15, 0.3 ], [
			0.3, - 0.3, - 1,
			0.3, - 0.2, - 0.7,
			0.3, - 0.305, - 1,
		 	0.3, - 0.3, - 1 ]
		);

		q0 = new THREE.Quaternion();
		q1 = new THREE.Quaternion().setFromAxisAngle( new THREE.Vector3( 1, 0, 0 ), 0.2 );
		q2 = new THREE.Quaternion().setFromAxisAngle( new THREE.Vector3( 1, 0, 0 ), - 0.02 );

		rotationKeyframes = new THREE.QuaternionKeyframeTrack( '.rotation', [ 0, 0.05, 0.15, 0.3 ], [
			q0.x, q0.y, q0.z, q0.w,
			q1.x, q1.y, q1.z, q1.w,
			q2.x, q2.y, q2.z, q2.w,
			q0.x, q0.y, q0.z, q0.w ]
		);

		const shotClip = new THREE.AnimationClip( 'Shot', 0.3, [ positionKeyframes, rotationKeyframes ] );
		animations.set( 'shot', shotClip );

		// reload

		positionKeyframes = new THREE.VectorKeyframeTrack( '.position', [ 0, 0.2, 1.3, 1.5 ], [
			0.3, - 0.3, - 1,
			0.3, - 0.6, - 1,
			0.3, - 0.6, - 1,
			0.3, - 0.3, - 1 ]
		);

		q1 = new THREE.Quaternion().setFromAxisAngle( new THREE.Vector3( 1, 0, 0 ), - 0.4 );

		rotationKeyframes = new THREE.QuaternionKeyframeTrack( '.rotation', [ 0, 0.2, 1.3, 1.5 ], [
			q0.x, q0.y, q0.z, q0.w,
			q1.x, q1.y, q1.z, q1.w,
			q1.x, q1.y, q1.z, q1.w,
			q0.x, q0.y, q0.z, q0.w ]
		);

		const reloadClip = new THREE.AnimationClip( 'Reload', 1.5, [ positionKeyframes, rotationKeyframes ] );
		animations.set( 'reload', reloadClip );

	}

}

export { AssetManager };
