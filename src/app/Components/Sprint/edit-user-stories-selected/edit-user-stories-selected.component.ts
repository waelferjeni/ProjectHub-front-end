import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgToastService } from 'ng-angular-popup';
import { Sprint } from 'src/app/Interfaces/Sprint';
import { UserStoryDto } from 'src/app/Interfaces/userStoryDto';
import { SprintService } from 'src/app/Services/sprint.service';
import { UserstoryService } from 'src/app/Services/userstory.service';
import { TYPE } from 'src/assets/values.constants';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-edit-user-stories-selected',
  templateUrl: './edit-user-stories-selected.component.html',
  styleUrls: ['./edit-user-stories-selected.component.css'],
})
export class EditUserStoriesSelectedComponent implements OnInit {
  userStoriesSelected: UserStoryDto[] = [];
  userstorySelected: UserStoryDto[] = [];
  userStoriesToSelect: UserStoryDto[] = [];
  checkDuration: boolean = false;
  constructor(
    private sprintService: SprintService,
    public userstoryService: UserstoryService,
    private dialogRef: MatDialog,
    @Inject(MAT_DIALOG_DATA) public sprint: Sprint
  ) {}
  ngOnInit(): void {
    this.getUserStoriesSelected();
    this.getUserStoriesToSelect();
  }
  getUserStoriesSelected() {
    this.userstoryService
      .getUserStoriesByProjectId(this.sprint.projectId)
      .subscribe((res: UserStoryDto[]) => {
        this.userStoriesSelected = res.filter(
          (item) => item.sprintId === this.sprint.id
        );
      });
  }
  getUserStoriesToSelect() {
    this.userstoryService
      .getUserStoriesByProjectId(this.sprint.projectId)
      .subscribe((res: UserStoryDto[]) => {
        this.userStoriesToSelect = res.filter(
          (item) =>
            item.sprintId === '00000000-0000-0000-0000-000000000000' &&
            item.estimatedDuration <= this.sprint.durationAvailable
        );
      });
  }
  removeUserStory(event: any, userStory: UserStoryDto) {
    if (event.target.checked) {
      userStory.sprintId = this.sprint.id;
      this.sprint.durationAvailable =
        this.sprint.durationAvailable - userStory.estimatedDuration;
      this.sprintService.update(this.sprint).subscribe();
      this.userstoryService.update(userStory).subscribe();
    } else {
      userStory.sprintId = '00000000-0000-0000-0000-000000000000';
      this.sprint.durationAvailable =
        this.sprint.durationAvailable + userStory.estimatedDuration;
      this.sprintService.update(this.sprint).subscribe();
      this.userstoryService.update(userStory).subscribe();
    }
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
    this.sprintService.update(this.sprint).subscribe();
    if (this.userstorySelected.length != 0) {
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
              title: 'Sprint edited successfully',
            });
            let dialog = this.dialogRef.getDialogById('editUserStories');
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
        title: 'Sprint edited successfully',
      });
      this.close();
    }
  }
  close() {
    const dialog = this.dialogRef.getDialogById('editUserStories');
    dialog?.close();
  }
}
