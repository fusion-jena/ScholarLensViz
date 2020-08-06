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
var colors = d3.scaleOrdinal(d3.schemeCategory20);
/**
 * Main Function Description: This function is called from the page load on the
 * index.html file. It draw the pie chart and table.
 */
function buildChord() {

	/* get the information by SPARQL query. The output is in JSON format.
		We need the competence name and number to draw the chord. */

	/* show the table view */
	number_of_competence = maximum_number;
	my_query_data = get_my_new_sparql_data('getUriCount', researcher, '', number_of_competence, '');
	/* since we want to show all competences in the table but not in chord, so we need to run SPARQL query two times with two different number of competences */
	my_query_data_table_data = my_query_data.results.bindings;

  

  // convert the query data  to a HTML table
  var all_names = [];
  for(var i=0; i < my_query_data_table_data.length; i++) {
    all_names[i] = my_query_data_table_data[i].uri.value.substr(28);
  }

	document.getElementById('div_table_view').innerHTML = json2table(my_query_data_table_data, all_names);
  document.getElementById("div_table_view").style.display = "block";

  // Set the user information on the box
	//document.getElementById('div_user_info').innerHTML = set_user_info(researcher);
	/**
	* HERE STARTS THE CODE FOR CHORD CHART
	*/

  // set the number of initial competences
	number_of_competence = initialNumber;
	my_query_data = get_my_new_sparql_data('getUriCount', researcher, '', number_of_competence, '');
	var data_chord = my_query_data.results.bindings;
  // arrays for the matrix (used to build the chart) and the names for the arcs
	var matrix = [];
	var names = [];
  var full_names = [];
  var value_map = new Map();
	// loop over the selected entities
	for (var i=0; i<data_chord.length; i++){
		matrix[i] = [];
    // get the first URI
		var elm1 = data_chord[i];
		var  myUri1 = elm1["uri"].value;
    // each label is like http://dbpedia.org/resource/Tree_(data_structure)", so we delete all first 28 charcters
		myUri1 = myUri1.substr(28);
    // for each entity take the first two and last two letters as the label
    var label = myUri1; //(myUri1.substr(0,2) + "_" + myUri1.substr(myUri1.length-2)).toUpperCase();
    // add the full and shortened names to their respective arrays
		names[i] = label;//.substr(28);
    full_names[i] = myUri1;
    // add the target to the value map
    if(!value_map.has(myUri1)) {
      value_map.set(myUri1, new Map());
    }

    // loop a second time over the selected entities to retrieve the pairs
		for (var j=0; j<data_chord.length; j++){
      // get the second URI
			var elm2 = data_chord[j];
			var myUri2 = elm2["uri"].value;
      // each label is like http://dbpedia.org/resource/Tree_(data_structure)", so we delete all first 28 charcters
			myUri2 = myUri2.substr(28);
      // by default each link between two entities is 0
      matrix[i][j] = 0;
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
            matrix[i][j] = value;
            // add the source for the target and its similarity, relatedness and
            // taken value to the value_map if it is above 0
            if(value > 0 && !value_map.get(myUri1).has(myUri2)) {
              value_map.get(myUri1).set(myUri2, new Map());
              value_map.get(myUri1).get(myUri2).set("sim", similarity);
              value_map.get(myUri1).get(myUri2).set("rel", relatedness);
              value_map.get(myUri1).get(myUri2).set("val", value);
            }

            break;
          }
        }
      }
		}
	}

  document.getElementById('div_chord_table').innerHTML = buildChordTable(value_map.keys().next().value);
  // loop over the matrix
  for(var i=0; i<matrix.length; i++) {
    // if an entity has no connection with another entity,
    // set the value of the entity to itself for better visualization
    var someIsNotZero = matrix[i].some(item => item !== 0);
    if(!someIsNotZero) {
      matrix[i][i] = 1;
    }
  }

	//var margin = {left:90, top:90, right:90, bottom:90},
	var margin = {left:120, top:120, right:120, bottom:120},
    width =  600// - margin.left - margin.right, // more flexibility: Math.min(window.innerWidth, 1000)
    height =  400// - margin.top - margin.bottom, // same: Math.min(window.innerWidth, 1000)
    innerRadius = Math.min(width, height) * .39,
    outerRadius = innerRadius * 1.1;


  opacityDefault = 0.8;

  ////////////////////////////////////////////////////////////
  /////////// Create scale and layout functions //////////////
  ////////////////////////////////////////////////////////////

  var chord = d3.chord()
    .padAngle(.15)
    .sortChords(d3.descending)

  var arc = d3.arc()
  .innerRadius(innerRadius*1.01)
  .outerRadius(outerRadius);

  var path = d3.ribbon()
  .radius(innerRadius);

