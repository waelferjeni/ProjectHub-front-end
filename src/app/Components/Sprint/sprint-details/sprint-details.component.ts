import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { Sprint } from 'src/app/Interfaces/Sprint';
import { UserStory } from 'src/app/Interfaces/UserStory';
import { AuthService } from 'src/app/Services/auth.service';
import { SprintService } from 'src/app/Services/sprint.service';
import { UserStoreService } from 'src/app/Services/user-store.service';
import { UserstoryDetailsComponent } from '../../UserStory/userstory-details/userstory-details.component';
import { TYPE } from 'src/assets/values.constants';
import Swal from 'sweetalert2';
import { UserstoryService } from 'src/app/Services/userstory.service';

@Component({
  selector: 'app-sprint-details',
  templateUrl: './sprint-details.component.html',
  styleUrls: ['./sprint-details.component.css'],
})
export class SprintDetailsComponent implements OnInit {
  public role: string = '';
  public isFinished: boolean = false;
  constructor(
    private userStore: UserStoreService,
    private auth: AuthService,
    public sprintService: SprintService,
    private dialogRef: MatDialog,
    public userstoryService: UserstoryService,
    @Inject(MAT_DIALOG_DATA) public sprint: Sprint
  ) {}
  ngOnInit(): void {
    this.getRole();
    this.checkUserStories();
  }
  getRole() {
    this.userStore.getRoleFromStore().subscribe((role) => {
      let userRoleFromToken = this.auth.getRoleFromToken();
      this.role = role || userRoleFromToken;
    });
  }
  estimatedDurationConversionDays(ed: number): number {
    var days, hours: number;
    days = Math.floor(ed / 24);
    hours = ed % 24;

    return days;
  }
  estimatedDurationConversionHours(ed: number): number {
    var days, hours: number;
    days = Math.floor(ed / 24);
    hours = ed % 24;
    return hours;
  }
  start() {
    let startDate: Date = new Date();
    startDate.setHours(startDate.getHours() + 1);
    this.sprint.startDate = startDate;
    this.sprint.endDate = this.endDate(this.sprint.estimatedDuration);
    this.sprint.sprintState = 1;
    this.sprintService.update(this.sprint).subscribe((res: any) => {
      Swal.fire({
        toast: true,
        position: 'top',
        showConfirmButton: false,
        icon: TYPE.SUCCESS,
        timerProgressBar: false,
        timer: 5000,
        title: 'Project started!',
      });
    });
    this.sprint.userStories.forEach((element) => {
      element.userStoryState = 1;
      this.userstoryService.update(element).subscribe();
    });
  }
  finishSprint(sprint: Sprint) {
    let endDate: Date = new Date();
    endDate.setHours(endDate.getHours() + 1);
    sprint.sprintState = 2;
    sprint.endDate = endDate;
    this.sprintService.update(sprint).subscribe();
    Swal.fire({
      toast: true,
      position: 'top',
      showConfirmButton: false,
      icon: TYPE.SUCCESS,
      timerProgressBar: false,
      timer: 5000,
      title: 'Sprint finished successfully',
    });
  }

  checkUserStories() {
    let check: number = 0;
    this.sprint.userStories.forEach((element) => {
      if (element.userStoryState != 2) {
        check = check + 1;
      }
    });
    if (check == 0 && this.sprint.userStories.length > 0) {
      this.isFinished = true;
    } else {
      this.isFinished = false;
    }
  }
  checkUserStoryState(userStory: UserStory) {
    if (userStory.userStoryState == 2) {
      return true;
    } else {
      return false;
    }
  }
  endDate(h: number): Date {
    let dt = new Date();
    dt.setTime(dt.getTime() + h * 60 * 60 * 1000);
    return dt;
  }

  close() {
    const dialog = this.dialogRef.getDialogById('sprintDetails');
    dialog?.close();
  }
}
