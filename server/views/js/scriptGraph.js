// get the researcher specified in the URL
var researcher = new URLSearchParams(window.location.search).get("researcher_id");
// get the fuseki adress specified in the URL
var fuseki = new URLSearchParams(window.location.search).get("fuseki");
// get the node adress specified in the URL
var node = new URLSearchParams(window.location.search).get("node");

// load file containing the values of the competences
var csv_data = null;
$.ajax({
  url: node + "/competences/" + researcher + ".csv",
  async: false,
  success: function(data) {
    csv_data = $.csv.toObjects(data);
  },
  error: function(data) {
	console.log("No sematic similarity values available for researcher "+ researcher + ".")
	csv_data = 0;
 }
});

// Define the global variables
var mouse_pos_X = 0, mouse_pos_Y = 0, my_query_data = '', my_query_data_test, my_active_id, line_height_shift = 10, namespace = 'http://semanticsoftware.info/lodexporter/creator/', response = '', transition_Delay = 700,  initialNumber = 8, maximum_number = 25;
// variable setting the colors for the categories
var group_colors = d3.scaleOrdinal(d3.schemeCategory20);
// array containing the IDs of all concepts and their categories
var all_nodes = [];
var nodes = [];
// variable specifying the last clicked node
var previous_selected_node = null;
// ################################################################################################
/**
 * Main Function Description: This function is called from the page load on the
 * index.html file. It draws the force-directed graph and table.
 */