////////////////////////////////////////////////////////////
////////////////////// Create SVG //////////////////////////
////////////////////////////////////////////////////////////

var svg = d3.select("#div_chord_chart").append("svg")
  //.attr("width", width + margin.left + margin.right)
  //.attr("height", height + margin.top + margin.bottom)
  .attr("widthDisplay", "100%").attr("heightDisplay", "100%").attr("viewBox", " 0 0 "+width + " " +height)
  .append("g")
  //.attr("transform", "translate(" + (width/2 + margin.left) + "," + (height/2 + margin.top) + ")")
  .attr("transform", "translate(" + (width/2) + "," + (height/2 ) + ") scale(0.75)")
  .datum(chord(matrix));

////////////////////////////////////////////////////////////
////////////////// Draw outer Arcs /////////////////////////
////////////////////////////////////////////////////////////

// add a hover window to display the values of the links
var toolTip = d3.select("body")
              .append("div")
              .attr("class", "tool_graph");

var outerArcs = svg.selectAll("g.group")
  .data(function(chords) { return chords.groups; })
  .enter().append("g")
  .attr("class", "group")
  .on("mouseover.fade", fade(.1))
  .on("mouseover.tooltip", function(d, i) {
    document.getElementById('div_chord_table').innerHTML = buildChordTable(names[d.index]);
  })
  .on("mouseout", fade(opacityDefault))

  // text popups
  //.on("click", mouseoverChord)
  .on("mouseout", mouseoutChord)
  .on("mouseout.tooltip", function() {return toolTip.style("visibility", "hidden");});

 outerArcs.append("path")
  .attr("id", function(d, i) { return names[d.index]; })
  .attr("d", arc);

 outerArcs.append("text")
          .attr("x", 6)
          .attr("dy", 15)
          .append("textPath")
            .attr("xlink:href", function(d) { return names[d.index]; })
            //.text(function(chords, i){return full_names[i];})
            .style("fill", "white");

 var o_arcs = d3.selectAll("path")._groups[0];
 for(var i=0; i < o_arcs.length; i++) {
   o_arcs[i].style.fill = colors(o_arcs[i].id);
 }

////////////////////////////////////////////////////////////
////////////////////// Append names ////////////////////////
////////////////////////////////////////////////////////////

//Append the label names on the outside
outerArcs.append("text")
  .each(function(d) { d.angle = (d.startAngle + d.endAngle) / 2; })
  .attr("dy", ".35em")
  .attr("class", "titles")
  .attr("text-anchor", function(d) { return d.angle > Math.PI ? "end" : null; })
  .attr("transform", function(d) {
    return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"
    + "translate(" + (outerRadius + 10) + ")"
    + (d.angle > Math.PI ? "rotate(180)" : "");
  })
  .text(function(d,i) { return names[i]; });

////////////////////////////////////////////////////////////
////////////////// Draw inner chords ///////////////////////
////////////////////////////////////////////////////////////

svg.selectAll("path.chord")
  .data(function(chords) { return chords; })
  .enter().append("path")
  .attr("class", "chord")
  .attr("id", function(d, i) { return names[d.source.index]; })
  .style("opacity", opacityDefault)
  .attr("d", path);

  var i_arcs = d3.selectAll("path.chord")._groups[0];
  for(var i=0; i < i_arcs.length; i++) {
    i_arcs[i].style.fill = colors(i_arcs[i].id);
  }

////////////////////////////////////////////////////////////
////////////////// Extra Functions /////////////////////////
////////////////////////////////////////////////////////////

