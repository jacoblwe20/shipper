var fs = require('fs'),
	spawn = require('child_process').spawn,
	Deps = require('./deps');

function Deploy ( dir ) {
	this.dir = dir;
	return this;
}

Deploy.prototype.isRepo = function ( repoName, callback ) {
	fs.exists( this.dir + '/' + repoName, callback );
};

Deploy.prototype.handleUpdate = function ( callback ) {
	return function ( ) {
		new Deps( this.dir + '/' + this.repo, function ( ) {
			callback( );
		} );
	}.bind( this );
}

Deploy.prototype.cloneRepo = function ( repoPath, callback ) {
	var error,
		clone,
		opts = {
			cwd : this.dir
		};

	clone = spawn( 'git', ['clone', repoPath], opts );
	clone.on( 'error', function ( e ) {
		error = e;
		console.log( 'Error:', e );
	})
	clone.stdout.on( 'data', function ( data ) {
		console.log( 'stdout: ' + data );
	})
	clone.on("close", function ( ) { 
		// install deps
		callback ( error );
	});
};

Deploy.prototype.pullRepo = function ( repo, callback ) {
	var error,
		pull,
		opts = {
			cwd : this.dir + '/' + repo.repo
		};
	
	pull = spawn( 'git', [ 'pull', repo.path, repo.branch ], opts );
	pull.on( 'error', function ( e ) {
		error = e;
		console.log( 'Error:', e );
	})
	pull.stdout.on( 'data', function ( data ) {
		console.log( 'stdout: ' + data );
	})
	pull.on("close", function ( ) { 
		callback ( error );
	});
};

Deploy.prototype.updateRepo = function ( repo, callback ) {
	var _this = this;
	this.repo = repo.repo;
	this.isRepo( repo.repo, function ( isRepo ) {
		if ( isRepo ) {
			return this.pullRepo( repo, this.handleUpdate( callback ) ) 
		}
		this.cloneRepo( repo.path , this.handleUpdate( callback ) );
	}.bind( this ))
};

module.exports = Deploy;