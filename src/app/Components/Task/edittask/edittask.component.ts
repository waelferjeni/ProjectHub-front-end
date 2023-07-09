import { Component, OnInit, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { NgToastService } from 'ng-angular-popup';
import { Project } from 'src/app/Interfaces/Project';
import { Task } from 'src/app/Interfaces/Task';
import { UserStory } from 'src/app/Interfaces/UserStory';
import { AuthService } from 'src/app/Services/auth.service';
import { ProjectService } from 'src/app/Services/project.service';
import { TaskService } from 'src/app/Services/task.service';
import { UserStoreService } from 'src/app/Services/user-store.service';
import { UserstoryService } from 'src/app/Services/userstory.service';
import { TYPE } from 'src/assets/values.constants';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-edittask',
  templateUrl: './edittask.component.html',
  styleUrls: ['./edittask.component.css'],
})
export class EdittaskComponent implements OnInit {
  Projects: Project[] = [];
  userStories: UserStory[] = [];
  userStory: UserStory = {} as UserStory;
  public userId: string = '';
  public fullName: string = '';
  public role: string = '';
  public serviceId: string = '';
  constructor(
    public taskService: TaskService,
    public projectService: ProjectService,
    private userStore: UserStoreService,
    public userstoryService: UserstoryService,
    private auth: AuthService,
    private matDialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public task: Task
  ) {}
  taskEdited!: Task;
  editTask!: FormGroup;
  ngOnInit(): void {
    this.getFullName();
    this.getId();
    this.getRole();
    this.getServiceId();
    this.auth.tokenExpires().subscribe();
    this.getAllProjects();
    this.edit();
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
  edit() {
    this.editTask = new FormGroup({
      taskName: new FormControl('', [Validators.required]),
      description: new FormControl('', [Validators.required]),
      taskState: new FormControl('', [Validators.required]),
    });
    this.editTask.controls['taskName'].setValue(this.task.name);
    this.editTask.controls['taskState'].setValue(this.task.taskState);
    this.getUserStories(this.task.projectId);
    this.editTask.controls['description'].setValue(this.task.description);
  }
  get f() {
    return this.editTask.controls;
  }
  getAllProjects() {
    if (this.role === 'serviceLeader') {
      this.projectService.getAll().subscribe((data: Project[]) => {
        this.Projects = data.filter(
          (item) => item.fk_ServiceId === this.serviceId
        );
      });
    } else if (this.role === 'Employee') {
      this.projectService.getAll().subscribe((data: Project[]) => {
        this.Projects = data.filter(
          (item) =>
            item.projectLeaderId === this.userId && item.projectState !== 3
        );
      });
    }
  }
  getUserStories(id: string) {
    this.userStories = [];
    this.userstoryService
      .getUserStoriesByProjectId(id)
      .subscribe((res: UserStory[]) => {
        this.userStories = res.filter((item) => item.durationAvailable > 0);
      });
  }
  chooseProject(project: any) {
    this.userStories = [];
    this.userstoryService
      .getUserStoriesByProjectId(project.target.value)
      .subscribe((res: UserStory[]) => {
        this.userStories = res.filter((item) => item.durationAvailable > 0);
      });
  }
  chooseUserStory(userStory: any) {
    this.userstoryService
      .find(userStory.target.value)
      .subscribe((res: UserStory) => {
        this.userStory = res;
      });
  }
  getDays(d: number): number {
    return Math.floor(d / 24);
  }

  getHours(d: number): number {
    return d % 24;
  }
  submit() {
    let task: Task = {} as Task;
    task.id = this.task.id;
    task.name = this.editTask.value.taskName;
    task.estimatedDuration = this.task.estimatedDuration;
    task.description = this.editTask.value.description;
    task.projectId = this.task.projectId;
    task.userStoryId = this.task.userStoryId;
    task.sprintId = this.task.sprintId;
    task.startDate = this.task.startDate;
    task.endDate = this.task.endDate;
    task.taskState = this.editTask.value.taskState;
    this.taskService.update(task).subscribe({
      next: (res: any) => {
        Swal.fire({
          toast: true,
          position: 'top',
          showConfirmButton: false,
          icon: TYPE.SUCCESS,
          timerProgressBar: false,
          timer: 5000,
          title: 'Task edited successfully!!',
        });
      },
    });
    this.refresh();
  }
  refresh() {
    const dialog = this.matDialog.getDialogById('editTask');
    dialog?.close();
  }
}
