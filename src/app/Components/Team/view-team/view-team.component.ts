import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { Team } from 'src/app/Interfaces/Team';
import { TeamUser } from 'src/app/Interfaces/TeamUser';
import { User } from 'src/app/Interfaces/user';
import { AuthService } from 'src/app/Services/auth.service';
import { TeamUserService } from 'src/app/Services/teamuser.service';
import { UserStoreService } from 'src/app/Services/user-store.service';

@Component({
  selector: 'app-view-team',
  templateUrl: './view-team.component.html',
  styleUrls: ['./view-team.component.css'],
})
export class ViewTeamComponent implements OnInit {
  public projectLeaderId: string = '';
  public projectLeader: User = {} as User;
  teamUsersSelected: TeamUser[] = [];
  usersSelected: User[] = [];
  public serviceId: string = '';
  constructor(
    private matDialog: MatDialog,
    public teamuserservice: TeamUserService,
    private auth: AuthService,
    private userStore: UserStoreService,
    @Inject(MAT_DIALOG_DATA) public team: Team
  ) {}
  ngOnInit(): void {
    this.getService();
    this.getProjectLeaderId();
    this.getUsers();
  }
  getService() {
    this.userStore.getServiceIdFromStore().subscribe((serviceId) => {
      let serviceIdFromToken = this.auth.getServiceIdFromToken();
      this.serviceId = serviceId || serviceIdFromToken;
    });
  }
  getUsers() {
    this.teamuserservice.GetEmployees(this.team.id).subscribe({
      next: (res: TeamUser[]) => {
        this.teamUsersSelected = res;
        let users: TeamUser[] = [];
        users = res;
        this.auth.getUsersByServiceId(this.team.serviceId).subscribe({
          next: (res: User[]) => {
            res.forEach((user) => {
              users.forEach((teamUser) => {
                if (user.id === teamUser.userId) {
                  this.usersSelected.push(user);
                }
              });
            });
          },
        });
      },
    });
  }
  getProjectLeaderId() {
    this.teamuserservice
      .getProjectLeader(this.team.id)
      .subscribe((data: TeamUser) => {
        this.projectLeaderId = data.userId;
        this.getProjectLeader(this.projectLeaderId);
      });
  }
  getProjectLeader(id: string) {
    this.auth.getUser(id).subscribe((user: User) => {
      this.projectLeader = user;
    });
  }
  close() {
    const dialog = this.matDialog.getDialogById('detailTeam');
    dialog?.close();
  }
}
