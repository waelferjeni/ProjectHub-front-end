import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Team } from 'src/app/Interfaces/Team';
import { TeamUser } from 'src/app/Interfaces/TeamUser';
import { User } from 'src/app/Interfaces/user';
import { TeamService } from 'src/app/Services/team.service';
import { TeamUserService } from 'src/app/Services/teamuser.service';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { EditComponent } from '../edit/edit.component';
import { AuthService } from 'src/app/Services/auth.service';
import { UserStoreService } from 'src/app/Services/user-store.service';
import { ViewTeamComponent } from '../view-team/view-team.component';
import Swal from 'sweetalert2';
import { TYPE } from 'src/assets/values.constants';
@Component({
  selector: 'app-team-list',
  templateUrl: './team-list.component.html',
  styleUrls: ['./team-list.component.css'],
})
export class TeamListComponent implements OnInit {
  roleselected: boolean = false;
  userchecked: boolean = true;
  idteam!: string;
  addTeam!: FormGroup;
  addTeammates!: FormGroup;
  userstoselect: User[] = [];
  usersSelected: User[] = [];
  users: User[] = [];
  teams: Team[] = [];
  team: Team = {} as Team;
  teamuser: TeamUser = {} as TeamUser;
  public userId: string = '';
  public fullName: string = '';
  public role: string = '';
  public serviceId: string = '';
  constructor(
    public teamservice: TeamService,
    public teamuserservice: TeamUserService,
    private auth: AuthService,
    private userStore: UserStoreService,
    private fb: FormBuilder,
    private matDialog: MatDialog
  ) {}
  ngOnInit(): void {
    this.getFullName();
    this.getId();
    this.getRole();
    this.getService();
    this.auth.tokenExpires().subscribe();
    this.getTeams();
    this.getUsers();
    this.addTeamForm();
    this.addTeammatesForm();
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
  getTeams() {
    if (this.role === 'serviceLeader') {
      this.teamservice.getAll().subscribe((data: Team[]) => {
        this.teams = data.filter((item) => item.serviceId === this.serviceId);
      });
    } else {
      this.teamservice.getAll().subscribe((data: Team[]) => {
        this.teams = data;
      });
    }
  }
  getUsers() {
    this.auth.getUsersByServiceId(this.serviceId).subscribe((data: User[]) => {
      this.users = data.filter(
        (item) =>
          item.role !== 'serviceLeader' && item.role !== 'independentEmployee'
      );
      this.userstoselect = data.filter(
        (item) =>
          item.role !== 'serviceLeader' && item.role !== 'independentEmployee'
      );
    });
  }
  addTeamForm() {
    this.addTeam = this.fb.group({
      teamName: ['', Validators.required],
      ProjectLeader: ['', Validators.required],
    });
  }
  addTeammatesForm() {
    this.addTeammates = this.fb.group({
      user: [''],
      userrole: [''],
    });
  }
  onSubmit() {
    this.team.name = this.addTeam.value.teamName;
    this.team.serviceId = this.serviceId;
    this.teamservice
      .create(this.team)

      .subscribe({
        next: (res: Team) => {
          this.idteam = res.id;
          this.teams.push(res);

          this.teamuser.UserRole = 'ProjectLeader';
          this.teamuser.teamId = res.id;
          this.teamuser.userId = this.addTeam.value.ProjectLeader;
          this.userstoselect = this.userstoselect.filter(
            (item) => item.id !== this.addTeam.value.ProjectLeader
          );
          this.teamuserservice.create(this.teamuser).subscribe();
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
      Swal.fire({
        toast: true,
        position: 'top',
        showConfirmButton: false,
        icon: TYPE.SUCCESS,
        timerProgressBar: false,
        timer: 5000,
        title: 'Team added successfully',
      });
    });
    this.resetForms();
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

  details(team: Team) {
    this.matDialog.open(ViewTeamComponent, {
      id: 'detailTeam',
      width: '700px',
      maxHeight: '90vh',
      data: team,
      autoFocus: false,
    });
  }
  edit(team: Team) {
    this.matDialog.open(EditComponent, {
      id: 'editeam',
      width: '700px',
      maxHeight: '90vh',
      data: team,
      autoFocus: false,
    });
  }
  async DeleteTeam(team: Team) {
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
        text: 'Once deleted,you will not be able to recover this team!',
        showCancelButton: true,
        confirmButtonText: 'Ok',
        cancelButtonText: 'Cancel',
        reverseButtons: false,
      })
      .then((result) => {
        if (result.value) {
          this.teamservice.delete(team.id).subscribe((res) => {
            this.teams = this.teams.filter((item) => item.id !== team.id);
          });
          return;
        }
      });
  }
  resetForms() {
    this.addTeam.reset();
    this.addTeammates.reset();
    this.ngOnInit();
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
