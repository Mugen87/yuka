/**
 * @author Mugen87 / https://github.com/Mugen87
 */

class FuzzySetRenderer {

	constructor( canvas ) {

		this.canvas = canvas;
		this.context = canvas.getContext( '2d' );

		this.viewport = {
			x: 0,
			y: 0,
			width: canvas.width,
			height: canvas.height
		};

	}

	setViewport( x, y, width, height ) {

		const viewport = this.viewport;

		viewport.x = x;
		viewport.y = y;
		viewport.width = width;
		viewport.height = height;

		return this;

	}

	draw( fuzzySet ) {

		const viewport = this.viewport;

		const width = viewport.width;
		const height = viewport.height;
		const xOffset = viewport.x;
		const yOffset = viewport.y;

		const context = this.context;

		// draw membership function

		const widthScale = ( width / ( fuzzySet.right - fuzzySet.left ) );

		let start = true;

		for ( let x = 0; x <= width; x ++ ) {

			const value = fuzzySet.left + ( x / widthScale );
			const dom = fuzzySet.computeDegreeOfMembership( value );
			const y = height - ( dom * height ); // (0,0) is top-left

			if ( start ) {

				context.moveTo( xOffset + x, yOffset + y );
				start = false;

			} else {

				context.lineTo( xOffset + x, yOffset + y );

			}

		}

		context.strokeStyle = '#ee0808';
		context.lineWidth = 2;
		context.stroke();

		// draw coordinate axes

		context.beginPath();
		context.moveTo( xOffset, yOffset + height );
		context.lineTo( xOffset + width, yOffset + height );
		context.strokeStyle = '#000000';
		context.stroke(); // x-axis

		context.beginPath();
		context.moveTo( xOffset, yOffset + height );
		context.lineTo( xOffset, yOffset );
		context.strokeStyle = '#000000';
		context.stroke(); // y-axis

		// draw title

		context.beginPath();
		context.font = '16px Arial';
		context.textAlign = 'center';
		context.fillText( fuzzySet.constructor.name, xOffset + width / 2, yOffset + height - 16 );

		return this;

	}

}

export { FuzzySetRenderer };
