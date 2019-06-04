// Define the global variables
var mouse_pos_X = 0, mouse_pos_Y = 0, my_query_data = '', my_query_data_test, my_active_id, line_height_shift = 10, my_user = 'R1', 
namespace = 'http://semanticsoftware.info/lodexporter/creator/', response = '', transition_Delay = 1000;

// ################################################################################################
/**
 * Main Function Description: This function is called from the page load on the
 * index.html file. It draw the pie chart and table.
 */
function startFunc(my_user) {
	console.log("first of script file");
	// TODO: here should be the user call back information
	my_query_data = get_my_new_sparql_data('getUriCount', 'R7', '', '25', '');
	my_user = 'R7';
	console.log("callback-test2");

	var width = 700, height = 500, my_query_data_pie = my_query_data.results.bindings, circle_ids = d3
			.range(my_query_data_pie.length);

	// HERE STARTS THE TABLE CREATION for DIFFERENT VIEW
	console.log("TableTestData");
	my_query_data_table_data = my_query_data.results.bindings;

	document.getElementById('div_table_view').innerHTML = json2table(my_query_data_table_data);
	// HERE ENDS TABLE CREATION for DIFFERENT VIEW

	var outerRadius = height / 1.5 - height / 4, innerRadius = height / 3
			- height / 6, cornerRadius = 10;

	var pie = d3.layout.pie().padAngle(.03);

	var arc = d3.svg.arc().padRadius(outerRadius).innerRadius(innerRadius);

	// The svg_pie_chart will be added to the div_visualization of the
	// index.html file
	// Here, only the svg_pie_chart element is created.
	var svg = d3.select("#div_visualization").append("svg")
			.attr("width", width).attr("height", height).attr("id",
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
			})
			.attr("id", function(d, i) {
				return "slice-" + circle_ids[i];
			})
			.attr("d", arc)

			.on("mouseover", arcTween(outerRadius, 0))
			.on("mouseout", function() {
				arcTween(outerRadius - 20, 150).call(this);
			})
			.on(
					"click",
					function(d) {
						arcTween(outerRadius, 0)
						var my_delay = 200, my_body = document.body;
						my_active_data = d;
						console.log("My active data :"
								+ JSON.stringify(my_active_data));
						if (!($(".with_nav")[0])) {
							my_body.className = 'with_nav';
						}
						;
						console.log("This id :" + this.id);
						my_active_id = this.id;
						console.log("my_active_id: " + my_active_id);
						document.getElementById("actualElement").style.background = "#3CACE4";
						document.getElementById("actualElement").style.color = "white";
						document.getElementById("btn_Sources").style.background = "white";
						document.getElementById("btn_Comment").style.background = "white";
						document.getElementById("btn_Table").style.background = "white";
						document.getElementById("hint").style.display = "none";
						document.getElementById("div_table").style.display = "none";
						document.getElementById("div_table_view").style.display = "none";
						document.getElementById("dbpediaLink").style.display = "none";

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

						document.getElementById("actualElement").innerText = (my_query_data_pie[my_active_id
								.substr(6)].uri.value.toString().substr(28))
								.toString();

						// call tooTip function for on_click event, before that,
						// it removes the previous information
						d3.selectAll(".toolCircle").remove();
						toolTip(d);

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

	// Set the user information on the box
	document.getElementById('div_user_info').innerHTML = set_user_info(my_user);

	// ################################################################################################
	/**
	 * Function to create tool tip Description: create the middle circle and add
	 * data and value on the circle.
	 */
	function toolTip(d) {
		var uri = my_query_data_pie[my_active_id.substr(6)].uri.value
				.toString().substr(28), value = d.value.toString();
		var tip = '';
		tip += '<tspan style="width: 10px;" x="0" dy="0.2em">' + uri
				+ '</tspan>';
		tip += '<tspan x="0" dy="2.2em">Value: ' + value + '</tspan>';
		console.log(tip);

		svg.append('text').attr('class', 'toolCircle').attr('dy', -15)
				.html(tip).style('font-size', '.9em').style('text-anchor',
						'middle');
		svg.append('circle').attr('class', 'toolCircle').attr('r',
				innerRadius * 0.85) // radius of tooltip circle
		.style('fill', 'lightblue').style('stroke', 'lightblue').style(
				'fill-opacity', 0.35);

	}
	// ################################################################################################
	/**
	 * Function to create mouse over action on each pie
	 */
	function arcTween(outerRadius, delay) {
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
	function json2table(json, classes) {
		var cols = Object.keys(json[0]);

		var headerRow = '';
		var bodyRows = '';

		classes = classes || '';

		function capitalizeFirstLetter(string) {
			return string.charAt(0).toUpperCase() + string.slice(1);
		}

		headerRow += '<div class=\"table_header1\">'
				+ capitalizeFirstLetter(cols[0]) + '</div>';
		headerRow += '<div class=\"table_header2\">'
				+ capitalizeFirstLetter(cols[1]) + '</div>';

		json.map(function(row) {

			cols.map(function(colName) {

				value = '';

				if (row[colName].value.startsWith('http')) {
					value = row[colName].value.toString().split("/")[4];
					bodyRows += '<div ><div class=\"tableView_Tag_Uri\" id=\"';
					bodyRows += String(value);
					bodyRows += '\" onclick=\"ucTableClick(this);\" >\t'
							+ value + '</div>';

				} else {
					value = row[colName].value.toString();
					bodyRows += '<div class=\"tableView_Tag_Count\" >\t'
							+ value + '</div></div>';
				}

			})

		});

		return '<div style=\" float: both; font-weight: bold; padding-top: 5px;\">'
				+ headerRow + '</div>' + bodyRows;
	}
	// ################################################################################################
	/**
	 * Function to create tool tip Description: create the middle circle and add
	 * data and value on the circle.
	 */
	function set_user_info(my_user) {
		var info = '';
		info += '<div class=\"user_info\">' + 'User: ' + my_user + '</div>';
		return info;
	}
	// ################################################################################################
};
// #### END OF MAIN FUNCTION ########################

// ################################################################################################
// ##################### Extra Functions #################
// ################################################################################################
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
	console.log("UC Table Div my_active_id: " + my_active_id);
	document.getElementById("actualElement").style.background = "#3CACE4";
	document.getElementById("actualElement").style.color = "white";
	document.getElementById("btn_Sources").style.background = "white";
	document.getElementById("btn_Comment").style.background = "white";
	document.getElementById("btn_Table").style.background = "white";
	// document.getElementById("hint").style.display = "none";
	// document.getElementById("div_table").style.display = "none";
	// document.getElementById("div_table_view").style.display = "none";
	document.getElementById("dbpediaLink").style.display = "none";

	document.getElementById("actualElement").innerText = (my_query_data_pie[my_active_id
			.substr(6)].uri.value.toString().substr(28)).toString();

}
// ################################################################################################
/**
 * Function to call ajax query of the user information
 */
function get_my_new_sparql_data(my_sel, my_researcher, my_uri, my_limit,
		my_offset) {
	//var url = 'http://localhost:3666/', my_data;
	var url = 'https://dev.gfbio.org:8181/', my_data;

	if (my_sel === 'getUriCount') {
		my_query_data_set = {
			'researcher' : namespace + my_researcher,
			'limit' : my_limit
		}; // , 'offset': my_offset
	} else if (my_sel === 'getLabelComment') {
		my_query_data_set = {
			'uri' : my_uri
		};
	} else if (my_sel === 'getCompRecSentence') {

		my_query_data_set = {
			'researcher' : namespace + my_researcher,
			'uri' : my_uri
		};
		console.log(my_query_data_set);
	} else {
		alert('Something went wrong here');
	}
	url = url + my_sel + '/';
	console.log("URL ->  " + url);
	console.log( my_query_data_set);

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
	for (my_count = 0; my_count < my_table_select.length / 2; my_count++) {
		my_element = my_data.results.bindings[my_count];
		my_start = my_element.my_topic_start.value
				- my_element.my_sent_start.value;
		my_end = my_element.my_sent_end.value - my_element.my_topic_end.value;
		my_text = my_element.content.value;
		my_table_select.item(2 * my_count + 1).innerHTML = my_text.substr(0,
				my_start)
				+ '<span class="mark_competence">'
				+ my_text.substr(my_start, my_end)
				+ '</span>'
				+ my_text.substr(my_end);
	}
}

// ################################################################################################
/**
 * Function tabulate
 */
function tabulate(data, columns) {
	var width = 700, height = 500;

	if (d3.select('#infoTable').empty() == false) {
		d3.select('#infoTable').remove();
	}

	var table = d3.select('#div_table').append('table');
	var thead = table.append('thead');
	var tbody = table.append('tbody');

	table.attr("id", "infoTable").attr("width", width);

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
	return table;
}

// ################################################################################################
/**
 * Function to display comments
 */
function display_comment(clicked_id) {
	console.log(my_query_data);
	var my_table_col_names = [ "competence", "score" ];
	my_active_id_track = my_active_id.substr(6);
	var my_query_help = my_query_data.results.bindings[my_active_id_track].uri.value
			.toString(), my_label_data, my_table_data = [];
	console.log(my_query_help);

	if (clicked_id == "btn_Comment") {
		my_label_data = get_my_new_sparql_data('getLabelComment', '',
				my_query_help, '', '');
		my_table_data[0] = {
			"label" : my_label_data.results.bindings[0].label.value,
			"comment" : my_label_data.results.bindings[0].comment.value
		};
		tabulate(my_table_data, [ "label", "comment" ]);

		document.getElementById("div_table_view").style.display = "none";

		document.getElementById("actualElement").style.background = "white";
		document.getElementById("actualElement").style.color = "black";
		document.getElementById("btn_Sources").style.background = "white";
		document.getElementById("btn_Table").style.background = "white";
		document.getElementById("btn_Comment").style.background = "#3CACE4";

		document.getElementById("hint").innerHTML = "All comments are obtained from DBPedia.";

		document.getElementById("hint").style.display = "block";
		document.getElementById("div_table").style.display = "block";
		document.getElementById("dbpediaLink").innerHTML = "For more information see: "
				+ "<a href='"
				+ my_query_help
				+ "'"
				+ " target='_blank'>"
				+ my_query_help + "</a>";

		document.getElementById("dbpediaLink").style.display = "block";
	} else if (clicked_id == "btn_Sources") {

		my_label_data = get_my_new_sparql_data('getCompRecSentence', my_user,
				my_query_help, '', '');
		for (my_count = 0; my_count < my_label_data.results.bindings.length; my_count++) {
			my_table_data[my_count] = {
				'Nbr' : my_count,
				'Record' : my_label_data.results.bindings[my_count].competenceRecord.value
			};
		}
		tabulate(my_table_data, [ 'Nbr', 'Record' ]);
		table_mark_topic(my_label_data);

		document.getElementById("div_table_view").style.display = "none";
		document.getElementById("dbpediaLink").style.display = "none";

		document.getElementById("actualElement").style.background = "white";
		document.getElementById("actualElement").style.color = "black";
		document.getElementById("btn_Sources").style.background = "#3CACE4";
		document.getElementById("btn_Comment").style.background = "white";
		document.getElementById("btn_Table").style.background = "white";
		document.getElementById("hint").innerHTML = "Based on your provided publications, we identified entities and phrases that characterize your competences.";
		document.getElementById("hint").style.display = "block";
		document.getElementById("div_table").style.display = "block";
	} else if (clicked_id == "btn_Table") {
		document.getElementById("actualElement").style.background = "white";
		document.getElementById("actualElement").style.color = "black";
		document.getElementById("btn_Sources").style.background = "white";
		document.getElementById("btn_Comment").style.background = "white";
		document.getElementById("btn_Table").style.background = "#3CACE4";

		document.getElementById("dbpediaLink").style.display = "none";
		document.getElementById("div_table").style.display = "none";

		document.getElementById("hint").innerHTML = "Table view of the Pie chart.";
		document.getElementById("hint").style.display = "block";

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
