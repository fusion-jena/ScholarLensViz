var request = require('request');
var Promise = require('promise');
//var querystring = require('querystring');

//var exports = module.exports = {};
//var result;


//sparql query here
var my_sparql_query_uriCount = [
								'PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> PREFIX um: <http://intelleo.eu/ontologies/user-model/ns/> PREFIX c:  <http://www.intelleo.eu/ontologies/competences/ns/> PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> PREFIX pubo: <http://lod.semanticsoftware.info/pubo/pubo#> PREFIX sro: <http://salt.semanticauthoring.org/ontologies/sro#> SELECT DISTINCT ?uri (COUNT(?uri) AS ?count) WHERE{ ?creator rdf:type um:User . ?creator rdfs:isDefinedBy <', 
								'', 
								'> . ?creator um:hasCompetencyRecord ?competenceRecord . ?competenceRecord c:competenceFor ?competence . ?competence rdfs:isDefinedBy ?uri . ?rhetoricalEntity rdf:type sro:RhetoricalElement . ?rhetoricalEntity pubo:containsNE ?competence . }  GROUP BY ?uri ORDER BY DESC(?count) LIMIT ', 
								''];


exports.queryKnowledgeBase = function(researcher,limit){
	console.log("Heeey :) I am getting profile for this very nice guy");
	console.log(researcher);
	
	
	//ajax call here to fuseki
	my_sparql_query_uriCount[1]= researcher;
	my_sparql_query_uriCount[3]= limit; //"2";
	
	//console.log(my_sparql_query_uriCount.join(""));
	
	
	var url ='http://localhost:3030/usermodel/sparql';
	var query = my_sparql_query_uriCount.join('');
	var queryUrl = url+"?query="+ encodeURIComponent(query) +"&format=json";
		

	var promise = new Promise(function(resolve,reject){
		request.post(queryUrl, function(error,response,body){
			if (!error && response.statusCode ==200){
				//console.log("ich bin im if-part");
				//console.log(body);
				//result = body;
				resolve(body);

			} else{
				console.log(response.statusCode);
				console.warn(error);
				reject(error);
			}
			
		});
	});
	//console.log("the result is: "+result);
	return promise;
	//return result;
};
