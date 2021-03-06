import { Component, OnInit, Input, OnDestroy, ElementRef } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-line-chart',
  templateUrl: './line-chart.component.html',
  styleUrls: ['./line-chart.component.css']
})

export class LineChartComponent implements OnInit, OnDestroy {
  @Input('height') setHeight: number;
  @Input('width') setWidth: number;
  @Input('color') setColor = ['steelblue', 'skyblue'];
  @Input() dataUrl: string;
  @Input() showBrush = true;
  @Input() showSelect = true;
  @Input() xValue: string = 'date';
  @Input() yValue;
  @Input('xRange') xValueRange = ['14/5/2013', '13/5/2017'];
  yValues = [];
  margin = { left: 60, right: 100, top: 60, bottom: 40 };
  defaultHeight: number;
  defaultWidth: number;
  height: number;
  width: number;
  margin2 = { left: 60, right: 100, top: 0, bottom: 20 };
  height2 = 80 - this.margin2.top - this.margin2.bottom;
  width2: number;
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
  // buttons
  buttonGroup: any;
  // Labels
  xLabel: any;
  yLabel: any;
  legend: any;
  // X-axis
  xAxisCall: any;
  xAxis: any;
  xAxisCall2: any;
  xAxis2: any;
  // Y-axis
  yAxisCall: any;
  yAxis: any;
  // overlay
  overLay: any;
  // Brush
  brush: any;
  brushComponent: any;
  // Data
  filteredData = {};
  parseTime = d3.timeParse('%d/%m/%Y');
  parseTime2 = d3.timeParse('%m/%d/%Y');
  formatTime = d3.timeFormat('%m/%d/%Y');
  xRange = [this.parseTime(this.xValueRange[0]).getTime(), this.parseTime(this.xValueRange[1]).getTime()];
  dateBegin: any = this.formatTime(new Date(this.xRange[0]));
  dateEnd: any = this.formatTime(new Date(this.xRange[1]));
  xDomain: any;
  yDomain: any;
  x2Domain: any;
  y2Domain: any;
  cnt = 0;
  diff = 0;
  promise: any;
  t = () => d3.transition().duration(1000);

  constructor(private container: ElementRef) { }

