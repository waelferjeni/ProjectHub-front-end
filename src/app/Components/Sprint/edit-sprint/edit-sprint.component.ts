import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Project } from 'src/app/Interfaces/Project';
import { Sprint } from 'src/app/Interfaces/Sprint';
import { SprintService } from 'src/app/Services/sprint.service';
import { SprintListComponent } from '../sprint-list/sprint-list.component';
import { SprintDto } from 'src/app/Interfaces/SprintDto';
import { SelectUserStoriesComponent } from '../select-user-stories/select-user-stories.component';
import { EditUserStoriesSelectedComponent } from '../edit-user-stories-selected/edit-user-stories-selected.component';

@Component({
  selector: 'app-edit-sprint',
  templateUrl: './edit-sprint.component.html',
  styleUrls: ['./edit-sprint.component.css'],
})
export class EditSprintComponent implements OnInit {
  sprintEdited!: Sprint;
  editSprint!: FormGroup;
  sprints: Sprint[] = [];
  constructor(
    public sprintService: SprintService,
    @Inject(MAT_DIALOG_DATA) public sprint: Sprint,
    private matDialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.edit();
  }
  get f() {
    return this.editSprint.controls;
  }
  edit() {
    this.editSprint = new FormGroup({
      sprintName: new FormControl('', [Validators.required]),
      sprintState: new FormControl('', [Validators.required]),
      description: new FormControl('', [Validators.required]),
      days: new FormControl('', [
        Validators.required,
        Validators.max(15),
        Validators.min(7),
      ]),
    });
    this.editSprint.controls['sprintName'].setValue(this.sprint.name);
    this.editSprint.controls['sprintState'].setValue(this.sprint.sprintState);
    this.editSprint.controls['description'].setValue(this.sprint.description);
    this.editSprint.controls['days'].setValue(
      this.getDays(this.sprint.estimatedDuration)
    );
  }
  getDays(d: number): number {
    return Math.floor(d / 24);
  }
  endDate(h: number): Date {
    let dt = new Date();
    dt.setTime(dt.getTime() + h * 60 * 60 * 1000);
    return dt;
  }
  submit() {
    let sprint: SprintDto = {} as SprintDto;
    sprint.id = this.sprint.id;
    sprint.name = this.editSprint.value.sprintName;
    sprint.estimatedDuration = this.editSprint.value.days * 24;
    sprint.description = this.editSprint.value.description;
    sprint.projectId = this.sprint.projectId;
    sprint.startDate = this.editSprint.value.startDate;
    sprint.endDate = this.endDate(sprint.estimatedDuration + 1);
    sprint.durationAvailable =
      sprint.estimatedDuration -
      (this.sprint.estimatedDuration - this.sprint.durationAvailable);
    sprint.sprintState = this.editSprint.value.sprintState;
    this.sprintService.update(sprint).subscribe({
      next: (res: Sprint) => {
        this.matDialog.open(EditUserStoriesSelectedComponent, {
          id: 'editUserStories',
          width: '700px',
          maxHeight: '90vh',
          data: res,
          autoFocus: false,
        });
      },
    });
    this.refresh();
  }
  refresh() {
    const dialog = this.matDialog.getDialogById('editSprint');
    dialog?.close();
  }
}
