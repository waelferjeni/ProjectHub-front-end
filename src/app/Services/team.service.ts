import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Team } from '../Interfaces/Team';
import { environment } from 'src/environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class TeamService {
  private baseUrl = environment.BASE_URL_Team_MANGMENT;
  //private apiURL = "https://localhost:7000/api/Team";
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };
  constructor(private httpClient: HttpClient) {}
  getAll(): Observable<any> {
    return this.httpClient
      .get(`${this.baseUrl}Team/GetAllTeams`)

      .pipe(catchError(this.errorHandler));
  }
  create(team: Team): Observable<any> {
    return this.httpClient
      .post(`${this.baseUrl}Team/PostTeam`, team, this.httpOptions)

      .pipe(catchError(this.errorHandler));
  }
  update(team: Team): Observable<any> {
    return this.httpClient
      .put(`${this.baseUrl}Team/PutTeam`, team, this.httpOptions)

      .pipe(catchError(this.errorHandler));
  }
  delete(id: string) {
    return this.httpClient
      .delete(`${this.baseUrl}Team/DeleteTeam/` + id, {
        responseType: 'text',
      })
      .pipe(catchError(this.errorHandler));
  }
  errorHandler(error: any) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }

    return throwError(() => {
      errorMessage;
    });
  }
}
