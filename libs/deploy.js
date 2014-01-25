var fs = require('fs');
var spawn = require('child_process').exec;

function Deploy ( dir ) {
	this.dir = dir;
	return this;
}

Deploy.prototype.isRepo = function ( repoName, callback ) {
	fs.exists( this.dir + '/' + repoName, callback );
};

Deploy.prototype.cloneRepo = function ( repoPath, callback ) {
	var error;
	var clone = spawn('cd ' + this.dir + '; git clone ' + repoPath, 
		function ( err, stdout, stderr ) {
		    if (err !== null) {
		      error = err;
		    }
			console.log('stdout: ' + stdout);
	} );
	clone.on("close", function ( ) {
		callback ( error );
	});
};

Deploy.prototype.pullRepo = function ( repo, callback ) {
	var error,
		pull = spawn(
			'cd ' + this.dir + '/' + repo.repo +
			'; git pull ' + repo.path + ' ' + repo.branch, 
			function ( err, stdout, stderr ) {
			    if (err !== null) {
			      error = err;
			    }
				console.log('stdout: ' + stdout);
			}
		);
	pull.on("close", function ( ) {
		callback ( error );
	});
};

Deploy.prototype.updateRepo = function ( repo, callback ) {
	var _this = this;
	_this.isRepo( repo.repo, function ( isRepo ) {
		console.log( _this.dir + '/' + repo.repo, isRepo );
		if ( isRepo ) {
			return _this.pullRepo( repo, callback ) 
		}
		_this.cloneRepo( repo.path , callback );
	})
};

module.exports = Deploy;