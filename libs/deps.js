var spawn = require('child_process').spawn;

function Deps ( url, callback ) {
	this.url = url;
	console.log( this.url );
	this.removeDeps(function(){
		this.install( callback )
	}.bind( this ))
}

Deps.prototype.install = function ( callback ) {
	var install = spawn( 'npm', ['install'], { cwd : this.url } );
	install.stderr.on( 'data', function ( data ) {
		if ( !data || !data.length ) return;
		console.log( data.toString('utf8') );
	});
	install.stdout.on( 'data', function ( data ) {
		if ( !data || !data.length ) return;
		console.log( data.toString('utf8') );
	});
	install.on('close', function(){
		console.log('close');
		if ( callback ) callback ( );
	});
};

Deps.prototype.removeDeps = function ( callback ) {
	var rm = spawn( 'rm', ['-rf', this.url + '/node_modules' ] );
	rm.stderr.on( 'data', function ( data ) {
		if ( !data || !data.length ) return;
		console.log( data.toString('utf8') );
	});
	rm.stdout.on( 'data', function ( data ) {
		if ( !data || !data.length ) return;
		console.log( data.toString('utf8') );
	});
	rm.on('close', function(){
		console.log('close');
		callback( );
	});
};           

module.exports = Deps;