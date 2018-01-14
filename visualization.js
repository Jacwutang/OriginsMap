
var width = 1000;
var height = 750;
var svg = d3.select("#map")
          .append("svg")
          .attr("height",height)
          .attr("width", width)
          // .append("g")
          .attr("transform", "translate(30,30)")

var g = svg.append("g")
//            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")
//            .append("g")
//            .attr("id", "counties");



d3.queue()
  .defer(d3.json,"US.json")
  .defer(d3.json,"USstates.json")
  .defer(d3.csv, "players_2013_geocodio.csv")
  .await(ready)


var projection = d3.geoAlbersUsa()
                   .translate([900/2,600/2])
                   .scale(1250);
var path = d3.geoPath()
             .projection(projection);
var centered;




//Convert from TopoJSON into something

function ready(error,data, file_states, players){



  var counties = topojson.feature(data,data.objects.counties).features;

  var states = topojson.feature(file_states, file_states.objects.states).features;


 g.append('g')
  .selectAll(".county")
  .data(counties)
  .enter().append("path")
  .attr("class", "county")
  .attr("d", path)
  .on('mouseover', function(d){
    d3.select(this).classed("selected", true)

  })
  .on('mouseout', function(d){
    d3.select(this).classed("selected", false)

  })
  .on('click',clicked);




  // svg.selectAll(".state")
  // .data(states)
  // .enter().append("path")
  // .attr("class","state")
  // .attr("d",path)


  g.selectAll(".city-circle")
     .data(players)
     .enter().append("circle")
     .attr("r",2)
     .attr("cx",function(player){
       var coords = projection([player.Longitude, player.Latitude]);

       if(coords === undefined || coords === null){
         return 0;
       } else{
         return coords[0];
       }

     })
     .attr("cy", function(player){
       var coords = projection([player.Longitude,player.Latitude]);
       if(coords === undefined || coords === null){
         return 0;
       } else{
         return coords[1];
       }
     })
     .attr("opacity", 0.5)
}

function clicked(d) {

  console.log(clicked);
  var x, y, k;

  if (d && centered !== d) {
    var centroid = path.centroid(d);
    x = centroid[0];
    y = centroid[1];
    k = 4;
    centered = d;
  } else {
    x = width / 2;
    y = height / 2;
    k = 1;
    centered = null;
  }

  g.selectAll("path")
      .classed("active", centered && function(d) { return d === centered; });

  g.transition()
      .duration(750)
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
      .style("stroke-width", 1.5 / k + "px");
}
