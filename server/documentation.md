# ScholarLensViz Documentation

This is the documentation of ScholarLensViz, a visualization framework developed on top of [ScholarLens](https://github.com/SemanticSoftwareLab/ScholarLens).

## Prerequiste
ScholarLensViz only runs on profiles generated with ScholarLens described in [Sateli et al.:ScholarLens: extracting competences from research publications for the automatic generation of semantic user profiles , PeerJ Computer Science, 2017](https://doi.org/10.7717/peerj-cs.121)
For test purposes, you can use the example profiles provided.

ScholarLensViz provides a Client-Server architecture using [NodeJS](https://nodejs.org/en/). ScholarLensViz was developed and tested with NodeJS v6.11.3 and v8.10.0 under Windows 10 and Ubuntu 18.
Please install NodeJS (NodeJS requires a [package manager](https://nodejs.org/en/download/package-manager/). 

## 1.) Install and run a triple store, e.g., Fuseki:

We use [Apache Jena Fuseki] ((https://jena.apache.org/documentation/fuseki2/)) but you can use any triple store you want. Start the triple store and load the example user profiles. Make sure that the profiles are available. 
Inside the SPARQL folder, we provide the queries to retrieve the competences per scholar, the provenance per competence entry as well as further SPARQL queries used for in the visualization.


## 2.) Install and run ScholarLensViz:

Download ScholarLensViz. We provide the node_modules folder in order to avoid version conflicts. However, in order to resolve dependency conflicts open a console, 
navigate to the ScholarLensViz/server folder and run 
‘’npm install’’.


Edit the knowledgeBase.json and add the URL to the profile graph

{
  "fuseki": "http://localhost:3030/ScholarLensViz",
  "node": "http://localhost:3666"
}



Start the server on a command line with

‘’node server.js’’

Open a browser and 

1. Open cmd
2. Write  ‘’npm install’’ at first, to resolve dependency conflicts
3. Write ‘’node server.js’’ 
4. Open a browser and write localhost:3666
5. now, the server is running.

Server.js (a server for ScholarLens) can be run on localhost:3666
To run any js files:1- open cmd, 2-go to the directory, 3- write ‘’node filename.js’’


## Settings

* create a lokalFuseki.json and add the Fuseki graph where you uploaded the profiles and the URL to the NodeJS

{
  "fuseki": "http://localhost:3030/ScholarLensViz",
  "node": "http://localhost:3666"
}



