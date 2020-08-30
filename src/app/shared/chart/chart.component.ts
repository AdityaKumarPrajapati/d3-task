import { Component, OnInit, Input } from '@angular/core';
import { Line } from './../../models/line.model';
import { LineChartSettings } from './../../models/settings.model';
import * as d3 from 'd3-selection';
import * as d3Scale from 'd3-scale';
import * as d3Shape from 'd3-shape';
import * as d3Axis from 'd3-axis';
declare const d3: any;

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss']
})
export class ChartComponent implements OnInit {

  width: any;
  height: any;
  svg: any;
  g : any;
  xScale : any;
  yScale : any;
  parseDate: any;
  lines: any;
  line: any;
  xAxis: any;
  yAxis: any;
  areaGenerator: any;
  minMaxData: any;

  /**
   * chartData is a input property for this component. Input properties make our components
   * loosely coupled and more generic
   */
  @Input() chartData: Line;
  @Input() chartOptions: LineChartSettings;

  constructor() { }

  ngOnInit(): void {
    this.getVal(this.chartData);
    this.init(this.chartData);
  }

  /* Data Modification */
  private getVal(data: any): any {
    const i = data[0].values.length;
    for(let j = 0; j < i; j++) {
      const max = d3.max(
        data.map((item: any) => item.values[j].value)
      )
      const min = d3.min(
        data.map((item: any) => item.values[j].value)
      )
      const date = d3.min(
        data.map((item: any) => item.values[j].date)
      )
      data[0].values[j].min = min;
      data[0].values[j].max = max;
    }
    return data;
  }


  /* Graph Plotting */
  private init(data: any): void {
    const { margin, duration, lineOpacity, lineOpacityHover, otherLinesOpacityHover, lineStroke, lineStrokeHover, circleOpacity, circleOpacityOnLineHover, circleRadius, circleRadiusHover } = this.chartOptions[0];
    this.parseDate = d3.timeParse("%Y");

    this.width = 600 - margin.left - margin.right,
    this.height = 270 - margin.top - margin.bottom;

    data.forEach((d: any) =>  { 
      d.values.forEach((d: any) =>  {
          d.date = this.parseDate(d.date);
          d.value = +d.value;    
      });
    });

    /* Scaling */ 
    this.xScale = d3Scale.scaleTime()
                          .range([0, this.width]);
    
    this.yScale = d3Scale.scaleLinear()
                          .range([this.height, 0]);

    this.xScale.domain(d3.extent(data[0].values, (d: any) => d.date));
    this.yScale.domain([-d3.max(data[0].values, (d: any) => d.value), d3.max(data[0].values, (d: any) => d.value)]);
    
    
    /* Axis */
    this.xAxis = d3Axis.axisBottom(this.xScale).ticks(5).tickPadding(8).tickSize(0);;
    this.yAxis = d3Axis.axisLeft(this.yScale).ticks(5).tickPadding(8).tickSize(0);;

    /* Line Generator */
    this.line = d3Shape.line()
                      .x((d: any) => this.xScale(d.date))
                      .y((d: any) => this.yScale(d.value));

    /* Area Generator */
    this.areaGenerator = d3Shape.area()
                    .x((d: any) => this.xScale(d.date))
                    .y0((d: any) => this.yScale(d.min))
                    .y1((d: any) => this.yScale(d.max));

    this.svg = d3.select('#line-graph')
                  .append('svg')
                  .attr("width", this.width + margin.left + margin.right)
                  .attr("height", this.height + margin.top + margin.bottom)
                  .append("g")
                  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
    
    /* Add the Area */
    this.svg.append('path')
            .datum(data[0].values)
            .attr('class', 'area')
            .attr('fill', 'lightgrey')
            .attr('stroke-width', 0)
            .attr('d', this.areaGenerator);


    /* Add the Value Line */            
    this.svg.selectAll('.line-group')
            .data(data).enter()
            .append('g')
            .attr('class', 'line-group')  
            .attr('fill', 'none')
            .attr('stroke-width', 2)
            .append('path')
            .attr('class', 'line')  
            .attr('d', (d: any) => this.line(d.values))
            .style('stroke', (d: any) => d.color)
            .style('opacity', lineOpacity);

    this.svg.append('g')
            .attr('class', 'x axis')
            .attr("transform", "translate(0," + this.height + ")")
            .call(this.xAxis);

    this.svg.append("g")         
          .attr("class", "y axis")
          .call(this.yAxis);

    // /* Add circles in the line */
    this.svg.selectAll("circle-group")
        .data(data).enter()
        .append("g")
        .style("fill", (d: any) => d.color)
        .selectAll("circle")
        .data((d: any) => d.values).enter()
        .append("g")
        .attr("class", "circle")  
        .append("circle")
        .attr("cx", (d: any) => this.xScale(d.date))
        .attr("cy", (d: any) => this.yScale(d.value))
        .attr("r", circleRadius)
        .style('opacity', circleOpacity);
  }
}
