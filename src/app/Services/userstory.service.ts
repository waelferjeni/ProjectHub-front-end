import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from 'src/environments/environment.development';
import { UserStory } from '../Interfaces/UserStory';
import { UserStoryDto } from '../Interfaces/userStoryDto';

@Injectable({
  providedIn: 'root',
})
export class UserstoryService {
  private baseURL = environment.BASE_URL_UserStory_Task_MANGMENT;

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };

  constructor(private httpClient: HttpClient) {}

  getAll(): Observable<any> {
    return this.httpClient
      .get(`${this.baseURL}UserStory/GetAllUserStories`)

      .pipe(catchError(this.errorHandler));
  }
  getUserStoriesByProjectId(id: string): Observable<any> {
    return this.httpClient
      .get(
        `${this.baseURL}UserStory/GetUserStoriesByProjectId/` + id,
        this.httpOptions
      )

      .pipe(catchError(this.errorHandler));
  }
  create(userStory: UserStory): Observable<any> {
    return this.httpClient
      .post(
        `${this.baseURL}UserStory/PostSpecUserStory`,
        userStory,
        this.httpOptions
      )
      .pipe(catchError(this.errorHandler));
  }

  find(id: string): Observable<any> {
    return this.httpClient
      .get(`${this.baseURL}UserStory/` + id, this.httpOptions)
      .pipe(catchError(this.errorHandler));
  }

  // findProject(id : string) : Project {
  //   return this.httpClient.get(`Project/`+ id)

  //   .pipe(
  //     catchError(this.errorHandler)
  //   )
  // }

  update(userStory: UserStoryDto): Observable<any> {
    return this.httpClient
      .put(`${this.baseURL}UserStory/PutUserStory`, userStory, this.httpOptions)

      .pipe(catchError(this.errorHandler));
  }

  delete(id: string) {
    return this.httpClient
      .delete(`${this.baseURL}UserStory/DeleteUserStory/` + id, {
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
