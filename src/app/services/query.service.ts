import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
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

  constructor(private http: HttpClient, ) { }

  getResult(title: string): Observable<any> {
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
}
