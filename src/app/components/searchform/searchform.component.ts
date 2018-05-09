import { Component, OnInit, ViewChild } from '@angular/core';
import { QueryService } from '../../services/query.service';
import { FormsModule } from '@angular/forms';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { NgxChartsModule } from '@swimlane/ngx-charts';

@Component({
  selector: 'app-searchform',
  templateUrl: './searchform.component.html',
  styleUrls: ['./searchform.component.css']
})
export class SearchformComponent implements OnInit {

  @ViewChild('searchForm') form: any;

// options

view = [1100, 500];
autoScale = true;
showXAxis = true;
showYAxis = true;
gradient = false;
showLegend = false;
showXAxisLabel = true;
xAxisLabel = 'Episode';
showYAxisLabel = true;
yAxisLabel = 'IMDB Rating';


single: any[];
// options end



  private result: string;
  private resultType: string;
  private series: any[];
  private loaded: boolean = false;
  private loading: boolean = false;
  private formInput = {
    searchInput: ''
  };

  constructor(private queryService: QueryService) { }

  ngOnInit() {
    this.queryService.getResult('skyline').subscribe( result => {
      this.result = result;
    });
  }
  plot() {
    const data = this.series.map( season => {
      return {
        name: `Season ${season.season}`,
        series: season.episodes.map( episode => {
          console.log(parseInt(episode.imdbRating, 10) !== NaN);
          return {
            name: episode.Title,
            value: episode.imdbRating !== 'N/A' ? episode.imdbRating : 10
          };
        })
      };
    });
    this.single = data;
    console.log(this.single);
  }

  onSubmit({value, valid}: {value: {search: string}, valid: string}) {
    this.loading = true;

    this.queryService.getResult(value.search).subscribe( result => {
      // console.log(result);
      this.resultType = result.Type;
      if (result.Type === 'movie') {
        this.loading = false;
        this.loaded = true;
        this.result = result;

      } else if (result.Type === 'series') {
        // get an array of season numbers
        const seasons: number[] = new Array(parseInt(result.totalSeasons, 10)).fill('').map((v, i) => i + 1);

        forkJoin(
          seasons.map( season => {
            return this.queryService.getSeason(result.imdbID, season).pipe(map( (currentSeason, i) => {
              return { episodes: currentSeason.Episodes, season: currentSeason.Season };
              }));
          })
          ).subscribe( series => {
            this.loading = false;
            this.loaded = true;
            this.series = series;
            // console.log(this.series);
            this.plot();
          }
        );
      }
    });
  }

}