function buildGraph() {
	/* get the information by SPARQL query. The output is in JSON format.
		We need the competence name and number to draw the graph. */

	/* show the table view */
	number_of_competence = maximum_number;
	my_query_data = get_my_new_sparql_data('getUriCount', researcher, '', number_of_competence, '');
	/* since we want to show all competences in the table but not in graph, so we need to run SPARQL query two times with two different number of competences */
	var my_query_data_table_data = my_query_data.results.bindings;
  // map containing all categories for each URI
  var cat_map = {};
  // loop over all URIs and get their categories
  for(var i=0; i<my_query_data_table_data.length; i++) {
    // get the first URI
    var elm = my_query_data_table_data[i];
    var  myUri = elm["uri"].value;
    cat_map[myUri] = [];
//**************start Category Information ******************//
    //Limit is set to 10 (do we have URIs with more than 10 categories?)
    my_query_category = get_category('getCategory',researcher, myUri, 10);
    var categories = my_query_category.results.bindings;
    var category = "none";
    // check if the URI has at least one category
    if(categories.length > 0) {
      // loop over all categories of the given URI
      for(var j = 0; j < categories.length; j++) {
        // get the category name and add it to the category map
        cat_uri = categories[j]["superTopicEq"]["value"].split("/");
        category = cat_uri[cat_uri.length-1];
        cat_map[myUri].push(category)
      }
    }

    // each label is like http://dbpedia.org/resource/Tree_(data_structure)", so we delete all first 28 charcters
    // for each entity take the first two and last two letters as the label
    var label = myUri.substr(28).toUpperCase(); //(myUri.substr(28).substr(0,2) + "_" + myUri.substr(28).substr(myUri.substr(28).length-2)).toUpperCase();
    // add the label to the nodes
    var node = {"id": label, "group": category};
    all_nodes.push(node);
// ************* end Category Information ********************//
  }

  // set the number of initial competences
	number_of_competence = initialNumber;
	my_query_data = get_my_new_sparql_data('getUriCount', researcher, '', number_of_competence, '');
	var data_graph = my_query_data.results.bindings;

  // add the abbreviations of the each concept to the first column
  // first two letters plus '_' plus last two letters
  //my_query_data_table_data = addAbbreviations(my_query_data_table_data);
  // add the category view to the table
  my_query_data_table_data = addCategories(my_query_data_table_data, cat_map);
  // convert the query data  to a HTML table
	document.getElementById('div_table_view').innerHTML = json2table(my_query_data_table_data, cat_map);
  // Set the user information on the box
	//document.getElementById('div_user_info').innerHTML = set_user_info(researcher);
	/**
	* HERE STARTS THE CODE FOR THE GRAPH
	*/

  // json arrays for the links and their values
  // category_list array is for the legend
  // can be ignored for now
  var links = [];
  var linkValues = {};
  //var category_list = [];
  document.getElementById("div_table_threshold").style.display = "none";
  // set the default values for the thresholds for the continous, dashed and dotted line
  conUpper = document.getElementById("con_lineU");
  conUpper.value = 1
  conLower = document.getElementById("con_lineL");
  conLower.value = 0.7
  dashUpper = document.getElementById("dash_lineU");
  dashUpper.value = 0.7
  dashLower = document.getElementById("dash_lineL");
  dashLower.value = 0.4
  dashdashUpper = document.getElementById("dashdash_lineU");
  dashdashUpper.value = 0.4
  dashdashLower = document.getElementById("dashdash_lineL");
  dashdashLower.value = 0
  // loop over the selected entities
	for (var i=0; i<data_graph.length; i++) {
    // get the first URI
		var elm1 = data_graph[i];
		var myUri1 = elm1["uri"].value;
//**************start Category Information ******************//
		//Limit is set to 10 (do we have URIs with more than 10 categories?)
		my_query_category = get_category('getCategory',researcher, myUri1, 10);
	  var categories = my_query_category.results.bindings;
    var category = "none";
    // if the concept has at least one category, set the first category as the default one
    // else, the category is none
    if(categories.length > 0) {
      first_cat_list = categories[0]["superTopicEq"]["value"].split("/");
      category = first_cat_list[first_cat_list.length-1];
    }

    //if(category != "none" && !(category_list.includes(category))) {
    //  category_list.push(category);
    //}
// ************* end Category Information ********************//

    // each label is like http://dbpedia.org/resource/Tree_(data_structure)", so we delete all first 28 charcters
		myUri1 = myUri1.substr(28);
    // for each entity take the first two and last two letters as the label
    var label = myUri1; //(myUri1.substr(0,2) + "_" + myUri1.substr(myUri1.length-2)).toUpperCase();
    // add the label to the nodes
    var node = {"id": label, "group": category};
    nodes.push(node);
    // loop a second time over the selected entities to retrieve the pairs
		for (var j=0; j<data_graph.length; j++) {
      // get the second URI
			var elm2 = data_graph[j];
			var myUri2 = elm2["uri"].value;
      // each label is like http://dbpedia.org/resource/Tree_(data_structure)", so we delete all first 28 charcters
      myUri2 = myUri2.substr(28);
      // check if the entities are not the same
      // if they are, ignore them and go to the next one
      if(myUri1 != myUri2) {
        // loop over the lines in the competences CSV file
  			for(var k=0; k<csv_data.length; k++) {
          // get the first entity of the current row
          var ent1 = csv_data[k]["Entity1"];
          // get the second entity of the current row
          var ent2 = csv_data[k]["Entity2"];
          // check if the first URI and entity and the second URI and entity are the same
          // if they are, get the necessary values
          if(myUri1 == ent1 && myUri2 == ent2 || myUri1 == ent2 && myUri2 == ent1) {
            // get the similarity
            var similarity = Number(csv_data[k]["Similarity"]);
            // get the relatedness
            var relatedness = Number(csv_data[k]["Relatedness"]);
            // set the wanted value depending on the similarity and relatedness
            // if both values are above 0, take the average
            // if only one value is above 0, take the non-0 one
            // else, the wanted value stays at 0
            var value = 0
            if(similarity > 0 && relatedness > 0) {
              value = (similarity + relatedness) / 2;
            } else if(similarity > 0 && relatedness == 0) {
              value = similarity;
            } else if(similarity == 0 && relatedness > 0) {
              value = relatedness;
            }

            // set the stroke and color of each link depending between which threshold the taken value lies
            var stroke = "";
            var color = "";
            if(value <= conUpper.value && value > conLower.value) {
              stroke = ("1, 0");
              color = "black";
            }
            else if(value <= dashUpper.value && value > dashLower.value) {
              stroke = ("10, 5");
              color = "dimgrey";
            }
            else if(value <= dashdashUpper.value && value > dashdashLower.value) {
              stroke = ("5, 9");
              color = "lightslategrey";
            }

            // check if the wanted value is between one of the thresholds
            // if it is, add the entity pair and the values to the link arrays
            if(stroke != "") {
              // for both entities take the first two and last two letters as the label
              //ent1 = (ent1.substr(0,2) + "_" + ent1.substr(ent1.length-2)).toUpperCase();
              //ent2 = (ent2.substr(0,2) + "_" + ent2.substr(ent2.length-2)).toUpperCase();
              // add the linked entities to the links
              var link = {"source": ent1, "target": ent2, "stroke": stroke, "color": color};
              links.push(link);
              // check if the linkValues array already contains the first entity
              // if it doens't, add the entity to it
              if(!(ent1 in linkValues)) {
                linkValues[ent1] = {};
              }

              // add the second entity and the values to the linkValues array
              linkValues[ent1][ent2] = {};
              linkValues[ent1][ent2]["sim"] = similarity;
              linkValues[ent1][ent2]["rel"] = relatedness;
              linkValues[ent1][ent2]["val"] = value;
            }

            break;
          }
        }
      }
    }
	}

  //document.getElementById("page").style.display = "block";
  graph_document = document.getElementById("div_force_graph");
  graph_document.style.display = "block";
  //var width = graph_document.clientHeight;
  //var height = graph_document.clientWidth;
  var width = 600;
  var height = 400;
  var radius = 30;
  // show the table with the entities
  document.getElementById("div_table_view").style.display = "block";

  // construct the svg canvas for the graph
  var svg = d3.select("#div_force_graph").append("svg")
  .attr("widthDisplay", "100%").attr("heightDisplay", "100%").attr("viewBox", " 0 0 "+width + " " +height);
            //.attr("width", width)
            //.attr("height", height);

  // set the pull between the nodes depending on the number of nodes
  // the more nodes are selected, the weaker the pull is to better distribute nodes
  // set the center of the graph to the center of the canvas
  var simulation = d3.forceSimulation()
                   .force("charge", d3.forceManyBody().strength(-1000/data_graph.length))
                   .force("center", d3.forceCenter(width/2, height/2));

  // set the length of each link to the sum of the height and width divided by 4
  simulation.force("link", d3.forceLink()
            .id(link => link.id)
            .distance((width+height)/4));

  // add the links of the entity pairs to the canvas
  var linkElements = svg.append("g")
                        .selectAll("line")
                        .data(links)
                        .enter().append("line")
                                .attr("stroke-width", 3)
                                .style("stroke-dasharray", link => link.stroke)
                                .attr("stroke", link => link.color);

  // add the nodes of the selected entities to the canvas
  var nodeElements = svg.append("g")
                     .selectAll("circle")
                     .data(nodes)
                     .enter().append("circle")
                             .attr("stroke", "black")
                             .attr("id", function(d, i) {
                               return "node-" + i;
                             })
                             .attr("fill", function(d) {
                               return d.group != "none" ? group_colors(d.group) : "dimgrey";
                             })
                             .attr("r", 6);

  // add the labels of the selected entities to the canvas
  var textElements = svg.append("g")
                     .selectAll("text")
                     .data(nodes)
                     .enter().append("text")
                             .text(d => d.id)
                             .style("font-size", "12px")
                             .style("font-weight", "bold")
							 //.style("paint-order", "stroke")
                             //.style("fill", "white")
                             //.style("stroke", "black")
                             //.style("stroke-width", "5px")
                             .attr("dx", -35)
                             .attr("dy", -13);

  // add a hover window to display the values of the links
  var toolTip = d3.select("body")
                .append("div")
                .attr("class", "tool_graph");

  // connect the nodes with the links and their corresponding labels
  simulation.nodes(nodes).on("tick", () => {
    linkElements
      .attr("x1", link => link.source.x)
      .attr("y1", link => link.source.y)
      .attr("x2", link => link.target.x)
      .attr("y2", link => link.target.y);
    // function for the x- and y-axes so that the nodes are always inside the canvas
    nodeElements
      .attr("cx", function(d) {return d.x = Math.max(radius, Math.min(width - radius, d.x));})
      .attr("cy", function(d) {return d.y = Math.max(radius, Math.min(height - radius, d.y));});
    textElements
      .attr("x", node => node.x)
      .attr("y", node => node.y);
  });

  // set the links
  simulation.force("link").links(links);
  // set the function when a node is clicked on to only display nodes that are connected with the selected node
  nodeElements.on("click", selectNode);
  // set the function when the mouse is hovered over a link to display a window with the similarity, relatedness and taken value
  // on mousemove the opend window follows the mouse pointer
  linkElements.on("mouseover", mouseLink)
              .on("mousemove", function(){return toolTip.style("top", (d3.event.pageY-10)+"px").style("left",(d3.event.pageX+10)+"px");})
              .on("mouseout", function(){return toolTip.style("visibility", "hidden");});

  // function to set the color of the node depending on its category
  // if no category is avaiable, set it to grey
  function getGroupColor(node) {
	if(all_nodes[node] === undefined)
		return "dimgrey";
	else
    return all_nodes[node].group != "none" ? group_colors(all_nodes[node].group) : "dimgrey";
  }

  // function to return all nodes that are connected with the selected node
  function getNeighbors(node) {
    return links.reduce((neighbors, link) => {
      if(link.target.id == node.id) {
        neighbors.push(link.source.id);
      } else if(link.source.id == node.id) {
        neighbors.push(link.target.id);
      }
      return neighbors;
    }, [node.id]);
  }

  // function to check if two nodes are connected
  function isNeighborLink(node, link) {
    return link.target.id == node.id || link.source.id == node.id;
  }

  // function to the change the color of the nodes
  // if no connection between the node and the selected node exists, change the color of the node to white
  function getNodeColor(node, neighbors, selectedNode) {
    return neighbors.indexOf(node.id) > -1 ? getGroupColor(node.index) : "white";
  }

  // function to the change the color of the labels
  //  if no connection exists, change the color to burlyWood
  function getTextColor(node, neighbors) {
    return neighbors.indexOf(node.id) > -1 ? "black" : "burlyWood";
  }

  // function to set the width of the links
  // if the node is connected to the selected node, change the size of the width to 3
  // else if no connection exists, change the width to the link to 0
  function getLinkStroke(node, link) {
    return isNeighborLink(node, link) ? 3 : 0;
  }

  // function to change the color of the nodes and labels and the width of the links
  // depending whether they are connected to the selected node or not
  function selectNode(selectedNode) {
    // if a selected node is clicked on when it was already selected, change the view of the graph to default
    // change the color of all nodes and labels to their respective color, the width of all links to 3
    // else, change the color of the nodes and labels and the width of the links as described above
    if(previous_selected_node == selectedNode) {
      previous_selected_node = null;
      nodeElements
        .attr("fill", node => getGroupColor(node.index));
      textElements
        .attr("fill", node => "black");
      linkElements
        .attr("stroke-width", link => 3);
    } else {
      previous_selected_node = selectedNode;
      var neighbors = getNeighbors(selectedNode);
      nodeElements
        .attr("fill", node => getNodeColor(node, neighbors, selectedNode));
      textElements
        .attr("fill", node => getTextColor(node, neighbors));
      linkElements
        .attr("stroke-width", link => getLinkStroke(selectedNode, link));
    }
  }

  // function to display a window with the similarity, relatedness and taken value of a link
  // when the mouse is hovered over it
  function mouseLink(selectedLink) {
    var source = selectedLink["source"]["id"];
    var target = selectedLink["target"]["id"];
    var sim = linkValues[source][target]["sim"];
    var rel = linkValues[source][target]["rel"];
    var value = linkValues[source][target]["val"];
    // round all three value to three decimal places
    var sim_rounded = Math.round((sim + Number.EPSILON) * 1000) / 1000;
    var rel_rounded = Math.round((rel + Number.EPSILON) * 1000) / 1000;
    var val_rounded = Math.round((value + Number.EPSILON) * 1000) / 1000;
    toolTip.html("Similarity: " + sim_rounded + "<br>Relatedness: " + rel_rounded + "<br>Value: " + val_rounded);
    toolTip.style("visibility", "visible");
  }

// ################################################################################################
	// ################################################################################################
	/**
	 * Function to convert json data to table view
	 *
	 * @param Json,
	 *            classes
	 */
	function json2table(json, categories, classes) {
		var cols = Object.keys(json[0]);

    //////////////////////////////////////////////
    //////////////// new table code //////////////
    //////////////////////////////////////////////
    var headerRow = "<div class=\"table-responsive\">" +
                      "<table class=\"table table-bordered\">" +
                        "<tr>" +
                          "<th scope=\"col\">Display</th>" +
                          "<th scope=\"col\">Competence</th>" +
                          "<th scope=\"col\">Count</th>" +
                          "<th scope=\"col\">Category</th>" +
                        "</tr>";

    var bodyRows = "";
    var currentNum = 0;
    // loop over the rows and columns of the query json data
		json.map(function(row) {
      bodyRows += "<tr>";
			cols.map(function(colName) {
        // if the current column is the URI,
        // add the link of the URI concept to DBPedia site to the HTML table as the first column
				if (colName == "uri") {
          var value = row[colName].value.toString().split("/")[4];
					bodyRows += "<td class=\"tableView_Graph_Tag_Checkbox;align-middle\"><input name=\"graph_checkbox\" type=\"checkbox\"";
          // if the current row number is less than the number of initial competences,
          // set the checkbox to checked
					if (currentNum < initialNumber){
						bodyRows += "id=\"" + String(value) + "\" checked>";
						currentNum += 1;
          // else, leave the checkbox unchecked
					} else {
						bodyRows += "id=\"" + String(value) + "\">";
					}

          bodyRows += "<td class=\"align-middle\" ><a href=\"http://dbpedia.org/resource/" + value.split(" ")[0] + "\" target=\"_blank\">" + value + "</a></td>";
        // if the current column is the count,
        // add the count of the concept to the HTML table as the second column
        } else if(colName == "count") {
          bodyRows += "<td class=\"align-middle\" >" + row[colName].value.toString() + "</td>";
        // else, add the respective categories of the concept to the HTML table as the third column
        } else {
          bodyRows += "<td class=\"align-middle\">";
          var value = row[colName].value.toString();
          var check_cat = value.split(" ")
          // get the category that is shown by default
          var uri = row["uri"].value.toString().split(" ")[0];
          // get only the name of the concept (without the URL)
          var short_uri = uri.split("/")[uri.split("/").length-1];
		  var topic = short_uri.replace("(", "");
		  var short_uri = topic.replace(")", "");
          var label = short_uri.toUpperCase(); //(short_uri.substr(0,2) + "_" + short_uri.substr(short_uri.length-2)).toUpperCase();
          // loop over all nodes till you find the one with the starting category
          var index = null;
          for(var i = 0; i < all_nodes.length; i++) {
            if(uri.split("/")[uri.split("/").length-1].toUpperCase() == all_nodes[i].id) {
              // save the index of the node
              index = i;
              if(categories[uri].length > 0) {
                all_nodes[i].group = categories[uri][0].toLowerCase();
              }

              break;
            }
          }

          var color = getGroupColor(index);
          // check if the concept has multiple categories (denoted by '[cat_list]')
          if(check_cat.length > 1 && check_cat[1] == "[cat_list]") {
            // retrieve all categories of the given concept
            var cat_list = categories[uri];
            // loop over all categories and add them to a dropdown menu in the HTML table
            for(var i = 0; i < cat_list.length; i++) {
              var category = decodeURIComponent(cat_list[i]);
			  var cat = category.replace("(","");
			   category = cat.replace(")","");
              // show the first category by default
              if(i == 0) {
                // add the first category as the default option (displayed) in the dropdown menu
                bodyRows += "<div class=\"dropdown\">";
                // shorten category name to the first 20 letters (plus '...')
                // to avoid that the category name stretches outside the table
                var short_cat = category.toUpperCase();
                if(category.length > 12) {
                  var short_cat = category.substr(0,10).toUpperCase() + "...";
                }

                // set the tooltip of the selected category to display the full name when hovering over the shortened name
                bodyRows += "<button name=\"category\" id=\"" + short_uri + "_tool\" class=\"btn btn-secondary dropdown-toggle\" data-toggle=\"dropdown\" title=\"" + category.toUpperCase() + "\"><span style=\"color:" + color + "\">&#9632</span> " + short_cat + "</button>";
                bodyRows += "<div class=\"dropdown-menu\" aria-labelledby=\"dropdownMenuButton\">";
              }

              // add the current category as an option in the dropdown menu
              bodyRows += "<button id=\"" + short_uri + "___" + category + "\" class=\"dropdown-item\">" + category.toUpperCase() + "</button>";
              // function to change the displayed category to the clicked one and change the color of the respective concept
              $("#div_table_view").on("click", "#" + short_uri + "___" + category, function(event) {
                // get the concept and its category
                var func_uri = event.target.id.split("___")[0];
                var func_cat = event.target.id.split("___")[1].toUpperCase();
                // access the tooltip element
                var func_tooltip = document.getElementById(func_uri + "_tool");
                // shorten the shown category name as before
                var func_short_cat = func_cat;
                if(func_cat.length > 12) {
                  func_short_cat = func_cat.substr(0,10) + "...";
                }

                var label = func_uri; //(func_uri.substr(0,2) + "_" + func_uri.substr(func_uri.length-2)).toUpperCase();
                var index = null;
                // loop over all pnodes till you find the one which category was changed
                for(var i = 0; i < nodes.length; i++) {
                  if(uri.split("/")[uri.split("/").length-1] == nodes[i].id) {
                    // save the index of the node
                    index = i;
                    // change the previous selected category of the node to the new one
                    nodes[i].group = func_cat.toLowerCase();
                    break;
                  }
                }

                try {
                  var color = nodes[index].group != "none" ? group_colors(nodes[index].group) : "dimgrey";
                  // change current the color of the node to the color of the new category
                  document.getElementById("node-"+index).style.fill = color;
                  // set the displayed name to the shortened version
                  func_tooltip.innerHTML = "<span style=\"color:" + color + "\">&#9632</span> " + func_short_cat;
                  func_tooltip.title = func_cat;
                } catch(err) {
                  alert("Please check the concept and reload the graph\nbefore changing its category.")
                }
              });
            }
          } else {
            // shorten category name to the first 20 letters (plus '...')
            // to avoid that the category name stretches outside the table
            // furthermore, if the name doesn't have to be shortened (less than 10 letter),
            // the tooltip also doesn't have to be set
            // (hovering over the category won't display the full name since the full name is already displayed)
            var short_cat = value.toUpperCase();
            if(value.length > 12) {
              var short_cat = value.substr(0,10).toUpperCase() + "...";
            }

            // set the tooltip of the selected category to display the full name when hovering over the shortened name
            bodyRows += "<div name=\"category\" id=\"single_category\" class=\"btn btn-secondary dropdown-toggle;disabled\" title=\"" + value.toUpperCase() + "\"><span style=\"color:" + color + "\">&#9632</span> " + short_cat + "</div>";
          }

          bodyRows += "</div></div></td>";
        }
      });

      bodyRows += "</tr>";
    });

    return headerRow + bodyRows + "</div>";

    
	}

  document.getElementById("loading").remove();
  document.getElementById("header").style.display = "block";
  document.getElementById("widget-container").style.display = "block";
};
// #### END OF MAIN FUNCTION ########################

