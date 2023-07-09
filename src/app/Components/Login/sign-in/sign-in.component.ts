import {
  Component,
  Inject,
  OnInit,
  Renderer2,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgToastService } from 'ng-angular-popup';
import { AuthService } from 'src/app/Services/auth.service';
import { DOCUMENT } from '@angular/common';
import { UserStoreService } from 'src/app/Services/user-store.service';
import ValidateForm from '../../../helpers/validateForm';
import { TYPE } from 'src/assets/values.constants';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss'],
})
export class SignInComponent implements OnInit {
  type: string = 'password';
  isText: boolean = false;
  eyeIcon: string = 'fa-eye-slash';
  loginForm!: FormGroup;

  constructor(
    private auth: AuthService,
    private router: Router,
    private userStore: UserStoreService
  ) {}
  ngOnInit(): void {
    this.initLoginForm();
  }
  initLoginForm() {
    this.loginForm = new FormGroup({
      userName: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required]),
    });
  }
  onSubmit() {
    if (this.loginForm.valid) {
      this.auth.signIn(this.loginForm.value).subscribe({
        next: (res) => {
          Swal.fire({
            title: this.loginForm.controls['userName'].value,
            text: 'Welcome Back',
            icon: TYPE.SUCCESS,
            confirmButtonText: 'Thanks',
          });
          this.loginForm.reset();
          this.auth.storeToken(res.token);
          const tokenPayLoad = this.auth.decodedToken();
          this.userStore.setIdForStore(tokenPayLoad.nameid);
          this.userStore.setFullNameForStore(tokenPayLoad.name);
          this.userStore.setRoleForStore(tokenPayLoad.role);
          if (
            tokenPayLoad.role === 'Admin' ||
            tokenPayLoad.role === 'serviceLeader'
          ) {
            this.router.navigate(['home']);
          } else if (tokenPayLoad.role === 'Employee') {
            this.router.navigate(['timesheet']);
          } else {
            this.router.navigate(['tasks']);
          }
        },
        error: (err) => {
          Swal.fire({
            toast: true,
            position: 'top',
            showConfirmButton: false,
            icon: TYPE.ERROR,
            timerProgressBar: false,
            timer: 5000,
            title: err,
          });
        },
      });
    } else {
      Swal.fire({
        toast: true,
        position: 'top',
        showConfirmButton: false,
        icon: TYPE.ERROR,
        timerProgressBar: false,
        timer: 5000,
        title: 'TYour form is invalid',
      });
      ValidateForm.validateAllFormFields(this.loginForm);
    }
  }
  hideShowPass() {
    this.isText = !this.isText;
    this.isText ? (this.eyeIcon = 'fa-eye') : (this.eyeIcon = 'fa-eye-slash');
    this.isText ? (this.type = 'text') : (this.type = 'password');
  }
}
