import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { NgToastService } from 'ng-angular-popup';
import { Task } from 'src/app/Interfaces/Task';
import { UserStory } from 'src/app/Interfaces/UserStory';
import { UserStoryDto } from 'src/app/Interfaces/userStoryDto';
import { AuthService } from 'src/app/Services/auth.service';
import { UserStoreService } from 'src/app/Services/user-store.service';
import { UserstoryService } from 'src/app/Services/userstory.service';
import { TYPE } from 'src/assets/values.constants';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-userstory-details',
  templateUrl: './userstory-details.component.html',
  styleUrls: ['./userstory-details.component.css'],
})
export class UserstoryDetailsComponent implements OnInit {
  public role: string = '';
  public isFinished: boolean = false;

  constructor(
    public userstoryService: UserstoryService,
    private dialogRef: MatDialog,
    private auth: AuthService,
    private userStore: UserStoreService,
    @Inject(MAT_DIALOG_DATA) public userstory: UserStory
  ) {}

  ngOnInit(): void {
    this.getRole();
    this.checkUserStories();
  }

  estimatedDurationConversion(ed: number): string {
    var days, hours: Number;
    days = Math.floor(ed / 24);
    hours = ed % 24;

    return days + ' d ' + hours + ' h';
  }
  getDate(date: Date) {
    date.getDate();
  }
  getRole() {
    this.userStore.getRoleFromStore().subscribe((role) => {
      let userRoleFromToken = this.auth.getRoleFromToken();
      this.role = role || userRoleFromToken;
    });
  }
  checkTaskState(task: Task) {
    if (task.taskState == 4) {
      return true;
    } else {
      return false;
    }
  }
  validate() {
    let userStoryValidated: UserStoryDto = {} as UserStoryDto;
    userStoryValidated.id = this.userstory.id;
    userStoryValidated.name = this.userstory.name;
    userStoryValidated.description = this.userstory.description;
    userStoryValidated.userStoryState = this.userstory.userStoryState;
    userStoryValidated.estimatedDuration = this.userstory.estimatedDuration;
    userStoryValidated.projectId = this.userstory.projectId;
    userStoryValidated.sprintId = this.userstory.sprintId;
    userStoryValidated.tasks = this.userstory.tasks;
    userStoryValidated.userStoryState = 2;
    this.userstoryService
      .update(userStoryValidated)
      .subscribe((res: UserStory) => {
        this.userstory.userStoryState = 2;
        Swal.fire({
          toast: true,
          position: 'top',
          showConfirmButton: false,
          icon: TYPE.SUCCESS,
          timerProgressBar: false,
          timer: 5000,
          title: 'UserStory Validated successfully',
        });
      });
  }
  checkUserStories() {
    let check: number = 0;
    this.userstory.tasks.forEach((element) => {
      if (element.taskState != 4) {
        check = check + 1;
      }
    });
    if (check == 0 && this.userstory.tasks.length > 0) {
      this.isFinished = true;
    } else {
      this.isFinished = false;
    }
  }
  close() {
    let dialog = this.dialogRef.getDialogById('userStoryDetails');
    dialog?.close();
  }
}
