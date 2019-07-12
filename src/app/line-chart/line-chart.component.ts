import { Component, OnInit, AfterContentInit, Input, OnDestroy, ElementRef } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-line-chart',
  templateUrl: './line-chart.component.html',
  styleUrls: ['./line-chart.component.css']
})

export class LineChartComponent implements OnInit, AfterContentInit, OnDestroy {
  @Input('height') setHeight = 300;
  @Input('width') setWidth = 1000;
  @Input('color') setColor = ['steelblue', 'skyblue'];
  @Input() dataUrl: string;
  @Input() showBrush = true;
  @Input() showSelect = true;
  @Input() xValue: string = 'date';
  @Input() yValue;
  @Input('xRange') xValueRange = ['14/5/2013', '13/5/2017'];
  yValues = [];
  margin = { left: 80, right: 100, top: 50, bottom: 50 };
  height = 300 - this.margin.top - this.margin.bottom;
  width = 1000 - this.margin.left - this.margin.right;
  margin2 = { left: 80, right: 100, top: 0, bottom: 20 };
  height2 = 80 - this.margin2.top - this.margin2.bottom;
  width2 = 1000 - this.margin2.left - this.margin2.right;
  color = ['steelblue', 'skyblue'];
  svg: any;
  svg2: any;
  g: any;
  g2: any;
  // Scales
  x = d3.scaleTime().range([0, this.width]);
  x2 = d3.scaleTime().range([0, this.width2]);
  y = d3.scaleLinear().range([this.height, 0]);
  y2 = d3.scaleLinear().range([this.height2, 0]);
  // Labels
  xLabel: any;
  yLabel: any;
  rangeLabel: any;
  legend: any;
  // X-axis
  xAxisCall: any;
  xAxis: any;
  xAxisCall2: any;
  xAxis2: any;
  // Y-axis
  yAxisCall: any;
  yAxis: any;
  // Data
  filteredData = {};
  parseTime = d3.timeParse('%d/%m/%Y');
  formatTime = d3.timeFormat('%m/%d/%Y');
  xRange = [this.parseTime(this.xValueRange[0]).getTime(), this.parseTime(this.xValueRange[1]).getTime()];
  promise: any;
  t = () => d3.transition().duration(1000);

