import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { NgToastService } from 'ng-angular-popup';
import { Project } from 'src/app/Interfaces/Project';
import { UserStory } from 'src/app/Interfaces/UserStory';
import { UserStoryDto } from 'src/app/Interfaces/userStoryDto';
import { AuthService } from 'src/app/Services/auth.service';
import { ProjectService } from 'src/app/Services/project.service';
import { UserStoreService } from 'src/app/Services/user-store.service';
import { UserstoryService } from 'src/app/Services/userstory.service';
import { TYPE } from 'src/assets/values.constants';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-edit-user-story',
  templateUrl: './edit-user-story.component.html',
  styleUrls: ['./edit-user-story.component.css'],
})
export class EditUserStoryComponent implements OnInit {
  editForm!: FormGroup;
  Projects: Project[] = [];
  public userId: string = '';
  public fullName: string = '';
  public role: string = '';
  public serviceId: string = '';
  constructor(
    public projectService: ProjectService,
    public userstoryService: UserstoryService,
    private auth: AuthService,
    private userStore: UserStoreService,
    private dialogRef: MatDialog,
    private toast: NgToastService,
    @Inject(MAT_DIALOG_DATA) public userstory: UserStory
  ) {}

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
        this.Projects = data.filter((item) => item.projectState === 3);
      });
    }
  }
  getUserStories() {
    this.userstoryService.getAll().subscribe();
  }

  edit() {
    this.editForm = new FormGroup({
      name: new FormControl('', Validators.required),
      description: new FormControl('', Validators.required),
      estimatedDays: new FormControl('', Validators.required),
      estimatedHours: new FormControl('', Validators.required),
    });
    this.editForm.controls['name'].setValue(this.userstory.name);
    this.editForm.controls['estimatedDays'].setValue(
      this.getDays(this.userstory.estimatedDuration)
    );

    this.editForm.controls['estimatedHours'].setValue(
      this.getHours(this.userstory.estimatedDuration)
    );
    this.editForm.controls['projectId'].setValue(this.userstory.projectId);
  }

  getDays(d: number): number {
    return Math.floor(d / 24);
  }

  getHours(d: number): number {
    return d % 24;
  }

  submit() {
    let userStoryMOdified: UserStoryDto = {} as UserStoryDto;
    userStoryMOdified.id = this.userstory.id;
    userStoryMOdified.name = this.editForm.value.name;
    userStoryMOdified.description = this.editForm.value.description;
    userStoryMOdified.userStoryState = this.userstory.userStoryState;
    userStoryMOdified.estimatedDuration =
      this.editForm.value.estimatedDays * 24 +
      this.editForm.value.estimatedHours;
    userStoryMOdified.projectId = this.userstory.projectId;
    userStoryMOdified.sprintId = this.userstory.sprintId;
    userStoryMOdified.tasks = this.userstory.tasks;
    userStoryMOdified.sprintId = this.userstory.sprintId;
    this.userstoryService
      .update(userStoryMOdified)
      .subscribe((res: UserStory) => {
        Swal.fire({
          toast: true,
          position: 'top',
          showConfirmButton: false,
          icon: TYPE.SUCCESS,
          timerProgressBar: false,
          timer: 5000,
          title: 'UserStory Edited Successfully',
        });
      });

    let dialog = this.dialogRef.getDialogById('editUserstory');
    dialog?.close();
  }
  close() {
    let dialog = this.dialogRef.getDialogById('editUserstory');
    dialog?.close();
  }
}
