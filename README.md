# ScholarLensViz
This repository provides the source code for ScholarLensViz - an application that visualizes scholarly user profiles. 
It is built on-top of ScholarLens (https://doi.org/10.7717/peerj-cs.121), a text-mining pipeline that extracts competences from a user's publications. The output of ScholarLens is a semantic user profile in an RDF graph with entries that are connected to the Linked Oepn Data (LOD) cloud. 

## Prerequisites
The user profiles created by ScholarLens needs to be added to a triple store, e.g., Apache Fuseki (https://jena.apache.org/documentation/fuseki2/). A REST API should be provided to be able to run SPARQL queries to obtain the competences.
Please have a look at our ScholarLens repo (https://github.com/SemanticSoftwareLab/ScholarLens) to set up the text mining pipeline.

In addition, you need to install NodeJS on your machine. Read more here: https://nodejs.org/en/download/package-manager/

## Installation
In order to resolve the NodeJS dependencies run:

```npm install```

## Settings
A few settings have to be made concerning the knowledge base and NodeJS.

### Knowledge Base (e.g., Fuseki)
Please make sure that you have a running triple store (knowledge base) and that the profiles are added correctly. A SPARQL query like that should return a list of competences:

```
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX um: <http://intelleo.eu/ontologies/user-model/ns/>
PREFIX c: <http://www.intelleo.eu/ontologies/competences/ns/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX pubo: <http://lod.semanticsoftware.info/pubo/pubo#>
PREFIX sro: <http://salt.semanticauthoring.org/ontologies/sro#>

SELECT DISTINCT ?uri (COUNT(?uri) AS ?count) WHERE{
?creator rdf:type um:User .
?creator rdfs:isDefinedBy <http://semanticsoftware.info/lodexporter/creator/R7> .
?creator um:hasCompetencyRecord ?competenceRecord .
?competenceRecord c:competenceFor ?competence .
?competence rdfs:isDefinedBy ?uri .
?rhetoricalEntity rdf:type sro:RhetoricalElement .
?rhetoricalEntity pubo:containsNE ?competence .
} 
GROUP BY ?uri ORDER BY DESC(?count)
```


The knowledge base and dataset used need to be defined in the following file: /schema/getURICount.js
An example configuration assuming that Fuseki is running on the default port 3030 looks like that: (quering a graph called 'profiles')

```var url ='http://localhost:3030/profiles/sparql';```

### NodeJS
By default, NodeJS is listening on http://localhost:3666. This address has to be added to the js file in /server/views/js/script.js
in function 'get_my_new_sparql_data'

 ```var url = 'http://localhost:3666/'```

## Running the Server
Now you can start the server on the command line with

```node server```

Open your browser and go to http://localhost:3666/ - then you should see the user profile in a pie chart.

## License
The text mining pipeline is distributed under the terms of the GNU LGPL v3.0. (https://www.gnu.org/licenses/lgpl-3.0.en.html) You can find a copy of the license in the pipeline folder.

