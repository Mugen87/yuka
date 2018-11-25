/**
 * @author robp94 / https://github.com/robp94
 */

const expect = require( 'chai' ).expect;
const YUKA = require( '../../../build/yuka.js' );

const Task = YUKA.Task;

describe( 'Task', function () {

	describe( '#execute()', function () {

		it( 'should exist', function () {

			const task = new Task();
			expect( task ).respondTo( 'execute' );
			task.execute();

		} );

	} );


} );
