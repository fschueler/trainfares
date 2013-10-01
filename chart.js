var margin = {top: 40, right: 20, bottom: 30, left: 40},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var formatPercent = d3.format(".0%");

var x = d3.scale.ordinal()
    .rangeRoundBands([0, width], .1);

var y = d3.scale.linear()
    .range([height, 0]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .tickFormat(formatPercent);

var color = d3.scale.ordinal()
    .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

var tip = d3.tip()
  .attr('class', 'd3-tip')
  .offset([-10, 0])
  .html(function(d) {
    return "<strong>Increase:</strong> <span style='color:red'>" + Math.round(100 * d.single) + "%" + "</span>";
  })

var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

svg.call(tip);

d3.tsv("data.tsv", type, function(error, data) {
  color.domain(d3.keys(data[0]).filter(function(key) { return key !== "city"; }));
  var inflation = 0.66
  data.forEach(function(d) {
    var y0 = 0;
    d.parts = color.domain().map(function(name) { return {name: name, y0: y0, y1: (name == "single" && +d[name] > inflation) ? y0 += +d[name] - inflation : y0 += +d[name]}; });
    d.total = d.parts[d.parts.length - 1].y1;
  });

  data.sort(function(a, b) { return b.total - a.total; });

  x.domain(data.map(function(d) { return d.city; }));
  y.domain([0, d3.max(data, function(d) { return d.single; })]);

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Increase");

  var city = svg.selectAll(".city")
      .data(data)
    .enter().append("g")
      .attr("class", "g")
      .attr("transform", function(d) { return "translate(" + x(d.city) + ",0)"; });

  city.selectAll(".bar")
      .data(function(d) { return d.parts; })
    .enter().append("rect")
      .attr("width", x.rangeBand())
      .attr("y", function(d) { return height; })
      .attr("height", function(d) { return height; })
      .style("fill", function(d) { return color(d.name); })
      .style("fill-opacity", function(d) { return d.name == "inflation" ? 0.5 : 1;});

  svg.selectAll("rect")
      .on('mouseover', tip.show)
      .on('mouseout', tip.hide)


    redraw();

  function redraw() {
    city.selectAll("rect")
    .data(function(d) { return d.parts; })
    .transition()
    .duration(1000)
    .attr("y", function(d) { return y(d.y1); })
    .attr("height", function(d) { return y(d.y0) - y(d.y1); });

}


    svg.append("line")
      .attr("y1", y(0.66))
      .attr("y2", y(0.66))
      .attr("x1", 0)
      .attr("x2", width)
      .style("opacity", "0.3")
      .style("stroke", "#000");

    svg.append("line")
      .attr("y1", y(1.53))
      .attr("y2", y(1.53))
      .attr("x1", 0)
      .attr("x2", width)
      .style("opacity", "0.3")
      .style("stroke", "#000");

    svg.append("text")
      .attr("x", width)
      .attr("y", y(0.6))
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .style("opacity", "0.6")
      .text("Inflation");

    svg.append("text")
      .attr("x", width)
      .attr("y", y(1.47))
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .style("opacity", "0.6")
      .text("Average");

    var legend = svg.selectAll(".legend")
      .data(color.domain().slice().reverse())
    .enter().append("g")
      .attr("class", "legend")
      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

  legend.append("rect")
      .attr("x", width - 18)
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", color);

  legend.append("text")
      .attr("x", width - 24)
      .attr("y", 9)
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .text(function(d) { return d; });


});

function type(d) {
  d.single = +d.single;
  return d;
}