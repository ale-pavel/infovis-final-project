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
  radius = 7;

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
        .force("link", d3.forceLink(links).id(d => d.id).distance(50))
        .force("charge", d3.forceManyBody().strength(-20))
        .force('collide', d3.forceCollide().radius(40))
        .force("center", d3.forceCenter(width / 3, height / 2));

    simulation.on("tick", () => {
      /*
      path
        .attr("d", function(d) {
          const r = Math.hypot(d.target.x - d.source.x, d.target.y - d.source.y);
          return `M${d.source.x},${d.source.y} A${r},${r} 0 0,1 ${d.target.x},${d.target.y}`;
        });
      */
      
      /*
      path.attr("d", function(d) {
        return arcPath(true, d);
      });
      */

      path.attr("d", function(d) {
        var curve = 2;
        var homogeneous = 3.2;
        var dx = d.target.x - d.source.x,
          dy = d.target.y - d.source.y,
          dr = Math.sqrt(dx*dx+dy*dy)*(d.linknum+homogeneous)/(curve*homogeneous);  //linknum is defined above
          if (dr === 0) { //for some reason the autolink (9,9) on Hrafnkels does not load into data
            dr = 120;
          }
        return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
      });

      pathInvis.attr("d", function(d) {
        var curve = 2;
        var homogeneous = 3.2;
        var dx = d.target.x - d.source.x,
          dy = d.target.y - d.source.y,
          dr = Math.sqrt(dx*dx+dy*dy)*(d.linknum+homogeneous)/(curve*homogeneous);  //linknum is defined above
          if (dr === 0) { //for some reason the autolink (9,9) on Hrafnkels does not load into data
            dr = 120;
          }
        return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
      });

      /*
      pathInvis.attr("d", function(d) {
          return arcPath(d.source.x < d.target.x, d);
      });
      */

      //constrains the nodes to be within a box
      node
        .attr("transform", function(d) {
          d.x = Math.max(radius, Math.min(width - radius, d.x));
          d.y = Math.max(radius, Math.min(height - radius, d.y));
          return "translate(" + d.x + "," + d.y + ")";
        })
    /*
      edgepaths.attr('d', function (d) {
          return 'M ' + d.source.x + ' ' + d.source.y + ' L ' + d.target.x + ' ' + d.target.y;
      });

      edgelabels.attr('transform', (d) => {
        return 'rotate(0)';
      });
    */


    });

  const svg_external = d3.select("#graph_visualization")
    .append("svg")
    .attr("viewBox", [0, 0, width, height]);

  //add encompassing group for the zoom 
  var g = svg_external.append("g")
    .attr("class", "everything");

  //Create deffinition for the arrow markers showing relationship directions
  g.append("defs").append("marker")
      .attr("id", "arrow")
      .attr("viewBox", "0 -5 15 15")
      .attr("refX", 19)
      .attr("refY", -1)
      .attr("markerWidth", 15)
      .attr("markerHeight", 15)
      .attr("orient", "auto")
      .attr('xoverflow', 'visible')
      .append("svg:path")
      .attr("d", "M0,-5L10,0L0,5");

  const groupPath = g.append("g")
    .attr("class", "link-group-g")

  const path = groupPath.append("g")
      .attr("class", "link-g")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.25)
      .attr("fill", "none")
    .selectAll("path")
    .data(links)
    .join("path")
      .attr("stroke-width", 0.8)
    .attr("marker-end", "url(#arrow)");

  const node = g.append("g")
    .attr("class", "node-g")
    .selectAll("g")
    .data(nodes)
    .enter().append("g")

  const circles = node.append("circle")
      .attr("stroke", "#555")
      .attr("stroke-width", 0.75)
      .attr("r", radius)
      .attr("fill", d => color(d.gender));
      

  const circle_titles = node.append("text")
      .text(d => d.label)
      .attr('x', 6)
      .attr('y', -8)
      .style("font-size", "12px");


  path.append("title")
      .text(d => d.action_description);

  const groupInvis = d3.select('.link-group-g')
    .append('g')
      .attr('class', 'group_invis')

  const pathInvis = d3.select('.group_invis')
    .selectAll('path')
    .data(links)
    .join('path')
      .attr('fill', 'none')
      .attr('stroke-width', 0)
      .attr('class', 'invis')
      .attr("id", function (d) {
          return "invis_" + d.source.id + "-" + d.action_description + "-" + d.target.id;
      });

  const pathLabel = d3.select('.group_invis')
    .selectAll('text')
    .data(links)
    .join("text")
      .attr('font-size', 8)
      .attr('fill', '#aaa');

  pathLabel.append("textPath")
      .attr("startOffset", "50%")
      .attr("text-anchor", "middle")
      .attr("xlink:href", function(d) { return "#invis_" + d.source.id + "-" + d.action_description + "-" + d.target.id; })
      .style("fill", "#cccccc")
      .attr("stroke", "none")
      .style("font-size", 10)
      .text(d => d.action_description);

