import { Component, Inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { Team } from 'src/app/Interfaces/Team';
import { TeamUser } from 'src/app/Interfaces/TeamUser';
import { User } from 'src/app/Interfaces/user';
import { TeamService } from 'src/app/Services/team.service';
import { TeamUserService } from 'src/app/Services/teamuser.service';
import { EditteammatesComponent } from '../editteammates/editteammates.component';
import { AuthService } from 'src/app/Services/auth.service';
import { UserStoreService } from 'src/app/Services/user-store.service';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css'],
})
export class EditComponent implements OnInit {
  roleselected: boolean = false;
  userchecked: boolean = true;
  idProjectLeader!: string;
  idteam!: string;
  usersToSelect: User[] = [];
  usersSelected: User[] = [];
  users: User[] = [];
  teams: Team[] = [];
  modifiedTeam: Team = {} as Team;
  teammates: TeamUser = {} as TeamUser;
  teamuser: TeamUser = {} as TeamUser;
  public userId: string = '';
  public fullName: string = '';
  public role: string = '';
  public serviceId: string = '';
  constructor(
    @Inject(MAT_DIALOG_DATA) public team: Team,
    public teamservice: TeamService,
    private auth: AuthService,
    public teamuserservice: TeamUserService,
    private matDialog: MatDialog,
    private userStore: UserStoreService
  ) {}
  ngOnInit(): void {
    this.getFullName();
    this.getId();
    this.getRole();
    this.getService();
    this.getUsers();
    this.getProjectLeader();
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
  editTeam = new FormGroup({
    teamName: new FormControl(''),
    ProjectLeader: new FormControl(''),
  });
  getProjectLeader() {
    this.teamuserservice
      .getProjectLeader(this.team.id)
      .subscribe((data: TeamUser) => {
        this.idProjectLeader = data.userId;
        this.teammates = data;
        this.editTeam.controls.ProjectLeader.setValue(this.teammates.userId);
        this.editTeam.controls.teamName.setValue(this.team.name);
      });
  }
  getUsers() {
    this.auth.getUsersByServiceId(this.serviceId).subscribe((data: User[]) => {
      this.users = data.filter(
        (item) =>
          item.role !== 'serviceLeader' && item.role !== 'independentEmployee'
      );
      this.usersToSelect = data.filter(
        (item) =>
          item.role !== 'serviceLeader' && item.role !== 'independentEmployee'
      );
    });
  }
  onSubmit() {
    this.modifiedTeam.name = this.editTeam.value.teamName!;
    this.modifiedTeam.id = this.team.id;
    this.modifiedTeam.serviceId = this.team.serviceId;
    this.teamservice.update(this.modifiedTeam).subscribe({
      next: (res: Team) => {
        if (this.editTeam.value.ProjectLeader !== this.idProjectLeader) {
          this.teamuser.teamId = this.teammates.teamId;
          this.teamuser.UserRole = 'ProjectLeader';
          this.teamuser.userId = this.teammates.userId;
          this.teamuserservice.delete(this.teamuser).subscribe();
          this.teamuser.userId = this.editTeam.value.ProjectLeader!;
          this.teamuser.UserRole = 'ProjectLeader';
          this.teamuserservice.create(this.teamuser).subscribe();
        }
        this.matDialog.open(EditteammatesComponent, {
          id: 'editteammates',
          width: '700px',
          maxHeight: '90vh',
          data: this.team,
          autoFocus: false,
        });
        this.refresh();
      },
    });
  }

  onAssign() {
    this.usersSelected.forEach((user) => {
      let teamuser: TeamUser = {} as TeamUser;
      teamuser.teamId = this.idteam;
      teamuser.userId = user.id;
      teamuser.UserRole = 'Employee';
      this.teamuserservice.create(teamuser).subscribe();
    });
    this.refresh();
  }
  selectuser(event: any, user: User) {
    if (event.target.checked) {
      this.usersSelected.push(user);
    } else {
      this.usersSelected = this.usersSelected.filter(
        (item) => item.id !== user.id
      );
    }
  }
  refresh() {
    const dialog = this.matDialog.getDialogById('editeam');
    dialog?.close();
  }
}