// ################################################################################################
/**
 * Function to create tool tip Description: create the middle circle and add
 * data and value on the circle.
 */
function set_user_info(my_user) {
  var info = '';
  info += '<div class=\"user_info\">' + 'Researcher: ' + my_user + '</div>';
  return info;
}

// ################################################################################################
/**
 * Function to call ajax query of the user information
 */
function get_my_new_sparql_data(my_sel, my_researcher, my_uri, my_limit,
		my_offset) {
	/* To run barchart from online data on the server, use the below code: */
	//var url = 'https://dev.gfbio.org:8181/', my_data;

	/* To run barchart from your local machine, use the below code: */
	var url = node + '/', my_data;
	//my_sel=getSimilarity

	my_query_data_set = {
		'researcher' : namespace + my_researcher,
		'limit' : my_limit,
		'uri' : my_uri,
    'fuseki' : fuseki
	};

	url = url + my_sel + '/';
	$.ajax({
		type : 'POST',
		url : url,
		dataType : "json",
		async : false,
		data : my_query_data_set,
		success : function(data) {
			my_data = $.parseJSON(data);
		},
		error : function(data) {
			response = $.parseJSON(data.responseText);
		}
	});

	return my_data;
}

/**
 * Function to call ajax query of category information for a given URI
 */
