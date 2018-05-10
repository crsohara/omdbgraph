import { Component, OnInit, ViewChild } from '@angular/core';
import { QueryService } from '../../services/query.service';
import { FormsModule } from '@angular/forms';
import { Observable, forkJoin, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { trigger, state, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'app-searchform',
  templateUrl: './searchform.component.html',
  styleUrls: ['./searchform.component.css'],
  animations: [
    trigger('loadingState', [
      state('true', style({
        transform: 'rotate(360deg)'
      })),
      state('false', style({
        transform: 'rotate(0deg)'
      })),
      transition('* => true', animate('1000ms')),
      transition('true => false', [])
    ])
  ]
})

export class SearchformComponent implements OnInit {

  @ViewChild('searchForm') form: any;

  // private result: {Response: string, Error, string};
  private result: { Response: string, Error?: string, [key: string]: string };
  private loaded: boolean = false;
  private loadingAnimation: boolean = false;
  private loading: boolean;
  private formInput = {
    searchInput: ''
  };

  constructor(private queryService: QueryService) { }

  ngOnInit() {
  }

  onAnimationDone(event): void {
    // keep the spinner spinning until loading is done
    if (this.loading) {
      if (event.toState === true  || event.toState === null) {
        this.loadingAnimation = false;
      } else if (event.toState === false) {
        this.loadingAnimation = true;
      }
    }
  }

  onSubmit({value, valid}: {value: {search: string}, valid: string}) {
    this.loading = true;

    this.queryService.getResult(value.search).subscribe( result => {
      this.result = result;
      if ( this.result.Response.toLowerCase() === 'true') {

        if (result.Type === 'movie') {
          this.loading = false;
          this.loaded = true;
        } else if (result.Type === 'series') {
          // get an array of season numbers
          const seasons: number[] = new Array(parseInt(result.totalSeasons, 10)).fill('').map((v, i) => i + 1);

          this.queryService.getSeasonsFormattedForGraph(seasons, result.imdbID).subscribe( series => {
            this.loading = false;
            this.loaded = true;
            this.queryService.setSeries(series);
          });
        }
      } else {
        this.loading = false;
        this.loaded = true;
        this.result = result;
      }
    });
  }

}
