import { Component, AfterContentInit, ViewChild, ElementRef, OnInit } from '@angular/core';
import * as d3 from 'd3';
import * as topojson from 'topojson';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterContentInit{
  title = 'worldMap';
  width: number;
  height: number;
  svg: any;
  g: any;
  projection: any;
  zoom: any;
  path: any;
  world: any;
  countries: any;
  select: any;
  promise: Promise<any>;
  @ViewChild('mapContainer') mapContainer: ElementRef;

  ngOnInit() {
    const arr = [d3.json("../assets/world-50m.json"), d3.csv("../assets/countryIdName.csv")];
    this.promise = Promise.all(arr);
    this.promise.then((data:any) => this.ready(data));
  }
  
  ngAfterContentInit() {
    this.width = this.mapContainer.nativeElement.getBoundingClientRect().width;
    this.height = this.mapContainer.nativeElement.getBoundingClientRect().height;
    this.projection = d3.geoMercator()
        .scale(this.width/6.3)
        .translate([this.width / 2, this.height / 1.6])
        .rotate([-11,0]); //set the center for the map
    this.zoom = d3.zoom().on("zoom", this.zoomed.bind(this));
    this.path = d3.geoPath().projection(this.projection); 
    this.svg = d3.select("div").append("svg")
        .attr("width", "100%")
        .attr("height", "100%")
        .on("click", this.stopped, true);
    this.svg.append("rect")
        .attr("class", "background")
        .attr("width", "100%")
        .attr("height", "100%")
        .on("click", this.reset.bind(this));
    this.g = this.svg.append("g");
    this.svg.call(this.zoom)// delete this line to disable free zooming
    this.promise.then(
      () => {
        this.g.selectAll("path")
            .data(this.countries)
            .enter()
            .append("path")
            .attr("d", this.path)
            .attr("class", "feature")
            .attr("id", (d:any) => {return 'id' + d.id}) //set id for each country path
            .on("click", this.clicked.bind(this)); // delete this line to disable free click
      }
    )
  }

  ready(data) {
    this.world = data[0];
    this.countries = (<any>topojson.feature(data[0], data[0].objects.countries)).features;
    this.countries = this.countries.filter((d: any) => {  //add country name from csv
      return data[1].some((n: any) => { 
        if (d.id == n.id) {
          d.name = n.name;
          return true;
        }
      })
    });
    this.countries.sort((a: any, b: any) => { 
      return a.name > b.name ? 1 : -1;
    })
  }

  clicked(d:any) {
    d3.selectAll("path").classed("mesh",false); //reset mesh border color
    d3.selectAll("path").classed("active", false); //reset country fill color
    d3.select('#id'+d.id).classed("active", true); //set newly selected country fill color
    var bounds = this.path.bounds(d);
    switch(d.id) { //special zooming cases
      case 152: bounds[0][0] = bounds[1][0]; break; //chile
      case 528: bounds[0][0] = bounds[1][0]; bounds[1][1] = bounds[0][1]; break; //netherlands
      case 250: bounds[0][0] = bounds[1][0] = (bounds[0][0] + bounds[1][0]) / 2; bounds[1][1] = bounds[1][1] / 1.43; break; //france
      case 840: bounds[1][0] = bounds[1][0] / 3.63; break; //amercia
    }
    var dx = bounds[1][0] - bounds[0][0],
        dy = bounds[1][1] - bounds[0][1],
        x = (bounds[0][0] + bounds[1][0]) / 2,
        y = (bounds[0][1] + bounds[1][1]) / 2,
        scale = Math.max(1, Math.min(7, 0.8 / Math.max(dx / this.width, dy / this.height))),
        translate = [this.width / 2 - scale * x, this.height / 2 - scale * y];
    this.svg.transition() 
        .duration(1000)
        .call( this.zoom.transform, d3.zoomIdentity.translate(translate[0],translate[1]).scale(scale) );
    this.g.append("path")
        .datum(topojson.mesh(this.world, this.world.objects.countries, (a, b) => { return a.id === d.id || b.id === d.id; })) //highlight borders including mutual borders
        .attr("d", this.path)
        .attr("fill","none")
        .attr("class", "mesh"); //set selected country border color
  }

  zoomed() {
    this.g.style("stroke-width", 1 / d3.event.transform.k + "px"); //change border stroke width when zooming
    this.g.attr("transform", d3.event.transform); 
  }

  reset() { //reset map color and zoom
    d3.selectAll("path").classed("mesh",false);
    d3.selectAll("path").classed("active", false);
    this.svg.transition().duration(1000).call(this.zoom.transform, d3.zoomIdentity);
  }

  stopped() {
    if (d3.event.defaultPrevented) {
      d3.event.stopPropagation()
    }
  }

  onSelect(event:Event) {
    const selected = (<HTMLSelectElement>event.target).value;
    if (selected === '' || selected === null) {
      return this.reset();
    }
    this.g.selectAll('path').filter((d: any) => {
      if (d.name === selected) {
        this.clicked(d);
      }
    });
  }
}