  constructor(private container: ElementRef) {}

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
    if (this.svg2) {
      this.svg2.remove();
    }
    this.yValues = [];
    if (this.yValue) {
      this.yValues.push(this.yValue);
    }
    this.height = this.setHeight - this.margin.top - this.margin.bottom;
    this.width = this.setWidth - this.margin.left - this.margin.right;
    this.width2 = this.setWidth - this.margin2.left - this.margin2.right;
    this.color = this.setColor;
    this.x = d3.scaleTime().range([0, this.width]);
    this.y = d3.scaleLinear().range([this.height, 0]);
    this.x2 = d3.scaleTime().range([0, this.width2]);
    this.y2 = d3.scaleLinear().range([this.height2, 0]);
    this.xRange = [this.parseTime(this.xValueRange[0]).getTime(), this.parseTime(this.xValueRange[1]).getTime()];
    this.svg = d3.select(this.container.nativeElement)
      .select('#chart-area')
      .append('svg')
      .attr('width', this.width + this.margin.left + this.margin.right)
      .attr('height', this.height + this.margin.top + this.margin.bottom);
    this.svg2 = d3.select(this.container.nativeElement)
      .select('#slider-area')
      .append('svg')
      .attr('width', this.width2 + this.margin2.left + this.margin2.right)
      .attr('height', this.height2 + this.margin2.top + this.margin2.bottom);
    this.g = this.svg.append('g')
      .attr('transform', 'translate(' + this.margin.left + ', ' + this.margin.top + ')');
    this.g2 = this.svg2.append('g')
      .attr('transform', 'translate(' + this.margin2.left + ',' + this.margin2.top + ')');
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
    this.rangeLabel = this.g.append('text')
      .attr('class', 'axisLabel')
      .attr('y', -30);
    // X-axis
    this.xAxisCall = d3.axisBottom(null)
      .ticks(this.width / 125);
    this.xAxis = this.g.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,' + this.height + ')');
    this.xAxisCall2 = d3.axisBottom(null)
      .ticks(4);
    this.xAxis2 = this.g2.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,' + this.height2 + ')');
    // Y-axis
    this.yAxisCall = d3.axisLeft(null)
    this.yAxis = this.g.append('g')
      .attr('class', 'y axis');
    //Load data
    this.promise.then(data => {
      // Prepare and clean data
      const items = [];
      for (const item in data) {
        if (!data.hasOwnProperty(item)) {
          continue;
        }
        items.push(item);
        this.filteredData[item] = data[item].filter(d => {
          return 1;
        })
        this.filteredData[item].forEach(d => {
          for(const prop in d) {
            if(prop === 'date' || prop === 'Date' || prop === 'DATE') {
              d[prop] = this.parseTime(d[prop]);
            } else {
              d[prop] = +d[prop] + '' !== 'NaN' ? +d[prop] : d[prop];
            }
          }
        });
      }
      for(const prop in this.filteredData[items[0]][0]) {
        if(prop !== this.xValue && prop !== this.yValue) {
          this.yValues.push(prop);
        }
      }
      if(!this.yValue) {
        this.yValue = this.yValues[0];
      }
      // Legend
      this.legend = this.svg.selectAll('.legend')
        .data(items).enter()
        .append('g')
        .attr('transform', (d, i) => 'translate(' + (this.width - 120 * (items.length - 1 - i)) + ',' + 20 + ')')
        .attr('class', 'legend');
      this.legend.append('circle')
        .attr('r', 5)
        .attr('height', 10)
        .style('fill', (d, i) => this.color[i]);
      this.legend.append('text')
        .attr('x', 15)
        .attr('y', 5)
        .text(d => d);

      // Run the visualization for the first time
      this.update2();
      this.update();
    });
  }

  update() {
    const dataTimeFiltered = [];
    for (let item in this.filteredData) {
      dataTimeFiltered.push(this.filteredData[item].filter(d => {
        return ((d[this.xValue] >= this.xRange[0]) && (d[this.xValue] <= this.xRange[1]));
      }))
    }
    // Update scales
    let max = -Infinity;
    dataTimeFiltered.forEach(data => {
      max = Math.max(max, d3.max(data, d => parseInt(d[this.yValue])));
    })
    this.x.domain(d3.extent(dataTimeFiltered[0], d => new Date(d[this.xValue])));
    this.y.domain([0, max * 1.005]);
    // Fix for format values
    const formatSi = d3.format('.2s');
    function formatAbbreviation(x) {
      if(x === 0) return 0;
      const s = formatSi(x);
      switch (s[s.length - 1]) {
        case 'G': return s.slice(0, -1) + 'B';
        case 'k': return s.slice(0, -1) + 'K';
      }
      return s;
    }
    // Update axes
    this.xAxisCall.scale(this.x);
    this.xAxis.transition(this.t()).call(this.xAxisCall);
    this.yAxisCall.scale(this.y);
    this.yAxis.transition(this.t()).call(this.yAxisCall.tickFormat(formatAbbreviation));
    //Update rangelable
    this.rangeLabel.text('Date: ' + this.formatTime(new Date(this.xRange[0])) + ' ~ ' + this.formatTime(new Date(this.xRange[1])));
    // Clear old chart
    this.svg.selectAll('.line').remove();
    this.svg.selectAll('.dateTip').remove();
    this.svg.selectAll('.focus').remove();
    // Path generator
    const line = d3.line()
      .x(d => this.x(d[this.xValue]))
      .y(d => this.y(d[this.yValue]));
    // Update line path
    const lines = this.g.selectAll('.line')
      .data(dataTimeFiltered);
    lines.exit().remove();
    lines.enter()
      .append('path')
      .attr('class', 'line')
      .attr('fill', 'none')
      .attr('stroke', (d, i) => this.color[i])
      .attr('stroke-width', '1px')
      .merge(lines)
      // .transition(t)
      .attr('d', line);
    // Update axis label
    // const newText = (this.yValue == 'price_usd') ? 'Price (USD)' :
    //   ((this.yValue == 'market_cap') ? 'Market Capitalization (USD)' : '24 Hour Trading Volume (USD)');
    this.xLabel.text(this.xValue);
    this.yLabel.text(this.yValue);
    // Date Tooltip code
    const dateTip = this.g.append('g')
      .attr('class', 'dateTip')
      .style('display', 'none');
    dateTip.append('line')
      .attr('class', 'x-hover-line hover-line')
      .attr('y1', 0)
      .attr('y2', this.height);
    dateTip.append('text')
      .attr('x', 10)
      .attr('y', -5);
    // Chart Tooltip code
    var focuses = this.g.selectAll('.focus')
      .data(dataTimeFiltered);
    focuses.exit().remove();
    this.svg.select('.overlay').remove();
    const tooltips = focuses.enter()
      .append('g')
      .attr('class', 'focus')
      .style('display','none')
      .attr('transform', 'translate(' + 0 + ', ' + this.height + ')')
    tooltips.append('circle')
      .attr('r', 5)
      .attr('stroke', (d, i) => this.color[i]);
    tooltips.append('text')
      .attr('x', 10)
      .attr('y', 5);
    this.svg.append('rect')
      .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')')
      .attr('class', 'overlay')
      .attr('width', this.width)
      .attr('height', this.height)
      .on('mousemove', mousemove.bind(this));

    function mousemove() {
      const xValue = this.xValue;
      const x0 = this.x.invert(d3.mouse(d3.event.currentTarget)[0]);
      dateTip.attr('transform', () => {
        const d2 = selectDate(dataTimeFiltered[0], x0);
        return 'translate(' + this.x(d2[xValue]) + ',' + 0 + ')';
      })
        .style('display','unset')
        .select('text')
        .text(() => {
          const d2 = selectDate(dataTimeFiltered[0], x0);
          return this.formatTime(new Date(d2[xValue]));
        });
      tooltips.attr('transform', d => {
        const d2 = selectDate(d, x0);
        return 'translate(' + this.x(d2[xValue]) + ',' + this.y(d2[this.yValue]) + ')';
      })
        .style('display','unset')
        .select('text')
        .text((d) => {
          const d2 = selectDate(d, x0);
          return d3.format('$,')(d2[this.yValue].toFixed(2));
        })
      //Find the closest date against the mouse position
      function selectDate(data, x) {
        const bisectDate = d3.bisector(d => d[xValue]).left;
        const i = bisectDate(data, x, 1);
        const d0 = data[i - 1];
        const d1 = data[i];
        return (d1 && d0) ? (x - d0[xValue] > d1[xValue] - x ? d1 : d0) : d0;
      }
    }
  }

  update2() {
    const dataTimeFiltered = [];
    for (let item in this.filteredData) {
      dataTimeFiltered.push(this.filteredData[item].filter(d => {
        return (d[this.xValue] >= this.parseTime(this.xValueRange[0]).getTime() && d[this.xValue] <= this.parseTime(this.xValueRange[1]).getTime());
      }));
    }
    let max = -Infinity;
    dataTimeFiltered.forEach(data => {
      max = Math.max(max, d3.max(data, d => parseInt(d[this.yValue])));
    });
    this.x2.domain(d3.extent(dataTimeFiltered[0], d => new Date(d[this.xValue])));
    this.y2.domain([0, max]);
    this.xAxisCall2.scale(this.x2);
    this.xAxis2.transition(this.t()).call(this.xAxisCall2);
    // Clear old chart
    this.svg2.selectAll('.area').remove();
    this.svg2.selectAll('.brush').remove();
    // Path generator
    const area = d3.area()
      .x(d => this.x2(d[this.xValue]))
      .y0(this.height2)
      .y1(d => this.y2(d[this.yValue]));
    //Update area path
    const areas = this.g2.selectAll('.area')
      .data(dataTimeFiltered);
    areas.exit().remove();
    areas.enter()
      .append('path')
      .attr('class', 'area')
      .attr('fill', 'cornflowerblue')
      .attr('opacity', 0.25)
      .attr('d', area);
    //Brush
    var brush = d3.brushX()
      .handleSize(5)
      .extent([[0, 0], [this.width2, this.height2]])
      .on('brush', brushed.bind(this));
    var brushComponent = this.g2.append('g')
      .attr('class', 'brush')
      .call(brush.bind(this));
    brushComponent.selectAll('.overlay')
      .on('click', resetBrush.bind(this));

    function brushed() {
      var selection = d3.event.selection || this.x2.range();
      this.xRange = selection.map(this.x2.invert);
      (this.xRange[0]).setHours(0, 0, 0, 0);
      (this.xRange[1]).setHours(23, 59, 59, 999);
      this.update();
    }

    function resetBrush() {
      this.xRange = [this.parseTime(this.xValueRange[0]).getTime(), this.parseTime(this.xValueRange[1]).getTime()];
      this.update();
    }
  }

  onSelect(value: string) {
    this.yValue = value;
    this.update2();
    this.update();
  }

  ngOnDestroy() {
    this.svg.remove(); 
    this.svg2.remove();
  }
}
