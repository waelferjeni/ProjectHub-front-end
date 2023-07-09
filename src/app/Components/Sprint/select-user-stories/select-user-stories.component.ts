import { Component, Inject, OnInit } from '@angular/core';
import { Validators } from '@angular/forms';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgToastService } from 'ng-angular-popup';
import { Sprint } from 'src/app/Interfaces/Sprint';
import { TeamUser } from 'src/app/Interfaces/TeamUser';
import { UserStory } from 'src/app/Interfaces/UserStory';
import { UserStoryDto } from 'src/app/Interfaces/userStoryDto';
import { SprintService } from 'src/app/Services/sprint.service';
import { UserstoryService } from 'src/app/Services/userstory.service';
import { TYPE } from 'src/assets/values.constants';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-select-user-stories',
  templateUrl: './select-user-stories.component.html',
  styleUrls: ['./select-user-stories.component.css'],
})
export class SelectUserStoriesComponent implements OnInit {
  userStories: UserStoryDto[] = [];
  userstorySelected: UserStoryDto[] = [];
  checkDuration: boolean = false;
  constructor(
    private sprintService: SprintService,
    public userstoryService: UserstoryService,
    private dialogRef: MatDialog,
    @Inject(MAT_DIALOG_DATA) public sprint: Sprint
  ) {}
  ngOnInit(): void {
    this.getUserStories();
  }
  getUserStories() {
    this.userstoryService
      .getUserStoriesByProjectId(this.sprint.projectId)
      .subscribe((res: UserStoryDto[]) => {
        this.userStories = res.filter(
          (item) => item.sprintId === '00000000-0000-0000-0000-000000000000'
        );
      });
  }
  selectUserStory(event: any, userStory: UserStoryDto) {
    if (event.target.checked) {
      if (this.sprint.durationAvailable >= userStory.estimatedDuration) {
        this.sprint.durationAvailable =
          this.sprint.durationAvailable - userStory.estimatedDuration;
        this.userstorySelected.push(userStory);
      } else {
        this.checkDuration = true;
        this.sprint.durationAvailable =
          this.sprint.durationAvailable - userStory.estimatedDuration;
        Swal.fire({
          toast: true,
          position: 'top',
          showConfirmButton: false,
          icon: TYPE.WARNING,
          timerProgressBar: false,
          timer: 5000,
          title: 'Sprint duration is not enough to add this user story',
        });
      }
    } else {
      if (this.sprint.durationAvailable < 0) {
        this.checkDuration = false;
      }
      this.sprint.durationAvailable =
        this.sprint.durationAvailable + userStory.estimatedDuration;
      this.userstorySelected = this.userstorySelected.filter(
        (item) => item.id !== userStory.id
      );
    }
  }
  onAssign() {
    if (this.userstorySelected.length != 0) {
      this.sprintService.update(this.sprint).subscribe();
      this.userstorySelected.forEach((userStory) => {
        userStory.sprintId = this.sprint.id;
        this.userstoryService.update(userStory).subscribe({
          next: (res) => {
            Swal.fire({
              toast: true,
              position: 'top',
              showConfirmButton: false,
              icon: TYPE.SUCCESS,
              timerProgressBar: false,
              timer: 5000,
              title: 'Sprint added successfully',
            });
            let dialog = this.dialogRef.getDialogById('selectUserStories');
            dialog?.close();
          },
          error: (err) => {
            Swal.fire({
              toast: true,
              position: 'top',
              showConfirmButton: false,
              icon: TYPE.ERROR,
              timerProgressBar: false,
              timer: 5000,
              title: 'Some error occured',
            });
          },
        });
      });
    } else {
      Swal.fire({
        toast: true,
        position: 'top',
        showConfirmButton: false,
        icon: TYPE.SUCCESS,
        timerProgressBar: false,
        timer: 5000,
        title: 'Sprint added successfully',
      });
      this.close();
    }
  }
  close() {
    const dialog = this.dialogRef.getDialogById('selectUserStories');
    dialog?.close();
  }
}
