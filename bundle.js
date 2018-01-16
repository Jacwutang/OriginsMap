(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
//fgnass.github.com/spin.js#v1.2.5
/**
 * Copyright (c) 2011 Felix Gnass [fgnass at neteye dot de]
 * Licensed under the MIT license
 */

var prefixes = ['webkit', 'Moz', 'ms', 'O']; /* Vendor prefixes */
var animations = {}; /* Animation rules keyed by their name */
var useCssAnimations;

/**
 * Utility function to create elements. If no tag name is given,
 * a DIV is created. Optionally properties can be passed.
 */
function createEl(tag, prop) {
  var el = document.createElement(tag || 'div');
  var n;

  for(n in prop) {
    el[n] = prop[n];
  }
  return el;
}

/**
 * Appends children and returns the parent.
 */
function ins(parent /* child1, child2, ...*/) {
  for (var i=1, n=arguments.length; i<n; i++) {
    parent.appendChild(arguments[i]);
  }
  return parent;
}

/**
 * Insert a new stylesheet to hold the @keyframe or VML rules.
 */
var sheet = function() {
  var el = createEl('style');
  ins(document.getElementsByTagName('head')[0], el);
  return el.sheet || el.styleSheet;
}();

/**
 * Creates an opacity keyframe animation rule and returns its name.
 * Since most mobile Webkits have timing issues with animation-delay,
 * we create separate rules for each line/segment.
 */
function addAnimation(alpha, trail, i, lines) {
  var name = ['opacity', trail, ~~(alpha*100), i, lines].join('-');
  var start = 0.01 + i/lines*100;
  var z = Math.max(1-(1-alpha)/trail*(100-start) , alpha);
  var prefix = useCssAnimations.substring(0, useCssAnimations.indexOf('Animation')).toLowerCase();
  var pre = prefix && '-'+prefix+'-' || '';

  if (!animations[name]) {
    sheet.insertRule(
      '@' + pre + 'keyframes ' + name + '{' +
      '0%{opacity:'+z+'}' +
      start + '%{opacity:'+ alpha + '}' +
      (start+0.01) + '%{opacity:1}' +
      (start+trail)%100 + '%{opacity:'+ alpha + '}' +
      '100%{opacity:'+ z + '}' +
      '}', 0);
    animations[name] = 1;
  }
  return name;
}

/**
 * Tries various vendor prefixes and returns the first supported property.
 **/
function vendor(el, prop) {
  var s = el.style;
  var pp;
  var i;

  if(s[prop] !== undefined) return prop;
  prop = prop.charAt(0).toUpperCase() + prop.slice(1);
  for(i=0; i<prefixes.length; i++) {
    pp = prefixes[i]+prop;
    if(s[pp] !== undefined) return pp;
  }
}

/**
 * Sets multiple style properties at once.
 */
function css(el, prop) {
  for (var n in prop) {
    el.style[vendor(el, n)||n] = prop[n];
  }
  return el;
}

/**
 * Fills in default values.
 */
function merge(obj) {
  for (var i=1; i < arguments.length; i++) {
    var def = arguments[i];
    for (var n in def) {
      if (obj[n] === undefined) obj[n] = def[n];
    }
  }
  return obj;
}

/**
 * Returns the absolute page-offset of the given element.
 */
function pos(el) {
  var o = {x:el.offsetLeft, y:el.offsetTop};
  while((el = el.offsetParent)) {
    o.x+=el.offsetLeft;
    o.y+=el.offsetTop;
  }
  return o;
}

var defaults = {
  lines: 12,            // The number of lines to draw
  length: 7,            // The length of each line
  width: 5,             // The line thickness
  radius: 10,           // The radius of the inner circle
  rotate: 0,            // rotation offset
  color: '#000',        // #rgb or #rrggbb
  speed: 1,             // Rounds per second
  trail: 100,           // Afterglow percentage
  opacity: 1/4,         // Opacity of the lines
  fps: 20,              // Frames per second when using setTimeout()
  zIndex: 2e9,          // Use a high z-index by default
  className: 'spinner', // CSS class to assign to the element
  top: 'auto',          // center vertically
  left: 'auto'          // center horizontally
};

/** The constructor */
var Spinner = function Spinner(o) {
  if (!this.spin) return new Spinner(o);
  this.opts = merge(o || {}, Spinner.defaults, defaults);
};

Spinner.defaults = {};
merge(Spinner.prototype, {
  spin: function(target) {
    this.stop();
    var self = this;
    var o = self.opts;
    var el = self.el = css(createEl(0, {className: o.className}), {position: 'relative', zIndex: o.zIndex});
    var mid = o.radius+o.length+o.width;
    var ep; // element position
    var tp; // target position

    if (target) {
      target.insertBefore(el, target.firstChild||null);
      tp = pos(target);
      ep = pos(el);
      css(el, {
        left: (o.left == 'auto' ? tp.x-ep.x + (target.offsetWidth >> 1) : o.left+mid) + 'px',
        top: (o.top == 'auto' ? tp.y-ep.y + (target.offsetHeight >> 1) : o.top+mid)  + 'px'
      });
    }

    el.setAttribute('aria-role', 'progressbar');
    self.lines(el, self.opts);

    if (!useCssAnimations) {
      // No CSS animation support, use setTimeout() instead
      var i = 0;
      var fps = o.fps;
      var f = fps/o.speed;
      var ostep = (1-o.opacity)/(f*o.trail / 100);
      var astep = f/o.lines;

      !function anim() {
        i++;
        for (var s=o.lines; s; s--) {
          var alpha = Math.max(1-(i+s*astep)%f * ostep, o.opacity);
          self.opacity(el, o.lines-s, alpha, o);
        }
        self.timeout = self.el && setTimeout(anim, ~~(1000/fps));
      }();
    }
    return self;
  },
  stop: function() {
    var el = this.el;
    if (el) {
      clearTimeout(this.timeout);
      if (el.parentNode) el.parentNode.removeChild(el);
      this.el = undefined;
    }
    return this;
  },
  lines: function(el, o) {
    var i = 0;
    var seg;

    function fill(color, shadow) {
      return css(createEl(), {
        position: 'absolute',
        width: (o.length+o.width) + 'px',
        height: o.width + 'px',
        background: color,
        boxShadow: shadow,
        transformOrigin: 'left',
        transform: 'rotate(' + ~~(360/o.lines*i+o.rotate) + 'deg) translate(' + o.radius+'px' +',0)',
        borderRadius: (o.width>>1) + 'px'
      });
    }
    for (; i < o.lines; i++) {
      seg = css(createEl(), {
        position: 'absolute',
        top: 1+~(o.width/2) + 'px',
        transform: o.hwaccel ? 'translate3d(0,0,0)' : '',
        opacity: o.opacity,
        animation: useCssAnimations && addAnimation(o.opacity, o.trail, i, o.lines) + ' ' + 1/o.speed + 's linear infinite'
      });
      if (o.shadow) ins(seg, css(fill('#000', '0 0 4px ' + '#000'), {top: 2+'px'}));
      ins(el, ins(seg, fill(o.color, '0 0 1px rgba(0,0,0,.1)')));
    }
    return el;
  },
  opacity: function(el, i, val) {
    if (i < el.childNodes.length) el.childNodes[i].style.opacity = val;
  }
});

/////////////////////////////////////////////////////////////////////////
// VML rendering for IE
/////////////////////////////////////////////////////////////////////////

/**
 * Check and init VML support
 */
!function() {

  function vml(tag, attr) {
    return createEl('<' + tag + ' xmlns="urn:schemas-microsoft.com:vml" class="spin-vml">', attr);
  }

  var s = css(createEl('group'), {behavior: 'url(#default#VML)'});

  if (!vendor(s, 'transform') && s.adj) {

    // VML support detected. Insert CSS rule ...
    sheet.addRule('.spin-vml', 'behavior:url(#default#VML)');

    Spinner.prototype.lines = function(el, o) {
      var r = o.length+o.width;
      var s = 2*r;

      function grp() {
        return css(vml('group', {coordsize: s +' '+s, coordorigin: -r +' '+-r}), {width: s, height: s});
      }

      var margin = -(o.width+o.length)*2+'px';
      var g = css(grp(), {position: 'absolute', top: margin, left: margin});

      var i;

      function seg(i, dx, filter) {
        ins(g,
          ins(css(grp(), {rotation: 360 / o.lines * i + 'deg', left: ~~dx}),
            ins(css(vml('roundrect', {arcsize: 1}), {
                width: r,
                height: o.width,
                left: o.radius,
                top: -o.width>>1,
                filter: filter
              }),
              vml('fill', {color: o.color, opacity: o.opacity}),
              vml('stroke', {opacity: 0}) // transparent stroke to fix color bleeding upon opacity change
            )
          )
        );
      }

      if (o.shadow) {
        for (i = 1; i <= o.lines; i++) {
          seg(i, -2, 'progid:DXImageTransform.Microsoft.Blur(pixelradius=2,makeshadow=1,shadowopacity=.3)');
        }
      }
      for (i = 1; i <= o.lines; i++) seg(i);
      return ins(el, g);
    };
    Spinner.prototype.opacity = function(el, i, val, o) {
      var c = el.firstChild;
      o = o.shadow && o.lines || 0;
      if (c && i+o < c.childNodes.length) {
        c = c.childNodes[i+o]; c = c && c.firstChild; c = c && c.firstChild;
        if (c) c.opacity = val;
      }
    };
  }
  else {
    useCssAnimations = vendor(s, 'animation');
  }
}();

module.exports = Spinner;

},{}],2:[function(require,module,exports){
var Spinner = require('spin');
// import {Spinner} from 'spin.js';

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

var opts = {
  lines: 5, // The number of lines to draw
  length: 38, // The length of each line
  width: 17, // The line thickness
  radius: 45, // The radius of the inner circle
  scale: 1, // Scales overall size of the spinner
  corners: 1, // Corner roundness (0..1)
  color: 'black', // CSS color or array of colors
  fadeColor: 'transparent', // CSS color or array of colors
  opacity: 0.25, // Opacity of the lines
  rotate: 0, // The rotation offset
  direction: 1, // 1: clockwise, -1: counterclockwise
  speed: 1, // Rounds per second
  trail: 60, // Afterglow percentage
  fps: 20, // Frames per second when using setTimeout() as a fallback in IE 9
  zIndex: 2e9, // The z-index (defaults to 2000000000)
  className: 'spinner', // The CSS class to assign to the spinner
  top: '50%', // Top position relative to parent
  left: '50%', // Left position relative to parent
  shadow: 0, // Box-shadow for the lines
  position: 'absolute' // Element positioning
};


var width = 1000;
var height = 750;
var svg = d3.select("#map")
          .append("svg")
          .attr("height",height)
          .attr("width", width)
          .attr("transform", "translate(30,30)")

var g = svg.append("g")

var tooltip = d3.select("#information")
    .append("div")
    .style("position", "absolute")
    .style("z-index", "10")
    .style("visibility", "hidden");

var target = document.getElementById('map');
var spinner = new Spinner(opts).spin(target);


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
  //stopSpinner();

  spinner.stop();
  filterData(players);
  var counties = topojson.feature(data,data.objects.counties).features;



  var states = topojson.feature(file_states, file_states.objects.states).features;

  var select = document.getElementById("dropdown");
  select.onchange = function(event){
    d3.selectAll(".city-circle").remove();

    g.selectAll(".city-circle")
      .data(players.filter(function(player){

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

},{"spin":1}]},{},[2]);
