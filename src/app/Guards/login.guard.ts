import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { NgToastService } from 'ng-angular-popup';
import { Observable } from 'rxjs';
import { AuthService } from '../Services/auth.service';
import { TYPE } from 'src/assets/values.constants';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root',
})
export class LoginGuard {
  constructor(private auth: AuthService, private router: Router) {}
  canActivate(): boolean {
    if (this.auth.isLoggedIn()) {
      Swal.fire({
        toast: true,
        position: 'top',
        showConfirmButton: false,
        icon: TYPE.WARNING,
        timerProgressBar: false,
        timer: 5000,
        title: 'you are already logged in',
      });
      this.router.navigate(['home']);
      return false;
    } else {
      return true;
    }
  }
}
