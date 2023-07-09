import { Component, OnInit } from '@angular/core';
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { User } from 'src/app/Interfaces/user';
import { Task } from 'src/app/Interfaces/Task';
import { TaskService } from 'src/app/Services/task.service';
import { AuthService } from 'src/app/Services/auth.service';
import { UserStoreService } from 'src/app/Services/user-store.service';
import { ProjectService } from 'src/app/Services/project.service';
import { Project } from 'src/app/Interfaces/Project';
import { Team } from 'src/app/Interfaces/Team';
import { TeamService } from 'src/app/Services/team.service';
import { TeamUserService } from 'src/app/Services/teamuser.service';
import { NgToastService } from 'ng-angular-popup';
import { TeamUser } from 'src/app/Interfaces/TeamUser';
import Swal from 'sweetalert2';
import { TYPE } from 'src/assets/values.constants';

@Component({
  selector: 'app-time-sheet',
  templateUrl: './time-sheet.component.html',
  styleUrls: ['./time-sheet.component.css'],
})
export class TimeSheetComponent implements OnInit {
  user: User[] = [];
  tasks: Task[] = [];
  tasksBackUp: Task[] = [];
  pending: Task[] = [];
  todo: Task[] = [];
  inprogress: Task[] = [];
  done: Task[] = [];
  Projects: Project[] = [];
  teams: TeamUser[] = [];
  public userId: string = '';
  public fullName: string = '';
  public role: string = '';
  public serviceId: string = '';
  constructor(
    public projectService: ProjectService,
    private taskService: TaskService,
    public teamservice: TeamService,
    public teamuserservice: TeamUserService,
    private auth: AuthService,
    private userStore: UserStoreService,
    private toast: NgToastService
  ) {}

  ngOnInit(): void {
    this.getFullName();
    this.getId();
    this.getRole();
    this.getServiceId();
    this.getMyTeams();
    this.auth.tokenExpires().subscribe();
    this.getAllProjects();
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
  getMyTeams() {
    this.teamuserservice
      .getTeamUsersByUserId(this.userId)
      .subscribe((data: TeamUser[]) => {
        this.teams = data;
      });
  }
  getAllProjects() {
    this.projectService.getAll().subscribe((data: Project[]) => {
      this.Projects = data.filter(
        (item) =>
          item.fk_ServiceId === this.serviceId &&
          item.projectState === 1 &&
          this.checkProject(item) == true
      );
    });
  }
  selectProject(project: any) {
    this.tasks = [];
    this.taskService.getAll().subscribe((res: Task[]) => {
      // this.tasks = res.filter(
      //   (item) => item.projectId === project.target.value
      // );
      console.log(res);
      this.tasksBackUp = res
        .filter(
          (item) =>
            (item.projectId === project.target.value &&
              item.taskState == 0 &&
              item.userStory.userStoryState == 1) ||
            (item.employeeId === this.userId &&
              item.projectId === project.target.value)
        )
        .sort();
      console.log(this.tasksBackUp);
      this.getTasks(this.tasksBackUp);
    });
  }
  checkProject(project: Project): boolean {
    let isFound: boolean = false;
    this.teams.forEach((element) => {
      if (element.teamId == project.teamId) {
        isFound = true;
      }
    });
    return isFound;
  }
  getTasks(tasks: Task[]) {
    this.pending = [];
    this.todo = [];
    this.inprogress = [];
    this.done = [];

    tasks.forEach((task) => {
      switch (task.taskState) {
        case 0: {
          this.pending.push(task);
          break;
        }
        case 1: {
          this.todo.push(task);
          break;
        }
        case 2: {
          this.inprogress.push(task);
          break;
        }
        case 3: {
          this.done.push(task);
          break;
        }
      }
    });
  }
  drop(event: CdkDragDrop<Task[]>, n: number) {
    let task: Task = {} as Task;
    if (event.previousContainer === event.container) {
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
      task = event.container.data[event.currentIndex];
      task.taskState = n;
      task.employeeId = this.userId;
      this.taskService.update(task).subscribe();
    }
  }
  Details(item: any) {
    //alert(JSON.stringify(item));
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