function get_category(my_sel, my_researcher, my_uri, my_limit) {
	var url = node + '/', my_data;
	my_query_data_set = {
		'researcher' : namespace + my_researcher,
		'uri' : my_uri,
		'limit' : my_limit,
    'fuseki' : fuseki
	};

	url = url + my_sel + '/';
	$.ajax({
		type : 'POST',
		url : url,
		dataType : "json",
		async : false,
		data : my_query_data_set,
		success : function(data) {
			my_data = $.parseJSON(data);
		},
		error : function(data) {
			response = $.parseJSON(data.responseText);
		}
	});

	return my_data;
}

// function to add the abbreviated names to the table
function addAbbreviations(data) {
  // loop over the query data
  for(var i = 0; i < data.length; i++) {
    // get the concept
    var name = data[i]["uri"]["value"].substr(28);
    // take the first two letters and the last two letter divided by a '_'
    // and add it as the abbreviation to the query data URI value
    var label = name.toUpperCase(); //(name.substr(0,2) + "_" + name.substr(name.length-2)).toUpperCase();
    data[i]["uri"]["value"] += " [" + label + "]";
  }

  return data
}

// add the extracted categories to the table
function addCategories(data, categories) {
  // loop over the query data
  for(var i = 0; i < data.length; i++) {
    // get the concept URI and its categories
    var uri = data[i]["uri"]["value"].split(" ")[0];
    var cat_list = categories[uri];
    data[i]["category"] = {};
    // if the concpet as at least one category, check further
    if(cat_list.length > 0) {
      // if the concept has only one category, set the category value of the query data to this category
      if(cat_list.length == 1) {
        data[i]["category"]["value"] = cat_list[0];
      // else, set the value of the query data to the concept plus ' [cat_list]'
      // this way, we know that this concept has more than one category
      // which we retrieve when building the table view by using the concept before ' [cat_list]' as a key
      } else {
        data[i]["category"]["value"] = uri + " [cat_list]";
      }
    // else, set the category value of the query data to 'None'
    } else {
      data[i]["category"]["value"] = "None";
    }
  }

  return data
}

