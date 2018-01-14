

var svg = d3.select("#map")
          .append("svg")
          .attr("height",600)
          .attr("width", 900)
          .append("g")
          .attr("transform", "translate(30,30)")


d3.queue()
  .defer(d3.json,"US.json")
  .defer(d3.csv, "players_2013_geocodio.csv")
  .await(ready)


var projection = d3.geoAlbersUsa()
                   .translate([900/2,600/2])
                   .scale(1000);
var path = d3.geoPath()
             .projection(projection);


//Convert from TopoJSON into something

function ready(error,data, players){
  console.log(data);
  console.log(players);

  var counties = topojson.feature(data,data.objects.counties).features;

  svg.selectAll(".county")
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



  svg.selectAll(".city-circle")
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



}
