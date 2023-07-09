import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Project } from 'src/app/Interfaces/Project';
import { Sprint } from 'src/app/Interfaces/Sprint';
import { UserStory } from 'src/app/Interfaces/UserStory';
import { User } from 'src/app/Interfaces/user';
import { SprintService } from 'src/app/Services/sprint.service';
import { EditSprintComponent } from '../edit-sprint/edit-sprint.component';
import { SprintDetailsComponent } from '../sprint-details/sprint-details.component';
import { SelectUserStoriesComponent } from '../select-user-stories/select-user-stories.component';
import { AuthService } from 'src/app/Services/auth.service';
import { UserStoreService } from 'src/app/Services/user-store.service';
import { ProjectService } from 'src/app/Services/project.service';
import { SprintDto } from 'src/app/Interfaces/SprintDto';
import { UserStoryDto } from 'src/app/Interfaces/userStoryDto';
import { UserstoryService } from 'src/app/Services/userstory.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-sprint-list',
  templateUrl: './sprint-list.component.html',
  styleUrls: ['./sprint-list.component.css'],
})
export class SprintListComponent implements OnInit {
  formModal: any;
  sprintAdded: Sprint = {} as Sprint;
  addSprint!: FormGroup;
  users: User[] = [];
  Projects: Project[] = [];
  sprints: Sprint[] = [];
  UserStories: UserStory[] = [];
  public userId: string = '';
  public fullName: string = '';
  public role: string = '';
  public serviceId: string = '';
  constructor(
    private sprintService: SprintService,
    private userStore: UserStoreService,
    public userstoryService: UserstoryService,
    private auth: AuthService,
    public projectService: ProjectService,
    private dialogRef: MatDialog
  ) {}
  ngOnInit(): void {
    this.getFullName();
    this.getId();
    this.getRole();
    this.getServiceId();
    this.auth.tokenExpires().subscribe();
    this.getAllProjects();
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
    } else {
      this.projectService.getAll().subscribe((data: Project[]) => {
        this.Projects = data;
      });
    }
  }
  selectProject(project: any) {
    this.sprints = [];
    this.sprintService
      .getSprintsByProjectId(project.target.value)
      .subscribe((res: Sprint[]) => {
        this.userstoryService.getAll().subscribe((data: UserStory[]) => {
          res.forEach((sprint) => {
            sprint.userStories = data.filter(
              (item) => item.sprintId === sprint.id
            );
            this.sprints.push(sprint);
          });
        });
      });
  }
  add() {
    this.addSprint = new FormGroup({
      projectId: new FormControl('', [Validators.required]),
      name: new FormControl('', [Validators.required]),
      days: new FormControl('', [
        Validators.required,
        Validators.max(15),
        Validators.min(7),
      ]),
      description: new FormControl('', [Validators.required]),
    });
  }
  get f() {
    return this.addSprint.controls;
  }
  onSubmit() {
    let startDate: Date = new Date();
    startDate.setHours(startDate.getHours() + 1);
    let sprint: SprintDto = {} as SprintDto;
    sprint.name = this.addSprint.value.name;
    sprint.estimatedDuration = this.addSprint.value.days * 24;
    sprint.durationAvailable = sprint.estimatedDuration;
    sprint.description = this.addSprint.value.description;
    sprint.projectId = this.addSprint.value.projectId;
    sprint.startDate = startDate;
    sprint.endDate = this.endDate(sprint.estimatedDuration + 1);
    this.sprintService.create(sprint).subscribe({
      next: (res: Sprint) => {
        this.sprintAdded = res;
        this.dialogRef.open(SelectUserStoriesComponent, {
          id: 'selectUserStories',
          width: '700px',
          maxHeight: '90vh',
          data: res,
          autoFocus: false,
        });
      },
    });

    this.ngOnInit();
    this.resetForms();
  }
  endDate(h: number): Date {
    let dt = new Date();
    dt.setTime(dt.getTime() + h * 60 * 60 * 1000);
    return dt;
  }
  estimatedDurationConversion(ed: number): string {
    var days, hours: Number;
    days = Math.floor(ed / 24);
    hours = ed % 24;

    return days + ' d ' + hours + ' h';
  }
  moreDetails(sprint: Sprint) {
    this.dialogRef.open(SprintDetailsComponent, {
      data: sprint,
      width: '800px',
      maxHeight: '90vh',
      id: 'sprintDetails',
    });
  }
  editDialog(sprint: Sprint) {
    this.dialogRef.open(EditSprintComponent, {
      id: 'editSprint',
      data: sprint,
      width: '800px',
      maxHeight: '90vh',
    });
  }

  async deleteSprint(sprint: Sprint) {
    let userStoriesSelected: UserStoryDto[] = [];
    this.userstoryService
      .getUserStoriesByProjectId(sprint.projectId)
      .subscribe((res: UserStoryDto[]) => {
        userStoriesSelected = res.filter((item) => item.sprintId === sprint.id);
        userStoriesSelected.forEach((element) => {
          element.sprintId = '00000000-0000-0000-0000-000000000000';
          this.userstoryService.update(element).subscribe();
        });
      });
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
        text: 'Once deleted,you will not be able to recover this sprint!',
        showCancelButton: true,
        confirmButtonText: 'Ok',
        cancelButtonText: 'Cancel',
        reverseButtons: false,
      })
      .then((result) => {
        if (result.value) {
          this.sprintService.delete(sprint.id).subscribe((res) => {
            this.sprints = this.sprints.filter((item) => item.id !== sprint.id);
          });
          return;
        }
      });
  }
  resetForms() {
    this.addSprint.reset();
    this.ngOnInit();
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
