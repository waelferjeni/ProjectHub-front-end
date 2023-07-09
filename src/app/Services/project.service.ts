import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from 'src/environments/environment.development';
import { Project } from '../Interfaces/Project';

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  private baseURL = environment.BASE_URL_Project_MANGMENT;

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };

  constructor(private httpClient: HttpClient) {}

  getAll(): Observable<any> {
    return this.httpClient
      .get(`${this.baseURL}Project/GetAllProjects`)

      .pipe(catchError(this.errorHandler));
  }

  create(project: Project): Observable<any> {
    return this.httpClient
      .post(`${this.baseURL}Project/PostProject`, project, this.httpOptions)

      .pipe(catchError(this.errorHandler));
  }

  find(id: string): Observable<any> {
    return this.httpClient
      .get(`${this.baseURL}Project/` + id)

      .pipe(catchError(this.errorHandler));
  }

  update(project: Project): Observable<any> {
    return this.httpClient
      .put(`${this.baseURL}Project/PutProject`, project, {
        responseType: 'text',
      })

      .pipe(catchError(this.errorHandler));
  }

  validate(project: Project): Observable<any> {
    return this.httpClient
      .put(`${this.baseURL}Project/PutProject`, project, {
        responseType: 'text',
      })

      .pipe(catchError(this.errorHandler));
  }

  delete(id: string) {
    return this.httpClient
      .delete(`${this.baseURL}Project/DeleteProject/` + id, {
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
    return throwError(errorMessage);
  }
}
