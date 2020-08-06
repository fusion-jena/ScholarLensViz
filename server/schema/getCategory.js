//importing necessary modules
var request = require('request');
var Promise = require('promise');

//the getCategory SPARQL query
var my_sparql_query_getCategory = [
'SELECT DISTINCT ?superTopicEq WHERE{ ?CSOEntry <http://www.w3.org/2002/07/owl#sameAs> <',
			'',
			'>. ?CSOEntry <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://cso.kmi.open.ac.uk/schema/cso#Topic> . ?CSOEntry <http://cso.kmi.open.ac.uk/schema/cso#preferentialEquivalent> ?CSOTopic.?superTopic <http://cso.kmi.open.ac.uk/schema/cso#superTopicOf> ?CSOTopic . ?superTopic <http://cso.kmi.open.ac.uk/schema/cso#preferentialEquivalent> ?superTopicEq} LIMIT ',
			''];
/*"Main"-function of this .js document with 2 parameter */
exports.queryKnowledgeBase = function(researcher,uri,limit,fuseki){

	//logging in the console just for checking
	console.log("getCategory");
	console.log("uri:" + uri);
	console.log("limit:" + limit)
	console.log(researcher)


	//preparing the string-array by filling in the parameters
	my_sparql_query_getCategory[1]= uri;
	my_sparql_query_getCategory[3]= limit;


	/*preparation of the call by setting up the parameters url, query and queryUrl (which is the actual paramter for the post function) */
	//var url ='http://localhost:3030/R4/sparql';
	//var url = fuseki + '/' + researcher.split('/')[researcher.split('/').length-1] + '/sparql';
	var url = fuseki + '/sparql';
	var query = my_sparql_query_getCategory.join('');

	//this one goes into the request.post() function
	var queryUrl = url+"?query="+ encodeURIComponent(query) +"&format=json";


	/*declaration of a promise to make sure we wait for the asynchronous call to come back from fuseki
	--> else we wont get any result since we´re 2 fast

	the request itself throws an error or not (obvious) and sends the json as "body" which we resolve in our promise
	and send it back to the first .js to be send back to the user */
	var promise = new Promise(function(resolve,reject){
		request.post(queryUrl, function(error,response,body){
			if (!error && response.statusCode ==200){
				resolve(body);

			} else{
				console.log(response.statusCode);
				console.warn(error);
				reject(error);
			}

		});
	});
	//the returned promise which is fulfilled when the actual result comes in
	return promise;
};
