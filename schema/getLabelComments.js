//importing necessary modules
var request = require('request');
var Promise = require('promise');


//the LabelComment sparql-query in form of a string-array to fill in the variable data
var my_sparql_query_LabelComment = [
								'PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> SELECT ?label ?comment WHERE{ SERVICE <http://dbpedia.org/sparql>{<',
                                '',
                                '> rdfs:label ?label . <',
                                '',
                                '> rdfs:comment ?comment .} FILTER langMatches( lang(?label), "en" ) FILTER langMatches( lang(?comment), "en" ) FILTER langMatches( lang(?comment), "en" )} '];

								
/*"Main"-function of this .js document with 1 parameter */
exports.queryKnowledgeBase = function(uri){
	
	//logging in the console just for checking
	console.log("Heeey :) I am getting label and comments now for: ");
	console.log(uri);
	
	
	//preparing the string-array by filling in the parameters
	my_sparql_query_LabelComment[1]= uri;
	my_sparql_query_LabelComment[3]= uri;
	
	
	/*preparation of the call by setting up the parameters url, query and queryUrl (which is the actual paramter for the post function) */
	var url ='http://localhost:3030/usermodel/sparql';
	var query = my_sparql_query_LabelComment.join('');
	
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
