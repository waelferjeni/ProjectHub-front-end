import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Task } from '../Interfaces/Task';
import { environment } from 'src/environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private baseURL = environment.BASE_URL_UserStory_Task_MANGMENT;
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };
  constructor(private httpClient: HttpClient) {}
  getAll(): Observable<any> {
    return this.httpClient
      .get(`${this.baseURL}Task/GetAllTasks`)

      .pipe(catchError(this.errorHandler));
  }
  getTasksByUserStoryId(id: string): Observable<any> {
    return this.httpClient
      .get(`${this.baseURL}Task/GetTasksByUserStoryId/` + id, this.httpOptions)

      .pipe(catchError(this.errorHandler));
  }
  create(task: Task): Observable<any> {
    return this.httpClient
      .post(`${this.baseURL}Task/PostTask`, task, this.httpOptions)

      .pipe(catchError(this.errorHandler));
  }
  update(task: Task): Observable<any> {
    return this.httpClient
      .put(`${this.baseURL}Task/PutTask`, task, this.httpOptions)

      .pipe(catchError(this.errorHandler));
  }
  delete(id: string) {
    return this.httpClient
      .delete(`${this.baseURL}Task/DeleteTask/` + id, {
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
