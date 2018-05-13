import { Component, OnInit, ViewChild } from '@angular/core';
import { QueryService } from '../../services/query.service';
import { FormsModule } from '@angular/forms';
import { Observable, forkJoin, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { trigger, state, style, animate, transition } from '@angular/animations';

import { ActivatedRoute, LoadChildren } from '@angular/router';
import { Location } from '@angular/common';

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
  @ViewChild('apikeyForm') apiKeyform: any;

  private result: { Response: string, Error?: string, [key: string]: string };
  private loadingAnimation: boolean = false;

  public loaded: boolean = false;
  public progress: { current: number, total: number } = { current: 0, total: 100 };
  public loading: boolean;
  public formInput: { searchInputText: string } = { searchInputText: '' };

  private apikey;

  constructor(
    private queryService: QueryService,
    private route: ActivatedRoute,
    private location: Location
  ) { }

  ngOnInit() {
    const apikey = localStorage.getItem('omdbapikey');

    if (apikey === null) {
      console.log('No API key found in localstorage, please visit https://www.omdbapi.com/');
      // prompt key input
    } else {
      console.log('Loading API key from localstorage');
      this.queryService.setApiKey(apikey);
    }

    this.queryService.p_queryProgress.subscribe( progress => this.progress = progress );

    if (this.route.snapshot.paramMap.get('title') !== null) {
      this.doMainQuery(this.route.snapshot.paramMap.get('title'));
    }
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

  doMainQuery(title) {
    this.queryService.getResult(title).subscribe( result => {
      this.result = result;

      if ( this.result.Response.toLowerCase() === 'true') {

        if (result.Type === 'movie') {
          this.loading = false;
          this.loaded = true;
          this.queryService.completeLoadingBar();
          this.queryService.hideGraph(true);

        } else if (result.Type === 'series') {
          // get an array of season numbers
          const seasons: number[] = new Array(parseInt(result.totalSeasons, 10)).fill('').map((v, i) => i + 1);

          this.queryService.getSeasonsFormattedForGraph(seasons, result.imdbID).subscribe( series => {
            this.loading = false;
            this.loaded = true;
            this.queryService.setSeries(series);
            this.queryService.completeLoadingBar();
            this.queryService.hideGraph(false);
          });
        }
      } else {
        this.loading = false;
        this.loaded = true;
        this.result = result;
        this.queryService.completeLoadingBar();
      }
    });
  }

  onSubmit({value, valid}: {value: {search: string}, valid: string}) {
    if (this.queryService.isApiKeySet()) {
      this.loading = true;
      this.doMainQuery(value.search);
    }
  }
  addApiKey({value, valid}: {value: {apikey: string}, valid: string}) {
    this.queryService.setApiKey(value.apikey, true);
  }

}
