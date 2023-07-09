import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from 'src/app/Services/auth.service';
import { AddUserComponent } from '../add-user/add-user.component';
import { UserStoreService } from 'src/app/Services/user-store.service';
import { User } from 'src/app/Interfaces/user';
import { ServiceService } from 'src/app/Services/service.service';
import { Service } from 'src/app/Interfaces/Service';
import { NgToastService } from 'ng-angular-popup';
import { EditUserComponent } from '../edit-user/edit-user.component';
import { UserDetailsComponent } from '../user-details/user-details.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css'],
})
export class UserListComponent implements OnInit {
  public users: User[] = [];
  public userId: string = '';
  public fullName: string = '';
  public role: string = '';
  public services: Service[] = [];
  constructor(
    private auth: AuthService,
    private matDialog: MatDialog,
    private userStore: UserStoreService,
    private serviceService: ServiceService
  ) {}
  ngOnInit(): void {
    this.auth.tokenExpires().subscribe();
    this.getId();
    this.getFullName();
    this.getRole();
    this.getAllUsers();
    this.getServices();
  }
  getId() {
    this.userStore.getIdFromStore().subscribe((id) => {
      let userIdFromToken = this.auth.getIdFromToken();
      this.userId = id || userIdFromToken;
    });
  }
  getFullName() {
    this.userStore.getFullNameFromStore().subscribe((fullName) => {
      let userFullNameFromToken = this.auth.getFullNameFromToken();
      this.fullName = fullName || userFullNameFromToken;
    });
  }
  getRole() {
    this.userStore.getRoleFromStore().subscribe((role) => {
      let userRoleFromToken = this.auth.getRoleFromToken();
      this.role = role || userRoleFromToken;
    });
  }
  getAllUsers() {
    this.auth.getUsers().subscribe((res: User[]) => {
      this.users = res.filter((item) => item.userName !== 'admin');
    });
  }
  addUser() {
    this.matDialog.open(AddUserComponent, {
      id: 'addUser',
      width: '700px',
      maxHeight: '90vh',
      autoFocus: false,
      data: this.services,
    });
  }
  getServices() {
    this.serviceService.getAll().subscribe((data: Service[]) => {
      this.services = data;
    });
  }
  details(user: User) {
    this.matDialog.open(UserDetailsComponent, {
      id: 'detailsUser',
      width: '700px',
      maxHeight: '90vh',
      autoFocus: false,
      data: user,
    });
  }
  edit(user: User) {
    this.matDialog.open(EditUserComponent, {
      id: 'editUser',
      width: '700px',
      maxHeight: '90vh',
      autoFocus: false,
      data: user,
    });
  }
  async deleteUser(user: User) {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-warning',
        cancelButton: 'btn btn-success',
      },
      buttonsStyling: true,
    });
    swalWithBootstrapButtons
      .fire({
        showCloseButton: true,
        title: 'Are You Sure?',
        text: 'Once deleted,you will not be able to recover this user!',
        showCancelButton: true,
        confirmButtonText: 'Ok',
        cancelButtonText: 'Cancel',
        reverseButtons: false,
      })
      .then((result) => {
        if (result.value) {
          this.auth.deleteUser(user.id).subscribe((res) => {
            this.users = this.users.filter((item) => item.id !== user.id);
          });
          return;
        }
      });
  }
  async logOut() {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-warning',
        cancelButton: 'btn btn-success',
      },
      buttonsStyling: true,
    });
    swalWithBootstrapButtons
      .fire({
        showCloseButton: true,
        title: 'Signing Out',
        text: 'Are you sure you want to sign out?',
        showCancelButton: true,
        confirmButtonText: 'Yes',
        cancelButtonText: 'Cancel',
        reverseButtons: false,
      })
      .then((result) => {
        if (result.value) {
          this.auth.signOut();
          return;
        }
      });
  }
}
