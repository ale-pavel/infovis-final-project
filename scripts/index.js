d3.json('dataset/graph.json')
  .then(function(data) {
    draw_graph(data);
})
  .catch(function(error) {
    console.log(error)
});


function draw_graph(data) {
  height = 600
  width = 1400
  radius = 10;

  genderData = ["0", "1", "2"]
  genderColours = ["#F88B9D", "#8ECEFD", "#D3D3D3"]

  color = d3.scaleOrdinal()
            .domain(genderData)
            .range(genderColours);

    const links = data.links.map(d => Object.create(d));
    const nodes = data.nodes.map(d => Object.create(d));

    //sort links by source, then target
    links.sort(function(a,b) {
        if (a.source > b.source) {return 1;}
        else if (a.source < b.source) {return -1;}
        else {
            if (a.target > b.target) {return 1;}
            if (a.target < b.target) {return -1;}
            else {return 0;}
        }
    });

    //any links with duplicate source and target get an incremented 'linknum'
    for (var i=0; i<links.length; i++) {
        if (i != 0 &&
            links[i].source == links[i-1].source &&
            links[i].target == links[i-1].target) {
                links[i].linknum = links[i-1].linknum + 1;
            }
        else {links[i].linknum = 1;};
    };

    const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id(d => d.id).distance(60).strength(0.01))
        .force("charge", d3.forceManyBody().strength(-25))
        .force('collide', d3.forceCollide().radius(55))
        .force("center", d3.forceCenter(width / 3, height / 2));

    simulation.on("tick", () => {
      path.attr("d", function(d) {
        var curve = 2;
        var homogeneous = 3.2;
        var dx = d.target.x - d.source.x,
          dy = d.target.y - d.source.y,
          dr = Math.sqrt(dx*dx+dy*dy)*(d.linknum+homogeneous)/(curve*homogeneous);  //linknum is defined above
        return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
      });

      //calculating the invisible arc path for the labels (invisible arc) is quite costly, degrades simulation frames
      pathInvis.attr("d", function(d) {
        var curve = 2;
        var homogeneous = 3.2;
        var dx = d.target.x - d.source.x,
          dy = d.target.y - d.source.y,
          dr = Math.sqrt(dx*dx+dy*dy)*(d.linknum+homogeneous)/(curve*homogeneous);  //linknum is defined above
        return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
      });

      //constrains the nodes to be within a box
      node
        .attr("transform", function(d) {
          d.x = Math.max(radius, Math.min(width - radius, d.x));
          d.y = Math.max(radius, Math.min(height - radius, d.y));
          return "translate(" + d.x + "," + d.y + ")";
        })
    });

  const svg_external = d3.select("#graph_visualization")
    .append("svg")
    .attr("viewBox", [0, 0, width, height]);

  //add encompassing group for the zoom 
  var g = svg_external.append("g")
    .attr("class", "everything");

  const groupPath = g.append("g")
    .attr("class", "link-group-g")

  const groupInvis = d3.select('.link-group-g')
    .append('g')
      .attr('class', 'group_invis')

  const pathInvis = d3.select('.group_invis')
    .selectAll('path')
    .data(links)
    .join('path')
      .attr('class', 'invis')
      .attr("id", function (d) {
          return "invis_" + d.source.id + "-" + d.action_description + "-" + d.target.id;
      });

  const pathLabel = d3.select('.group_invis')
    .selectAll('text')
    .data(links)
    .join("text")

  pathLabel.append("textPath")
      .attr("startOffset", "50%")
      .attr("text-anchor", "middle")
      .attr("xlink:href", function(d) { return "#invis_" + d.source.id + "-" + d.action_description + "-" + d.target.id; })
      .text(d => d.action_description);

  const path = groupPath.append("g")
      .attr("class", "link-g")
    .selectAll("path")
    .data(links)
    .join("path")
    .attr("marker-end", "url(#arrow)")
    .attr("class", function(d) {return "link-g source" + d.source.id} );

  //Create deffinition for the arrow markers showing relationship directions
  g.append("defs").append("marker")
      .attr("id", "arrow")
      .attr("viewBox", "0 -5 15 15")
      .attr("refX", 16)
      .attr("refY", 0)
      .attr("markerWidth", 15)
      .attr("markerHeight", 15)
      .attr("orient", "auto")
      .attr('xoverflow', 'visible')
      .append("svg:path")
      .attr("d", "M0,-5L10,0L0,5");

  g.append("defs").append("marker")
      .attr("id", "arrow_selected")
      .attr("viewBox", "0 -5 15 15")
      .attr("refX", 16)
      .attr("refY", 0)
      .attr("markerWidth", 15)
      .attr("markerHeight", 15)
      .attr("orient", "auto")
      .attr('xoverflow', 'visible')
      .append("svg:path")
      .attr("d", "M0,-5L10,0L0,5");

  const node = g.append("g")
    .attr("class", "node-g")
    .selectAll("g")
    .data(nodes)
    .enter().append("g") 
    .attr('id', d => 'node_' + d.id)

  const circles = node.append("circle")
      .attr("r", radius)
      .attr("fill", d => color(d.gender));

  const circle_titles = node.append("text")
      .text(d => d.label)
      .attr('x', 6)
      .attr('y', -8);

  path.append("title")
      .text(d => d.action_description);

  function get_target_nodes(node_id) {
    target_list = [];

    for (const key in data.links) {
      if (data.links[key].source == node_id)
        target_list.push('node_' + data.links[key].target);
    }

    return target_list;
  }

  // Add the highlighting functionality
  node.on('mouseover', function(d) {
    // Highlight the nodes: every node is grey except of him
    //node.style('fill', "#ccc")
    node.style('fill-opacity', '0.25')
    node.style('stroke-opacity', '0.25')
    d3.select(this).style('fill-opacity', '1')
    d3.select(this).style('stroke-opacity', '1')

    const target_nodes_list = get_target_nodes(d.currentTarget.__data__.index +1);
    //console.log(target_nodes_list);
    for (var i = 0, len = target_nodes_list.length; i < len; i++) {
      elem = target_nodes_list[i];
      console.log(elem);
      d3.select('#' + elem).style('fill-opacity', '1');
      d3.select('#' + elem).style('stroke-opacity', '1');
    }

    // Edit text colour for a node
    //d3.select(this).style('fill', '#000')

    // Highlight the connections
    path
      .style('stroke', function (link_d) { return link_d.source.id == (d.currentTarget.__data__.index +1) ? '#000' : '#ccc';})
      .style('stroke-width', function (link_d) { return link_d.source.id == (d.currentTarget.__data__.index +1) ? '1' : '1';})
      .style('stroke-opacity', function (link_d) { return link_d.source.id == (d.currentTarget.__data__.index +1) ? '0.5' : '0.25';})
      .attr("marker-end", function (link_d) { return link_d.source.id == (d.currentTarget.__data__.index +1) ? 'url(#arrow_selected)' : 'url(#arrow)';})

    pathLabel
      .style('fill', function (link_d) { return link_d.source.id == (d.currentTarget.__data__.index +1) ? '#000' : '#ccc';})
      .style('stroke-width', function (link_d) { return link_d.source.id == (d.currentTarget.__data__.index +1) ? '2' : '1';})
      .style('stroke-opacity', function (link_d) { return link_d.source.id == (d.currentTarget.__data__.index +1) ? '0.75' : '0.25';})
      .style('font-size', function (link_d) { return link_d.source.id == (d.currentTarget.__data__.index +1) ? '14px' : '10px';})
  })
  .on('mouseout', function (d) {
    //node.style('fill', "#000")
    node.style('fill-opacity', '1')
    node.style('stroke-opacity', '1')

    path
      .style('stroke', '#ccc')
      .style('stroke-width', '1')
      .style('stroke-opacity', '0.25')
      .attr("marker-end", "url(#arrow)")

    pathLabel
      .style('fill', '#ccc')
      .style('font-size', '10px')
  });

  function drag_started(event) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    event.subject.fx = event.subject.x;
    event.subject.fy = event.subject.y;
  }
  
  function dragged(event) {
    event.subject.fx = event.x;
    event.subject.fy = event.y;
  }
  
  function drag_ended(event) {
    if (!event.active) simulation.alphaTarget(0);
    event.subject.fx = null;
    event.subject.fy = null;
  }
  
  const drag_handler = d3.drag()
      .on("start", drag_started)
      .on("drag", dragged)
      .on("end", drag_ended);

  drag_handler(node);

  svg_external.call(d3.zoom()
      .extent([[0, 0], [width, height]])
      .scaleExtent([1, 8])
      .on("zoom", zoomed));

  function zoomed({transform}) {
    g.attr("transform", transform);
  }
}