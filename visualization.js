var state_Hash = {
   "01": "Alabama",
   "02": "Alaska",
   "04": "Arizona",
   "05": "Arkansas",
   "06": "California",
   "08": "Colorado",
   "09": "Connecticut",
   "10": "Delaware",
   "11": "District of Columbia",
   "12": "Florida",
   "13": "Geogia",
   "15": "Hawaii",
   "16": "Idaho",
   "17": "Illinois",
   "18": "Indiana",
   "19": "Iowa",
   "20": "Kansas",
   "21": "Kentucky",
   "22": "Louisiana",
   "23": "Maine",
   "24": "Maryland",
   "25": "Massachusetts",
   "26": "Michigan",
   "27": "Minnesota",
   "28": "Mississippi",
   "29": "Missouri",
   "30": "Montana",
   "31": "Nebraska",
   "32": "Nevada",
   "33": "New Hampshire",
   "34": "New Jersey",
   "35": "New Mexico",
   "36": "New York",
   "37": "North Carolina",
   "38": "North Dakota",
   "39": "Ohio",
   "40": "Oklahoma",
   "41": "Oregon",
   "42": "Pennsylvania",
   "44": "Rhode Island",
   "45": "South Carolina",
   "46": "South Dakota",
   "47": "Tennessee",
   "48": "Texas",
   "49": "Utah",
   "50": "Vermont",
   "51": "Virginia",
   "53": "Washington",
   "54": "West Virginia",
   "55": "Wisconsin",
   "56": "Wyoming"
}


var width = 1000;
var height = 750;
var svg = d3.select("#map")
          .append("svg")
          .attr("height",height)
          .attr("width", width)
          // .append("g")
          .attr("transform", "translate(30,30)")

var g = svg.append("g")

var tooltip = d3.select("#information")
    .append("div")
    .style("position", "absolute")
    .style("z-index", "10")
    .style("visibility", "hidden");


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
  // var player_dob = filterData(players);
  filterData(players);
  var counties = topojson.feature(data,data.objects.counties).features;

  console.log(counties);

  var states = topojson.feature(file_states, file_states.objects.states).features;

  var select = document.getElementById("dropdown");
  select.onchange = function(event){
    d3.selectAll(".city-circle").remove();

    g.selectAll(".city-circle")
      .data(players.filter(function(player){
        // console.log(player.birth_date);
        // console.log(event.target.value);
        return player.birth_date < parseInt(event.target.value);
      }))
      .enter().append("circle")
      .attr("class","city-circle")
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
      .on('mouseover', function(c){
         tooltip.style("visibility", "visible");
       })
      .on('mousemove', function(c){
        console.log(c);
        tooltip.text(c.name + ',' + ' College: ' + c.college);
        // tooltip.style("top",
        // (d3.event.pageY-10)+"px").style("left",(d3.event.pageX+10)+"px").text(c.name);
      })
      .on('mouseout', function(c){

          tooltip.style("visibility", "hidden");

      })



  }




 g.append('g')
  .selectAll(".county")
  .data(counties)
  .enter().append("path")
  .attr("class", "county")
  .attr("d", path)
  .on('mouseover', function(d){
    d3.select(this).classed("selected", true);
    tooltip.style("visibility", "visible");
    console.log(d)
  })
  .on('mousemove', function(d){
    // tooltip.style("top",
    // (d3.event.pageY-10)+"px").style("left",(d3.event.pageX+10)+"px").text(d.properties.NAME + ' ' +


    tooltip.text(d.properties.NAME + ' ' + 'County' + ',' + ' ' + mapCountyToState(d.properties.STATEFP));

  })
  .on('mouseout', function(d){
    d3.select(this).classed("selected", false);
      tooltip.style("visibility", "hidden");

  })
  .on('click',clicked);


  g.selectAll(".state")
  .data(states)
  .enter().append("path")
  .attr("class","state")
  .attr("d",path)
  // .on('mouseover', function(s){
  //   d3.select(this).classed("selected", true);
  //   tooltip.style("visibility", "visible");
  //
  // })
  // .on('mousemove', function(s){
  //   tooltip.text(s.properties.NAME);
  //   // tooltip.style("top",
  //   // (d3.event.pageY-10)+"px").style("left",(d3.event.pageX+10)+"px").text(s.properties.NAME);
  // })
  // .on('mouseout', function(s){
  //   d3.select(this).classed("selected", false);
  //     tooltip.style("visibility", "hidden");
  //
  // })


  g.selectAll(".city-circle")
     .data(players)
     .enter().append("circle")
     .attr("class","city-circle")
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
     .on('mouseover', function(c){
        tooltip.style("visibility", "visible");
      })
     .on('mousemove', function(c){
       console.log(c);
       tooltip.text(c.name + ',' + ' College: ' + c.college);
       // tooltip.style("top",
       // (d3.event.pageY-10)+"px").style("left",(d3.event.pageX+10)+"px").text(c.name);
     })
     .on('mouseout', function(c){

         tooltip.style("visibility", "hidden");

     })
}
// ------------------------------------------------------------------
function clicked(d) {


  var x, y, k;

  if (d && centered !== d) {
    var centroid = path.centroid(d);
    x = centroid[0];
    y = centroid[1];
    k = 10;
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

function mapCountyToState(state_id){
  return state_Hash[state_id];

}


function filterData(data){
  var res = [];

  data.forEach( (d) => {
    d.birth_date = parseInt("19" + d.birth_date.slice(-2) )
    res.push(d);

  })

  return res;

};

// function selectEventHandler(event,players){
//
//
//
//   d3.selectAll(".city-circle").remove();
//
//
//   d3.selectAll(".city-circle")
//     .data(players,function(player){
//       console.log(event.target.value);
//       return player.birth_date < parseInt(event.target.value);
//     })
//     .enter().append("circle")
//     .attr("class","city-circle")
//     .attr("fill", "red")
//     .attr("r",10)
//     .attr("cx",function(player){
//       var coords = projection([player.Longitude, player.Latitude]);
//
//       if(coords === undefined || coords === null){
//         return 0;
//       } else{
//         return coords[0];
//       }
//
//     })
//     .attr("cy", function(player){
//       var coords = projection([player.Longitude,player.Latitude]);
//       if(coords === undefined || coords === null){
//         return 0;
//       } else{
//         return coords[1];
//       }
//     })
//     .attr("opacity", 0.5)
//
//
// }
