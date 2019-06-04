var http = require('http'),
	db = require('./db'),
	app = require('./app');


http.createServer(app).listen(app.get('port'), function(){
  console.log('Visualization Widget - Sparql Server is listening on port: ' + app.get('port'));
});