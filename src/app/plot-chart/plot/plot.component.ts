import { Component, OnInit } from '@angular/core';
import * as data from './../data/chart-data.json';
import { Line } from '../../models/line.model';

@Component({
  selector: 'app-plot',
  templateUrl: './plot.component.html',
  styleUrls: ['./plot.component.scss']
})
export class PlotComponent implements OnInit {

   /**
    * Declare data property glabally so that we can access anywhere in component and type hint
    * with Line model
    */
  data: Line;
  constructor() { }

  /**
   * ngOnit angular life cycle method called after initializing the component
   */
  ngOnInit(): void {
    this.data = data.default;
  }

}
