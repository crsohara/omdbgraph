import { Component, OnInit } from '@angular/core';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { Observable } from 'rxjs';
import { QueryService } from '../../services/query.service';


@Component({
  selector: 'app-graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.css']
})
export class GraphComponent implements OnInit {

  // view = [1100, 500];
  private autoScale = true;
  private showXAxis = true;
  private showYAxis = true;
  private gradient = false;
  private showLegend = false;
  private showXAxisLabel = true;
  private xAxisLabel = 'Episode';
  private showYAxisLabel = true;
  private yAxisLabel = 'IMDB Rating';

  public single: any[]; // private
  public progress: any; // private

  constructor(private queryService: QueryService) { }

  ngOnInit() {
    this.queryService.p_currentSeries.subscribe( series => {
      this.single = series;
    });
    this.queryService.p_queryProgress.subscribe( progress => {
      this.progress = progress;
    });
  }

}
