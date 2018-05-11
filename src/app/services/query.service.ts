import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, forkJoin, BehaviorSubject, of } from 'rxjs';
import { map, timeout, retryWhen, delay, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

const httpHeaders = {
  headers: new HttpHeaders({
    'content-type': 'application/jsonp'
  })
};
const baseUrl = '//www.omdbapi.com/?callback=JSONP_CALLBACK&apikey=' + environment.OMDB_API_KEY;

@Injectable({
  providedIn: 'root'
})
export class QueryService {

  private currentSeries = new BehaviorSubject([]);
  p_currentSeries = this.currentSeries.asObservable();

  private progress = {current: 0, total: 0};

  private queryProgress = new BehaviorSubject(this.progress);
  p_queryProgress = this.queryProgress.asObservable();

  private hideGraphBool = new BehaviorSubject(false);
  p_hideGraph = this.hideGraphBool.asObservable();

  constructor(private http: HttpClient, ) { }

  getSeason(imdbID: string, season: number): Observable<any> {
    const params = `&i=${imdbID}&Season=${season}`;
    return this.http.jsonp(`${baseUrl}${params}`, '')
      .pipe(
        timeout(3000),
        retryWhen( error => {
          console.log('Season request is taking too long, retrying1...');
          return error.pipe(delay(200));
        }),
        map(response => {
          return response;
        }
      )
    );
  }

  getResult(title: string): Observable<any> {
    this.queryProgress.next({ current: 1, total: 100 });

    return this.http.jsonp(`${baseUrl}&t=${title}`, '')
      .pipe(
        timeout(1000),
        retryWhen( error => {
          console.log('Item Title request is taking too long, retrying2...');
          return error.pipe(delay(200));
        }),
        map(response => {
          return response;
        }
      )
    );
  }

  getSeasons(seasons: any[], imdbID: string): Observable<any> {
    this.progress.total = seasons.length;

    return forkJoin(
      seasons.map( season => {
        return this.getSeason(imdbID, season).pipe(map((currentSeason, i) => {
          this.progress.current = this.progress.current + 1;
          this.queryProgress.next(this.progress);
          return {
            episodes: currentSeason.Episodes,
            season: currentSeason.Season
          };
        }));
      })
    );
  }

  getSeasonsFormattedForGraph(seasons: any[], imdbID: string): Observable<any> {
    return this.getSeasons(seasons, imdbID).pipe(map( series => {
      return series.map( season => {
        return {
          name: `Season ${season.season}`,
          series: season.episodes.map( episode => {
            return {
              name: `${season.season}.${episode.Episode}`,
              value: episode.imdbRating !== 'N/A' ? episode.imdbRating : 10,
              extra: {episodeTitle: episode.Title }
            };
          })
        };
      });
    }));
  }

  completeLoadingBar() {
    this.progress = { current: 0, total: 0 };
    this.queryProgress.next(this.progress);

  }

  hideGraph(hideGraph: boolean) {
    this.hideGraphBool.next(hideGraph);
  }

  setSeries(series: any) {
    this.currentSeries.next(series);
  }
}
