import { NgModule } from '@angular/core';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgApexchartsModule } from 'ng-apexcharts';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { HomeComponent } from './components/home/home.component';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { TimeSheetComponent } from './components/time-sheet/time-sheet.component';
import { EditComponent } from './Components/Team/edit/edit.component';
import { MatDialogModule } from '@angular/material/dialog';
import { EditteammatesComponent } from './Components/Team/editteammates/editteammates.component';
import { SprintDetailsComponent } from './Components/Sprint/sprint-details/sprint-details.component';
import { EditSprintComponent } from './Components/Sprint/edit-sprint/edit-sprint.component';
import { SelectUserStoriesComponent } from './Components/Sprint/select-user-stories/select-user-stories.component';
import { EdittaskComponent } from './Components/Task/edittask/edittask.component';
import { NgToastModule } from 'ng-angular-popup';
import { TokenInterceptor } from './Interceptors/token.interceptor';
import { SignInComponent } from './Components/Login/sign-in/sign-in.component';
import { SprintListComponent } from './Components/Sprint/sprint-list/sprint-list.component';
import { TaskListComponent } from './Components/Task/task-list/task-list.component';
import { TeamListComponent } from './Components/Team/team-list/team-list.component';
import { ViewTeamComponent } from './Components/Team/view-team/view-team.component';
import { UserListComponent } from './Components/User/user-list/user-list.component';
import { ServiceListComponent } from './Components/Service/service-list/service-list.component';
import { EditModalComponent } from './Components/Service/edit-modal/edit-modal.component';
import { DetailsModalComponent } from './Components/Service/details-modal/details-modal.component';
import { ProjectListComponent } from './Components/Project/project-list/project-list.component';
import { EditProjectComponent } from './Components/Project/edit-project/edit-project.component';
import { AddProjectComponent } from './Components/Project/add-project/add-project.component';
import { ProjectDetailsComponent } from './Components/Project/project-details/project-details.component';
import { UserstoryDetailsComponent } from './Components/UserStory/userstory-details/userstory-details.component';
import { UserStoryListComponent } from './Components/UserStory/user-story-list/user-story-list.component';
import { EditUserStoryComponent } from './Components/UserStory/edit-user-story/edit-user-story.component';
import { AddUserComponent } from './Components/User/add-user/add-user.component';
import { EditUserComponent } from './Components/User/edit-user/edit-user.component';
import { UserDetailsComponent } from './Components/User/user-details/user-details.component';
import { EditUserStoriesSelectedComponent } from './Components/Sprint/edit-user-stories-selected/edit-user-stories-selected.component';
import { TaskDetailsComponent } from './Components/Task/task-details/task-details.component';
@NgModule({
  declarations: [
    AppComponent,

    SignInComponent,

    ViewTeamComponent,
    SprintListComponent,
    TaskListComponent,
    TeamListComponent,
    UserListComponent,
    SignInComponent,
    HomeComponent,
    TimeSheetComponent,
    EditComponent,
    EditteammatesComponent,
    SprintDetailsComponent,
    EditSprintComponent,
    SelectUserStoriesComponent,
    EdittaskComponent,
    ServiceListComponent,
    EditModalComponent,
    DetailsModalComponent,
    ProjectListComponent,
    EditProjectComponent,
    AddProjectComponent,
    ProjectDetailsComponent,
    UserstoryDetailsComponent,
    UserStoryListComponent,
    EditUserStoryComponent,
    AddUserComponent,
    EditUserComponent,
    UserDetailsComponent,
    EditUserStoriesSelectedComponent,
    TaskDetailsComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    DragDropModule,
    MatDialogModule,
    NgToastModule,
    NgApexchartsModule,
    MatPaginatorModule,
    MatTableModule,
    MatSortModule,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
