import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { NgToastService } from 'ng-angular-popup';
import { Service } from 'src/app/Interfaces/Service';
import { User } from 'src/app/Interfaces/user';
import { AuthService } from 'src/app/Services/auth.service';
import { ServiceService } from 'src/app/Services/service.service';
import { TYPE } from 'src/assets/values.constants';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-edit-modal',
  templateUrl: './edit-modal.component.html',
  styleUrls: ['./edit-modal.component.css'],
})
export class EditModalComponent implements OnInit {
  serv!: Service;
  editForm!: FormGroup;
  users: User[] = [];

  constructor(
    public serviceService: ServiceService,
    private matDialog: MatDialog,
    private auth: AuthService,
    @Inject(MAT_DIALOG_DATA) public service: Service
  ) {}

  ngOnInit(): void {
    this.edit();
  }
  edit() {
    this.editForm = new FormGroup({
      name: new FormControl('', Validators.required),
    });
  }
  submit() {
    this.service.name = this.editForm.value.name;
    this.serviceService.update(this.service).subscribe((res: any) => {
      Swal.fire({
        toast: true,
        position: 'top',
        showConfirmButton: false,
        icon: TYPE.SUCCESS,
        timerProgressBar: false,
        timer: 5000,
        title: 'Service updated successfully',
      });
      this.close();
    });
  }
  close() {
    const dialog = this.matDialog.getDialogById('edit');
    dialog?.close();
  }
}
