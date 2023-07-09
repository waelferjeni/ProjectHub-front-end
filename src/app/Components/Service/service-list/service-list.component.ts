import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';

import { ActivatedRoute, Router } from '@angular/router';
import { Service } from 'src/app/Interfaces/Service';
import { ServiceService } from 'src/app/Services/service.service';
import { DetailsModalComponent } from '../details-modal/details-modal.component';
import { EditModalComponent } from '../edit-modal/edit-modal.component';
import { AuthService } from 'src/app/Services/auth.service';
import { UserStoreService } from 'src/app/Services/user-store.service';
import { User } from 'src/app/Interfaces/user';
import { NgToastService } from 'ng-angular-popup';
import Swal from 'sweetalert2';
import { TYPE } from 'src/assets/values.constants';

@Component({
  selector: 'app-service-list',
  templateUrl: './service-list.component.html',
  styleUrls: ['./service-list.component.css'],
})
export class ServiceListComponent implements OnInit {
  //@Input() serviceName="";
  services: Service[] = [];
  service: Service = {} as Service;
  addForm!: FormGroup;
  serv!: Service;
  users: User[] = [];
  public userId: string = '';
  public fullName: string = '';
  public role: string = '';

  constructor(
    public serviceService: ServiceService,
    private dialogRef: MatDialog,
    private auth: AuthService,
    private userStore: UserStoreService
  ) {}

  ngOnInit(): void {
    this.auth.tokenExpires().subscribe();
    this.getFullName();
    this.getId();
    this.getRole();
    this.getAll();

    this.add();

    this.getServiceLeaders();
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
  getServiceLeaders() {
    this.auth.getUsers().subscribe((res: User[]) => {
      this.users = res.filter((item) => item.role === 'serviceLeader');
    });
  }
  getAll() {
    this.serviceService.getAll().subscribe((data: Service[]) => {
      this.services = data;
    });
  }

  add() {
    this.addForm = new FormGroup({
      name: new FormControl('', [Validators.required]),
      serviceLeader: new FormControl('00000000-0000-0000-0000-000000000000'),
    });
  }

  get f() {
    return this.addForm.controls;
  }

  submit() {
    this.service.name = this.addForm.value.name;
    this.service.serviceLeaderID = this.addForm.value.serviceLeader;
    this.serviceService.create(this.service).subscribe((res: any) => {
      this.services.push(res);
      Swal.fire({
        toast: true,
        position: 'top',
        showConfirmButton: false,
        icon: TYPE.SUCCESS,
        timerProgressBar: false,
        timer: 5000,
        title: 'Service added successfully',
      });
    });
  }
  async deleteService(service: Service) {
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
        text: 'Once deleted,you will not be able to recover this service!',
        showCancelButton: true,
        confirmButtonText: 'Ok',
        cancelButtonText: 'Cancel',
        reverseButtons: false,
      })
      .then((result) => {
        if (result.value) {
          this.serviceService.delete(service.id).subscribe((res) => {
            this.services = this.services.filter(
              (item) => item.id !== service.id
            );
          });
          return;
        }
      });
  }
  openDialog(service: Service) {
    this.dialogRef.open(DetailsModalComponent, {
      data: service,
      width: '700px',
      maxHeight: '100vh',
      id: 'details',
    });
  }

  openEditDialog(service: Service) {
    this.dialogRef.open(EditModalComponent, {
      data: service,
      width: '800px',
      maxHeight: '90vh',
      id: 'edit',
    });
  }
  close() {
    this.addForm.reset();
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
