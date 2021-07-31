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

  genderData = ["0", "1", "2"]
  genderColours = ["#F88B9D", "#8ECEFD", "#D3D3D3"]

  color = d3.scaleOrdinal()
            .domain(genderData)
            .range(genderColours);

  chart = () => {
    const links = data.links.map(d => Object.create(d));
    const nodes = data.nodes.map(d => Object.create(d));

    const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id(d => d.id))
        .force("charge", d3.forceManyBody().strength(-30))
        .force('collide', d3.forceCollide().radius(30))
        .force("center", d3.forceCenter(width / 3, height / 2));

    simulation.on("tick", () => {
      link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

      node
        .attr("transform", function(d) {
          return "translate(" + d.x + "," + d.y + ")";
        })

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
        .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(links)
      .join("line")
        .attr("stroke-width", 0.6)
      .attr("marker-end", "url(#arrow)");

    link.append("title")
        .text(d => d.action_description);

    const node = g.append("g")
      .selectAll("g")
      .data(nodes)
      .enter().append("g")
      .call(drag(simulation));

    const circles = node.append("circle")
        .attr("stroke", "#555")
        .attr("stroke-width", 0.75)
        .attr("r", 5)
        .attr("fill", d => color(d.gender));
        

    const circle_titles = node.append("text")
        .text(d => d.label)
        .attr('x', 6)
        .attr('y', -8)
        .style("font-size", "12px");
  }


  drag = simulation => { 
    function dragstarted(event) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }
    
    function dragged(event) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }
    
    function dragended(event) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    /*//add zoom capabilities 
    var zoom_handler = d3.zoom()
      .on("zoom", zoom_actions);

    zoom_handler(svg); 

    //Zoom functions 
    function zoom_actions(){
        g.attr("transform", d3.event.transform)
    }*/
    
    return d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
  }

  chart();
}