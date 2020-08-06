//importing necessary modules
var express = require('express');
var router = express.Router();

//implementing our getUriCounts.js where the actual fuseki-sparql-query is done
var UriCount = require("../schema/getUriCounts.js");


/*the main function in which we catch the incoming data and calling the "queryKnowledgeBase" function
in the relating .js document via a promise to make asynchronous calls work */
router.post('/', function(req, res, next) {

	//in the first query we just need researcher and limit
	var researcher = req.body.researcher;
	var limit = req.body.limit;
	var fuseki = req.body.fuseki;
	console.log(fuseki)

	//TODO: implement security checks e.g. more data incoming --> fault etc?!


	//calling the queryKnowledgeBase-function and returning the json-data via "res"
	var resultPromise = UriCount.queryKnowledgeBase(researcher,limit,fuseki);
	resultPromise.then(function(result){
		console.log("fuseki query is done");
		res.status(200).json(result);
	});

});

module.exports = router;