function popup() {
  return function(d,i) {
    console.log("love");
  };
}//popup

//Returns an event handler for fading a given chord group.
function fade(opacity) {
  return function(d,i) {
    svg.selectAll("path.chord")
        .filter(function(d) { return d.source.index != i && d.target.index != i; })
    .transition()
        .style("opacity", opacity);
  };
}//fade

  //Highlight hovered over chord
function mouseoverChord(d,i) {

  //Decrease opacity to all
  svg.selectAll("path.chord")
    .transition()
    .style("opacity", 0.1);
  //Show hovered over chord with full opacity
  d3.select(this)
    .transition()
        .style("opacity", 1);

  //Define and show the tooltip over the mouse location
  $(this).popover({
    //placement: 'auto top',
    title: 'test',
    placement: 'right',
    container: 'body',
    animation: false,
    offset: "20px -100px",
    followMouse: true,
    trigger: 'click',
    html : true,
    content: function() {
      return "<p style='font-size: 11px; text-align: center;'><span style='font-weight:900'>"  +
           "</span> text <span style='font-weight:900'>"  +
           "</span> folgt hier <span style='font-weight:900'>" + "</span> movies </p>"; }
  });
  $(this).popover('show');
}
//Bring all chords back to default opacity
function mouseoutChord(d) {
  //Hide the tooltip
  $('.popover').each(function() {
    $(this).remove();
  })

  //Set opacity back to default for all
  svg.selectAll("path.chord")
    .transition()
    .style("opacity", opacityDefault);
  }      //function mouseoutChord

// ################################################################################################
	// ################################################################################################
	/**
	 * Function to convert json data to table view
	 *
	 * @param Json,
	 *            classes
	 */
	function json2table(json, all_names, classes) {
    var cols = Object.keys(json[0]);

    //////////////////////////////////////////////
    //////////////// new table code //////////////
    //////////////////////////////////////////////
    var headerRow = "<div class=\"table-responsive\">" +
                      "<table class=\"table table-bordered\">" +
                        "<tr>" +
                          "<th scope=\"col\">Display</th>" +
                          "<th scope=\"col\">URI</th>" +
                          "<th scope=\"col\">Count</th>" +
                        "</tr>";

    var bodyRows = "";
    var index = 0;
    var currentNum = 0;
    // loop over the rows and columns of the query json data
		json.map(function(row) {
      bodyRows += "<tr>";
			cols.map(function(colName) {
        // if the current column is the URI,
        // add the link of the URI concept to DBPedia site to the HTML table as the first column
				if (colName == "uri") {
          var value = row[colName].value.toString().split("/")[4];
					bodyRows += "<td class=\"tableView_Chord_Tag_Checkbox;align-middle\"><input name=\"chord_checkbox\" type=\"checkbox\"";
          // if the current row number is less than the number of initial competences,
          // set the checkbox to checked
					if (currentNum < initialNumber){
						bodyRows += "id=\"" + String(value) + "\" checked>";
						currentNum += 1;
          // else, leave the checkbox unchecked
					} else {
						bodyRows += "id=\"" + String(value) + "\">";
					}

          var color = colors(all_names[index]);
          bodyRows += "<td class=\"align-middle\"><a href=\"http://dbpedia.org/resource/" + value.split(" ")[0] + "\" target=\"_blank\"><span style=\"color:" + color + "\">&#9632</span> " + value + "</a></td>";
        // if the current column is the count,
        // add the count of the concept to the HTML table as the second column
        } else if(colName == "count") {
          bodyRows += "<td class=\"align-middle\">" + row[colName].value.toString() + "</td>";
        // else, add the respective categories of the concept to the HTML table as the third column
      } 
      });

      bodyRows += "</tr>";
      index++;
    });

    return headerRow + bodyRows + "</div>";

	}

  // method to build the table with all targets and their values given by a source
  function buildChordTable(source) {
    var headerRow = "<div class=\"table-responsive\">" +
                      "<table class=\"table table-bordered\">" +
                        "<tr>" +
                          "<th scope=\"col\">Source</th>" +
                          "<th scope=\"col\">" + source + "</th>" +
                        "</tr>";
    headerRow += "<tr>" +
                   "<th scope=\"col\">Target</th>" +
                   "<th scope=\"col\">Similarity</th>" +
                   "<th scope=\"col\">Relatedness</th>" +
                   "<th scope=\"col\">value</th>" +
                 "</tr>";
    var bodyRows = "";
    for(var [target, value] of value_map.get(source).entries()) {
      bodyRows += "<tr>";
      var sim = value.get("sim");
      var rel = value.get("rel");
      var value = value.get("val");
      // round the value to three decimal places
      var sim_rounded = Math.round((sim + Number.EPSILON) * 1000) / 1000;
      var rel_rounded = Math.round((rel + Number.EPSILON) * 1000) / 1000;
      var val_rounded = Math.round((value + Number.EPSILON) * 1000) / 1000;
      bodyRows += "<td>" + target + "</td><td>" + sim_rounded + "</td>" +
                  "<td>" + rel_rounded + "</td><td>" + val_rounded + "</td></tr>";
    }

    return headerRow + bodyRows + "</table></div>";
  }

  //document.getElementById("page").style.display = "block";

  document.getElementById("loading").remove();
  document.getElementById("header").style.display = "block";
  document.getElementById("widget-container").style.display = "block";
};

