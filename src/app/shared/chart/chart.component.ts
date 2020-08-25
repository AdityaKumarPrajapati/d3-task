import { Component, OnInit, Input } from '@angular/core';
import { Line } from './../../models/line.model';
declare const d3: any;

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss']
})
export class ChartComponent implements OnInit {

  /**
   * chartData is a input property for this component. Input properties make our components
   * loosely coupled and more generic
   */
  @Input() chartData: Line;

  constructor() { }

  ngOnInit(): void {
    console.log(d3);
    console.log(this.chartData);
  }

}
