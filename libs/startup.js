/*
This file is to do the last few parts of deploying
first we need to run test specified in `package.json.scripts.test`
then run a start script, i think for now just generate a open port 
and run. Might be a good idea to use forever or something to manage 
the lower level work like pid mamangment.
*/

var spawn = require('child_process').spawn;

function Startup ( url ) {
	this.url = url;
	this.readPackage( );
}

Startup.prototype.readPackage = function ( ) {
	var pkg;
	try {
		pkg = require( this.url + '/package.json' );
	} catch ( e ) {
		console.log('Cannot read package.json');
	}

	if ( !pkg ) return;

	this.scripts = pkg.scripts;
	if ( this.scripts.test ) {
		// run test then startup based off of success
	}

	if ( this.scripts.start ) {
		this.start( this.scripts.start );
	}
};

Startup.prototype.test = function ( callback ) {
	var test = spawn( 'npm', ['test'] );
	test.stdout.on('data', function ( data ) {
		console.log( 'stdout:', data.toString('utf8') );
	});
	test.stderr.on('data', function ( data ) {
		console.log( 'stderr:', data.toString('utf8') );
	});
	test.on('close', function ( data ) {
		if ( callback ) callback( );
		console.log( 'Testing done' );
	});
};

Startup.prototype.start = function ( script, callback ) {
	// allow only one command
	var commands = script.split(/\;/)[0],
		application,
		start;


	if ( commands ) {
		commands = commands.split(/ /);
		application = commands.shift( );
	}
	console.log( application, commands, this.url );
	start = spawn( application, commands, { 
		cwd : this.url 
	});

	start.stdout.on('data', function ( data ) {
		console.log( data.toString('utf8') );
	});

	start.stderr.on('data', function ( data ) {
		console.log( data.toString('utf8') );
	});

	start.on('close', function ( ) {
		console.log('close start')
	});
};

module.exports = Startup;

//10 ~ this is mine