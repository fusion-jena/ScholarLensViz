//importing necessary modules
var request = require('request');
var Promise = require('promise');

//the CompRecSentence sparql-query in form of a string-array to fill in the variable data
var my_sparql_query_CompRecSentence = [
                'PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> ' +
                'PREFIX um: <http://intelleo.eu/ontologies/user-model/ns/> ' +
                'PREFIX c:  <http://www.intelleo.eu/ontologies/competences/ns/> ' +
                'PREFIX cnt: <http://www.w3.org/2011/content#> ' +
                'PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> ' +
                'PREFIX pubo: <http://lod.semanticsoftware.info/pubo/pubo#> ' +
                'PREFIX sro: <http://salt.semanticauthoring.org/ontologies/sro#> ' +
                'PREFIX oa: <http://www.w3.org/ns/oa#> ' +
				'PREFIX doco: <http://purl.org/spar/doco/> '+
                'SELECT DISTINCT ?articleTitle ?doi ?competenceRecord ?competence ?content ?my_sent_start ?my_sent_end ?topic ?my_topic_start ?my_topic_end  WHERE{ ' +
                   '{ ' +
                    'SELECT DISTINCT ?articleTitle ?doi ?sentence ?competence ?competenceRecord WHERE { ' +
                        '{ ' +
                          'SELECT ?competenceRecord   WHERE{ ' +
                               '?creator rdf:type um:User . ' +
                               '?creator rdfs:isDefinedBy <','','> . ' +
                               '?creator um:hasCompetencyRecord ?competenceRecord . ' +
                               '?competenceRecord c:competenceFor ?competence . ' +
                               '?competence rdfs:isDefinedBy <','','> . ' +
                               '?rhetoricalEntity rdf:type sro:RhetoricalElement . ' +
                               '?rhetoricalEntity pubo:containsNE ?competence . ' +
                               '}' +
                          '}' +
                           '?competenceRecord c:competenceFor ?competence . ' +
                           '?sentence pubo:containsNE ?competence . ' +
						   'OPTIONAL{'+
								'?doc pubo:hasAnnotation ?sentence.'+
								'?doc pubo:hasAnnotation ?metaArticle.'+
								'?metaArticle rdf:type doco:Title .'+
								'?metaArticle cnt:chars ?articleTitle .'+
      		               '} .'+
						  'OPTIONAL{ '+
                             '?doc pubo:hasAnnotation ?sentence.'+
                             '?doc pubo:hasAnnotation ?metaDOI.'+
           	                 '?metaDOI rdf:type pubo:DOI .'+
          	                 '?metaDOI cnt:chars ?doi'+
						   '} '+
                         '} '+
                        '} ' +
                   '?sentence cnt:chars ?content . ' +
                   '?sentence oa:start ?my_sent_start . ' +
                   '?sentence oa:end ?my_sent_end . ' +
                   '?competence cnt:chars ?topic . ' +
                   '?competence oa:start ?my_topic_start . ' +
                   '?competence oa:end ?my_topic_end . ' +
                        '} ORDER BY ?competenceRecord'];


/*"Main"-function of this .js document with 2 parameters */
exports.queryKnowledgeBase = function(researcher,uri,fuseki){

	//logging in the console just for checking
	console.log("Heeey :) I am getting a profile for this very nice guy");
	console.log(researcher);
	console.log(uri);


	//preparing the string-array by filling in the parameters
	my_sparql_query_CompRecSentence[1]= researcher;
	my_sparql_query_CompRecSentence[3]= uri;


	/*preparation of the call by setting up the parameters url, query and queryUrl (which is the actual paramter for the post function) */
	//var url ='http://localhost:3030/R4/sparql';
    //var url = fuseki + '/' + researcher.split('/')[researcher.split('/').length-1] + '/sparql';
	var url = fuseki + '/sparql';
	var query = my_sparql_query_CompRecSentence.join('');

	//this one goes into the request.post() function
	var queryUrl = url+"?query="+ encodeURIComponent(query) +"&format=json";


	/*declaration of a promise to make sure we wait for the asynchronous call to come back from fuseki
	--> else we wont get any result since we´re 2 fast

	the request itself throws an error or not (obvious) and sends the json as "body" which we resolve in our promise
	and send it back to the first .js to be send back to the user */
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
	//the returned promise which is fulfilled when the actual result comes in
	return promise;
};
