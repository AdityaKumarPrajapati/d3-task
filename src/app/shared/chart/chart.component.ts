import { Component, OnInit, Input } from '@angular/core';
import { Line } from './../../models/line.model';
import { LineChartSettings } from './../../models/settings.model';
import * as d3 from 'd3-selection';
import * as d3Scale from 'd3-scale';
import * as d3ScaleChromatic from 'd3-scale-chromatic';
import * as d3Shape from 'd3-shape';
import * as d3Array from 'd3-array';
import * as d3Axis from 'd3-axis';
declare const d3: any;

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss']
})
export class ChartComponent implements OnInit {

  width = 500;
  height = 300;
  margin = 50;
  duration = 250;

  lineOpacity = "0.25";
  lineOpacityHover = "0.85";
  otherLinesOpacityHover = "0.1";
  lineStroke = "1.5px";
  lineStrokeHover = "2.5px";

  circleOpacity = '0.85';
  circleOpacityOnLineHover = "0.25"
  circleRadius = 3;
  circleRadiusHover = 6;
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

  /**
   * chartData is a input property for this component. Input properties make our components
   * loosely coupled and more generic
   */
  @Input() chartData: Line;
  @Input() chartOptions: LineChartSettings;

  constructor() { }

  ngOnInit(): void {
    console.log('here');
    this.init(this.chartData);
  }

  private init(data: any): void {
    this.parseDate = d3.timeParse("%Y");

    data.forEach((d: any) =>  { 
      d.values.forEach((d: any) =>  {
          d.date = this.parseDate(d.date);
          d.value = +d.value;    
      });
    });

    this.xScale = d3Scale.scaleTime()
                    .domain(d3.extent(data[0].values, (d: any) => d.date))
                    .range([0, this.width-this.margin]);
    
    this.yScale = d3Scale.scaleLinear()
                    .domain([-d3.max(data[0].values, (d: any) => d.value), d3.max(data[0].values, (d: any) => d.value)])
                    .range([this.height-this.margin, 0]);

    this.svg = d3.select('#line-graph')
                  .append('svg').style("overflow", "auto")
                  .attr("width", (this.width+this.margin)+"px")
                  .attr("height", (this.height+this.margin)+"px")
                  .append('g')
                  .attr("transform", `translate(${this.margin}, ${this.margin})`);

    this.line = d3Shape.line()
                      .x((d: any) => this.xScale(d.date))
                      .y((d: any) => this.yScale(d.value));

    this.areaGenerator = d3Shape.area()
                    .x((d: any) => this.xScale(d.date))
                    .y0(this.height)
                    .y1((d: any) => this.yScale(d.value));
    
    this.lines = this.svg.append('g').attr('class', 'lines');

    this.lines.selectAll('.line-group')
            .data(data).enter()
            .append('g')
            .attr('class', 'line-group')  
            .attr('fill', 'none')
            .attr('stroke-width', 2)
            .on("mouseover", function(d: any, i: any) {
                this.svg.append("text")
                    .attr("class", "title-text")
                    .style("fill", (d: any) => d.color )        
                    .text(d.name)
                    .attr("text-anchor", "middle")
                    .attr("x", (this.width-this.margin)/2)
                    .attr("y", 5);
                })
            .on("mouseout", (d: any) =>  {
                this.svg.select(".title-text").remove();
                })
            .append('path')
            .attr('class', 'line')  
            .attr('d', (d: any) => this.line(d.values))
            .style('stroke', (d: any) => d.color)
            .style('opacity', this.lineOpacity)
            .on("mouseover", (d: any) =>  {
                d3.selectAll('.line')
                    .style('opacity', this.otherLinesOpacityHover);
                d3.selectAll('.circle')
                    .style('opacity', this.circleOpacityOnLineHover);
                d3.select(this)
                    .style('opacity', this.lineOpacityHover)
                    .style("stroke-width", this.lineStrokeHover)
                    .style("cursor", "pointer");
                })
            .on("mouseout", (d: any) => {
                d3.selectAll(".line")
                    .style('opacity', this.lineOpacity);
                d3.selectAll('.circle')
                    .style('opacity', this.circleOpacity);
                d3.select(this)
                    .style("stroke-width", this.lineStroke)
                    .style("cursor", "none");
                });

    

    // this.lines.

    /* Add circles in the line */
    this.lines.selectAll("circle-group")
        .data(data).enter()
        .append("g")
        .style("fill", (d: any) => d.color)
        .selectAll("circle")
        .data((d: any) => d.values).enter()
        .append("g")
        .attr("class", "circle")  
        .on("mouseover", (d: any) => {
            d3.select(this)     
            .style("cursor", "pointer")
            .append("text")
            .attr("class", "text")
            .text(`${d.value}`)
            .attr("x", (d: any) => this.xScale(d.date) + 5)
            .attr("y", (d: any) => this.yScale(d.value) - 10);
        })
        .on("mouseout", (d: any) => {
            d3.select(this)
            .style("cursor", "none")  
            .transition()
            .duration(this.duration)
            .selectAll(".text").remove();
        })
        .append("circle")
        .attr("cx", (d: any) => this.xScale(d.date))
        .attr("cy", (d: any) => this.yScale(d.value))
        .attr("r", this.circleRadius)
        .style('opacity', this.circleOpacity)
        .on("mouseover", (d: any) => {
            d3.select(this)
                .transition()
                .duration(this.duration)
                .attr("r", this.circleRadiusHover);
            })
        .on("mouseout", (d: any) => {
            d3.select(this) 
                .transition()
                .duration(this.duration)
                .attr("r", this.circleRadius);
            });

    this.xAxis = d3Axis.axisBottom(this.xScale).ticks(6).tickPadding(8).tickSize(0);
    this.yAxis = d3Axis.axisLeft(this.yScale).ticks(6).tickPadding(8).tickSize(0);

    this.svg.append("g")
          .attr("class", "xAxis axis")
          .attr("transform", `translate(0, ${this.height-this.margin})`)
          .call(this.xAxis);

    this.svg.append("g")
        .attr("class", "yAxis axis")
        .call(this.yAxis)
        .append('text')
        .attr("y", 15)
        .attr("transform", "rotate(-90)")
        .attr("fill", "#000");

    
  }

}
