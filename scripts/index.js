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

    const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id(d => d.id))
        .force("charge", d3.forceManyBody().strength(-5))
        .force('collide', d3.forceCollide().radius(30))
        .force("center", d3.forceCenter(width / 3, height / 2));

    simulation.on("tick", () => {
      link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

      //constrains the nodes to be within a box
      node
        .attr("transform", function(d) {
          d.x = Math.max(radius, Math.min(width - radius, d.x));
          d.y = Math.max(radius, Math.min(height - radius, d.y));
          return "translate(" + d.x + "," + d.y + ")";
        })

      edgepaths.attr('d', function (d) {
          return 'M ' + d.source.x + ' ' + d.source.y + ' L ' + d.target.x + ' ' + d.target.y;
      });

      edgelabels.attr('transform', (d) => {
        return 'rotate(0)';
      });


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
      .attr("viewBox", "0 -3 10 10")
      .attr("refX", 20)
      .attr("refY", 0)
      .attr("markerWidth", 8)
      .attr("markerHeight", 8)
      .attr("orient", "auto")
      .append("svg:path")
      .attr("d", "M0,-5L10,0L0,5");

  const link = g.append("g")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.8)
      .attr("class", "link-g")
    .selectAll("line")
    .data(links)
    .join("line")
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


  link.append("title")
      .text(d => d.action_description);

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
    .text(d => d.action_description);

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