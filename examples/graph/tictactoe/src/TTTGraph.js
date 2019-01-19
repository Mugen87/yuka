/**
* This class represents an implementation of the MinMax algorithm for Tic-Tac-Toe. It is based
* on the generic graph class of Yuka and enables an optimal play behavior of the AI.
*
* More information about MinMax right here: https://www.youtube.com/watch?v=5oXyibEgJr0
*
* @author robp94 / https://github.com/robp94
*/

import { Graph } from '../../../../build/yuka.module.js';
import { TTTNode } from './TTTNode.js';
import { TTTEdge } from './TTTEdge.js';

const arrayTurn = [];

class TTTGraph extends Graph {

	constructor( humanPlayer = 1 ) {

		super();
		this.digraph = true;

		this.nodeMap = new Map(); // used for fast lookup, [node.value, node.index]
		this.currentNode = - 1;
		this.nextNode = 0;

		this.currentPlayer = 1;
		this.aiPlayer = this.nextPlayer( humanPlayer );

		this.init( );

	}

	init( ) {

		const node = new TTTNode( this.nextNode ++ );

		this.addNode( node );
		this.currentNode = node.index;

		// start generation of game state graph

		this.generate( node.index, this.currentPlayer );

	}

	addNode( node ) {

		this.nodeMap.set( node.value, node.index );
		return super.addNode( node );

	}

	generate( nodeIndex, activePlayer ) {

		const node = this.getNode( nodeIndex );
		const weights = [];

		for ( let i = 0; i < 9; i ++ ) {

			if ( node.board[ i ] === 9 ) {

				// determine the next board and check if there is already a
				// respective node

				const nextBoard = this.getNextBoard( node, i, activePlayer );
				let activeNodeIndex = this.findNode( nextBoard );

				if ( activeNodeIndex === - 1 ) {

					// there is no node representing the next board so let's create
					// a new one

					const nextNode = new TTTNode( this.nextNode ++, nextBoard );
					this.addNode( nextNode );
					activeNodeIndex = nextNode.index;

					// link the current node to the next one

					const edge = new TTTEdge( nodeIndex, activeNodeIndex, i, activePlayer );
					this.addEdge( edge );

					// check if the next node represents a finished game

					if ( nextNode.finished === true ) {

						// if so, then compute the weight for this node and store it
						// in the current weights array

						this.computeWeight( nextNode );
						weights.push( nextNode.weight );

					} else {

						// if not, recursively call "generate()" to continue the build of the graph

						weights.push( this.generate( activeNodeIndex, this.nextPlayer( activePlayer ) ) );

					}

				} else {

					// there is already a node representing the next board
					// in this case we should link to it with a new edge and update the weights

					const edge = new TTTEdge( nodeIndex, activeNodeIndex, i, activePlayer );
					this.addEdge( edge );

					const nextNode = this.getNode( activeNodeIndex );
					weights.push( nextNode.weight );

				}

			}

		}

		// update weight for the current node

		if ( activePlayer === this.aiPlayer ) {

			node.weight = Math.max( ...weights );
			return node.weight;

		} else {

			node.weight = Math.min( ...weights );
			return node.weight;

		}

	}

	aiTurn() {

		const currentWeight = this.getNode( this.currentNode ).weight;

		// perform best possible move

		const possibleMoves = [];
		this.getEdgesOfNode( this.currentNode, possibleMoves );
		let bestMove;

		for ( let i = 0, l = possibleMoves.length; i < l; i ++ ) {

			const move = possibleMoves[ i ];
			const node = this.getNode( move.to );

			if ( node.weight === currentWeight ) {

				// check if the AI can immediately finish the game

				if ( node.finished ) {

					// if so, perform the move

					this.turn( move.cell, this.aiPlayer );
					return;

				} else if ( bestMove === undefined ) {

					// otherwise save it if no better move is found

					bestMove = move;

				}


			}

		}

		this.turn( bestMove.cell, this.aiPlayer );

	}

	getNextBoard( node, cell, player ) {

		const board = node.board.slice();
		board[ cell ] = player;

		return board;

	}

	nextPlayer( currentPlayer ) {

		return ( currentPlayer % 2 ) + 1;

	}

	findNode( board ) {

		const value = parseInt( board.join( '' ), 10 );
		const node = this.nodeMap.get( value );

		return node ? node : - 1;

	}

	turn( cell, player ) {

		arrayTurn.length = 0;
		this.getEdgesOfNode( this.currentNode, arrayTurn );

		for ( let i = 0, l = arrayTurn.length; i < l; i ++ ) {

			const edge = arrayTurn[ i ];

			if ( edge.cell == cell && edge.player === player ) {

				this.currentNode = edge.to;
				this.currentPlayer = this.nextPlayer( player );
				break;

			}

		}

	}

	// called for node that represents an end of the game (win/draw)

	computeWeight( node ) {

		if ( node.win ) {

			if ( node.winPlayer === this.aiPlayer ) {

				node.weight = 100;

			} else {

				node.weight = - 100;

			}

		} else {

			node.weight = 0;

		}

	}

}

export { TTTGraph };