  ngOnInit() {
    if (!this.setWidth) {
      if ((<HTMLElement>this.container.nativeElement.getElementsByClassName('chart')[0]).offsetWidth > 0) {
        this.setWidth = (<HTMLElement>this.container.nativeElement.getElementsByClassName('chart')[0]).offsetWidth;
      } else {
        this.setWidth = 800;
      }
    } else {
      this.defaultWidth = this.setWidth;
    }
    if (!this.setHeight) {
      this.setHeight = this.setWidth / 3;
    } else {
      this.defaultHeight = this.setHeight;
    }
    this.loadData();
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
    d3.select(this.container.nativeElement)
      .select('#chart-area')
      .style('width', this.width + this.margin.left + this.margin.right + 'px');
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
    // Buttons
    this.buttonGroup = this.svg.append('g')
      .attr('class', 'button-group')
      .attr('transform', 'translate(' + 60 + ', ' + 33 + ')');
    this.buttonGroup.append('text')
      .text('Zoom');
    let button = this.buttonGroup
      .append('g')
      .attr('class', 'button')
      .on('click', (d, i, n) => onClick.bind(this)(30, i, n));
    button.append('rect')
      .attr('height', 18)
      .attr('width', 30)
      .attr('x', '35')
      .attr('y', '-13');
    button.append('text')
      .attr('x', '41')
      .text('1m');
    button = this.buttonGroup
      .append('g')
      .attr('class', 'button')
      .on('click', (d, i, n) => onClick.bind(this)(91, i, n));
    button.append('rect')
      .attr('height', 18)
      .attr('width', 30)
      .attr('x', '70')
      .attr('y', '-13');
    button.append('text')
      .attr('x', '76')
      .text('3m');
    button = this.buttonGroup
      .append('g')
      .attr('class', 'button')
      .on('click', (d, i, n) => onClick.bind(this)(183, i, n));
    button.append('rect')
      .attr('height', 18)
      .attr('width', 30)
      .attr('x', '105')
      .attr('y', '-13');
    button.append('text')
      .attr('x', '111')
      .text('6m');
    button = this.buttonGroup
      .append('g')
      .attr('class', 'button')
      .on('click', (d, i, n) => onClick.bind(this)(365, i, n));
    button.append('rect')
      .attr('height', 18)
      .attr('width', 30)
      .attr('x', '140')
      .attr('y', '-13');
    button.append('text')
      .attr('x', '148')
      .text('1y');
    button = this.buttonGroup
      .append('g')
      .attr('class', 'button')
      .on('click', (d, i, n) => onClick.bind(this)(0, i, n));
    button.append('rect')
      .attr('height', 18)
      .attr('width', 30)
      .attr('x', '175')
      .attr('y', '-13');
    button.append('text')
      .attr('x', '183')
      .text('All');
    // Labels
    this.xLabel = this.g.append('text')
      .attr('class', 'x axisLabel')
      .attr('y', this.height + 35)
      .attr('x', this.width / 2)
      .attr('text-anchor', 'middle');
    this.yLabel = this.g.append('text')
      .attr('class', 'y axisLabel')
      .attr('y', -45)
      .attr('x', -this.height / 2)
      .attr('transform', 'rotate(-90)')
      .attr('text-anchor', 'middle');
    // This.g.append('button').attr('type', 'button').attr('value','1m').attr('y', -30).text('fucl');
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
    this.yAxisCall = d3.axisLeft(null);
    this.yAxis = this.g.append('g')
      .attr('class', 'y axis');

    // drag
    const vis = this;
    let dragStart;
    let range;
    const dragHandler = d3.drag()
      .on('start', function () {
        dragStart = vis.x.invert(d3.mouse(<HTMLElement>this)[0]);
        range = vis.x2(vis.xRange[1]) - vis.x2(vis.xRange[0]);
        d3.select(this).style('cursor', 'move');
      })
      .on('drag', function () {
        const diff = (vis.x.invert(d3.mouse(<HTMLElement>this)[0])).getTime() - dragStart;
        const head = vis.x2(vis.parseTime(vis.xValueRange[0]).setHours(0, 0, 0, 0));
        const tail = vis.x2(vis.parseTime(vis.xValueRange[1]).setHours(23, 59, 59, 999));
        const begin = vis.x2(vis.xRange[0] - diff);
        const end = begin + range;
        if (begin >= head && end <= tail) {
          vis.brushComponent.call(vis.brush.move, [begin, end]);
        }
      })
      .on('end', function () {
        d3.select(this).style('cursor', 'default');
      })

    // overlay
    this.overLay = this.svg.append('rect')
      .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')')
      .attr('class', 'overlay')
      .attr('width', this.width)
      .attr('height', this.height)
      .call(dragHandler);

