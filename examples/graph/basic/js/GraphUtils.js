/**
 * @author Mugen87 / https://github.com/Mugen87
 */

class GraphUtils {

	static createGridLayout( size, segments ) {

		const graph = new YUKA.Graph();
		graph.digraph = true;

		const halfSize = size / 2;
		const segmentSize = size / segments;

		// nodes

		let index = 0;

		for ( let i = 0; i <= segments; i ++ ) {

			const z = ( i * segmentSize ) - halfSize;

			for ( let j = 0; j <= segments; j ++ ) {

				const x = ( j * segmentSize ) - halfSize;

				const position = new YUKA.Vector3( x, 0, z );

				const node = new YUKA.NavNode( index, position );

				graph.addNode( node );

				index ++;

			}

		}

		// edges

		const count = graph.getNodeCount();
		const segmentSizeSquared = ( segmentSize * segmentSize ) + Number.EPSILON;

		for ( let i = 0; i < count; i ++ ) {

			const node = graph.getNode( i );

			// check distance to all other nodes

			for ( let j = 0; j < count; j ++ ) {

				if ( i !== j ) {

					const neighbor = graph.getNode( j );

					const distanceSquared = neighbor.position.distanceToSquared( node.position );

					if ( distanceSquared <= segmentSizeSquared ) {

						const distance = Math.sqrt( distanceSquared );

						const edge = new YUKA.NavEdge( i, j, distance );

						graph.addEdge( edge );

					}

				}

			}

		}

		return graph;

	}

	static createGraphHelper( graph, nodeSize = 1, nodeColor = 0x4e84c4, edgeColor = 0xffffff ) {

		const group = new THREE.Group();

		// nodes

		const nodeMaterial = new THREE.MeshBasicMaterial( { color: nodeColor } );
		const nodeGeomety = new THREE.IcosahedronBufferGeometry( nodeSize, 2 );

		const nodes = [];

		graph.getNodes( nodes );

		for ( let node of nodes ) {

			const nodeMesh = new THREE.Mesh( nodeGeomety, nodeMaterial );
			nodeMesh.position.copy( node.position );
			nodeMesh.userData.nodeIndex = node.index;

			nodeMesh.matrixAutoUpdate = false;
			nodeMesh.updateMatrix();

			group.add( nodeMesh );

		}

		// edges

		const edgesGeometry = new THREE.BufferGeometry();
		const position = [];

		const edgesMaterial = new THREE.LineBasicMaterial( { color: edgeColor } );

		const edges = [];

		for ( let node of nodes ) {

			graph.getEdgesOfNode( node.index, edges );

			for ( let edge of edges ) {

				const fromNode = graph.getNode( edge.from );
				const toNode = graph.getNode( edge.to );

				position.push( fromNode.position.x, fromNode.position.y, fromNode.position.z );
				position.push( toNode.position.x, toNode.position.y, toNode.position.z );

			}

		}

		edgesGeometry.addAttribute( 'position', new THREE.Float32BufferAttribute( position, 3 ) );

		const lines = new THREE.LineSegments( edgesGeometry, edgesMaterial );
		lines.matrixAutoUpdate = false;

		group.add( lines );

		return group;

	}

	static createPathHelper( graph, path, nodeSize, color = 0x00ff00 ) {

		const group = new THREE.Group();

		// nodes

		const startNodeMaterial = new THREE.MeshBasicMaterial( { color: 0xff0000 } );
		const endNodeMaterial = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
		const nodeGeomety = new THREE.IcosahedronBufferGeometry( nodeSize, 2 );

		const startNodeMesh = new THREE.Mesh( nodeGeomety, startNodeMaterial );
		const endNodeMesh = new THREE.Mesh( nodeGeomety, endNodeMaterial );

		const startNode = graph.getNode( path[ 0 ] );
		const endNode = graph.getNode( path[ path.length - 1 ] );

		startNodeMesh.position.copy( startNode.position );
		endNodeMesh.position.copy( endNode.position );

		group.add( startNodeMesh );
		group.add( endNodeMesh );

		// edges

		const edgesGeometry = new THREE.BufferGeometry();
		const position = [];

		const edgesMaterial = new THREE.LineBasicMaterial( { color: color } );

		for ( let i = 0, l = path.length - 1; i < l; i ++ ) {

			const fromNode = graph.getNode( path[ i ] );
			const toNode = graph.getNode( path[ i + 1 ] );

			position.push( fromNode.position.x, fromNode.position.y, fromNode.position.z );
			position.push( toNode.position.x, toNode.position.y, toNode.position.z );

		}

		edgesGeometry.addAttribute( 'position', new THREE.Float32BufferAttribute( position, 3 ) );

		const lines = new THREE.LineSegments( edgesGeometry, edgesMaterial );
		lines.matrixAutoUpdate = false;

		group.add( lines );

		return group;

	}

	static createSearchTreeHelper( graph, searchTree, color = 0xff0000 ) {

		const geometry = new THREE.BufferGeometry();
		const position = [];

		const material = new THREE.LineBasicMaterial( { color: color } );

		for ( let edge of searchTree ) {

			const fromNode = graph.getNode( edge.from );
			const toNode = graph.getNode( edge.to );

			position.push( fromNode.position.x, fromNode.position.y, fromNode.position.z );
			position.push( toNode.position.x, toNode.position.y, toNode.position.z );

		}

		geometry.addAttribute( 'position', new THREE.Float32BufferAttribute( position, 3 ) );

		const lines = new THREE.LineSegments( geometry, material );
		lines.matrixAutoUpdate = false;

		return lines;

	}

}
