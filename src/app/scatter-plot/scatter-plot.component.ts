import { Component, OnInit, AfterContentInit, Input, Output, EventEmitter } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-scatter-plot',
  templateUrl: './scatter-plot.component.html',
  styleUrls: ['./scatter-plot.component.css']
})
export class ScatterPlotComponent implements OnInit, AfterContentInit {
  @Output() selectedSpot = new EventEmitter<string>();
  defaultSpot:string;
  @Input('defaultSpot') 
  set setDefaultSpot(value: string) {
    this.defaultSpot = value;
    const result = this.filteredData.find( d => d.id === this.defaultSpot);
    if(result) {
      this.mouseover(result);
    }
  };
  @Input('height') setHeight = 400;
  @Input('width') setWidth = 480;
  @Input('color') setColor = 'steelblue';
  @Input() dataUrl: string;
  @Input() xValue: string = 'x';
  @Input() yValue: string = 'y';
  @Input() xRange = [0, 1];
  @Input() yRange = [0, 1];
  margin = { left: 80, right: 100, top: 50, bottom: 50 };
  height = 400 - this.margin.top - this.margin.bottom;
  width = 480 - this.margin.left - this.margin.right;
  color = 'steelblue';
  svg: any;
  g: any;
  // Scales
  x = d3.scaleLinear().range([0, this.width]);
  y = d3.scaleLinear().range([this.height, 0]);
  // Labels
  xLabel: any;
  yLabel: any;
  legend: any;
  // X-axis
  xAxisCall: any;
  xAxis: any;
  // Y-axis
  yAxisCall: any;
  yAxis: any;
  // Tooltip 
  tooltip: any;
  filteredData = [];
  promise: any;
  t = () => d3.transition().duration(1000);

  constructor() { }

  ngOnInit() {
    this.loadData();
  }

  ngAfterContentInit() {
    this.reset();
  }

  loadData() {
    this.promise = d3.json(this.dataUrl);
  }

  reset() {
    if (this.svg) {
      this.svg.remove();
    }
    this.height = this.setHeight - this.margin.top - this.margin.bottom;
    this.width = this.setWidth - this.margin.left - this.margin.right;
    this.color = this.setColor;
    this.x = d3.scaleLinear().range([0, this.width]);
    this.y = d3.scaleLinear().range([this.height, 0]);
    this.svg = d3.select('#scatter-plot-area')
      .append('svg')
      .attr('width', this.width + this.margin.left + this.margin.right)
      .attr('height', this.height + this.margin.top + this.margin.bottom);
    this.g = this.svg.append('g')
      .attr('transform', 'translate(' + this.margin.left + ', ' + this.margin.top + ')');
    // Labels
    this.xLabel = this.g.append('text')
      .attr('class', 'x axisLabel')
      .attr('y', this.height + 40)
      .attr('x', this.width / 2)
      .attr('text-anchor', 'middle')
    this.yLabel = this.g.append('text')
      .attr('class', 'y axisLabel')
      .attr('y', -50)
      .attr('x', -this.height / 2)
      .attr('transform', 'rotate(-90)')
      .attr('text-anchor', 'middle')
    // X-axis
    this.xAxisCall = d3.axisBottom(null).ticks(2);
    this.xAxis = this.g.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,' + this.height + ')');
    // Y-axis
    this.yAxisCall = d3.axisLeft(null).ticks(2);
    this.yAxis = this.g.append('g')
      .attr('class', 'y axis');
    // Reference lines
    this.g.append('line')
      .attr('class', 'reference-line')
      .attr('x1', 0)
      .attr('x2', this.width);
    this.g.append('line')
      .attr('class', 'reference-line')
      .attr('x1', 0)
      .attr('x2', this.width)
      .attr('y1', this.height / 2)
      .attr('y2', this.height / 2)
    this.g.append('line')
      .attr('class', 'reference-line')
      .attr('x1', this.width /2)
      .attr('x2', this.width /2)
      .attr('y1', 0)
      .attr('y2', this.height);
    this.g.append('line')
      .attr('class', 'reference-line')
      .attr('x1', this.width)
      .attr('x2', this.width)
      .attr('y1', 0)
      .attr('y2', this.height);
    //Load data
    this.promise.then(data => {
      this.filteredData = data;
      this.filteredData.forEach(d => {
        for(const prop in d) {
          d[prop] = +d[prop] + '' !== 'NaN' ? +d[prop] : d[prop];
        }
      })
      this.update();
    });
  }

  update() {
    const xRangeNew = d3.extent(this.filteredData, d => d[this.xValue]);
    const yRangeNew = d3.extent(this.filteredData, d => d[this.yValue]);
    this.xRange[0] = this.xRange[0] < xRangeNew[0] ? this.xRange[0] : xRangeNew[0];
    this.xRange[1] = this.xRange[1] > xRangeNew[1] ? this.xRange[1] : xRangeNew[1];
    this.yRange[0] = this.yRange[0] < yRangeNew[0] ? this.yRange[0] : yRangeNew[0];
    this.yRange[1] = this.yRange[1] > yRangeNew[1] ? this.yRange[1] : yRangeNew[1]; 
    this.x.domain(this.xRange);
    this.y.domain(this.yRange);
    // Fix for format values
    function formatAbbreviation(x) {
      if(x === 0) return 0;
      return d3.format(',.0%')(x);
    }
    // Update axes
    this.xAxisCall.scale(this.x);
    this.xAxis.transition(this.t()).call(this.xAxisCall.tickFormat(formatAbbreviation));
    this.yAxisCall.scale(this.y);
    this.yAxis.transition(this.t()).call(this.yAxisCall.tickFormat(formatAbbreviation));
    //tooltip
    this.tooltip = this.g.append('g')
      .attr('class', 'scatter-plot-tooltip');
    this.tooltip.append('line')
      .attr('class', 'x-hover-line hover-line');
    this.tooltip.append('text')
      .attr('y', -20)
      .attr('text-anchor', 'middle');
    // Update spots
    const circles = this.g.selectAll('.spot')
      .data(this.filteredData);
    circles.exit().remove();
    circles.enter()
      .append('circle')
      .attr('class', 'spot')
      .attr('id', d => 'id_' + d.id.split(' ').join('_'))
      .attr('r', 6)
      .attr('transform', d => 'translate(' + this.x(d[this.xValue]) + ', ' + this.y(d[this.yValue]) + ')')
      .merge(circles)
      .on('mouseover', this.mouseover.bind(this))
      .on('mousedown', this.mousedown.bind(this))
      .on('mouseup', this.mouseup.bind(this))
      .on('mousemove', this.mouseup.bind(this));
    // Default tooltip
    const result = this.filteredData.find( d => d.id === this.defaultSpot);
    if(result) {
      this.mouseover(result);
    }
  }

  mouseover(d) {
    this.g.selectAll('.spot').classed('hover-spot', false);
    this.g.select('#id_' + d.id.split(' ').join('_')).classed('hover-spot', true);
    this.tooltip.attr('transform', 'translate(' + this.x(d[this.xValue]) + ',' + 0 + ')');
    this.tooltip.select('line')
      .attr('y1', this.y(d[this.yValue]))
      .attr('y2', -15);
    this.tooltip.select('text')
      .text(d.id);
  }

  mousedown(d) {
    this.g.select('#id_' + d.id.split(' ').join('_')).classed('select-spot', true);
    this.selectedSpot.emit(d.id);
  }

  mouseup(d) {
    this.g.select('#id_' + d.id.split(' ').join('_')).classed('select-spot', false);
  }

}
