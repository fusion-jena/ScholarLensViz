//importing necessary modules
var express = require('express');
var router = express.Router();

//implementing our getLabelComment.js where the actual fuseki-sparql-query is done
var LabelComment = require("../schema/getLabelComments.js");


/*the main function in which we catch the incoming data and calling the "queryKnowledgeBase" function
in the relating .js document via a promise to make asynchronous calls work */
router.post('/', function(req, res, next) {

	//we just need the uri in this function
	var researcher = req.body.researcher;
	var uri = req.body.uri;
	var fuseki = req.body.fuseki;

	//TODO: implement security checks e.g. more data incoming --> fault etc?!


	//calling the queryKnowledgeBase-function and returning the json-data via "res"
	var resultPromise = LabelComment.queryKnowledgeBase(researcher, uri, fuseki);
	resultPromise.then(function(result){
		console.log("fuseki query is done");
		res.status(200).json(result);
	});

});

module.exports = router;
