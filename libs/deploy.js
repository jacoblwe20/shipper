var fs = require('fs'),
	spawn = require('child_process').spawn,
	Deps = require('./deps'),
	stream = require('stream'),
	Duplex = stream.Duplex,
	util = require('util'),
	Startup = require('./startup');

function Deploy ( dir ) {
	this.dir = dir;
	return this;
}
// inherit stream duplex
util.inherits( Deploy, Duplex );

Deploy.prototype.isRepo = function ( repoName, callback ) {
	fs.exists( this.dir + '/' + repoName, callback );
};

Deploy.prototype.handleUpdate = function ( callback ) {
	return function ( ) {
		new Deps( this.dir + '/' + this.repo, function ( ) {
			callback( );
		} );
	}.bind( this );
};

Deploy.prototype.startup = function ( callback ) {
	var startup = new Startup( this.dir + '/' + this.repo, callback );
};

Deploy.prototype.cloneRepo = function ( repoPath, callback ) {
	var error,
		clone,
		opts = {
			cwd : this.dir
		};

	clone = spawn( 'git', ['clone', repoPath], opts );
	clone.on( 'error', function ( err ) {
		this.emit('err', err )
	}. bind( this ));
	clone.stdout.pipe( this );
	clone.on( 'close', function ( ) {
		this.emit('close');
	}. bind( this ));
};

Deploy.prototype.pullRepo = function ( repo, callback ) {
	var error,
		pull,
		opts = {
			cwd : this.dir + '/' + repo.repo
		};
	
	pull = spawn( 'git', [ 'pull', repo.path, repo.branch ], opts );
	pull.on( 'error', function ( err ) {
		this.emit('err', err )
	}. bind( this ));
	pull.stdout.pipe( this );
	pull.on( 'close', function ( ) {
		this.emit('close');
	}. bind( this ));
};

Deploy.prototype.updateRepo = function ( repo, callback ) {
	var _this = this;
	this.repo = repo.repo;
	this.isRepo( repo.repo, function ( isRepo ) {
		if ( isRepo ) {
			return this.pullRepo( repo, this.handleUpdate( function ( ) {
				this.startup( callback );
			}.bind( this ) )); 
		}
		this.cloneRepo( repo.path , this.handleUpdate( function ( ) {
			this.startup( callback );
		}.bind( this ) ));
	}.bind( this ))
};

module.exports = Deploy;