import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { NgToastService } from 'ng-angular-popup';
import { Service } from 'src/app/Interfaces/Service';
import { Team } from 'src/app/Interfaces/Team';
import { AuthService } from 'src/app/Services/auth.service';
import ValidateForm from '../../../helpers/validateForm';
import { User } from 'src/app/Interfaces/user';
import { TYPE } from 'src/assets/values.constants';
import Swal from 'sweetalert2';
import emailjs, { EmailJSResponseStatus } from '@emailjs/browser';

@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.scss'],
})
export class AddUserComponent implements OnInit {
  addForm!: FormGroup;
  isAvailable: boolean = false;
  constructor(
    private auth: AuthService,
    private matDialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public services: Service[]
  ) {}
  ngOnInit(): void {
    this.initaddForm();
  }

  initaddForm() {
    this.addForm = new FormGroup({
      firstName: new FormControl('', [Validators.required]),
      lastName: new FormControl('', [Validators.required]),
      userName: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required]),
      role: new FormControl('', [Validators.required]),
      serviceId: new FormControl('', [Validators.required]),
    });
  }
  checkService(service: any) {
    this.auth
      .getServiceLeaderByServiceId(service.target.value)
      .subscribe((res: string) => {
        if (res == 'true') {
          this.isAvailable = true;
        } else {
          this.isAvailable = false;
        }
        console.log(this.isAvailable);
      });
  }
  onSubmit() {
    if (
      this.addForm.value.role == 'serviceLeader' &&
      this.isAvailable == false
    ) {
      Swal.fire({
        toast: true,
        position: 'top',
        showConfirmButton: false,
        icon: TYPE.ERROR,
        timerProgressBar: false,
        timer: 5000,
        title: 'this service already have service manager',
      });
    } else if (this.addForm.valid) {
      let user: User = this.addForm.value;
      this.auth.addUser(this.addForm.value).subscribe({
        next: (res) => {
          Swal.fire({
            toast: true,
            position: 'top',
            showConfirmButton: false,
            icon: TYPE.SUCCESS,
            timerProgressBar: false,
            timer: 5000,
            title: 'User added successfully',
          });
          this.sendingEmail(user);
          this.refresh();
          this.addForm.reset();
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
        title: 'Your form is invalid',
      });
      ValidateForm.validateAllFormFields(this.addForm);
    }
  }
  refresh() {
    const dialog = this.matDialog.getDialogById('addUser');
    dialog?.close();
  }
  sendingEmail(user: User) {
    var templateParams = {
      to_name: user.firstName + '' + user.lastName,
      userName: user.userName,
      password: user.password,
      email_id: user.email,
    };
    emailjs
      .send(
        'service_sfc4fcb',
        'template_nfizzkl',
        templateParams,
        'INxqlJLZm2snvZ-wZ'
      )
      .then(
        (result: EmailJSResponseStatus) => {
          console.log(result.text);
        },
        (error) => {
          console.log(error.text);
        }
      );
  }
}
