import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { Sprint } from 'src/app/Interfaces/Sprint';
import { Task } from 'src/app/Interfaces/Task';
import { TaskDto } from 'src/app/Interfaces/TaskDto';
import { AuthService } from 'src/app/Services/auth.service';
import { TaskService } from 'src/app/Services/task.service';
import { UserStoreService } from 'src/app/Services/user-store.service';
import { TYPE } from 'src/assets/values.constants';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-task-details',
  templateUrl: './task-details.component.html',
  styleUrls: ['./task-details.component.css'],
})
export class TaskDetailsComponent implements OnInit {
  public role: string = '';
  constructor(
    private userStore: UserStoreService,
    private auth: AuthService,
    public taskService: TaskService,
    private dialogRef: MatDialog,
    @Inject(MAT_DIALOG_DATA) public task: TaskDto
  ) {}
  ngOnInit(): void {
    this.getRole();
  }
  estimatedDurationConversion(ed: number): string {
    var days, hours: Number;
    days = Math.floor(ed / 24);
    hours = ed % 24;

    return days + ' d ' + hours + ' h';
  }
  getRole() {
    this.userStore.getRoleFromStore().subscribe((role) => {
      let userRoleFromToken = this.auth.getRoleFromToken();
      this.role = role || userRoleFromToken;
    });
  }
  Validate() {
    let endDate: Date = new Date();
    endDate.setHours(endDate.getHours() + 1);
    this.task.taskState = 4;
    this.task.endDate = endDate;
    this.taskService.update(this.task).subscribe((res) => {
      Swal.fire({
        toast: true,
        position: 'top',
        showConfirmButton: false,
        icon: TYPE.SUCCESS,
        timerProgressBar: false,
        timer: 5000,
        title: 'Task Validated successfully',
      });
    });
  }
  close() {
    let dialog = this.dialogRef.getDialogById('taskDetails');
    dialog?.close();
  }
}
