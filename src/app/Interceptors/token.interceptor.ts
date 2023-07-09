import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { AuthService } from '../Services/auth.service';
import { NgToastService } from 'ng-angular-popup';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { TYPE } from 'src/assets/values.constants';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  constructor(
    private auth: AuthService,
    private toast: NgToastService,
    private router: Router
  ) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    const myToken = this.auth.getToken();
    if (myToken) {
      request = request.clone({
        setHeaders: { Authorization: `Bearer ${myToken}` },
      });
    }
    return next.handle(request).pipe(
      catchError((err: any) => {
        if (err instanceof HttpErrorResponse) {
          if (err.status === 401) {
            Swal.fire({
              toast: true,
              position: 'top',
              showConfirmButton: false,
              icon: TYPE.ERROR,
              timerProgressBar: false,
              timer: 5000,
              title: 'Token is expired,Please login again',
            });
            this.router.navigate(['login']);
            localStorage.clear();
          } else if (err.status === 404) {
            return throwError(() => new Error('User Not Found!'));
          } else if (err.status === 400) {
            return throwError(
              () => new Error('UserName or Password is Incorrect')
            );
          }
        }
        return throwError(() => new Error('Some  other error occured'));
      })
    );
  }
}
