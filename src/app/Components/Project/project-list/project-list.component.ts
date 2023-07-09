import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Project } from 'src/app/Interfaces/Project';
import { Service } from 'src/app/Interfaces/Service';
import { ServiceService } from 'src/app/Services/service.service';
import { DetailsModalComponent } from '../../Service/details-modal/details-modal.component';
import { EditModalComponent } from '../../Service/edit-modal/edit-modal.component';
import { ProjectService } from 'src/app/Services/project.service';
import { ProjectDetailsComponent } from '../project-details/project-details.component';
import { EditProjectComponent } from '../edit-project/edit-project.component';
import { TeamService } from 'src/app/Services/team.service';
import { Team } from 'src/app/Interfaces/Team';
import { AddProjectComponent } from '../add-project/add-project.component';
import { AuthService } from 'src/app/Services/auth.service';
import { UserStoreService } from 'src/app/Services/user-store.service';
import { NgToastService } from 'ng-angular-popup';
import Swal from 'sweetalert2';
import { SprintService } from 'src/app/Services/sprint.service';
import { UserStory } from 'src/app/Interfaces/UserStory';
import { UserStoryDto } from 'src/app/Interfaces/userStoryDto';
import { UserstoryService } from 'src/app/Services/userstory.service';
import { TaskService } from 'src/app/Services/task.service';
import { Task } from 'src/app/Interfaces/Task';

@Component({
  selector: 'app-project-list',
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.css'],
})
export class ProjectListComponent implements OnInit {
  projects: Project[] = [];
  project: Project = {} as Project;
  addForm!: FormGroup;
  editForm!: FormGroup;
  teams: Team[] = [];
  filteredByState: Project[] = [];
  public userId: string = '';
  public fullName: string = '';
  public role: string = '';
  public serviceId: string = '';
  constructor(
    public projectService: ProjectService,
    public serviceService: ServiceService,
    public teamService: TeamService,
    private dialogRef: MatDialog,
    private addSprint: MatDialog,
    private auth: AuthService,
    private userStore: UserStoreService,
    private sprintService: SprintService,
    public userstoryService: UserstoryService,
    public taskService: TaskService
  ) {}

  ngOnInit(): void {
    this.auth.tokenExpires().subscribe();
    this.getFullName();
    this.getId();
    this.getRole();
    this.getServiceId();
    this.getAll();
    this.add();
    this.getTeams();
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
  getServiceId() {
    this.userStore.getServiceIdFromStore().subscribe((serviceId) => {
      let serviceIdFromToken = this.auth.getServiceIdFromToken();
      this.serviceId = serviceId || serviceIdFromToken;
    });
  }

  getAll() {
    if (this.role === 'Employee') {
      this.projectService.getAll().subscribe((data: Project[]) => {
        this.projects = data.filter(
          (item) => item.projectLeaderId === this.userId
        );
        this.filteredByState = data.filter(
          (item) => item.projectLeaderId === this.userId
        );
      });
    } else if (this.role === 'serviceLeader') {
      this.projectService.getAll().subscribe((data: Project[]) => {
        this.projects = data.filter(
          (item) => item.fk_ServiceId === this.serviceId
        );
        this.filteredByState = data.filter(
          (item) => item.fk_ServiceId === this.serviceId
        );
      });
    }
    if (this.role === 'Admin') {
      this.projectService.getAll().subscribe((data: Project[]) => {
        this.projects = data;
        this.filteredByState = data;
      });
    }
  }

  allProjects() {
    this.filteredByState = this.projects;
  }

  add() {
    this.addForm = new FormGroup({
      name: new FormControl('', [Validators.required]),
      clientName: new FormControl('', [Validators.required]),
      days: new FormControl('', [Validators.required]),
      hours: new FormControl('', [Validators.required]),
      description: new FormControl('', [Validators.required]),
      service: new FormControl('', [Validators.required]),
      team: new FormControl('', [Validators.required]),
    });
  }

  get f() {
    return this.addForm.controls;
  }

  filterByState(state: any) {
    this.filteredByState = this.projects;

    if (state.target.value == 4) {
    } else {
      this.filteredByState = this.projects.filter(
        (item) => item.projectState == state.target.value
      );
    }
  }
  getTeams() {
    this.teamService.getAll().subscribe((data: Team[]) => {
      this.teams = data.filter((item) => item.serviceId === this.serviceId);
    });
  }

  estimatedDurationConversion(ed: number): string {
    var days, hours: Number;
    days = Math.floor(ed / 24);
    hours = ed % 24;

    return days + ' d ' + hours + ' h';
  }

  addProject() {
    this.addSprint.open(AddProjectComponent, {
      width: '800px',
      maxHeight: '90vh',
      id: 'addProject',
      data: this.serviceId,
    });
  }
  editDialog(project: Project) {
    this.dialogRef.open(EditProjectComponent, {
      data: project,
      width: '800px',
      maxHeight: '90vh',
      id: 'editProject',
    });
  }
  async deleteProject(project: Project) {
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
        text: 'Once deleted,you will not be able to recover this project!',
        showCancelButton: true,
        confirmButtonText: 'Ok',
        cancelButtonText: 'Cancel',
        reverseButtons: false,
      })
      .then((result) => {
        if (result.value) {
          this.projectService.delete(project.id).subscribe((res) => {
            this.projects = this.projects.filter(
              (item) => item.id !== project.id
            );
            project.sprints.forEach((sprint) => {
              this.sprintService.delete(sprint.id).subscribe();
            });
            this.getAll();
            this.userstoryService
              .getUserStoriesByProjectId(project.id)
              .subscribe((res: UserStoryDto[]) => {
                res.forEach((userStory) => {
                  this.userstoryService.delete(userStory.id).subscribe();
                  this.taskService
                    .getTasksByUserStoryId(userStory.id)
                    .subscribe((res: Task[]) => {
                      res.forEach((task) => {
                        this.taskService.delete(task.id).subscribe();
                      });
                    });
                });
              });
          });

          return;
        }
      });
  }
  moreDetails(project: Project) {
    this.dialogRef.open(ProjectDetailsComponent, {
      data: project,
      width: '800px',
      maxHeight: '90vh',
      id: 'projectDetails',
    });
  }
  getDateDiff(startDate: Date, endDate: Date): string {
    var std = new Date(startDate);
    var end = new Date(endDate);
    var diff = end.getTime() - std.getTime() + 3600000;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return days + ' days and ' + hours + ' hours';
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
