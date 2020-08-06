//importing necessary modules
var request = require('request');
var Promise = require('promise');

const csv = require('csv-parser');
const fs = require('fs');

var inputFilePath = 'files/competences_output.csv';
results = {};

exports.queryKnowledgeBase = function(word1,word2){

	var json = SimCal(word1, word2);
	let promise = new Promise(function(resolve, reject) {
	  /* the function is executed automatically when the promise is constructed. We return the result, when it is ready.
	  So, we set a timer for delay */
	  setTimeout(() => resolve(json), 100);
	});

	//the returned promise which is fulfilled when the actual result comes in
	return promise;

	function SimCal(word1,word2) {
		fs.createReadStream(inputFilePath)
		  .pipe(csv())
		  .on('data', (row) => {
				if((row.Entity1 === word1 && row.Entity2 === word2)) {
					var value = 0.0;
					//retrieve the similarity and relatedness of all entity combinations
					var similarity = Number(row.Similarity);
					var relatedness = Number(row.Relatedness);
					//if both values are above 0, take the average between them
					//if only one of the values is 0, take the non-0 one
					//else, the taken value is 0
					if(similarity > 0 && relatedness > 0) {
						value = (similarity + relatedness) / 2
					}
					else if(similarity > 0 && relatedness == 0) {
						value = similarity
					}
					else if(similarity == 0 && relatedness > 0) {
						value = relatedness
					}
					results = row;
					results["Value"] = value;
					//console.log("===return-------::: word1:"+word1+ "= " + row.WORD1 + "-------::: word2:"+word2+ "= " + row.WORD2+ " .... " +value);
					return results;
			}
		  })
		  .on('end', () => {
		   //console.log('===CSV file successfully processed and this value is found: ' + value);
		   return results;
		  });

		   //console.log("===FINAL: for "+ word1 + " and " + word2 + " and I am returning the default value: "+value);
		  return results;
		}
};
