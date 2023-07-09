import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Project } from 'src/app/Interfaces/Project';
import { Sprint } from 'src/app/Interfaces/Sprint';
import { UserStory } from 'src/app/Interfaces/UserStory';
import { ProjectService } from 'src/app/Services/project.service';
import { ServiceService } from 'src/app/Services/service.service';
import { UserstoryService } from 'src/app/Services/userstory.service';
import { UserstoryDetailsComponent } from '../userstory-details/userstory-details.component';
import { EditUserStoryComponent } from '../edit-user-story/edit-user-story.component';
import { Observable } from 'rxjs/internal/Observable';
import { lastValueFrom } from 'rxjs';
import { AuthService } from 'src/app/Services/auth.service';
import { UserStoreService } from 'src/app/Services/user-store.service';
import { NgToastService } from 'ng-angular-popup';
import Swal from 'sweetalert2';
import { TYPE } from 'src/assets/values.constants';
import { TaskService } from 'src/app/Services/task.service';
import { Task } from 'src/app/Interfaces/Task';
import { SprintService } from 'src/app/Services/sprint.service';
import { SprintDto } from 'src/app/Interfaces/SprintDto';

@Component({
  selector: 'app-user-story-list',
  templateUrl: './user-story-list.component.html',
  styleUrls: ['./user-story-list.component.css'],
})
export class UserStoryListComponent implements OnInit {
  userStory: UserStory = {} as UserStory;
  addForm!: FormGroup;
  editForm!: FormGroup;
  userStories: UserStory[] = [];
  proj!: Project;
  public userId: string = '';
  public fullName: string = '';
  public role: string = '';
  public serviceId: string = '';
  Projects: Project[] = [];

  constructor(
    public projectService: ProjectService,
    public userstoryService: UserstoryService,
    private dialogRef: MatDialog,
    private auth: AuthService,
    private userStore: UserStoreService,
    public taskService: TaskService,
    private sprintService: SprintService
  ) {}

  ngOnInit(): void {
    this.getFullName();
    this.getId();
    this.getRole();
    this.getServiceId();
    this.auth.tokenExpires().subscribe();
    this.getAllProjects();
    this.add();
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
  getAllProjects() {
    if (this.role === 'serviceLeader') {
      this.projectService.getAll().subscribe((data: Project[]) => {
        this.Projects = data.filter(
          (item) =>
            item.fk_ServiceId === this.serviceId && item.projectState !== 3
        );
      });
    } else if (this.role === 'Employee') {
      this.projectService.getAll().subscribe((data: Project[]) => {
        this.Projects = data.filter(
          (item) =>
            item.projectLeaderId === this.userId && item.projectState !== 3
        );
      });
    } else if (this.role === 'Admin') {
      this.projectService.getAll().subscribe((data: Project[]) => {
        this.Projects = data.filter((item) => item.projectState !== 3);
      });
    }
  }
  selectProject(project: any) {
    this.userStories = [];
    this.userstoryService
      .getUserStoriesByProjectId(project.target.value)
      .subscribe((res: UserStory[]) => {
        res.forEach((element) => {
          this.projectService
            .find(element.projectId)
            .subscribe((data: Project) => {
              element.project = data;
              this.userStories.push(element);
            });
        });
      });
  }
  add() {
    this.addForm = new FormGroup({
      name: new FormControl('', [Validators.required]),
      days: new FormControl('', [Validators.required, Validators.min(0)]),
      hours: new FormControl('', [
        Validators.required,
        Validators.max(23),
        Validators.min(0),
      ]),
      description: new FormControl('', [Validators.required]),
      project: new FormControl('', [Validators.required]),
    });
  }

  get f() {
    return this.addForm.controls;
  }

  estimatedDurationConversion(ed: number): string {
    var days, hours: Number;
    days = Math.floor(ed / 24);
    hours = ed % 24;

    return days + ' d ' + hours + ' h';
  }
  getProjectNameById(id: string): Project {
    this.projectService.find(id).subscribe((data: Project) => {
      this.proj = data;
    });

    return this.proj;
  }

  onSubmit() {
    this.userStory.name = this.addForm.value.name;
    this.userStory.description = this.addForm.value.description;
    this.userStory.projectId = this.addForm.value.project;
    this.userStory.userStoryState = 0;
    this.userStory.estimatedDuration =
      this.addForm.value.days * 24 + this.addForm.value.hours;
    this.userStory.durationAvailable = this.userStory.estimatedDuration;
    this.userStory.sprintId = '00000000-0000-0000-0000-000000000000';
    this.userstoryService.create(this.userStory).subscribe({
      next: (res: UserStory) => {
        Swal.fire({
          toast: true,
          position: 'top',
          showConfirmButton: false,
          icon: TYPE.SUCCESS,
          timerProgressBar: false,
          timer: 5000,
          title: 'UserStory added successfully',
        });
        let dialog = this.dialogRef.getDialogById('addProject');
        dialog?.close();
        this.addForm.reset();
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

  moreDetails(userstory: UserStory) {
    this.dialogRef.open(UserstoryDetailsComponent, {
      data: userstory,
      width: '800px',
      maxHeight: '90vh',
      id: 'userStoryDetails',
    });
  }

  editDialog(userstory: UserStory) {
    this.dialogRef.open(EditUserStoryComponent, {
      data: userstory,
      width: '800px',
      maxHeight: '90vh',
      id: 'editUserstory',
    });
  }
  async deleteUserStory(userStory: UserStory) {
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
        text: 'Once deleted,you will not be able to recover this user story!',
        showCancelButton: true,
        confirmButtonText: 'Ok',
        cancelButtonText: 'Cancel',
        reverseButtons: false,
      })
      .then((result) => {
        if (result.value) {
          this.userstoryService.delete(userStory.id).subscribe((res) => {
            this.userStories = this.userStories.filter(
              (item) => item.id !== userStory.id
            );
          });
          this.taskService
            .getTasksByUserStoryId(userStory.id)
            .subscribe((res: Task[]) => {
              res.forEach((task) => {
                this.taskService.delete(task.id).subscribe();
              });
            });
          this.sprintService
            .find(userStory.sprintId)
            .subscribe((res: SprintDto) => {
              res.durationAvailable =
                res.durationAvailable + userStory.estimatedDuration;
              this.sprintService.update(res).subscribe();
            });

          return;
        }
      });
  }
  resetForms() {
    this.addForm.reset();
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
