//importing necessary modules
var express = require('express');
var router = express.Router();

//implementing our getCompRecSentence.js where the actual fuseki-sparql-query is done
var CompRecSentence = require("../schema/getCompRecSentences.js");


/*the main function in which we catch the incoming data and calling the "queryKnowledgeBase" function
in the relating .js document via a promise to make asynchronous calls work */
router.post('/', function(req, res, next) {

	//in this query we get the researcher and the uri
	var researcher = req.body.researcher;
	var uri = req.body.uri;
	var fuseki = req.body.fuseki;

	//TODO: implement security checks e.g. more data incoming --> fault etc?!


	//calling the queryKnowledgeBase-function and returning the json-data via "res"
	var resultPromise = CompRecSentence.queryKnowledgeBase(researcher,uri,fuseki);
	resultPromise.then(function(result){
		console.log("fuseki query is done");
		console.log(JSON.parse(result));
		res.status(200).json(result);
	});

});

module.exports = router;
