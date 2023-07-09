import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from 'src/environments/environment.development';
import { Service } from '../Interfaces/Service';

@Injectable({
  providedIn: 'root',
})
export class ServiceService {
  //private apiURL = "https://localhost:7222/api/Service";
  private baseURL = environment.BASE_URL_Project_MANGMENT;

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };

  constructor(private httpClient: HttpClient) {}

  getAll(): Observable<any> {
    return this.httpClient
      .get(`${this.baseURL}Service/GetAllServices`)

      .pipe(catchError(this.errorHandler));
  }

  create(service: Service): Observable<any> {
    return this.httpClient
      .post(`${this.baseURL}Service/PostService`, service, this.httpOptions)

      .pipe(catchError(this.errorHandler));
  }

  find(id: string): Observable<any> {
    return this.httpClient
      .get(`${this.baseURL}Service/` + id, this.httpOptions)

      .pipe(catchError(this.errorHandler));
  }

  update(service: Service): Observable<any> {
    return this.httpClient
      .put(`${this.baseURL}Service/PutService`, service, {
        responseType: 'text',
      })

      .pipe(catchError(this.errorHandler));
  }
  delete(id: string) {
    return this.httpClient
      .delete(`${this.baseURL}Service/DeleteService/` + id, {
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