// ################################################################################################

// function to reload the graph with the selected entities and thresholds
// in general, this function works in the same way as the main function
// the only difference is that the selected entities can differ
function reloadGraph() {
  previous_selected_node = null;
  // disable the reload button till the graph is loaded
  var button = document.getElementById("div_reload_graph_btn");
  button.disabled = true;
	var selectedDataId = [];
	var selectedData = document.getElementsByName("graph_checkbox");
  // json arrays for the nodes
  nodes = [];
  // loop over the checkboxes of the table
	for (var i = 0; i < selectedData.length; i++) {
    // if the a box was checked, get the node and add it to the nodes array for visualization
    // additionally, get the selected categories
		if (selectedData[i].checked) {
      // get the concept by removing the last eight characters (abbreviation is removed)
      var myUri = selectedData[i].id;
			selectedDataId.push(myUri);
      var category = document.getElementsByName("category")[i].title;
      // for each entity take the first two and last two letters as the label
      label = myUri; //(myUri.substr(0,2) + "_" + myUri.substr(myUri.length-2)).toUpperCase();
      // add the label to the nodes
      var node = {"id": label, "group": category.toLowerCase()};
      nodes.push(node);
		}
	}

	/**
	* HERE STARTS THE CODE FOR GRAPH
	*/
	//number_of_competence = initialNumber;
	//my_query_data = get_my_new_sparql_data('getUriCount', 'R1', '', number_of_competence, '');
	var data_graph = selectedDataId;
  //my_query_data.results.bindings;
  // json arrays for the links and their values
  var links = [];
  var linkValues = {};
  // get the values of the thresholds for green, gold and red
  // if one of the values is not as number, set the default value
  // if the lower threshold is higher than the upper threshold, exchange them
  greenUpper = document.getElementById("con_lineU");
  if(isNaN(greenUpper.value)) {
    greenUpper.value = 1;
  }

  greenLower = document.getElementById("con_lineL");
  if(isNaN(greenLower.value)) {
    greenLower.value = 0.7;
  }

  if(greenUpper.value < greenLower.value) {
      greenv = greenLower.value;
      greenLower.value = greenUpper.value;
      greenUpper.value = greenv;
  }

  goldUpper = document.getElementById("dash_lineU");
  if(isNaN(goldUpper.value)) {
    goldUpper.value = 0.7;
  }

  goldLower = document.getElementById("dash_lineL");
  if(isNaN(goldLower.value)) {
    goldLower.value = 0.4;
  }

  if(goldUpper.value < goldLower.value) {
      goldv = goldLower.value;
      goldLower.value = goldUpper.value;
      goldUpper.value = goldv;
  }

  redUpper = document.getElementById("dashdash_lineU");
  if(isNaN(redUpper.value)) {
    redUpper.value = 0.4;
  }

  redLower = document.getElementById("dashdash_lineL");
  if(isNaN(redLower.value)) {
    redLower.value = 0;
  }

  if(redUpper.value < redLower.value) {
      redv = redLower.value;
      redLower.value = redUpper.value;
      redUpper.value = redv;
  }

  // loop over the selected entities
	for (var i=0; i<data_graph.length; i++) {
    // get the first entity
		var myUri1 = data_graph[i];
    // loop a second time over the selected entities to retrieve the pairs
    // starting from the current entity in the first loop
		for (var j=0; j<data_graph.length; j++) {
      // get the second entity
			var myUri2 = data_graph[j];
      // check if the entities are not the same
      // if they are, ignore them and go to the next one
      if(myUri1 != myUri2) {
        // loop over the lines in the competences CSV file
  			for(var k=0; k<csv_data.length; k++) {
          // get the first entity of the current row
          var ent1 = csv_data[k]["Entity1"];
          // get the second entity of the current row
          var ent2 = csv_data[k]["Entity2"];
          // check if the first URI and entity and the second URI and entity are the same
          // if they are, get the necessary values
          if(myUri1 == ent1 && myUri2 == ent2 || myUri1 == ent2 && myUri2 == ent1) {
            // get the similarity
            var similarity = Number(csv_data[k]["Similarity"]);
            // get the relatedness
            var relatedness = Number(csv_data[k]["Relatedness"]);
            var value = 0
            // set the wanted value depending on the similarity and relatedness
            // if both values are above 0, take the average
            // if only one value is above 0, take the non-0 one
            // else, the wanted value stays at 0
            if(similarity > 0 && relatedness > 0) {
              value = (similarity + relatedness) / 2;
            } else if(similarity > 0 && relatedness == 0) {
              value = similarity;
            } else if(similarity == 0 && relatedness > 0) {
              value = relatedness;
            }

            var stroke = "";
            var color = "";
            // set the stroke of each link depending between which threshold the taken value lies
            if(value <= conUpper.value && value > conLower.value) {
              stroke = ("1, 0");
              color = "black";
            }
            else if(value <= dashUpper.value && value > dashLower.value) {
              stroke = ("10, 5");
              color = "dimgrey";
            }
            else if(value <= dashdashUpper.value && value > dashdashLower.value) {
              stroke = ("5, 9");
              color = "lightslategrey";
            }

            // check if the wanted value is between one of the thresholds
            // if it is, add the entity pair and the values to the link arrays
            if(stroke != "") {
              // for both entities take the first two and last two letters as the label
              //ent1 = (ent1.substr(0,2) + "_" + ent1.substr(ent1.length-2)).toUpperCase();
              //ent2 = (ent2.substr(0,2) + "_" + ent2.substr(ent2.length-2)).toUpperCase();
              // add the linked entities to the links
              var link = {"source": ent1, "target": ent2, "stroke": stroke, "color": color};
              links.push(link);
              // check if the linkValues array already contains the first entity
              // if it doens't, add the entity to it
              if(!(ent1 in linkValues)) {
                linkValues[ent1] = {};
              }

              // add the second entity and the values to the linkValues array
              linkValues[ent1][ent2] = {};
              linkValues[ent1][ent2]["sim"] = similarity;
              linkValues[ent1][ent2]["rel"] = relatedness;
              linkValues[ent1][ent2]["val"] = value;
            }

            break;
          }
        }
      }
    }
	}

  // enable the reload button
  button.disabled = false;

  // get the div of the graph and retrieve its height and width
  graph_document = document.getElementById("div_force_graph");
 //var width = graph_document.clientHeight;
  //var height = graph_document.clientWidth;
  var width = 600;
  var height = 400;
  var radius = 30;

  // remove the canvas and construct if again with the new values
  d3.select("svg").remove();

  // construct the svg canvas for the graph
  var svg = d3.select("#div_force_graph").append("svg")
            .attr("widthDisplay", "100%").attr("heightDisplay", "100%").attr("viewBox", " 0 0 "+width + " " +height);

  // set the pull between the nodes depending on the number of nodes
  /// the more nodes are selected, the weaker the pull is to better distribute nodes
  // set the center of the graph to the center of the canvas
  var simulation = d3.forceSimulation()
                   .force("charge", d3.forceManyBody().strength(-1000/data_graph.length))
                   .force("center", d3.forceCenter(width/2, height/2));

  // set the length of each to the sum of the height and width divided by 4
  simulation.force("link", d3.forceLink()
            .id(link => link.id)
            .distance((width+height)/4));

  // add the links of the entity pairs to the canvas
  var linkElements = svg.append("g")
                        .selectAll("line")
                        .data(links)
                        .enter().append("line")
                                .attr("stroke-width", link => 3)
                                .style("stroke-dasharray", link => link.stroke)
                                .attr("stroke", link => link.color);

  // add the nodes of the selected entities to the canvas
  var nodeElements = svg.append("g")
                     .selectAll("circle")
                     .data(nodes)
                     .enter().append("circle")
                             .attr("stroke", "black")
                             .attr("id", function(d, i) {
                               return "node-" + i;
                             })
                             .attr("fill", function(d) {
                               return d.group != "none" ? group_colors(d.group) : "dimgrey";
                             })
                             .attr("r", 6);

  // add the labels of the selected entities to the canvas
  var textElements = svg.append("g")
                     .selectAll("text")
                     .data(nodes)
                     .enter().append("text")
                             .text(d => d.id)
                             .style("font-size", "12px")
                             .style("font-weight", "bold")
							 //.style("paint-order", "stroke")
                             //.style("fill", "white")
                             //.style("stroke", "black")
                             //.style("stroke-width", "5px")
                             .attr("dx", -35)
                             .attr("dy", -13);

  // add a hover window to display the values of the links
  var toolTip = d3.select("body")
                .append("div")
                .attr("class", "tool_graph");

  // connect the nodes with the links and their corresponding labels
  simulation.nodes(nodes).on("tick", () => {
    linkElements
      .attr("x1", link => link.source.x)
      .attr("y1", link => link.source.y)
      .attr("x2", link => link.target.x)
      .attr("y2", link => link.target.y);
    // function for the x- and y-axes so that the nodes are always inside the canvas
    nodeElements
      .attr("cx", function(d) {return d.x = Math.max(radius, Math.min(width - radius, d.x));})
      .attr("cy", function(d) {return d.y = Math.max(radius, Math.min(height - radius, d.y));});
    textElements
      .attr("x", node => node.x)
      .attr("y", node => node.y);
  });

  // set the links
  simulation.force('link').links(links);

  // set the function when a node is clicked on to only display nodes that are connected with the selected node
  nodeElements.on("click", selectNode);

  // set the function when the mouse is hovered over a link to display a window with the similarity, relatedness and taken value
  // on mousemove the opend window follows the mouse pointer
  linkElements.on("mouseover", mouseLink)
              .on("mousemove", function(){return toolTip.style("top", (d3.event.pageY-10)+"px").style("left",(d3.event.pageX+10)+"px");})
              .on("mouseout", function(){return toolTip.style("visibility", "hidden");});

  // function to set the color of the node depending on its category
  // if no category is avaiable, set it to grey
  function getGroupColor(node) {
    return all_nodes[node].group != "none" ? group_colors(all_nodes[node].group) : "dimgrey";
  }

  // function to return all nodes that are connected with the selected node
  function getNeighbors(node) {
    return links.reduce((neighbors, link) => {
      if(link.target.id == node.id) {
        neighbors.push(link.source.id);
      } else if(link.source.id == node.id) {
        neighbors.push(link.target.id);
      }
      return neighbors;
    }, [node.id]);
  }

  // function to check if two nodes are connected
  function isNeighborLink(node, link) {
    return link.target.id == node.id || link.source.id == node.id;
  }

  // function to the change the color of the nodes
  // if no connection between the node and the selected node exists, change the color of the node to white
  function getNodeColor(node, neighbors, selectedNode) {
    return neighbors.indexOf(node.id) > -1 ? getGroupColor(node.index) : "white";
  }

  // function to the change the color of the labels
  // if no connection exists, change the color to burlyWood
  function getTextColor(node, neighbors) {
    return neighbors.indexOf(node.id) > -1 ? "black" : "burlyWood";
  }

  // function to set the width of the links
  // if the node is connected to the selected node, change the size of the width to 3
  // else if no connection exists, change the width to the link to 0
  function getLinkStroke(node, link) {
    return isNeighborLink(node, link) ? 3 : 0;
  }

  // function to change the color of the nodes and labels and the width of the links
  // depending whether they are connected to the selected node or not
  function selectNode(selectedNode) {
    // if a selected node is clicked on when it was already selected, change the view of the graph to default
    // all nodes and labels to to their respective color, the width of all links to 3
    // else, chnage the color of the nodes and labels and the width of the links as described above
    if(previous_selected_node == selectedNode) {
      previous_selected_node = null;
      nodeElements
        .attr("fill", node => getGroupColor(node.index));
      textElements
        .attr("fill", node => "black");
      linkElements
        .attr("stroke-width", link => 3);
    } else {
      previous_selected_node = selectedNode;
      var neighbors = getNeighbors(selectedNode);
      nodeElements
        .attr("fill", node => getNodeColor(node, neighbors, selectedNode));
      textElements
        .attr("fill", node => getTextColor(node, neighbors));
      linkElements
        .attr("stroke-width", link => getLinkStroke(selectedNode, link));
    }
  }

  // function to display a window with the similarity, relatedness and taken value of a link
  // when the mouse is hovered over it
  function mouseLink(selectedLink) {
    var source = selectedLink["source"]["id"];
    var target = selectedLink["target"]["id"];
    var sim = linkValues[source][target]["sim"];
    var rel = linkValues[source][target]["rel"];
    var value = linkValues[source][target]["val"];
    // round all three value to three decimal places
    var sim_rounded = Math.round((sim + Number.EPSILON) * 1000) / 1000;
    var rel_rounded = Math.round((rel + Number.EPSILON) * 1000) / 1000;
    var val_rounded = Math.round((value + Number.EPSILON) * 1000) / 1000;
    toolTip.html("Similarity: " + sim_rounded + "<br>Relatedness: " + rel_rounded + "<br>Value: " + val_rounded);
    toolTip.style("visibility", "visible");
  }
};

$(document).ready(function() {
                $("#header").load("header.html");
                $("#footer").load("footer.html");
            });
