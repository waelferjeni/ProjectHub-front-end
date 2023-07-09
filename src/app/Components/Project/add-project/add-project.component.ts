import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { NgToastService } from 'ng-angular-popup';
import { Project } from 'src/app/Interfaces/Project';
import { Service } from 'src/app/Interfaces/Service';
import { Team } from 'src/app/Interfaces/Team';
import { TeamUser } from 'src/app/Interfaces/TeamUser';
import { AuthService } from 'src/app/Services/auth.service';
import { ProjectService } from 'src/app/Services/project.service';
import { ServiceService } from 'src/app/Services/service.service';
import { TeamService } from 'src/app/Services/team.service';
import { TeamUserService } from 'src/app/Services/teamuser.service';
import { UserStoreService } from 'src/app/Services/user-store.service';
import { TYPE } from 'src/assets/values.constants';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add-project',
  templateUrl: './add-project.component.html',
  styleUrls: ['./add-project.component.css'],
})
export class AddProjectComponent implements OnInit {
  teams: Team[] = [];
  addForm!: FormGroup;
  project: Project = {} as Project;
  idProjectLeader!: string;
  constructor(
    public projectService: ProjectService,
    public serviceService: ServiceService,
    private dialogRef: MatDialog,
    public teamService: TeamService,
    public teamuserservice: TeamUserService,
    @Inject(MAT_DIALOG_DATA) public serviceId: string
  ) {}

  ngOnInit(): void {
    this.getTeams();
    this.add();
  }

  add() {
    this.addForm = new FormGroup({
      name: new FormControl('', [Validators.required]),
      clientName: new FormControl('', [Validators.required]),
      days: new FormControl('', [Validators.required, Validators.min(0)]),
      hours: new FormControl('', [
        Validators.required,
        Validators.max(23),
        Validators.min(0),
      ]),
      description: new FormControl('', [Validators.required]),
      team: new FormControl('', [Validators.required]),
    });
  }

  get f() {
    return this.addForm.controls;
  }

  getTeams() {
    this.teamService.getAll().subscribe((data: Team[]) => {
      this.teams = data.filter((item) => item.serviceId === this.serviceId);
    });
  }

  getProjects() {
    this.projectService.getAll().subscribe();
  }
  getProjectLeader(teamId: any) {
    this.teamuserservice
      .getProjectLeader(teamId.target.value)
      .subscribe((data: TeamUser) => {
        this.idProjectLeader = data.userId;
      });
  }
  endDate(h: number): Date {
    let dt = new Date();
    dt.setTime(dt.getTime() + (h + 1) * 60 * 60 * 1000);
    return dt;
  }
  submit() {
    let startDate: Date = new Date();
    startDate.setHours(startDate.getHours() + 1);
    this.project.name = this.addForm.value.name;
    this.project.clientName = this.addForm.value.clientName;
    this.project.description = this.addForm.value.description;
    this.project.fk_ServiceId = this.serviceId;
    this.project.teamId = this.addForm.value.team;
    this.project.estimatedDuration =
      this.addForm.value.days * 24 + this.addForm.value.hours;
    this.project.startDate = startDate;
    this.project.endDate = this.endDate(this.project.estimatedDuration);
    this.project.projectState = 0;
    this.project.projectLeaderId = this.idProjectLeader;
    this.projectService.create(this.project).subscribe({
      next: (res) => {
        this.getProjects();
        Swal.fire({
          toast: true,
          position: 'top',
          showConfirmButton: false,
          icon: TYPE.SUCCESS,
          timerProgressBar: false,
          timer: 5000,
          title: 'Project added successfully',
        });
        let dialog = this.dialogRef.getDialogById('addProject');
        dialog?.close();
      },
      error: (err) => {
        Swal.fire({
          toast: true,
          position: 'top',
          showConfirmButton: false,
          icon: TYPE.ERROR,
          timerProgressBar: false,
          timer: 5000,
          title: 'Some   error occured',
        });
      },
    });
  }
  close() {
    let dialog = this.dialogRef.getDialogById('addProject');
    dialog?.close();
  }
}
