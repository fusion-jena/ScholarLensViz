// get the researcher specified in the URL
var researcher = new URLSearchParams(window.location.search).get("researcher_id");
// get the researcher's name specified in the URL
var researcherName = new URLSearchParams(window.location.search).get("researcher_name");
// get the fuseki adress specified in the URL
var fuseki = new URLSearchParams(window.location.search).get("fuseki");
// get the node adress specified in the URL
var node = new URLSearchParams(window.location.search).get("node");
// Define the global variables
var mouse_pos_X = 0, mouse_pos_Y = 0, my_query_data = '', my_query_data_test, my_active_id, line_height_shift = 10, namespace = 'http://semanticsoftware.info/lodexporter/creator/', response = '', transition_Delay = 1000;
// variable setting the colors for the categories
var group_colors = d3.scale.category20();
var arc_map = {};
// ################################################################################################
/**
 * Main Function Description: This function is called from the page load on the
 * index.html file. It draw the pie chart and table.
 */
function buildPie() {
	// TODO: here should be the user call back information
	my_query_data = get_my_new_sparql_data('getUriCount', researcher, '', '25', '');
	my_user = researcher;

	var width = 600, height = 400, my_query_data_pie = my_query_data.results.bindings, circle_ids = d3
			.range(my_query_data_pie.length);

	// HERE STARTS THE TABLE CREATION for DIFFERENT VIEW
	my_query_data_table_data = my_query_data.results.bindings;
  // map containing all categories for each URI
  var cat_map = {};
  // array containing the IDs of all concepts and their categories
  var arcs = [];
  // loop over all URIs and get their categories
  for(var i=0; i<my_query_data_table_data.length; i++) {
    // get the first URI
    var elm = my_query_data_table_data[i];
    var  myUri = elm["uri"].value;
    cat_map[myUri] = [];
//**************start Category Information ******************//
    try {
      //Limit is set to 10 (do we have URIs with more than 10 categories?)
      my_query_category = get_category('getCategory',researcher, myUri, 10);
      var categories = my_query_category.results.bindings;
      // check if the URI has at least one category
      if(categories.length > 0) {
        // loop over all categories of the given URI
        for(var j = 0; j < categories.length; j++) {
          // get the category name and add it to the category map
          var cat_uri = categories[j]["superTopicEq"]["value"].split("/");
          var category = cat_uri[cat_uri.length-1];
          cat_map[myUri].push(category);
          // set the first category as the default view
          if(j == 0) {
            var arc = {"id": myUri.substr(28), "group": category};
            arcs.push(arc);
          }
        }
      // if the URI has no category, the URI category is NONE
      } else {
        var arc = {"id": myUri.substr(28), "group": "none"};
        arcs.push(arc);
      }
    } catch(error) {
      var arc = {"id": myUri.substr(28), "group": "none"};
      arcs.push(arc);
    }
// ************* end Category Information ********************//
  }

  // add the category view to the table
  my_query_data_table_data = addCategories(my_query_data_table_data, cat_map);
  // convert the query data  to a HTML table
	document.getElementById('div_table_view').innerHTML = json2table(my_query_data_table_data, cat_map);
  document.getElementById("btn_Sources").style.background = "white";
  document.getElementById("btn_Sources").style.color = "#000";
  document.getElementById("btn_Table").style.background = "#0b60a1";
  document.getElementById("btn_Table").style.color = "#fff";
  document.getElementById("div_table").style.display = "none";
  document.getElementById("hint").innerHTML = "Competences of Researcher " + researcherName + " and their frequencies how often they appear over the latest 10 publications listed in <a href=\"https://dblp.uni-trier.de/\">dblp</a>. All competences are linked to <a href=\"https://wiki.dbpedia.org/\">DBpedia</a> URIs obtained from <a href=\"https://www.dbpedia-spotlight.org/\" target=\"_blank\">DBpedia Spotlight</a>. Click on a pie slice and inspect the provenance. The category is obtained from the <a href=\"https://cso.kmi.open.ac.uk\" target=\"blank\">CSO Ontology</a>.";
  document.getElementById("div_table_view").style.display = "block";

  var outerRadius = height / 1.5 - height / 4, innerRadius = height / 3
			- height / 6, cornerRadius = 10;

	var pie = d3.layout.pie().padAngle(.03);
	var arc = d3.svg.arc().padRadius(outerRadius).innerRadius(innerRadius);
  // window displaying the label of the pie piece
  var entityWindow = d3.select("body")
                     .append("div")
                     .attr("class", "entity_window");

	// The svg_pie_chart will be added to the div_visualization of the
	// index.html file
	// Here, only the svg_pie_chart element is created.
	var svg = d3.select("#div_visualization").append("svg")
			.attr("widthDisplay", "100%").attr("heightDisplay", "100%").attr("viewBox", " 0 0 "+width + " " +height).attr("id",
					"viz_pieChart").append("g").attr("transform",
					"translate(" + width / 2 + "," + height / 2 + ")");

	// Here, the data is assigned to the svg_pie_chart
	svg
			.selectAll("path")
			.data(pie(my_query_data_pie.map(function(d) {
				return parseInt(d.count.value);
			})))
			.enter()
			.append("path")
			.each(function(d) {
				d.outerRadius = outerRadius - 20;
        var my_delay = 200, my_body = document.body;
        my_active_data = d;
        if (!($(".with_nav")[0])) {
          my_body.className = 'with_nav';
        };
			})
			.attr("id", function(d, i) {
        arc_map[i] = d;
        if(i == 0) {
          // show first competence by default
          my_active_id = "slice-0";
          my_active_id_track = my_active_id.substr(6);
          var my_query_help = my_query_data.results.bindings[my_active_id_track].uri.value
              .toString(), my_label_data, my_table_data = [];

          my_label_data = get_my_new_sparql_data('getCompRecSentence', researcher,
              my_query_help, '', '');

          // loop over all competences and add them to the table of the current concept
          for (var my_count = 0; my_count < my_label_data.results.bindings.length; my_count++) {
            // check if the current competence has a DOI
            // if not, set the DOI to "not avaiable"
            var doi = "No DOI avaiable";
            if("doi" in my_label_data.results.bindings[my_count]) {
                doi = my_label_data.results.bindings[my_count].doi.value;
            }

            // set the current information (count starts at 1) for the table
            my_table_data[my_count] = {
              'Nbr' : my_count,
              //'Record' : my_label_data.results.bindings[my_count].competenceRecord.value,
          'Record' : my_label_data.results.bindings[my_count].content.value,
              'Publication': my_label_data.results.bindings[my_count].articleTitle.value,
              'DOI': doi,
        'MySentStart' : my_label_data.results.bindings[my_count].my_sent_start.value,
          'MySentEnd' : my_label_data.results.bindings[my_count].my_sent_end.value,
          'MyTopicStart' : my_label_data.results.bindings[my_count].my_topic_start.value,
          'MyTopicEnd' : my_label_data.results.bindings[my_count].my_topic_end.value
            };
          }

          // tabulate the information as a HTML table
          document.getElementById("div_table").innerHTML = tabulate(my_table_data, ['Nbr', 'Record', 'Publication', 'DOI']);
          // mark the concept in each sentence
          table_mark_topic(my_label_data);
        	// HERE ENDS TABLE CREATION for DIFFERENT VIEW
          my_label_data = get_my_new_sparql_data('getLabelComment', researcher,
              my_query_help, '', '');
          comment = my_label_data.results.bindings[0].comment.value;
          document.getElementById("label_comment").innerHTML = comment;
          document.getElementById("label_ref").innerHTML = "For more information see: "
              + "<a class=\"label_query\" href='"
              + my_query_help
              + "'"
              + " target='_blank'>"
              + my_query_help + "</a>";

          toolTip(d);

          document.getElementById("label_header").style.display = "block";
          document.getElementById("label_comment").style.display = "block";
          document.getElementById("label_ref").style.display = "block";
        }

				return "slice-" + circle_ids[i];
			})
			.attr("d", arc)
      // change the color of each piece depending on its first category
      .style("fill", function(d, i) {
        return getGroupColor(i);
      })
      .style("stroke-width", 0)
			.on("mouseover", function() {
        my_active_id_track = this.id.substr(6);
        var my_query_help = my_query_data.results.bindings[my_active_id_track].uri.value
            .toString(), my_label_data, my_table_data = [];
        my_label_data = get_my_new_sparql_data('getLabelComment', researcher,
            my_query_help, '', '');
        label = null;
        try {
          label = my_label_data.results.bindings[0].label.value;
        } catch(error) {
            label = my_query_data.results.bindings[my_active_id_track].uri.value.substr(28);
        }

        // show the label of the pie piece when hovering over it
        entityWindow.html(label);
        entityWindow.style("visibility", "visible");
        arcTween(outerRadius, 0).call(this)
      })
      // the label follows the mouse when moving
      .on("mousemove", function(){return entityWindow.style("top", (d3.event.pageY-10)+"px").style("left",(d3.event.pageX+10)+"px");})
      // the label window is hidden when moving outside a pie piece
			.on("mouseout", function() {
        entityWindow.style("visibility", "hidden");
				arcTween(outerRadius - 20, 150).call(this);
			})
      // on click display the table containing the marked sentence, the publication and its DOI
			.on(
					"click",
					function(d) {
            var pieces = svg.selectAll("path")[0];
            for(var i=0; i < pieces.length; i++) {
              pieces[i].style.strokeWidth = 0;
            }

						arcTween(outerRadius, 0);
						my_active_id = this.id;
            document.getElementById(my_active_id).style.stroke = "green";
            document.getElementById(my_active_id).style.strokeWidth = 5;
            my_active_id_track = my_active_id.substr(6);
            var my_query_help = my_query_data.results.bindings[my_active_id_track].uri.value
          			.toString(), my_label_data, my_table_data = [];

            my_label_data = get_my_new_sparql_data('getCompRecSentence', researcher,
        				my_query_help, '', '');

            // loop over all competences and add them to the table of the current concept
        		for (var my_count = 0; my_count < my_label_data.results.bindings.length; my_count++) {
              // check if the current competence has a DOI
              // if not, set the DOI to "not avaiable"
              var doi = "No DOI avaiable";
              if("doi" in my_label_data.results.bindings[my_count]) {
                  doi = my_label_data.results.bindings[my_count].doi.value;
              }

              // set the current information (count starts at 1) for the table
        			my_table_data[my_count] = {
        				'Nbr' : my_count,
        				//'Record' : my_label_data.results.bindings[my_count].competenceRecord.value,
						'Record' : my_label_data.results.bindings[my_count].content.value,
                'Publication': my_label_data.results.bindings[my_count].articleTitle.value,
                'DOI': doi,
				'MySentStart' : my_label_data.results.bindings[my_count].my_sent_start.value,
						'MySentEnd' : my_label_data.results.bindings[my_count].my_sent_end.value,
						'MyTopicStart' : my_label_data.results.bindings[my_count].my_topic_start.value,
						'MyTopicEnd' : my_label_data.results.bindings[my_count].my_topic_end.value
        			};
        		}

            // tabulate the information as a HTML table
        		document.getElementById("div_table").innerHTML = tabulate(my_table_data, ['Nbr', 'Record', 'Publication', 'DOI']);
            // mark the concept in each sentence
        		table_mark_topic(my_label_data);
        		document.getElementById("btn_Sources").style.background = "#0b60a1";
				    document.getElementById("btn_Sources").style.color = "#fff";
        		document.getElementById("btn_Table").style.background = "white";
				    document.getElementById("btn_Table").style.color = "#000";
        		document.getElementById("hint").innerHTML = "Based on " +researcherName+"'s 10 latest publications listed in <a href=\"https://dblp.uni-trier.de/\" target=\"_blank\">dblp</a>, we identified entities and phrases that characterize the scholar's competences. Click on a pie slice to inspect further competences.";
		        document.getElementById("hint").style.display = "block";
        		document.getElementById("div_table").style.display = "block";
            document.getElementById("div_table_view").style.display = "none";
            document.getElementById("btn_Sources").disabled = false;

						var lineFunction = d3.svg.line().x(function(d) {
							return d.x;
						}).y(function(d) {
							return d.y;
						}).interpolate('linear');

						var lineData = [ {
							"x" : height / 16,
							"y" : -outerRadius
						}, {
							"x" : height / 16 + line_height_shift,
							"y" : -outerRadius - line_height_shift
						}, {
							"x" : height / 16 + line_height_shift + height / 4,
							"y" : -outerRadius - line_height_shift
						} ];

						// call tooTip function for on_click event, before that,
						// it removes the previous information
						d3.selectAll(".toolCircle").remove();
						toolTip(d);
            my_label_data = get_my_new_sparql_data('getLabelComment', researcher,
        				my_query_help, '', '');
            try {
              comment = my_label_data.results.bindings[0].comment.value;
              document.getElementById("label_comment").innerHTML = comment;
              document.getElementById("label_ref").innerHTML = "For more information see: "
          				+ "<a class=\"label_query\" href='"
          				+ my_query_help
          				+ "'"
          				+ " target='_blank'>"
          				+ my_query_help + "</a>";

              document.getElementById("label_header").style.display = "block";
              document.getElementById("label_comment").style.display = "block";
              document.getElementById("label_ref").style.display = "block";
            } catch {
              document.getElementById("label_header").style.display = "none";
              document.getElementById("label_comment").style.display = "none";
              document.getElementById("label_ref").style.display = "none";
              alert("Unable to access comments of competence: " + label);
            }
					})

			// For transition in the 1st load
			.transition().ease("Linear").duration(transition_Delay).attrTween(
					"d", function(b) {
						b.innerRadius = 0;
						var i = d3.interpolate({
							startAngle : 0,
							endAngle : 0
						}, b);
						return function(t) {
							return arc(i(t));
						};
					});

	// Action on the mouse over and mouse out on the pie chart
	svg.selectAll("rect").on("mouseover", function(d) {
	}).on("mouseout", arcTween(outerRadius - 20, 150));

  document.getElementById("slice-0").style.stroke = "green";
  document.getElementById("slice-0").style.strokeWidth = 5;

  // add a click function to show the piece of the chart when clicked on the competence in the table
  for(var i=0; i < my_query_data_table_data.length; i++) {
    document.getElementById ("entity-" + i).addEventListener("click", function() {showPiePiece(this.id.split("-")[1]);}, false);
  }

	// Set the user information on the box
	//document.getElementById('div_user_info').innerHTML = set_user_info(my_user);

	// ################################################################################################
	/**
	 * Function to create tool tip Description: create the middle circle and add
	 * data and value on the circle.
	 */
	function toolTip(d) {
		var uri = my_query_data_pie[my_active_id.substr(6)].uri.value
				.toString().substr(28), value = d.value.toString();
		var tip = '';
		var uri_title = uri;
		
		if(uri_title.includes('_')) {
		  var res = uri.split('_');
		  
		  if(res.length > 2){
			var dyStart = -2.2;
		  }
		  else if(res.length == 2){
			var dyStart = -1.2;
		  }
		  else{
			  dyStart = 0.2;
		  }
		  
		  tip += '<tspan style="width: 10px;" x="0" dy="'+dyStart+'em">' + res[0] + '</tspan>';
		  
		  var dy = 1.2;
		  for(var k=1; k < res.length; k++){    
		   tip += '<tspan style="width: 10px;" x="0" dy="'+dy+'em">' + res[k] + '</tspan>';
		 }
		  
		}else{
			tip += '<tspan style="width: 10px;" x="0" dy="0.2em">' + uri_title+ '</tspan>';
		}
		tip += '<tspan x="0" dy="2.2em">Value: ' + value + '</tspan>';
	
		svg.append('text').attr('class', 'toolCircle').attr('dy', -15)
				.html(tip).style('font-size', '.8em').style('text-anchor',
						'middle');
		svg.append('circle').attr('class', 'toolCircle').attr('r',
				innerRadius * 0.85) // radius of tooltip circle
		.style('fill', 'lightblue').style('stroke', 'lightblue').style(
				'fill-opacity', 0.35);

	}

  // function to set the color of the pie piece depending on its category
  // if no category is avaiable, set it to grey
  function getGroupColor(arc) {
	   return arcs[arc].group != "none" ? group_colors(arcs[arc].group) : "dimgrey";
  }

	// ################################################################################################
	/**
	 * Function to create mouse over action on each pie
	 */
	function arcTween(outerRadius, delay, id) {
		return function() {
			d3.select(this).transition().delay(delay).attrTween("d",
					function(d) {
						var i = d3.interpolate(d.outerRadius, outerRadius);
						return function(t) {
							d.outerRadius = i(t);
							return arc(d);
						};
					});
		};
	}
	;
	// ################################################################################################
	// ################################################################################################
	/**
	 * Function to convert json data to table view
	 *
	 * @param Json,
	 *            classes
	 */
	function json2table(json, categories, classes) {
    var cols = null;
    try {
      var cols = Object.keys(json[0]);
    } catch(error) {
      window.location.href = "errorPage.html";
    }

    classes = classes || '';

    //////////////////////////////////////////////
    //////////////// new table code //////////////
    //////////////////////////////////////////////
    var headerRow = "<div class=\"table-responsive\">" +
                      "<table class=\"table table-bordered\">" +
                        "<tr>" +
                          "<th scope=\"col\">DBpedia URI</th>" +
                          "<th scope=\"col\">Count</th>" +
                          "<th scope=\"col\">Category</th>" +
                        "</tr>";

    var bodyRows = "";
    var current_row = 0;
    // loop over the rows and columns of the query json data
		json.map(function(row) {
      bodyRows += "<tr>";
			cols.map(function(colName) {
        // if the current column is the URI,
        // add the link of the URI concept to DBPedia site to the HTML table as the first column
				if (colName == "uri") {
          var uri = row[colName].value.toString().split("/")[4];
          bodyRows += "<td class=\"align-middle\"><a id=\"entity-" + current_row + "\" href=\"#\">" + uri + "</a></td>";
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
          var uri = row["uri"].value.toString();
          // get only the name of the concept (without the URL)
          var short_uri = uri.split("/")[uri.split("/").length-1];
		  var topic = short_uri.replace("(", "");
		  var short_uri = topic.replace(")", "");
          // loop over all pie pieces till you find the one with the starting category
          var index = null;
          for(var i = 0; i < arcs.length; i++) {
            if(uri.split("/")[uri.split("/").length-1] == arcs[i].id) {
              // save the index of the piece
              index = i;
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

                var index = null;
                // loop over all pie pieces till you find the one which category was changed
                for(var i = 0; i < arcs.length; i++) {
                  if(uri.split("/")[uri.split("/").length-1] == arcs[i].id) {
                    // save the index of the piece
                    index = i;
                    // change the previous selected category of the piece to the new one
                    arcs[i].group = func_cat.toLowerCase();
                    break;
                  }
                }

                // change current the color of the piece to the color of the new category
                var color = getGroupColor(index);
                document.getElementById("slice-"+index).style.fill = color;
                // set the displayed name to the shortened version
                func_tooltip.innerHTML = "<span style=\"color:" + color + "\">&#9632</span> " + func_short_cat;
                func_tooltip.title = func_cat;
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
      current_row++;
    });

    return headerRow + bodyRows + "</div>";

 
	}
	// ################################################################################################
	/**
	 * Function to create tool tip Description: create the middle circle and add
	 * data and value on the circle.
	 */

  function showPiePiece(index) {
    var pieces = svg.selectAll("path")[0];
    for(var i=0; i < pieces.length; i++) {
      pieces[i].style.strokeWidth = 0;
    }

    var d = arc_map[index];
    my_active_id = "slice-" + index;
    document.getElementById(my_active_id).style.stroke = "green";
    document.getElementById(my_active_id).style.strokeWidth = 5;
    my_active_id_track = my_active_id.substr(6);
    var my_query_help = my_query_data.results.bindings[my_active_id_track].uri.value
        .toString(), my_label_data, my_table_data = [];

    my_label_data = get_my_new_sparql_data('getCompRecSentence', researcher,
        my_query_help, '', '');

    // loop over all competences and add them to the table of the current concept
    for (var my_count = 0; my_count < my_label_data.results.bindings.length; my_count++) {
      // check if the current competence has a DOI
      // if not, set the DOI to "not avaiable"
      var doi = "No DOI avaiable";
      if("doi" in my_label_data.results.bindings[my_count]) {
          doi = my_label_data.results.bindings[my_count].doi.value;
      }

      // set the current information (count starts at 1) for the table
      my_table_data[my_count] = {
        'Nbr' : my_count,
        //'Record' : my_label_data.results.bindings[my_count].competenceRecord.value,
    'Record' : my_label_data.results.bindings[my_count].content.value,
        'Publication': my_label_data.results.bindings[my_count].articleTitle.value,
        'DOI': doi,
'MySentStart' : my_label_data.results.bindings[my_count].my_sent_start.value,
    'MySentEnd' : my_label_data.results.bindings[my_count].my_sent_end.value,
    'MyTopicStart' : my_label_data.results.bindings[my_count].my_topic_start.value,
    'MyTopicEnd' : my_label_data.results.bindings[my_count].my_topic_end.value
      };
    }

    // tabulate the information as a HTML table
    document.getElementById("div_table").innerHTML = tabulate(my_table_data, ['Nbr', 'Record', 'Publication', 'DOI']);
    // mark the concept in each sentence
    table_mark_topic(my_label_data);
    document.getElementById("btn_Sources").style.background = "#0b60a1";
    document.getElementById("btn_Sources").style.color = "#fff";
    document.getElementById("btn_Table").style.background = "white";
    document.getElementById("btn_Table").style.color = "#000";
    document.getElementById("hint").innerHTML = "Based on "+researcherName+"'s 10 latest publications listed in <a href=\"https://dblp.uni-trier.de/\" target=\"_blank\">dblp</a>, we identified entities and phrases that characterize the scholar's competences. Click on a pie slice to inspect further competences.";
    document.getElementById("hint").style.display = "block";
    document.getElementById("div_table").style.display = "block";
    document.getElementById("div_table_view").style.display = "none";
    document.getElementById("btn_Sources").disabled = false;

    var lineFunction = d3.svg.line().x(function(d) {
      return d.x;
    }).y(function(d) {
      return d.y;
    }).interpolate('linear');

    var lineData = [ {
      "x" : height / 16,
      "y" : -outerRadius
    }, {
      "x" : height / 16 + line_height_shift,
      "y" : -outerRadius - line_height_shift
    }, {
      "x" : height / 16 + line_height_shift + height / 4,
      "y" : -outerRadius - line_height_shift
    } ];

    // call tooTip function for on_click event, before that,
    // it removes the previous information
    d3.selectAll(".toolCircle").remove();
    toolTip(d);
    my_label_data = get_my_new_sparql_data('getLabelComment', researcher,
        my_query_help, '', '');
    label = my_query_help.substr(28);
    try {
      comment = my_label_data.results.bindings[0].comment.value;
      document.getElementById("label_comment").innerHTML = comment;
      document.getElementById("label_ref").innerHTML = "For more information see: "
          + "<a class=\"label_query\" href='"
          + my_query_help
          + "'"
          + " target='_blank'>"
          + my_query_help + "</a>";

      document.getElementById("label_header").style.display = "block";
      document.getElementById("label_comment").style.display = "block";
      document.getElementById("label_ref").style.display = "block";
    } catch {
      document.getElementById("label_header").style.display = "none";
      document.getElementById("label_comment").style.display = "none";
      document.getElementById("label_ref").style.display = "none";
      alert("Unable to access comments of competence: " + label);
    }
  }

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
  	if (my_sel === 'getUriCount') {
  		my_query_data_set = {
  			'researcher' : namespace + my_researcher,
  			'limit' : my_limit,
        'fuseki' : fuseki
  		}; // , 'offset': my_offset
  	} else if (my_sel === 'getLabelComment') {
  		my_query_data_set = {
        'researcher' : namespace + my_researcher,
  			'uri' : my_uri,
        'fuseki' : fuseki
  		};
  	} else if (my_sel === 'getCompRecSentence') {

  		my_query_data_set = {
  			'researcher' : namespace + my_researcher,
  			'uri' : my_uri,
        'fuseki' : fuseki
  		};
  	} else {
  		alert('Something went wrong here');
  	}
  	url = url + my_sel + '/';
  	//console	.log("https://dev.gfbio.org/documents/10184/c5b2ca09-51a8-4e99-860a-6191c69bb7c5");
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

  document.getElementById("loading").remove();
  document.getElementById("header").style.display = "block";
  document.getElementById("widget-container").style.display = "block";
	// ################################################################################################
  //document.getElementById("page").style.display = "block";
};
// #### END OF MAIN FUNCTION ########################

// ################################################################################################
// ##################### Extra Functions #################
// ################################################################################################

// add the extracted categories to the query data
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

/**
 * Function on click of the rows of the table view
 *
 * @param clicked_item
 */
function ucTableClick(item) {

	if (!($(".with_nav")[0])) {
		my_body.className = 'with_nav';
	}
	;
	my_active_id = item.getAttribute('id');
	document.getElementById("btn_Sources").style.background = "white";
	document.getElementById("btn_Table").style.background = "white";
	// document.getElementById("hint").style.display = "none";
	// document.getElementById("div_table").style.display = "none";
	// document.getElementById("div_table_view").style.display = "none";

}
// ################################################################################################
/**
 * Function to call ajax query of the user information
 */
function get_my_new_sparql_data(my_sel, my_researcher, my_uri, my_limit,
		my_offset) {
	// To run barchart from online data on the server, use the below code:
	//var url = 'https://dev.gfbio.org:8181/', my_data;

	//To run barchart from your local machine, use the below code:
	var url = node + '/', my_data;

	if (my_sel === 'getUriCount') {
		my_query_data_set = {
			'researcher' : namespace + my_researcher,
			'limit' : my_limit,
      'fuseki' : fuseki
		}; // , 'offset': my_offset
	} else if (my_sel === 'getLabelComment') {
		my_query_data_set = {
      'researcher' : namespace + my_researcher,
			'uri' : my_uri,
      'fuseki' : fuseki
		};
	} else if (my_sel === 'getCompRecSentence') {

		my_query_data_set = {
			'researcher' : namespace + my_researcher,
			'uri' : my_uri,
      'fuseki' : fuseki
		};
	} else {
		alert('Something went wrong here');
	}
	url = url + my_sel + '/';
	//console	.log("https://dev.gfbio.org/documents/10184/c5b2ca09-51a8-4e99-860a-6191c69bb7c5");
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

// ################################################################################################
/**
 * Function to mark the proper topic in the data
 */
function table_mark_topic(my_data) {
	var my_table_select = document.getElementsByTagName('td');
	var my_case = 0, my_text = '', my_start = 0, my_end = 0, my_element, my_text = '';
	for (my_count = 0; my_count < my_table_select.length / 4; my_count++) {
    if(my_element != void(0)) {
      my_element = my_data.results.bindings[my_count];
  		my_start = my_element.my_topic_start.value
  				- my_element.my_sent_start.value;
  		my_end = my_element.my_sent_end.value - my_element.my_topic_end.value;
  		my_text = my_element.content.value;
  		my_table_select.item(4 * my_count + 1).innerHTML = my_text.substr(0,
  				my_start)
  				+ '<span class="mark_competence">'
  				+ my_text.substr(my_start, my_end)
  				+ '</span>'
  				+ my_text.substr(my_end);
    }
	}
}

// ################################################################################################
/**
 * Function tabulate
 */
function tabulate(data, columns) {
	if(d3.select('#infoTable').empty() == false) {
		d3.select('#infoTable').remove();
	}

  //////////////////////////////////////////////
  //////////////// new table code //////////////
  //////////////////////////////////////////////
  var headerRow = "<div id=\"infoTable\" class=\"table-responsive\">" +
                    "<table class=\"table\">" +
                      "<tr>" +
                        "<th scope=\"col\">Nbr</th>" +
                        "<th scope=\"col\">Record</th>" +
                        "<th scope=\"col\">Publication</th>" +
                        "<th scope=\"col\">DOI</th>" +
                      "</tr>";

  var bodyRows = "";
  var real_index = 1;
  // loop over the data with each index being one row
  for(var i = 0; i< data.length; i++) {
    // bug fix: currently the concept itself is added as an extra row after each sentence
    // this shouldn't be
    // to fix this, ignore every second row
    if(i % 2 == 0) {
      bodyRows += "<tr>";
      var row = data[i];
      // loop over each column of each row and add it to the table
      for(var j = 0; j < columns.length; j++) {
        var value = row[columns[j]];

        // correct row number to the first column since every second row is ignored
        if(columns[j] == "Nbr") {
          value = real_index;
        }

        // add the link to each DOI if a DOI is avaiable
        if(columns[j] == "DOI" && value != "No DOI avaiable") {
          value = "<a href=\"https://doi.org/" + value + "\"  target=\"_blank\">" + value + "</a>";
        }
		// highlight the topic
        if(columns[j] == "Record") {
	      var my_text = value;
		  var my_sent_start = row['MySentStart'];
		  var my_sent_end = row['MySentEnd'];
		  var my_topic_start = row['MyTopicStart'];
		  var my_topic_end = row['MyTopicEnd'];

		  var my_start = my_topic_start- my_sent_start;
		  var my_end = my_topic_end - my_topic_start;
		  var text_end = my_sent_end - my_topic_end;
		  value = my_text.substr(0,
				my_start)
				+ '<span class="mark_competence">'
				+ my_text.substr(my_start, my_end)
				+ '</span>'
				+ my_text.substr((my_start+my_end),text_end);
          //value = "<a href=\"https://doi.org/" + value + "\"  target=\"_blank\">" + value + "</a>";
        }

        bodyRows += "<td class=\"align-middle\">" + value + "</td>";
      }

      real_index += 1;
      bodyRows += "</tr>";
    }
  }

  return headerRow + bodyRows + "</div>";

  //////////////////////////////////////////////
  //////////////// old table code //////////////
  //////////////////////////////////////////////
	/*var table = d3.select('#div_table').append('table');
  table.attr("id", "infoTable");
  table.attr("cellpadding", "5");
	var thead = table.append('thead');
	var tbody = table.append('tbody');

	thead.append('tr').selectAll('th').data(columns).enter().append('th').text(
			function(column) {
				return column;
			});

	var rows = tbody.selectAll('tr').data(data).enter().append('tr').attr("id",
			function(d, i) {
				return 'table_entry-' + i.toString();
			});

	var cells = rows.selectAll('td').data(function(row) {
		return columns.map(function(column) {
			return {
				column : column,
				value : row[column]
			};
		});
	}).enter().append('td').text(function(d) {
		return d.value;
	});

	return table;*/
}

// ################################################################################################
/**
 * Function to display comments
 */
function display_comment(clicked_id) {
	var my_table_col_names = [ "competence", "score" ];
	my_active_id_track = my_active_id.substr(6);
	var my_query_help = my_query_data.results.bindings[my_active_id_track].uri.value
			.toString(), my_label_data, my_table_data = [];

	if (clicked_id == "btn_Sources") {
		/*my_label_data = get_my_new_sparql_data('getCompRecSentence', researcher,
				my_query_help, '', '');

		for (my_count = 0; my_count < my_label_data.results.bindings.length; my_count++) {
      var doi = "No DOI avaiable";
      if("doi" in my_label_data.results.bindings[my_count]) {
          doi = my_label_data.results.bindings[my_count].doi.value;
      }

      my_table_data[my_count] = {
        'Nbr' : my_count,
        'Record' : my_label_data.results.bindings[my_count].competenceRecord.value,
        'Publication': my_label_data.results.bindings[my_count].articleTitle.value,
        'DOI': doi
      };
		}

    // tabulate the information as a HTML table
    document.getElementById("div_table").innerHTML = tabulate(my_table_data, ['Nbr', 'Record', 'Publication', 'DOI']);
    // mark the concept in each sentence
    table_mark_topic(my_label_data);*/
		document.getElementById("btn_Sources").style.background = "#0b60a1";
		document.getElementById("btn_Sources").style.color = "#fff";
		document.getElementById("btn_Table").style.background = "white";
		document.getElementById("btn_Table").style.color = "#000";
		document.getElementById("hint").innerHTML = "Based on "+researcherName+"'s 10 latest publications listed in <a href=\"https://dblp.uni-trier.de/\" target=\"_blank\">dblp</a>, we identified entities and phrases that characterize the scholar's competences. Click on a pie slice to inspect further competence entries.";
		document.getElementById("hint").style.display = "block";
		document.getElementById("div_table").style.display = "block";
    document.getElementById("div_table_view").style.display = "none";
	} else if (clicked_id == "btn_Table") {
		document.getElementById("btn_Sources").style.background = "white";
		document.getElementById("btn_Sources").style.color = "#000";
		document.getElementById("btn_Table").style.background = "#0b60a1";
		document.getElementById("btn_Table").style.color = "#fff";
		document.getElementById("div_table").style.display = "none";
		document.getElementById("hint").innerHTML = "Competences of Researcher " + researcherName + " and their frequencies how often they appear over the latest 10 publications listed in <a href=\"https://dblp.uni-trier.de/\">dblp</a>. All competences are linked to <a href=\"https://wiki.dbpedia.org/\">DBpedia</a> URIs obtained from <a href=\"https://www.dbpedia-spotlight.org/\" target=\"_blank\">DBpedia Spotlight</a>. Click on a pie slice and inspect the provenance. The category is obtained from the <a href=\"https://cso.kmi.open.ac.uk\" target=\"blank\">CSO Ontology</a>.";
    document.getElementById("div_table_view").style.display = "block";
	}

}
// ################################################################################################

function display_text(my_text, my_start, my_start_mark, my_end_mark, my_end) {
	jQuery('#table_entry-1').replaceWith(jQuery('<textarea>').attr({
		id : 'table_entry-2',
		value : jQuery(document.getElementById('table_entry-1')).text()
	}));

}

// ################################################################################################

/**
 * To set the general variables of the mouse positions
 */
$("#div_visualization").click(function(e) {
	mouse_pos_X = e.offsetX;
	mouse_pos_Y = e.offsetY;

})

$(document).ready(function() {
                $("#header").load("header.html");
                $("#footer").load("footer.html");
            });
