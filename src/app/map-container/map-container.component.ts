import { Component, AfterContentInit, OnInit, Input, Output, EventEmitter, HostListener} from '@angular/core';
import * as d3 from 'd3';
import * as topojson from 'topojson';

@Component({
  selector: 'app-map-container',
  templateUrl: './map-container.component.html',
  styleUrls: ['./map-container.component.css']
})
export class MapContainerComponent implements OnInit, AfterContentInit {
  @Input() width: any = 800;
  @Input() height: any = 800;
  @Input() scalable: boolean = true;
  @Input() clickable: boolean = true;
  @Input() showSelector: boolean = true;
  @Input() escZoomOut: boolean = false;
  @Input() resizable: boolean = false;
  country: string = '';
  @Input('country') 
  set setCountry(value: string) {
    this.country = value;
    if(this.svg) {
      this.onSelect(this.country);
    }
  }
  @Output() selectedCountry = new EventEmitter<string>();
  svg: any;
  tooltip: any;
  g: any;
  projection: any;
  zoom: any;
  path: any;
  world: any;
  countries: any;
  select: any;
  promise: Promise<any>;
  countryName: string = '';
  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) { 
    if(event.key === 'Escape' && this.escZoomOut) {
      this.reset();
    }
  }

  ngOnInit() {
    const arr = [d3.json("../assets/world-50m.json"), d3.csv("../assets/countryIdName.csv")];
    this.promise = Promise.all(arr);
    this.promise.then((data:any) => this.ready(data));
  }
  
  ngAfterContentInit() { 
    this.height = parseInt(this.height);
    this.width = parseInt(this.width);
    if(this.height > this.width) {
      this.height = this.width;
    }
    this.projection = d3.geoMercator()
        .scale(this.width/6.3)
        .translate([this.width / 2, this.height / 1.6])
        .rotate([-11,0]); //set the center for the map
    this.zoom = d3.zoom().on("zoom", this.zoomed.bind(this));
    this.path = d3.geoPath().projection(this.projection); 
    this.tooltip = d3.select(".mapContainer")
        .append("div") 
        .attr("class", "tooltip")       
        .style("display", "none");
    this.svg = d3.select(".mapContainer").append("svg")
        .attr("width", this.width)
        .attr("height", this.height)
        .on("click", this.stopped, true);
    this.svg.append("rect")
        .attr("class", "background")
        .attr("width", this.width)
        .attr("height", this.height)
        .on("click", this.reset.bind(this));
    this.g = this.svg.append("g");
    if(this.scalable) {
      this.svg.call(this.zoom)// delete this line to disable free zooming
    }
    this.promise.then(() => {
      const selectCountry = 
      this.g.selectAll("path")
          .data(this.countries).enter()
          .append("path")
          .attr("d", this.path)
          .attr("class", "feature")
          .attr("id", (d:any) => 'id' + d.id) //set id for each country path
          .on("mousemove", (d:any) => 
            this.tooltip
                .style("display", "block")
                .style("position", "fixed")
                .style("left", (d3.event.pageX + 20) + "px")   
                .style("top", (d3.event.pageY - window.scrollY + 20) + "px") 
                .html(d.name))
          .on("mouseout", () => 
            this.tooltip.style("display", "none"))
        if(this.clickable){
          selectCountry.on("click", this.clicked.bind(this)); // delete this line to disable free click
        } 
        this.onSelect(this.country); 
        document.querySelector('select').style.maxWidth = this.width + 'px';  
      }
    )
  }

  ready(data:any) {
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
    this.countries.sort((a: any, b: any) => a.name > b.name ? 1 : -1)
  }

  clicked(d:any) {
    d3.selectAll("path").classed("mesh", false); //reset mesh border color
    d3.selectAll("path").classed("countryActive", false); //reset country fill color
    d3.select('#id'+d.id).classed("countryActive", true); //set newly selected country fill color
    var bounds = this.path.bounds(d);
    switch(d.id) { //special zooming cases
      case 152: bounds[0][0] = bounds[1][0]; break; //chile
      case 528: bounds[0][0] = bounds[1][0]; bounds[1][1] = bounds[0][1]; break; //netherlands
      case 250: bounds[0][0] = bounds[1][0] = (bounds[0][0] + bounds[1][0]) / 1.95; bounds[1][1] = bounds[0][1] + this.height / 19; break; //france
      case 840: bounds[1][0] = bounds[1][0] / 3.63; break; //amercia
    }
    var dx = bounds[1][0] - bounds[0][0],
        dy = bounds[1][1] - bounds[0][1],
        x = (bounds[0][0] + bounds[1][0]) / 2,
        y = (bounds[0][1] + bounds[1][1]) / 2,
        scale = Math.max(1, Math.min(8, 0.8 / Math.max(dx / this.width, dy / this.height))),
        translate = [this.width / 2 - scale * x, this.height / 2 - scale * y];
    this.svg.transition() 
        .duration(1000)
        .call( this.zoom.transform, d3.zoomIdentity.translate(translate[0],translate[1]).scale(scale));
    this.g.append("path")
        .datum(topojson.mesh(this.world, this.world.objects.countries, (a, b) => a.id === d.id || b.id === d.id)) //highlight borders including mutual borders
        .attr("d", this.path)
        .attr("fill","none")
        .attr("class", "mesh"); //set selected country border color
    this.countryName = d.name;
    this.selectedCountry.emit(d.name);
  }

  zoomed() {
    this.g.style("stroke-width", 1 / d3.event.transform.k + "px"); //change border stroke width when zooming
    this.g.attr("transform", d3.event.transform); 
  }

  reset() { //reset map color and zoom
    if(!this.clickable) return;
    d3.selectAll("path").classed("mesh", false);
    d3.selectAll("path").classed("countryActive", false);
    this.svg.transition().duration(1000).call(this.zoom.transform, d3.zoomIdentity);
    this.countryName = '';
    this.selectedCountry.emit('');
  }

  stopped() {
    if (d3.event.defaultPrevented) {
      d3.event.stopPropagation();
    }
  }

  onResize() {
    if(this.resizable) {
      d3.select(".mapContainer").html('');
      this.ngOnInit();
      this.ngAfterContentInit();
    }
  }

  onSelect(value:string) {
    if (value === '' || value === null) {
      d3.selectAll("path").classed("mesh", false);
      d3.selectAll("path").classed("countryActive", false);
      this.svg.transition().duration(1000).call(this.zoom.transform, d3.zoomIdentity);
      this.countryName = '';
      this.selectedCountry.emit('');
      return;
    }
    this.g.selectAll('path').filter((d: any) => {
      if (d.name === value) {
        this.clicked(d);
      }
    });
  }
}
