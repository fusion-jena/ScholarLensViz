# ScholarLensViz
This repository provides the source code for ScholarLensViz - an application that visualizes scholarly user profiles. 
It is built on-top of ScholarLens (https://doi.org/10.7717/peerj-cs.121), a text-mining pipeline that extracts competences from a user's publications. The output of ScholarLens is a semantic user profile in an RDF graph with entries that are connected to the Linked Open Data (LOD) cloud. 

## Prerequisites

### Knowledge Base
The user profiles created by ScholarLens needs to be added to a triple store, e.g., Apache Fuseki (https://jena.apache.org/documentation/fuseki2/). A REST API should be provided to be able to run SPARQL queries to obtain the competences.
Please have a look at our ScholarLens repo (https://github.com/SemanticSoftwareLab/ScholarLens) to set up the text mining pipeline. For test purposes, you can use the example profiles provided.

### NodeJS
In addition, you need to install [NodeJS](https://nodejs.org/en/) on your machine. NodeJS requires a [package manager](https://nodejs.org/en/download/package-manager/).
ScholarLensViz was developed and tested with NodeJS v6.11.3 and v8.10.0 under Windows 10 and Ubuntu 18.

### Semantic Similarity/Relateness of profile entries
We compute the semantic similarity with [sematch](https://github.com/gsi-upm/sematch). Per user profile all combinations of profile entries are computed and stored in csv file under /server/views/competences/ScholarName.csv


## ScholarLensViz Installation
At first, download ScholarLensViz, open a console, navigate to the ScholarLensViz/server folder and resolve dependency conflicts:

```npm install```

### Settings

Edit the server/views/localFuseki.json file and add the URL to the profile graph and the NodeJS port of your local installation. An example configuration assuming that Fuseki is running on the default port 3030 and Node running on port 3666 looks like that: (quering a graph called 'ScholarLensViz')


{
  "fuseki": "http://localhost:3030/ScholarLensViz",
  "node": "http://localhost:3666"
}

### Knowledge Base (e.g., Fuseki)
Please make sure that you have a running triple store (knowledge base) and that the profiles are added correctly. 
Inside the SPARQL folder, we provide the queries to retrieve the competences per scholar, the provenance per competence entry as well as further SPARQL queries used for in the visualization.
A SPARQL query like that should return a list of competences:

```
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX um: <http://intelleo.eu/ontologies/user-model/ns/>
PREFIX c: <http://www.intelleo.eu/ontologies/competences/ns/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX pubo: <http://lod.semanticsoftware.info/pubo/pubo#>
PREFIX sro: <http://salt.semanticauthoring.org/ontologies/sro#>

SELECT DISTINCT ?uri (COUNT(?uri) AS ?count) WHERE{
?creator rdf:type um:User .
?creator rdfs:isDefinedBy <http://semanticsoftware.info/lodexporter/creator/R4> .
?creator um:hasCompetencyRecord ?competenceRecord .
?competenceRecord c:competenceFor ?competence .
?competence rdfs:isDefinedBy ?uri .
?rhetoricalEntity rdf:type sro:RhetoricalElement .
?rhetoricalEntity pubo:containsNE ?competence .
} 
GROUP BY ?uri ORDER BY DESC(?count)
```


### Running the Server
Now you can start the server on the command line with

```node server```

Open your browser and go to http://localhost:3666/ - then you should see the example user profile (R4) in a pie chart.

## Demo
A running demo can be found on our server:

https://dev.gfbio.uni-jena.de/scholar/

The URL published in the paper (https://dev.gfbio.org/scholar/) is currently under maintenance and will be back soon.

## Changelog

30.10.2020 release 2.1
* local config file added
* URLs shortened
* local storage added for faster loading
* UI improved (buttons added, a list of all papers used is now provided)

06.08.2020 release 2.0
* d3 libraries updated
* UI revised
* bootstrap 4 integrated
* 2 new visualizations (force-directed graph, chord chart)
* demo application provided

07.06.2019 initial release 1.0

## License
ScholarLensViz is distributed under the terms of the GNU LGPL v3.0. (https://www.gnu.org/licenses/lgpl-3.0.en.html) You can find a copy of the license in the pipeline folder.

## Citation
Löffler, F., Wesp, V., Babalou, S., Kahn, P., Lachmann, R., Sateli, B., Witte, R., König-Ries, B. (2020). ScholarLensViz: A VisualizationFramework for Transparency in Semantic User Profiles. Proceedings of the ISWC 2020 Satellite Tracks (Posters & Demonstrations, Industry, and Outrageous Ideas) co-located with 19th International Semantic Web Conference (ISWC 2020), Virtual Conference, November 1 - 6, 2020. http://ceur-ws.org/Vol-2721/paper485.pdf