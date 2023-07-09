import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Project } from 'src/app/Interfaces/Project';
import { Task } from 'src/app/Interfaces/Task';
import { UserStory } from 'src/app/Interfaces/UserStory';
import { TaskService } from 'src/app/Services/task.service';
import { MatDialog } from '@angular/material/dialog';
import { EdittaskComponent } from '../edittask/edittask.component';
import { AuthService } from 'src/app/Services/auth.service';
import { UserStoreService } from 'src/app/Services/user-store.service';
import { ProjectService } from 'src/app/Services/project.service';
import { UserstoryService } from 'src/app/Services/userstory.service';
import { TaskDetailsComponent } from '../task-details/task-details.component';
import { EditProjectComponent } from '../../Project/edit-project/edit-project.component';
import { ProjectDetailsComponent } from '../../Project/project-details/project-details.component';
import Swal from 'sweetalert2';
import { TYPE } from 'src/assets/values.constants';
import { SprintDto } from 'src/app/Interfaces/SprintDto';
import { SprintService } from 'src/app/Services/sprint.service';
import { TaskDto } from 'src/app/Interfaces/TaskDto';
import { User } from 'src/app/Interfaces/user';
@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.css'],
})
export class TaskListComponent implements OnInit {
  addTask!: FormGroup;
  id!: string;
  formModal: any;
  projects: Project[] = [];
  Projects: Project[] = [];
  userStories: UserStory[] = [];
  tasks: TaskDto[] = [];
  tasksBackUp: TaskDto[] = [];
  task: Task = {} as Task;
  userStory: UserStory = {} as UserStory;
  addProject!: FormGroup;
  project: Project = {} as Project;
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
    private dialogRef: MatDialog,
    private sprintService: SprintService
  ) {}

  ngOnInit(): void {
    this.getFullName();
    this.getId();
    this.getRole();
    this.getServiceId();
    this.auth.tokenExpires().subscribe();
    this.getAllProjects();
    this.addForm();
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
  addForm() {
    this.addTask = new FormGroup({
      taskName: new FormControl('', [Validators.required]),
      description: new FormControl('', [Validators.required]),
      hours: new FormControl('', [
        Validators.required,
        Validators.max(23),
        Validators.min(0),
      ]),
      days: new FormControl('', [Validators.required, Validators.min(0)]),
      userStory: new FormControl('', [Validators.required]),
      project: new FormControl('', [Validators.required]),
      complexity: new FormControl('', [Validators.required]),
    });
  }
  add() {
    this.addProject = new FormGroup({
      name: new FormControl('', [Validators.required]),
      clientName: new FormControl('', [Validators.required]),
      days: new FormControl('', [Validators.required, Validators.min(0)]),
      hours: new FormControl('', [
        Validators.required,
        Validators.max(23),
        Validators.min(0),
      ]),
      description: new FormControl('', [Validators.required]),
    });
  }
  get f() {
    return this.addTask.controls;
  }
  get f2() {
    return this.addProject.controls;
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
    } else if (this.role === 'Admin') {
      this.projectService.getAll().subscribe((data: Project[]) => {
        this.Projects = data;
      });
    }
  }
  selectProject(project: any) {
    let res: TaskDto[] = [];
    this.tasksBackUp = [];
    this.tasks = [];
    this.taskService.getAll().subscribe((res: TaskDto[]) => {
      // this.tasks = res.filter(
      //   (item) => item.projectId === project.target.value
      // );
      res = res.filter((task) => task.projectId === project.target.value);
      res.forEach((element) => {
        this.auth.getUser(element.employeeId).subscribe((res: User) => {
          element.employee = res;
          this.tasksBackUp.push(element);
          console.log(this.tasksBackUp);
        });
      });
      //this.tasks = this.tasksBackUp;
      // this.tasksBackUp = res.filter(
      //   (item) => item.projectId === project.target.value
      // );
    });
  }
  selectTaskState(state: any) {
    //this.tasks = [];
    this.tasks = this.tasksBackUp.filter(
      (item) => item.taskState == state.target.value
    );
    if (state.target.value == 5) {
      this.tasks = this.tasksBackUp;
    }
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
  onSubmit() {
    let task: Task = {} as Task;
    if (
      this.addTask.value.days * 24 + this.addTask.value.hours >
      this.userStory.durationAvailable
    ) {
      Swal.fire({
        toast: true,
        position: 'top',
        showConfirmButton: false,
        icon: TYPE.WARNING,
        timerProgressBar: false,
        timer: 5000,
        title: 'UserStory is not enough to add this task',
      });
    } else if (this.addTask.invalid) {
      Swal.fire({
        toast: true,
        position: 'top',
        showConfirmButton: false,
        icon: TYPE.WARNING,
        timerProgressBar: false,
        timer: 5000,
        title: 'Please fill all the fields',
      });
    } else {
      let startDate: Date = new Date();
      startDate.setHours(startDate.getHours() + 1);
      task.name = this.addTask.value.taskName;
      task.complexity = this.addTask.value.complexity;
      task.startDate = startDate;
      task.taskState = 0;
      task.estimatedDuration =
        this.addTask.value.days * 24 + this.addTask.value.hours;
      task.endDate = this.endDate(task.estimatedDuration);
      task.description = this.addTask.value.description;
      task.projectId = this.addTask.value.project;
      task.userStoryId = this.userStory.id;
      task.sprintId = this.userStory.sprintId;
      this.taskService.create(task).subscribe({
        next: (res: TaskDto) => {
          let task: TaskDto = {} as TaskDto;
          this.auth.getUser(res.employeeId).subscribe((res: User) => {
            task.employee = res;
            this.tasks.push(task);
          });
          this.userStory.durationAvailable =
            this.userStory.durationAvailable - res.estimatedDuration;
          this.userstoryService.update(this.userStory).subscribe();
        },
      });
      Swal.fire({
        toast: true,
        position: 'top',
        showConfirmButton: false,
        icon: TYPE.SUCCESS,
        timerProgressBar: false,
        timer: 5000,
        title: 'Task added successfully',
      });
      this.resetForms();
    }
  }
  endDate(h: number): Date {
    let dt = new Date();
    dt.setTime(dt.getTime() + h * 60 * 60 * 1000);
    return dt;
  }
  submit() {
    this.project.name = this.addProject.value.name;
    this.project.clientName = this.addProject.value.clientName;
    this.project.description = this.addProject.value.description;
    this.project.fk_ServiceId = this.serviceId;
    this.project.estimatedDuration =
      this.addProject.value.days * 24 + this.addProject.value.hours;
    this.project.endDate = this.endDate(this.project.estimatedDuration + 1);
    this.project.projectState = 1;
    this.project.projectLeaderId = this.userId;
    this.projectService.create(this.project).subscribe({
      next: (res) => {
        this.getAllProjects();
        Swal.fire({
          toast: true,
          position: 'top',
          showConfirmButton: false,
          icon: TYPE.SUCCESS,
          timerProgressBar: false,
          timer: 5000,
          title: 'Task created successfully!!',
        });
      },
      error: (err) => {
        Swal.fire({
          toast: true,
          position: 'top',
          showConfirmButton: false,
          icon: TYPE.ERROR,
          timerProgressBar: false,
          timer: 5000,
          title: 'Some   error occured!!',
        });
      },
    });
  }
  estimatedDurationConversion(ed: number): string {
    var days, hours: Number;
    days = Math.floor(ed / 24);
    hours = ed % 24;

    return days + ' d ' + hours + ' h';
  }
  moreDetails(task: Task) {
    this.dialogRef.open(TaskDetailsComponent, {
      id: 'taskDetails',
      data: task,
      width: '800px',
      maxHeight: '90vh',
    });
  }
  editDialog(task: Task) {
    this.dialogRef.open(EdittaskComponent, {
      id: 'editTask',
      data: task,
      width: '800px',
      maxHeight: '90vh',
    });
  }
  async deleteTask(task: Task) {
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
        text: 'Once deleted,you will not be able to recover this task!',
        showCancelButton: true,
        confirmButtonText: 'Ok',
        cancelButtonText: 'Cancel',
        reverseButtons: false,
      })
      .then((result) => {
        if (result.value) {
          this.taskService.delete(task.id).subscribe((res) => {
            this.userstoryService
              .find(task.userStoryId)
              .subscribe((res: UserStory) => {
                res.durationAvailable =
                  res.durationAvailable + task.estimatedDuration;
                this.userstoryService.update(res).subscribe();
              });
            this.tasks = this.tasks.filter((item) => item.id !== task.id);
          });
          this.sprintService
            .find(task.userStory.sprintId)
            .subscribe((res: SprintDto) => {
              res.durationAvailable =
                res.durationAvailable + task.estimatedDuration;
              this.sprintService.update(res).subscribe();
            });
          return;
        }
      });
  }
  selectState(state: any) {
    this.projectService.getAll().subscribe((data: Project[]) => {
      this.projects = data.filter(
        (item) =>
          item.projectLeaderId === this.userId &&
          item.projectState == state.target.value
      );
    });
  }
  Details(project: Project) {
    this.dialogRef.open(ProjectDetailsComponent, {
      data: project,
      width: '800px',
      maxHeight: '90vh',
      id: 'projectDetails',
    });
  }
  Edit(project: Project) {
    this.dialogRef.open(EditProjectComponent, {
      data: project,
      width: '800px',
      maxHeight: '90vh',
      id: 'editProject',
    });
  }
  async Delete(project: Project) {
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
        text: 'Once deleted,you will not be able to recover this task!',
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
          });
          return;
        }
      });
  }

  resetForms() {
    this.userStories = [];
    this.addTask.reset();
    //this.ngOnInit();
  }
  refresh() {
    this.addTask.reset();
    this.userStories = [];
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
