import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Team } from '../Interfaces/Team';
import { TeamUser } from '../Interfaces/TeamUser';
import { environment } from 'src/environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class TeamUserService {
  private baseUrl = environment.BASE_URL_Team_MANGMENT;
  //private apiURL = "https://localhost:7000/api/TeamUser";
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };
  constructor(private httpClient: HttpClient) {}
  getAll(): Observable<any> {
    return this.httpClient
      .get(`${this.baseUrl}TeamUser/GetAllTeamsUsers`)

      .pipe(catchError(this.errorHandler));
  }
  getTeamUsersByUserId(id: string): Observable<any> {
    return this.httpClient
      .get(`${this.baseUrl}TeamUser/GetTeamUsersByUserId?userId=` + id)

      .pipe(catchError(this.errorHandler));
  }
  create(teamUser: TeamUser): Observable<any> {
    return this.httpClient
      .post(`${this.baseUrl}TeamUser/PostTeamUser`, teamUser, this.httpOptions)

      .pipe(catchError(this.errorHandler));
  }
  getProjectLeader(id: string): Observable<any> {
    return this.httpClient
      .get(`${this.baseUrl}TeamUser/GetProjectLeader?Teamid=` + id)

      .pipe(catchError(this.errorHandler));
  }
  GetEmployees(id: string): Observable<any> {
    return this.httpClient
      .get(`${this.baseUrl}TeamUser/GetEmployees?Teamid=` + id)

      .pipe(catchError(this.errorHandler));
  }
  GetEmployeeById(id: string): Observable<any> {
    return this.httpClient
      .get(`${this.baseUrl}TeamUser/GetEmployeeByUserId?Teamid=` + id)

      .pipe(catchError(this.errorHandler));
  }
  update(teamuser: TeamUser): Observable<any> {
    return this.httpClient
      .put(`${this.baseUrl}TeamUser/PutTeamUser`, teamuser, this.httpOptions)

      .pipe(catchError(this.errorHandler));
  }
  delete(teamUser: TeamUser) {
    const options = {
      headers: new HttpHeaders({
        contentType: 'application/json',
        responseType: 'text',
      }),
      body: teamUser,
    };
    return this.httpClient
      .delete(`${this.baseUrl}TeamUser/DeleteTeamUser`, options)
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