// #### END OF MAIN FUNCTION ########################

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

// ################################################################################################
// ##################### Extra Functions #################
// ################################################################################################

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

/**
 * Function to call ajax query of the user information
 */
function get_my_new_sparql_data(my_sel, my_researcher, my_uri, my_limit,
		my_offset) {
	/* To run barchart from online data on the server, use the below code: */
	//var url = 'https://dev.gfbio.org:8181/', my_data;

	/* To run barchart from your local machine, use the below code: */
	//var url = '/', my_data;
    var url = node + '/', my_data;

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

// function to add the abbreviated names to the table
function addAbbreviations(data) {
  // loop over the query data
  for(var i = 0; i < data.length; i++) {
    // get the concept
    var name = data[i]["uri"]["value"].substr(28);
    // take the first two letters and the last two letter divided by a '_'
    // and add it as the abbreviation to the query data URI value
    var label = (name.substr(0,2) + "_" + name.substr(name.length-2)).toUpperCase();
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

// function to reload the chord with the selected entities
// in general, this function works in the same way as the main function
// the only difference is that the selected entities can differ
function reloadChord(){
  // disable the reload button till the chord is loaded
  var button = document.getElementById("div_reload_chord_btn");
  button.disabled = true;
	var selectedDataId = [];
	var selectedData = document.getElementsByName("chord_checkbox");
  // loop over the checkboxes of the table
	for (var i = 0; i < selectedData.length; i++) {
    // if the a box was checked, get the entity and add it to the list
		if (selectedData[i].checked) {
			selectedDataId.push(selectedData[i].id);
		}
	}

	/**
	* HERE STARTS THE CODE FOR CHORD CHART
	*/
	var data_chord = selectedDataId;
  // arrays for the matrix (used to build the chart) and the names for the arcs
	var matrix = [];
	var names = [];
  var full_names = [];
  var value_map = new Map();
  // loop over the selected entities
	for (var i=0; i<data_chord.length; i++){
		matrix[i] = [];
    // get the first URI
		var myUri1 = data_chord[i];
    // for each entity take the first two and last two letters as the label
    label = myUri1; //(myUri1.substr(0,2) + "_" + myUri1.substr(myUri1.length-2)).toUpperCase();
    // add the full and shortened names to their respective arrays
		names[i] = label;
    full_names[i] = myUri1;
    // add the target to the value map
    if(!value_map.has(myUri1)) {
      value_map.set(myUri1, new Map());
    }

    // loop a second time over the selected entities to retrieve the pairs
		for (var j=0; j<data_chord.length; j++){
			var myUri2 = data_chord[j];
      // by default each link between two entities is 0
      matrix[i][j] = 0;
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

            matrix[i][j] = value;
            // add the source for the target and its similarity, relatedness and
            // its taken value to the value_map if it is above 0
            if(value > 0 && !value_map.get(myUri1).has(myUri2)) {
              value_map.get(myUri1).set(myUri2, new Map());
              value_map.get(myUri1).get(myUri2).set("sim", similarity);
              value_map.get(myUri1).get(myUri2).set("rel", relatedness);
              value_map.get(myUri1).get(myUri2).set("val", value);
            }

            break;
          }
        }
      }
		}
	}

  document.getElementById('div_chord_table').innerHTML = buildChordTable(data_chord[0]);
  // loop over the matrix
  for(var i=0; i<matrix.length; i++) {
    // if an entity has no connection with another entity,
    // set the value of the entity to itself for better visualization
    var someIsNotZero = matrix[i].some(item => item !== 0);
    if(!someIsNotZero) {
      matrix[i][i] = 1;
    }
  }

	//var margin = {left:90, top:90, right:90, bottom:90},
	var margin = {left:60, top:60, right:60, bottom:60},
    width =  600// - margin.left - margin.right, // more flexibility: Math.min(window.innerWidth, 1000)
    height =  400// - margin.top - margin.bottom, // same: Math.min(window.innerWidth, 1000)
    innerRadius = Math.min(width, height) * .39,
    outerRadius = innerRadius * 1.1;

  opacityDefault = 0.8;
	/* delete the previous svg one and create a new one */
	d3.select("svg").remove();

  ////////////////////////////////////////////////////////////
  /////////// Create scale and layout functions //////////////
  ////////////////////////////////////////////////////////////

  var chord = d3.chord()
    .padAngle(.15)
    .sortChords(d3.descending)

    var arc = d3.arc()
    .innerRadius(innerRadius*1.01)
    .outerRadius(outerRadius);

  var path = d3.ribbon()
  .radius(innerRadius);

////////////////////////////////////////////////////////////
////////////////////// Create SVG //////////////////////////
////////////////////////////////////////////////////////////

var svg = d3.select("#div_chord_chart").append("svg")
  //.attr("width", width + margin.left + margin.right)
  //.attr("height", height + margin.top + margin.bottom)
  .attr("widthDisplay", "100%").attr("heightDisplay", "100%").attr("viewBox", " 0 0 "+width +" " +height)
  .append("g")
  .attr("transform", "translate(" + (width/2) + "," + (height/2) + ") scale(0.75)")
  .datum(chord(matrix));

////////////////////////////////////////////////////////////
////////////////// Draw outer Arcs /////////////////////////
////////////////////////////////////////////////////////////

var toolTip = d3.select("body")
              .append("div")
              .attr("class", "tool_graph");

var outerArcs = svg.selectAll("g.group")
  .data(function(chords) { return chords.groups; })
  .enter().append("g")
  .attr("class", "group")
  .on("mouseover.fade", fade(.1))
  .on("mouseover.tooltip", function(d, i) {
    document.getElementById('div_chord_table').innerHTML = buildChordTable(names[d.index]);
  })
  .on("mouseout", fade(opacityDefault))

  // text popups
  //.on("click", mouseoverChord)
  .on("mouseout", mouseoutChord)
  .on("mouseout.tooltip", function() {return toolTip.style("visibility", "hidden");});

  outerArcs.append("path")
   .attr("id", function(d, i) { return names[d.index]; })
   .attr("d", arc);

  outerArcs.append("text")
           .attr("x", 6)
           .attr("dy", 15)
           .append("textPath")
             .attr("xlink:href", function(d) { return names[d.index]; })
             .text(function(chords, i){return full_names[i];})
             .style("fill", "white");

  var o_arcs = d3.selectAll("path")._groups[0];
  for(var i=0; i < o_arcs.length; i++) {
    o_arcs[i].style.fill = colors(o_arcs[i].id);
  }


////////////////////////////////////////////////////////////
////////////////////// Append names ////////////////////////
////////////////////////////////////////////////////////////

//Append the label names on the outside
outerArcs.append("text")
  .each(function(d) { d.angle = (d.startAngle + d.endAngle) / 2; })
  .attr("dy", ".35em")
  .attr("class", "titles")
  .attr("text-anchor", function(d) { return d.angle > Math.PI ? "end" : null; })
  .attr("transform", function(d) {
    return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"
    + "translate(" + (outerRadius + 10) + ")"
    + (d.angle > Math.PI ? "rotate(180)" : "");
  })
  .text(function(d,i) { return names[i]; });

////////////////////////////////////////////////////////////
////////////////// Draw inner chords ///////////////////////
////////////////////////////////////////////////////////////

svg.selectAll("path.chord")
  .data(function(chords) { return chords; })
  .enter().append("path")
  .attr("class", "chord")
  .attr("id", function(d, i) { return names[d.source.index]; })
  .style("opacity", opacityDefault)
  .attr("d", path);

  var i_arcs = d3.selectAll("path.chord")._groups[0];
  for(var i=0; i < i_arcs.length; i++) {
    i_arcs[i].style.fill = colors(i_arcs[i].id);
  }

////////////////////////////////////////////////////////////
////////////////// Extra Functions /////////////////////////
////////////////////////////////////////////////////////////

// method to build the table with all targets and their values given by a source
function buildChordTable(source) {
  var headerRow = "<div class=\"table-responsive\">" +
                    "<table class=\"table table-bordered header-fixed\">" +
                      "<tr>" +
                        "<th scope=\"col\">Source</th>" +
                        "<th scope=\"col\">" + source + "</th>" +
                      "</tr>";
  headerRow += "<tr>" +
                 "<th scope=\"col\">Target</th>" +
                 "<th scope=\"col\">Similarity</th>" +
                 "<th scope=\"col\">Relatedness</th>" +
                 "<th scope=\"col\">value</th>" +
               "</tr>";
  var bodyRows = "";
  for(var [target, value] of value_map.get(source).entries()) {
    bodyRows += "<tr>";
    var sim = value.get("sim");
    var rel = value.get("rel");
    var value = value.get("val");
    // round the value to three decimal places
    var sim_rounded = Math.round((sim + Number.EPSILON) * 1000) / 1000;
    var rel_rounded = Math.round((rel + Number.EPSILON) * 1000) / 1000;
    var val_rounded = Math.round((value + Number.EPSILON) * 1000) / 1000;
    bodyRows += "<td>" + target + "</td><td>" + sim_rounded + "</td>" +
                "<td>" + rel_rounded + "</td><td>" + val_rounded + "</td></tr>";
  }

  return headerRow + bodyRows + "</table></div>";
}

function popup() {
  return function(d,i) {
    console.log("love");
  };
}//popup

//Returns an event handler for fading a given chord group.
function fade(opacity) {
  return function(d,i) {
    svg.selectAll("path.chord")
        .filter(function(d) { return d.source.index != i && d.target.index != i; })
    .transition()
        .style("opacity", opacity);
  };
}//fade

  //Highlight hovered over chord
function mouseoverChord(d,i) {

  //Decrease opacity to all
  svg.selectAll("path.chord")
    .transition()
    .style("opacity", 0.1);
  //Show hovered over chord with full opacity
  d3.select(this)
    .transition()
        .style("opacity", 1);

  //Define and show the tooltip over the mouse location
  $(this).popover({
    //placement: 'auto top',
    title: 'test',
    placement: 'right',
    container: 'body',
    animation: false,
    offset: "20px -100px",
    followMouse: true,
    trigger: 'click',
    html : true,
    content: function() {
      return "<p style='font-size: 11px; text-align: center;'><span style='font-weight:900'>"  +
           "</span> text <span style='font-weight:900'>"  +
           "</span> folgt hier <span style='font-weight:900'>" + "</span> movies </p>"; }
  });
  $(this).popover('show');
}
//Bring all chords back to default opacity
function mouseoutChord(d) {
  //Hide the tooltip
  $('.popover').each(function() {
    $(this).remove();
  })
  //Set opacity back to default for all
  svg.selectAll("path.chord")
    .transition()
    .style("opacity", opacityDefault);
  }      //function mouseoutChord
};

$(document).ready(function() {
                $("#header").load("header.html");
                $("#footer").load("footer.html");
            });

//Source of chord diagram: https://stackoverflow.com/questions/43259039/how-to-add-labels-into-the-arc-of-a-chord-diagram-in-d3-js
//and in https://jsfiddle.net/rjonean4/
