require('dotenv').load();

var pushover = require('pushover'),
	fs = require('fs'),
	repodir = __dirname + process.env.REPOS,
	deploydir = __dirname + process.env.DEPLOYS,
	repos = pushover( repodir );
	deploy = new (require('./libs/deploy'))( deploydir );

repos.on('push', function (push) {
    console.log('push ' + push.repo + '/' + push.commit
        + ' (' + push.branch + ')' );
    
    push.accept( );
    //console.log(fs.readdirSync( __dirname + '/tmp/' + push.repo ))
	push.once('exit', function ( ) {
		// deploy logic
		push.path = repodir + '/' + push.repo + '.git';
		deploy.updateRepo( push , function( err ){
			if ( err ) return console.log( err )
			console.log('repo updated')
		})
	})
});


repos.on('fetch', function (fetch) {
    console.log('fetch ' + fetch.commit);
    fetch.accept();
});

var http = require('http');
var server = http.createServer(function (req, res) {
    repos.handle(req, res);
});

server.listen(7000);
console.log( 'Server started at port ' + 7000 );