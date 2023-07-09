import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { NgToastService } from 'ng-angular-popup';
import { Service } from 'src/app/Interfaces/Service';
import { User } from 'src/app/Interfaces/user';
import { AuthService } from 'src/app/Services/auth.service';
import { ServiceService } from 'src/app/Services/service.service';
import ValidateForm from 'src/app/helpers/validateForm';
import { TYPE } from 'src/assets/values.constants';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-edit-user',
  templateUrl: './edit-user.component.html',
  styleUrls: ['./edit-user.component.css'],
})
export class EditUserComponent implements OnInit {
  type: string = 'password';
  isText: boolean = false;
  eyeIcon: string = 'fa-eye-slash';
  editForm!: FormGroup;
  services: Service[] = [];
  user: User = {} as User;
  isAvailable: boolean = false;
  constructor(
    private auth: AuthService,
    private matDialog: MatDialog,
    private serviceService: ServiceService,
    @Inject(MAT_DIALOG_DATA) public data: User
  ) {}
  ngOnInit(): void {
    this.getAllServices();
    this.user = this.data;
    this.initeditForm();
    this.checkService();
  }
  getAllServices() {
    this.serviceService.getAll().subscribe((res: Service[]) => {
      this.services = res;
    });
  }
  initeditForm() {
    this.editForm = new FormGroup({
      firstName: new FormControl('', [Validators.required]),
      lastName: new FormControl('', [Validators.required]),
      role: new FormControl('', [Validators.required]),
    });
    this.editForm.controls['firstName'].setValue(this.user.firstName);
    this.editForm.controls['lastName'].setValue(this.user.lastName);
    this.editForm.controls['role'].setValue(this.user.role);
  }
  checkService() {
    this.auth
      .getServiceLeaderByServiceId(this.data.serviceId)
      .subscribe((res: string) => {
        if (res == 'true') {
          this.isAvailable = true;
        } else {
          this.isAvailable = false;
        }
      });
  }
  onSubmit() {
    let user: User = {} as User;
    if (
      this.editForm.value.role == 'serviceLeader' &&
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
    } else if (this.editForm.valid) {
      user.id = this.user.id;
      user.firstName = this.editForm.value.firstName;
      user.lastName = this.editForm.value.lastName;
      user.email = this.user.email;
      user.password = this.user.password;
      user.userName = this.user.userName;
      user.role = this.editForm.value.role;
      user.serviceId = this.user.serviceId;
      this.auth.editUser(user).subscribe((res: string) => {
        Swal.fire({
          toast: true,
          position: 'top',
          showConfirmButton: false,
          icon: TYPE.SUCCESS,
          timerProgressBar: false,
          timer: 5000,
          title: 'User edited successfully',
        });
        this.refresh();
        this.editForm.reset();
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
      ValidateForm.validateAllFormFields(this.editForm);
    }
  }
  refresh() {
    const dialog = this.matDialog.getDialogById('editUser');
    dialog?.close();
  }
}
