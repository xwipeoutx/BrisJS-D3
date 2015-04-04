var figures = [
    { "name": "Triangle", "numPoints": 3, "perimeterRatio": 4.55 },
    { "name": "Square", "numPoints": 4, "perimeterRatio": 4 },
    { "name": "Pentagon", "numPoints": 5, "perimeterRatio": 3.81 },
    { "name": "Hexagon", "numPoints": 6, "perimeterRatio": 3.72 }
];

d3.select("#chart")
    .selectAll("div")
    .data(figures)
    .enter()
    .append("div")
    .text(function(d) { return d.name; })
    .style('background', 'red')
    .style('width', function(d) { return (3*d.numPoints)+ "em" });