import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { MapContainerComponent } from './map-container/map-container.component';
import { LineChartComponent } from './line-chart/line-chart.component';
import { ScatterPlotComponent } from './scatter-plot/scatter-plot.component';
import { DateInputComponent } from './date-input/date-input.component';
import { TestDirective } from './date-input/test.directive';

@NgModule({
  declarations: [
    AppComponent,
    DateInputComponent,
    TestDirective,
    MapContainerComponent,
    LineChartComponent,
    ScatterPlotComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
