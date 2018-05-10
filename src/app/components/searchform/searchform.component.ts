import { Component, OnInit, ViewChild } from '@angular/core';
import { QueryService } from '../../services/query.service';
import { FormsModule } from '@angular/forms';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-searchform',
  templateUrl: './searchform.component.html',
  styleUrls: ['./searchform.component.css']
})
export class SearchformComponent implements OnInit {

  @ViewChild('searchForm') form: any;

  private result: string;
  private resultType: string;
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

  onSubmit({value, valid}: {value: {search: string}, valid: string}) {
    this.loading = true;

    this.queryService.getResult(value.search).subscribe( result => {
      this.resultType = result.Type;
      this.result = result;

      if (result.Type === 'movie') {
        this.loading = false;
        this.loaded = true;
        // this.result = result;

      } else if (result.Type === 'series') {
        // get an array of season numbers
        const seasons: number[] = new Array(parseInt(result.totalSeasons, 10)).fill('').map((v, i) => i + 1);

        this.queryService.getSeasonsFormattedForGraph(seasons, result.imdbID).subscribe( series => {
          this.loading = false;
          this.loaded = true;
          this.queryService.setSeries(series);
        });

      }
    });
  }

}
