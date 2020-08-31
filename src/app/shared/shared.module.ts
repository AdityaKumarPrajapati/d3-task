import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartComponent } from './chart/chart.component';
import { LineComponent } from './line/line.component';



@NgModule({
  declarations: [ChartComponent, LineComponent],
  imports: [
    CommonModule
  ],
  exports: [
    ChartComponent
  ]
})
export class SharedModule { }
