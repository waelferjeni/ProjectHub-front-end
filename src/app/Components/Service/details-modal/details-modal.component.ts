import { Component, Inject, Input, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { Service } from 'src/app/Interfaces/Service';
import { User } from 'src/app/Interfaces/user';
import { AuthService } from 'src/app/Services/auth.service';
import { ServiceService } from 'src/app/Services/service.service';

@Component({
  selector: 'app-details-modal',
  templateUrl: './details-modal.component.html',
  styleUrls: ['./details-modal.component.css'],
})
export class DetailsModalComponent implements OnInit {
  user: User = {} as User;

  constructor(
    public auth: AuthService,
    @Inject(MAT_DIALOG_DATA) public service: Service,
    private matDialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.getServiceLeader(this.service.serviceLeaderID);
  }
  getServiceLeader(id: string) {
    this.auth.getUser(id).subscribe((data: User) => {
      this.user = data;
    });
  }
  close() {
    const dialog = this.matDialog.getDialogById('details');
    dialog?.close();
  }
}
