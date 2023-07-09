import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Project } from 'src/app/Interfaces/Project';
import { Sprint } from 'src/app/Interfaces/Sprint';
import { AuthService } from 'src/app/Services/auth.service';
import { ProjectService } from 'src/app/Services/project.service';
import { UserStoreService } from 'src/app/Services/user-store.service';
import { SprintDetailsComponent } from '../../Sprint/sprint-details/sprint-details.component';
import { TYPE } from 'src/assets/values.constants';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-project-details',
  templateUrl: './project-details.component.html',
  styleUrls: ['./project-details.component.css'],
})
export class ProjectDetailsComponent implements OnInit {
  validationForm!: FormGroup;
  public userId: string = '';
  public fullName: string = '';
  public role: string = '';
  public isFinished: boolean = false;
  constructor(
    public projectService: ProjectService,
    private auth: AuthService,
    private userStore: UserStoreService,
    private dialogRef: MatDialog,
    @Inject(MAT_DIALOG_DATA) public project: Project
  ) {}

  ngOnInit(): void {
    this.auth.tokenExpires().subscribe();
    this.getFullName();
    this.getId();
    this.getRole();
    this.checkSprints();
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
  estimatedDurationConversion(ed: number): string {
    var days, hours: Number;
    days = Math.floor((ed + 1) / 24);
    hours = ed % 24;

    return days + ' d ' + hours + ' h';
  }

  getDate(date: Date) {
    date.getDate();
  }

  getDateDiff(startDate: Date, endDate: Date): string {
    var std = new Date(startDate);
    var end = new Date(endDate);
    var diff = end.getTime() - std.getTime() + 3600000;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return days + ' days and ' + hours + ' hours';
  }
  endDate(h: number): Date {
    let dt = new Date();
    dt.setTime(dt.getTime() + h * 60 * 60 * 1000);
    return dt;
  }
  validate() {
    let endDate: Date = new Date();
    endDate.setHours(endDate.getHours() + 1);
    this.project.projectState = 3;
    this.project.endDate = endDate;
    this.projectService.update(this.project).subscribe((res: any) => {
      Swal.fire({
        toast: true,
        position: 'top',
        showConfirmButton: false,
        icon: TYPE.SUCCESS,
        timerProgressBar: false,
        timer: 5000,
        title: 'Project validated!',
      });
    });
  }

  finish() {
    this.project.projectState = 2;

    this.projectService.update(this.project).subscribe((res: any) => {
      Swal.fire({
        toast: true,
        position: 'top',
        showConfirmButton: false,
        icon: TYPE.SUCCESS,
        timerProgressBar: false,
        timer: 5000,
        title: 'Project finished!',
      });
    });
  }
  start() {
    let startDate: Date = new Date();
    startDate.setHours(startDate.getHours() + 1);
    this.project.startDate = startDate;
    this.project.endDate = this.endDate(this.project.estimatedDuration);
    this.project.projectState = 1;
    this.projectService.update(this.project).subscribe((res: any) => {
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
  }
  sprintDetails(sprint: Sprint) {
    this.dialogRef.open(SprintDetailsComponent, {
      data: sprint,
      width: '800px',
      maxHeight: '90vh',
      id: 'sprintDetails',
    });
  }
  checkSprints() {
    let check: number = 0;
    this.project.sprints.forEach((element) => {
      if (element.sprintState != 2) {
        check = check + 1;
      }
    });
    if (check == 0 && this.project.sprints.length > 0) {
      this.isFinished = true;
    } else {
      this.isFinished = false;
    }
  }
  checkSprintState(sprint: Sprint): boolean {
    if (sprint.sprintState == 2) {
      return true;
    } else {
      return false;
    }
  }
  close() {
    const dialog = this.dialogRef.getDialogById('projectDetails');
    dialog?.close();
  }
}
