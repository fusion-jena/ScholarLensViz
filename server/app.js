var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var cors = require('cors')


/*SPOT 1:	HERE TO ADD NEW ROUTES FOR DIFFERENT QUERIES in form of:
var YOUR_VAR = require('./routes/YOUR_SCHEMA');
*/

var getUriCount = require('./routes/getUriCount');
var getLabelComment = require('./routes/getLabelComment');
var getCompRecSentence = require('./routes/getCompRecSentence');
var getSimilarity = require('./routes/getSimilarity');
var getCategory = require('./routes/getCategory');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'jade');



// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '/views')));
app.set('port', process.env.PORT || 3666);
app.use(cors())



app.get('/', function(request, response){
    //app.render('index', {option: 'value'});
	response.sendfile('views/index.html');
});

app.use('/getUriCount', getUriCount);
app.use('/getLabelComment', getLabelComment);
app.use('/getCompRecSentence', getCompRecSentence);
app.use('/getSimilarity', getSimilarity);
app.use('/getCategory', getCategory);

module.exports = app;
