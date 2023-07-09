import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { Team } from 'src/app/Interfaces/Team';
import { TeamUser } from 'src/app/Interfaces/TeamUser';
import { User } from 'src/app/Interfaces/user';
import { AuthService } from 'src/app/Services/auth.service';
import { TeamUserService } from 'src/app/Services/teamuser.service';
import { UserStoreService } from 'src/app/Services/user-store.service';
import { TYPE } from 'src/assets/values.constants';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-editteammates',
  templateUrl: './editteammates.component.html',
  styleUrls: ['./editteammates.component.css'],
})
export class EditteammatesComponent implements OnInit {
  projectLeaderId!: string;
  teamUsersSelected: TeamUser[] = [];
  usersSelected: User[] = [];
  usersToSelect: User[] = [];
  editTeammates!: FormGroup;
  public userId: string = '';
  public fullName: string = '';
  public role: string = '';
  public serviceId: string = '';
  constructor(
    @Inject(MAT_DIALOG_DATA) public team: Team,
    private matDialog: MatDialog,
    public teamuserservice: TeamUserService,
    private auth: AuthService,
    private userStore: UserStoreService
  ) {}

  ngOnInit(): void {
    this.getFullName();
    this.getId();
    this.getRole();
    this.getService();
    this.getUsers();
    this.getUsersToSelect();
    this.editTeammatesForm();
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
        this.auth.getUsersByServiceId(this.serviceId).subscribe({
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
  getProjectLeader() {
    this.teamuserservice
      .getProjectLeader(this.team.id)
      .subscribe((data: TeamUser) => {
        this.projectLeaderId = data.userId;
      });
  }

  getUsersToSelect() {
    this.getProjectLeader();
    this.auth.getUsersByServiceId(this.serviceId).subscribe({
      next: (res: User[]) => {
        this.usersToSelect = res.filter((item) => item.userName != 'admin');
        this.usersToSelect = res.filter(
          (item) =>
            item.role != 'serviceLeader' && item.role !== 'independentEmployee'
        );
        this.teamUsersSelected.forEach((teamUser) => {
          this.usersToSelect = this.usersToSelect.filter(
            (item) => item.id != teamUser.userId
          );
        });
      },
    });
  }
  getEmployeeById(id: string) {
    let user: TeamUser = {} as TeamUser;
    this.teamuserservice.GetEmployeeById(id).subscribe({
      next: (res: TeamUser) => {
        user = res;
      },
    });
    return user;
  }
  editTeammatesForm() {
    this.editTeammates = new FormGroup({
      user: new FormControl(''),
    });
  }
  addUser(user: User) {
    let userAdded: TeamUser = {} as TeamUser;
    userAdded.UserRole = 'Employee';
    userAdded.teamId = this.team.id;
    userAdded.userId = user.id;
    this.teamuserservice.create(userAdded).subscribe({
      next: (res: TeamUser) => {},
    });
  }

  removeUser(user: User) {
    let userRemoved: TeamUser = {} as TeamUser;
    userRemoved.UserRole = 'Employee';
    userRemoved.teamId = this.team.id;
    userRemoved.userId = user.id;
    this.teamuserservice.delete(userRemoved).subscribe();
    // this.usersToSelect.push(user);
  }
  removerLeaderFromList() {
    this.usersToSelect = this.usersToSelect.filter(
      (item) => item.id != this.projectLeaderId
    );
    this.teamUsersSelected.forEach((teamUser) => {
      this.usersToSelect = this.usersToSelect.filter(
        (item) => item.id != teamUser.userId
      );
    });
    return this.usersToSelect;
  }
  refresh() {
    Swal.fire({
      toast: true,
      position: 'top',
      showConfirmButton: false,
      icon: TYPE.SUCCESS,
      timerProgressBar: false,
      timer: 5000,
      title: 'Team edited successfully',
    });
    const dialog = this.matDialog.getDialogById('editteammates');
    dialog?.close();
  }
}
