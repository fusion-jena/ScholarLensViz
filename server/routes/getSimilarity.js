//importing necessary modules
var request = require('request');
var Promise = require('promise');
var express = require('express');
var router = express.Router();

//implementing our getUriCounts.js where the actual fuseki-sparql-query is done
var SimValue = require("../schema/getSimilarity.js");


/*the main function in which we catch the incoming data and calling the "queryKnowledgeBase" function
in the relating .js document via a promise to make asynchronous calls work */
router.post('/', function(req, res, next) {

	//in the first query we just need researcher and limit
	var word1 = req.body.word1;
	var word2 = req.body.word2;	

	
	var resultPromise = SimValue.queryKnowledgeBase(word1,word2);
		resultPromise.then(function(result){
			console.log("fuseki query is done");
			res.status(200).json(result);
		});

});

module.exports = router;