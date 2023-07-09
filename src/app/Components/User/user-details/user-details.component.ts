import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgToastService } from 'ng-angular-popup';
import { Service } from 'src/app/Interfaces/Service';
import { User } from 'src/app/Interfaces/user';
import { AuthService } from 'src/app/Services/auth.service';
import { ServiceService } from 'src/app/Services/service.service';
import ValidateForm from 'src/app/helpers/validateForm';

@Component({
  selector: 'app-user-details',
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.css'],
})
export class UserDetailsComponent implements OnInit {
  public service: Service = {} as Service;
  public user: User = {} as User;
  constructor(
    private matDialog: MatDialog,
    private serviceService: ServiceService,
    @Inject(MAT_DIALOG_DATA) public data: User
  ) {}
  ngOnInit(): void {
    this.getService();
    this.user = this.data;
  }
  getService() {
    this.serviceService.find(this.data.serviceId).subscribe((res: Service) => {
      this.service = res;
    });
  }

  refresh() {
    const dialog = this.matDialog.getDialogById('detailsUser');
    dialog?.close();
  }
}
