import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from 'src/environments/environment.development';
import { Sprint } from '../Interfaces/Sprint';
import { SprintDto } from '../Interfaces/SprintDto';
@Injectable({
  providedIn: 'root',
})
export class SprintService {
  private baseURL = environment.BASE_URL_Project_MANGMENT;
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };
  constructor(private httpClient: HttpClient) {}
  getAll(): Observable<any> {
    return this.httpClient
      .get(`${this.baseURL}Sprint/GetAllSprints`)

      .pipe(catchError(this.errorHandler));
  }
  getSprintsByProjectId(id: string): Observable<any> {
    return this.httpClient
      .get(
        `${this.baseURL}Sprint/GetSprintsByProjectId/` + id,
        this.httpOptions
      )

      .pipe(catchError(this.errorHandler));
  }
  create(sprint: SprintDto): Observable<any> {
    return this.httpClient
      .post(`${this.baseURL}Sprint/PostSprint`, sprint, this.httpOptions)

      .pipe(catchError(this.errorHandler));
  }

  find(id: string): Observable<any> {
    return this.httpClient
      .get(`${this.baseURL}Sprint/` + id, this.httpOptions)

      .pipe(catchError(this.errorHandler));
  }

  update(sprint: SprintDto): Observable<any> {
    return this.httpClient
      .put(`${this.baseURL}Sprint/PutSprint`, sprint, this.httpOptions)

      .pipe(catchError(this.errorHandler));
  }

  delete(id: string) {
    return this.httpClient
      .delete(`${this.baseURL}Sprint/DeleteSprint/` + id, {
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