/*
  const edgepaths = d3.select(".link-g")
    .selectAll('path')
    .data(links)
    .join('path')
      .attr('class', 'edgepath')
      .attr('fill-opacity', 0)
      .attr('stroke-opacity', 0)
      .attr('id', (d, i) => 'edgepath' + i)
      .style("pointer-events", "none");

  const edgelabels = d3.select(".link-g")
    .selectAll('text')
    .data(links)
    .join('text')
      .style("pointer-events", "none")
      .attr('class', 'edgelabel')
      .attr('id', (d, i) => 'edgelabel' + i)
      .attr('font-size', 8)
      .attr('fill', '#aaa');

  edgelabels.append('textPath')
    .attr('xlink:href', (d, i) =>'#edgepath' + i)
    .style("text-anchor", "middle")
    .style("pointer-events", "none")
    .attr("startOffset", "50%")
    .attr("stroke", "none")
    .attr("fill", "black")
    .text(d => d.action_description);
  */

  /*
  function countSiblingLinks(source, target) {
      var count = 0;
      for(var i = 0; i < links.length; ++i) {
        if((links[i].source == source && links[i].target == target) || 
          (links[i].source == target && links[i].target == source))
          count++;
      };
      return count;
  };

  function getSiblingLinks(source, target) {
      var siblings = [];
      for(var i = 0; i < links.length; ++i) {
        if((links[i].source == source && links[i].target == target) || 
          (links[i].source == target && links[i].target == source))
          siblings.push(links[i].action_description);
      };
      return siblings;
  };

  
  function arcPath(leftHand, d) {
    var x1 = leftHand ? d.source.x : d.target.x,
        y1 = leftHand ? d.source.y : d.target.y,
        x2 = leftHand ? d.target.x : d.source.x,
        y2 = leftHand ? d.target.y : d.source.y,
        dx = x2 - x1,
        dy = y2 - y1,
        dr = Math.sqrt(dx * dx + dy * dy),
        drx = dr,
        dry = dr,
        sweep = leftHand ? 0 : 1;
        siblingCount = countSiblingLinks(d.source, d.target)
        xRotation = 0,
        largeArc = 0;

        if (dr === 0) {
            sweep = 0;
            xRotation = -180;
            largeArc = 1;
            drx = 120;
            dry = 120;
            x2 = x2 + 1;
            y2 = y2 + 1;
        }

        if (siblingCount > 1) {
            var siblings = getSiblingLinks(d.source, d.target);
            var arcScale = d3.scaleOrdinal()
                                    .domain(siblings)
                                    .range([1, siblingCount]);
            drx = drx/(1 + (1/siblingCount) * (arcScale(d.value) - 1));
            dry = dry/(1 + (1/siblingCount) * (arcScale(d.value) - 1));
        }

    return "M" + x1 + "," + y1 + "A" + drx + ", " + dry + " " + xRotation + ", " + largeArc + ", " + sweep + " " + x2 + "," + y2;
  }
  */

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