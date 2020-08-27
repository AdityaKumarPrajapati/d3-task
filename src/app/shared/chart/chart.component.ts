import { Component, OnInit, Input } from '@angular/core';
import { Line } from './../../models/line.model';
import { LineChartSettings } from './../../models/settings.model';
declare const d3: any;
declare const deepmerge: any;
declare let LineGraph: any;

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
  @Input() chartOptions: LineChartSettings;

  constructor() { }

  ngOnInit(): void {
    let linegraph = new LineGraph('line-graph');
    // linegraph.setOptions(this.chartOptions);
    linegraph.render(this.chartData);
    // console.log(deepmerge);
    // console.log('sfsefsef',this.chartData);
  }

}