    // Load data
    this.cnt = 0;
    this.promise.then(data => {
      // Prepare and clean data
      const items = [];
      for (const item in data) {
        this.cnt++;
        if (!data.hasOwnProperty(item)) {
          continue;
        }
        items.push(item);
        this.filteredData[item] = data[item].filter(d => {
          return 1;
        })
        this.filteredData[item].forEach(d => {
          for (const prop in d) {
            if (prop === 'date' || prop === 'Date' || prop === 'DATE') {
              d[prop] = this.parseTime(d[prop]);
            } else {
              d[prop] = +d[prop] + '' !== 'NaN' ? +d[prop] : d[prop];
            }
          }
        });
      }
      for (const prop in this.filteredData[items[0]][0]) {
        if (prop !== this.xValue && prop !== this.yValue) {
          this.yValues.push(prop);
        }
      }
      if (!this.yValue) {
        this.yValue = this.yValues[0];
      }
      // Legend
      this.legend = this.svg.selectAll('.legend')
        .data(items).enter()
        .append('g')
        .attr('transform', (d, i) => 'translate(' + (this.width + this.margin.left - 100 * (items.length - i)) + ',' + 5 + ')')
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

    // Time range buttons function
    function onClick(d, i, n) {
      this.buttonGroup.selectAll('rect')
        .classed('button-selected', false);
      d3.select(n[i])
        .select('rect')
        .classed('button-selected', true);
      if (d === 0) {
        let end = this.x2.range().map(this.x2.invert)[1].setHours(0, 0, 0, 0);
        let begin = this.x2.range().map(this.x2.invert)[0].setHours(0, 0, 0, 0);
        this.diff = end - begin;
        end = this.x2(end);
        begin = this.x2(begin);
        this.brushComponent.call(this.brush.move, [begin, end]);
      } else {
        let end = this.xRange[1];
        let begin = end - 86400000 * d;
        if (begin < this.x2.range().map(this.x2.invert)[0].setHours(0, 0, 0, 0)) {
          begin = this.x2.range().map(this.x2.invert)[0].setHours(0, 0, 0, 0);
          end = begin + 86400000 * d;
        }
        if (end > this.x2.range().map(this.x2.invert)[1].setHours(0, 0, 0, 0)) {
          end = this.x2.range().map(this.x2.invert)[1].setHours(0, 0, 0, 0);
        }
        this.diff = end - begin;
        end = this.x2(end);
        begin = this.x2(begin);
        this.brushComponent.call(this.brush.move, [begin, end]);
      }
    }
  }

  update() {
    const dataTimeFiltered = [];
    for (let item in this.filteredData) {
      dataTimeFiltered.push(this.filteredData[item].filter(d => {
        return ((d[this.xValue] >= this.xRange[0]) && (d[this.xValue] <= this.xRange[1]));
      }));
    }
    // Update scales
    let max = -Infinity;
    dataTimeFiltered.forEach(data => {
      max = Math.max(max, d3.max(data, d => parseInt(d[this.yValue])));
    })
    this.xDomain = d3.extent(dataTimeFiltered[0], d => new Date(d[this.xValue]));
    this.yDomain = [0, max * 1.005];
    this.x.domain(this.xDomain);
    this.y.domain(this.yDomain);
    // Fix for format values
    const formatSi = d3.format('.2s');
    function formatAbbreviation(x) {
      if (x === 0) {
        return 0;
      }
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
    // Update rangelabel
    this.dateBegin = this.formatTime(new Date(this.xRange[0]));
    this.dateEnd = this.formatTime(new Date(this.xRange[1]));
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
    const focuses = this.g.selectAll('.focus')
      .data(dataTimeFiltered);
    focuses.exit().remove();
    const tooltips = focuses.enter()
      .append('g')
      .attr('class', 'focus')
      .style('display', 'none')
      .attr('transform', 'translate(' + 0 + ', ' + this.height + ')')
    tooltips.append('circle')
      .attr('r', 5)
      .attr('stroke', (d, i) => this.color[i]);
    tooltips.append('text')
      .attr('x', 10)
      .attr('y', 5);

    this.overLay.on('mousemove', mousemove.bind(this));

    function mousemove() {
      const xValue = this.xValue;
      const x0 = this.x.invert(d3.mouse(d3.event.currentTarget)[0]);
      dateTip.attr('transform', () => {
        const d2 = selectDate(dataTimeFiltered[0], x0);
        return 'translate(' + this.x(d2[xValue]) + ',' + 0 + ')';
      })
        .style('display', 'unset')
        .select('text')
        .text(() => {
          const d2 = selectDate(dataTimeFiltered[0], x0);
          return this.formatTime(new Date(d2[xValue]));
        });
      tooltips.attr('transform', d => {
        const d2 = selectDate(d, x0);
        return 'translate(' + this.x(d2[xValue]) + ',' + this.y(d2[this.yValue]) + ')';
      })
        .style('display', 'unset')
        .select('text')
        .text((d) => {
          const d2 = selectDate(d, x0);
          return d3.format('$,')(d2[this.yValue].toFixed(2));
        })
      // Find the closest date against the mouse position
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
    this.x2Domain = d3.extent(dataTimeFiltered[0], d => new Date(d[this.xValue]));
    this.y2Domain = [0, max];
    this.x2.domain(this.x2Domain);
    this.y2.domain(this.y2Domain);
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
    this.brush = d3.brushX()
      .handleSize(5)
      .extent([[0, 0], [this.width2, this.height2]])
      .on('brush', brushed.bind(this));
    this.brushComponent = this.g2.append('g')
      .attr('class', 'brush')
      .call(this.brush.bind(this));
    this.brushComponent.selectAll('.overlay')
      .on('click', this.resetBrush.bind(this));

    function brushed() {
      const selection = d3.event.selection || this.x2.range();
      this.xRange = selection.map(this.x2.invert);
      this.xRange[0].setHours(0, 0, 0, 0);
      this.xRange[1].setHours(0, 0, 0, 0);
      // don't use this.diff !== this.xRange[1] -this.xRange[0], daylight saving time!!
      if (Math.abs(this.diff - (this.xRange[1] - this.xRange[0])) > 172800000) {
        this.diff = this.xRange[1] - this.xRange[0];
        this.buttonGroup.selectAll('rect')
          .classed('button-selected', false);
      }
      this.update();
    }
  }

  resetBrush() {
    this.xRange = [this.parseTime(this.xValueRange[0]).getTime(), this.parseTime(this.xValueRange[1]).getTime()];
    this.buttonGroup.selectAll('rect')
      .classed('button-selected', false);
    this.update();
  }

  onSelect(value: string) {
    this.yValue = value;
    this.update2();
    this.update();
  }

  fetchDateBegin(value) {
    const date = new Date(value);
    if (date.getTime() >= this.parseTime(this.xValueRange[0]).getTime()
      && date.getTime() <= this.parseTime2(this.dateEnd).getTime()
      && date.getTime() !== this.parseTime2(this.dateBegin).getTime()) {
      this.dateBegin = value;
      let begin = this.parseTime2(this.dateBegin).setHours(0, 0, 0, 0);
      let end = this.parseTime2(this.dateEnd).setHours(0, 0, 0, 0);
      begin = this.x2(begin);
      end = this.x2(end);
      this.brushComponent.call(this.brush.move, [begin, end]);
    } else {
      this.dateBegin = new String(this.dateBegin);
    }

  }

  fetchDateEnd(value) {
    const date = new Date(value);
    if (date.getTime() <= this.parseTime(this.xValueRange[1]).getTime()
      && date.getTime() >= this.parseTime2(this.dateBegin).getTime()
      && date.getTime() !== this.parseTime2(this.dateEnd).getTime()) {
      this.dateEnd = value;
      let begin = this.parseTime2(this.dateBegin).setHours(0, 0, 0, 0);
      let end = this.parseTime2(this.dateEnd).setHours(0, 0, 0, 0);
      begin = this.x2(begin);
      end = this.x2(end);
      this.brushComponent.call(this.brush.move, [begin, end]);
    } else {
      this.dateEnd = new String(this.dateEnd);
    }
  }


  redraw() {
    this.height = this.setHeight - this.margin.top - this.margin.bottom;
    this.width = this.setWidth - this.margin.left - this.margin.right;
    this.width2 = this.setWidth - this.margin2.left - this.margin2.right;
    this.x = d3.scaleTime().range([0, this.width]);
    this.y = d3.scaleLinear().range([this.height, 0]);
    this.x2 = d3.scaleTime().range([0, this.width2]);
    this.y2 = d3.scaleLinear().range([this.height2, 0]);
    d3.select(this.container.nativeElement)
      .select('#chart-area')
      .style('width', this.width + this.margin.left + this.margin.right + 'px');
    this.svg
      .attr('width', this.width + this.margin.left + this.margin.right)
      .attr('height', this.height + this.margin.top + this.margin.bottom);
    this.svg2
      .attr('width', this.width2 + this.margin2.left + this.margin2.right)
      .attr('height', this.height2 + this.margin2.top + this.margin2.bottom);
    this.g.attr('transform', 'translate(' + this.margin.left + ', ' + this.margin.top + ')');
    this.g2.attr('transform', 'translate(' + this.margin2.left + ',' + this.margin2.top + ')');
    // Labels
    this.xLabel
      .attr('y', this.height + 35)
      .attr('x', this.width / 2);
    this.yLabel.attr('x', -this.height / 2);
    // X-axis
    this.xAxisCall = d3.axisBottom(null).ticks(this.width / 125);
    this.xAxis.attr('transform', 'translate(0,' + this.height + ')');
    this.xAxis2.attr('transform', 'translate(0,' + this.height2 + ')');
    // overlay
    this.overLay
      .attr('width', this.width)
      .attr('height', this.height);
    // legend
    this.legend.attr('transform', (d, i) => 'translate(' + (this.width + this.margin.left - 100 * (this.cnt - i)) + ',' + 5 + ')');
    // update axis
    this.x.domain(this.xDomain);
    this.y.domain(this.yDomain);
    this.xAxisCall.scale(this.x);
    this.xAxis.call(this.xAxisCall);
    this.yAxisCall.scale(this.y);
    this.yAxis.call(this.yAxisCall);
    this.x2.domain(this.x2Domain);
    this.y2.domain(this.y2Domain);
    this.xAxisCall2.scale(this.x2);
    this.xAxis2.call(this.xAxisCall2);
    // tooltips
    this.g.select('.dateTip')
      .select('line')
      .attr('y2', this.height);
    this.g.select('.dateTip').style('display', 'none');
    this.g.selectAll('.focus').style('display', 'none');
    // Brush
    const begin = this.x2(this.xRange[0]);
    const end = this.x2(this.xRange[1]);
    this.svg2.selectAll('.brush').remove();
    this.brush.extent([[0, 0], [this.width2, this.height2]]);
    this.brushComponent = this.g2.append('g')
      .attr('class', 'brush')
      .call(this.brush.bind(this));
    this.brushComponent.selectAll('.overlay')
      .on('click', this.resetBrush.bind(this));
    if (this.xRange[0] - this.x2Domain[0] || this.xRange[1] - this.x2Domain[1]) {
      this.brushComponent.call(this.brush.move, [begin, end]);
    }
    // update data
    const line = d3.line()
      .x(d => this.x(d[this.xValue]))
      .y(d => this.y(d[this.yValue]));
    this.g.selectAll('.line').attr('d', line);
    const area = d3.area()
      .x(d => this.x2(d[this.xValue]))
      .y0(this.height2)
      .y1(d => this.y2(d[this.yValue]));
    this.g2.selectAll('.area').attr('d', area);
  }

  onResize() {
    if (!this.defaultWidth) {
      if (this.setWidth !== (<HTMLElement>this.container.nativeElement.getElementsByClassName('chart')[0]).offsetWidth) {
        this.setWidth = (<HTMLElement>this.container.nativeElement.getElementsByClassName('chart')[0]).offsetWidth;
        if (!this.defaultHeight) {
          this.setHeight = this.setWidth / 3;
        }
        this.redraw();
      }
    }
  }

  ngOnDestroy() {
    this.svg.remove();
    this.svg2.remove();
  }
}
