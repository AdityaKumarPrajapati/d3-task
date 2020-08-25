import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PlotChartRoutingModule } from './plot-chart-routing.module';
import { SharedModule } from './../shared/shared.module';
import { PlotComponent } from './plot/plot.component';


@NgModule({
  declarations: [PlotComponent],
  imports: [
    CommonModule,
    PlotChartRoutingModule,
    SharedModule
  ]
})
export class PlotChartModule { }
