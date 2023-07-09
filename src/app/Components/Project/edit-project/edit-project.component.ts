import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
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
  selector: 'app-edit-project',
  templateUrl: './edit-project.component.html',
  styleUrls: ['./edit-project.component.css'],
})
export class EditProjectComponent implements OnInit {
  proj!: Project;
  editForm!: FormGroup;
  services: Service[] = [];
  teams: Team[] = [];
  idProjectLeader!: string;
  public serviceId: string = '';
  constructor(
    public projectService: ProjectService,
    public serviceService: ServiceService,
    public teamService: TeamService,
    private auth: AuthService,
    private userStore: UserStoreService,
    private dialogRef: MatDialog,
    public teamuserservice: TeamUserService,
    @Inject(MAT_DIALOG_DATA) public project: Project
  ) {}

  ngOnInit(): void {
    this.getServiceId();
    this.getServices();
    this.getTeams();
    this.edit();
  }
  getServiceId() {
    this.userStore.getServiceIdFromStore().subscribe((serviceId) => {
      let serviceIdFromToken = this.auth.getServiceIdFromToken();
      this.serviceId = serviceId || serviceIdFromToken;
    });
  }
  edit() {
    this.editForm = new FormGroup({
      name: new FormControl('', Validators.required),
      clientName: new FormControl('', Validators.required),
      description: new FormControl('', Validators.required),
      estimatedDays: new FormControl('', Validators.required),
      estimatedHours: new FormControl('', Validators.required),
      team: new FormControl('', [Validators.required]),
    });
    //this.editForm.patchValue(project)
    this.editForm.controls['name'].setValue(this.project.name);
    this.editForm.controls['team'].setValue(this.project.teamId);
    this.editForm.controls['estimatedDays'].setValue(
      this.getDays(this.project.estimatedDuration)
    );
    this.editForm.controls['estimatedHours'].setValue(
      this.getHours(this.project.estimatedDuration)
    );
    this.editForm.controls['description'].setValue(this.project.description);
  }

  getDays(d: number): number {
    return Math.floor(d / 24);
  }

  getHours(d: number): number {
    return d % 24;
  }

  getServices() {
    this.serviceService.getAll().subscribe((data: Service[]) => {
      this.services = data;
    });
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

  submit() {
    this.project.name = this.editForm.value.name;
    this.project.clientName = this.editForm.value.clientName;
    this.project.description = this.editForm.value.description;
    this.project.estimatedDuration =
      this.editForm.value.estimatedDays * 24 +
      this.editForm.value.estimatedHours;
    this.project.teamId = this.editForm.value.team;
    this.project.projectLeaderId = this.idProjectLeader;
    this.projectService.update(this.project).subscribe((res: string) => {
      Swal.fire({
        toast: true,
        position: 'top',
        showConfirmButton: false,
        icon: TYPE.SUCCESS,
        timerProgressBar: false,
        timer: 5000,
        title: 'Project edited successfully',
      });
    });
    let dialog = this.dialogRef.getDialogById('editProject');
    dialog?.close();
  }
  close() {
    let dialog = this.dialogRef.getDialogById('editProject');
    dialog?.close();
  }
}
