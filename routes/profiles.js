var express = require('express');
var router = express.Router();
var Profile = require("../schema/profile.js");

router.post('/', function(req, res, next) {
	//console.log(req);
	var researcher = req.body.researcher;
	console.log(researcher);
	var limit = req.body.limit;
	console.log(limit);
	var query = req.body.query;
	//console.log(uri);
	//console.log(req.body.researcher);
	//res.write('invalid uri given');
	//res.end();
	//res.json("{data='invalid'}");
	var resultPromise = Profile.queryKnowledgeBase(researcher,limit);
	resultPromise.then(function(result){
		console.log("fuseki query is done");
		res.status(200).json(result);
	});

});





module.exports = router;