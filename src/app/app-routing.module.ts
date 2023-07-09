import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';

import { SignInComponent } from './Components/Login/sign-in/sign-in.component';
import { SprintListComponent } from './Components/Sprint/sprint-list/sprint-list.component';
import { TaskListComponent } from './Components/Task/task-list/task-list.component';
import { TeamListComponent } from './Components/Team/team-list/team-list.component';
import { AuthGuard } from './Guards/auth.guard';
import { UserListComponent } from './Components/User/user-list/user-list.component';
import { TimeSheetComponent } from './components/time-sheet/time-sheet.component';
import { ServiceListComponent } from './Components/Service/service-list/service-list.component';
import { ProjectListComponent } from './Components/Project/project-list/project-list.component';
import { UserStoryListComponent } from './Components/UserStory/user-story-list/user-story-list.component';
import { LoginGuard } from './Guards/login.guard';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: SignInComponent, canActivate: [LoginGuard] },
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'tasks', component: TaskListComponent, canActivate: [AuthGuard] },
  { path: 'sprints', component: SprintListComponent, canActivate: [AuthGuard] },
  {
    path: 'timesheet',
    component: TimeSheetComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'userstories',
    component: UserStoryListComponent,
    canActivate: [AuthGuard],
  },
  { path: 'teams', component: TeamListComponent, canActivate: [AuthGuard] },
  {
    path: 'projects',
    component: ProjectListComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'services',
    component: ServiceListComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'users',
    component: UserListComponent,
    canActivate: [AuthGuard],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
