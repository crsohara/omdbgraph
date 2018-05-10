import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, forkJoin, BehaviorSubject, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

const httpHeaders = {
  headers: new HttpHeaders({
    'content-type': 'application/jsonp'
  })
};
const baseUrl = 'http://www.omdbapi.com/?callback=JSONP_CALLBACK&apikey=' + environment.OMDB_API_KEY;

@Injectable({
  providedIn: 'root'
})
export class QueryService {

  private currentSeries = new BehaviorSubject([]);
  p_currentSeries = this.currentSeries.asObservable();

  private progress = {current: 0, total: null};

  private queryProgress = new BehaviorSubject(this.progress);
  p_queryProgress = this.queryProgress.asObservable();

  constructor(private http: HttpClient, ) { }

  getResult(title: string): Observable<any> {
    this.progress = {current: 0, total: null};
    this.queryProgress.next({current: 0, total: null});
    this.currentSeries.next([]);
    return this.http.jsonp(`${baseUrl}&t=${title}`, '').pipe(map(response => {
      return response;
    }));
  }

  getSeason(imdbID: string, season: number): Observable<any> {
    const params = `&i=${imdbID}&Season=${season}`;
    return this.http.jsonp(`${baseUrl}${params}`, '').pipe(map(response => {
      return response;
    }));
  }

  getSeasons(seasons: any[], imdbID: string): Observable<any> {
    this.progress.total = seasons.length;

    return forkJoin(
      seasons.map( season => {
        return this.getSeason(imdbID, season).pipe(map((currentSeason, i) => {
          console.log('got a season');
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
              name: episode.Title,
              value: episode.imdbRating !== 'N/A' ? episode.imdbRating : 10
            };
          })
        };
      });
    }));
  }

  setSeries(series: any) {
    this.currentSeries.next(series);
  }
}
