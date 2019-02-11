/**
 * @author robp94 / https://github.com/robp94
 */

const expect = require( 'chai' ).expect;
const YUKA = require( '../../../build/yuka.js' );

const Task = YUKA.Task;
const TaskQueue = YUKA.TaskQueue;

// mock for requestIdleCallback

global.requestIdleCallback = ( handler ) => {

	let time = 2;

	return setTimeout( () => {

		handler( {
			timeRemaining: () => {

				return time --;

			}
		} );

	}, 1 );

};

describe( 'TaskQueue', function () {

	describe( '#constructor()', function () {

		it( 'should create an object with correct default values', function () {

			const taskQueue = new TaskQueue();
			expect( taskQueue ).to.have.a.property( 'tasks' ).that.is.an( 'array' );
			expect( taskQueue ).to.have.a.property( 'options' ).that.is.an( 'object' );
			expect( taskQueue ).to.have.a.property( '_active' ).that.is.false;
			expect( taskQueue ).to.have.a.property( '_handler' ).that.is.a( 'function' );
			expect( taskQueue ).to.have.a.property( '_taskHandle' ).that.is.equal( 0 );

		} );

	} );

	describe( '#enqueue()', function () {

		it( 'should add a task to the internal queue', function () {

			const taskQueue = new TaskQueue();
			const task1 = new Task();
			const task2 = new Task();
			const task3 = new Task();

			taskQueue.enqueue( task1 );
			taskQueue.enqueue( task2 );
			taskQueue.enqueue( task3 );

			expect( taskQueue.tasks ).to.have.ordered.members( [ task1, task2, task3 ] );

		} );

	} );

	describe( '#update()', function () {

		it( 'should set the internal active flag to false if no tasks are in the internal queue', function () {

			const taskQueue = new TaskQueue();
			taskQueue._active = true;

			taskQueue.update();

			expect( taskQueue._active ).to.be.false;

		} );

		it( 'should not call requestIdleCallback() if idle processing is already active', function () {

			const taskQueue = new TaskQueue();
			const task = new Task();

			taskQueue.enqueue( task );
			taskQueue._active = true;
			taskQueue._taskHandle = 99;
			taskQueue.update();

			expect( taskQueue._taskHandle ).to.equal( 99 );

		} );

		it( 'should call requestIdleCallback() if idle processing is not active', function ( done ) {

			const taskQueue = new TaskQueue();
			const task = new CustomTask( () => {

				expect( taskQueue._active ).to.be.true;
				expect( taskQueue._taskHandle ).to.not.equal( 0 );
				expect( task.executed ).to.be.true;

			} );

			taskQueue.enqueue( task );
			taskQueue.update();

			setTimeout( () => {

				expect( taskQueue._active ).to.be.false;
				expect( taskQueue._taskHandle ).to.equal( 0 );

				done();

			}, 100 );

		} );

		it( 'should stop processing tasks if no idle time is left and call requestIdleCallback() again', function ( done ) {

			const taskQueue = new TaskQueue();
			const task1 = new CustomTask();
			const task2 = new CustomTask();
			const task3 = new CustomTask();

			taskQueue.enqueue( task1 );
			taskQueue.enqueue( task2 );
			taskQueue.enqueue( task3 );

			taskQueue.update();

			setTimeout( () => {

				expect( task1.executed ).to.be.true;
				expect( task2.executed ).to.be.true;
				expect( task3.executed ).to.be.true;

				done();

			}, 100 );

		} );

	} );

} );

//

class CustomTask extends Task {

	constructor( callback = null ) {

		super();

		this.callback = callback;
		this.executed = false;

	}

	execute() {

		this.executed = true;

		if ( this.callback !== null ) this.callback();

	}

}
