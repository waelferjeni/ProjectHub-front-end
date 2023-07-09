import { Component, OnInit, ViewChild } from '@angular/core';
import { AuthService } from 'src/app/Services/auth.service';
import { UserStoreService } from 'src/app/Services/user-store.service';
import { ChartComponent } from 'ng-apexcharts';
import Swal from 'sweetalert2';
import {
  ApexNonAxisChartSeries,
  ApexResponsive,
  ApexChart,
  ApexAxisChartSeries,
  ApexDataLabels,
  ApexXAxis,
  ApexPlotOptions,
} from 'ng-apexcharts';
import { User } from 'src/app/Interfaces/user';
import { ServiceService } from 'src/app/Services/service.service';
import { Service } from 'src/app/Interfaces/Service';
import { Project } from 'src/app/Interfaces/Project';
import { ProjectService } from 'src/app/Services/project.service';
import { TeamService } from 'src/app/Services/team.service';
import { Team } from 'src/app/Interfaces/Team';
import { UserStory } from 'src/app/Interfaces/UserStory';
import { UserstoryService } from 'src/app/Services/userstory.service';

export type ChartOptions = {
  seriesAx: ApexAxisChartSeries;
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  responsive: ApexResponsive[];
  labels: any;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  xaxis: ApexXAxis;
};

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  @ViewChild('chart') chart!: ChartComponent;
  public chartOptions2: Partial<ChartOptions> | any;
  public chartPerService: Partial<ChartOptions> | any;
  public chartPerProject: Partial<ChartOptions> | any;
  public chartPerTeam: Partial<ChartOptions> | any;
  public selected: boolean = false;
  public userId: string = '';
  public fullName: string = '';
  public role: string = '';
  public serviceId: string = '';
  public projects: Project[] = [];
  public nbrProjects: number = 0;
  public nbrProjectsToDo: number = 0;
  public nbrProjectsInProgress: number = 0;
  public nbrProjectsDone: number = 0;
  public nbrProjectsValidated: number = 0;
  public projectTotal: number[] = [];
  public userStories: UserStory[] = [];
  public nbrUserStoriesToDo: number = 0;
  public nbrUserStoriesInProgress: number = 0;
  public nbrUserStoriesDone: number = 0;
  public nbrUsers: number = 0;
  public nbrServices: number = 0;
  public nbrTeams: number = 0;
  public teamNames: string[] = [];
  public serviceManagers: number = 0;
  public independentEmployees: number = 0;
  public servicesNames: string[] = [];
  public serviceTotal: number[] = [];
  constructor(
    private auth: AuthService,
    private userStore: UserStoreService,
    public serviceService: ServiceService,
    public projectService: ProjectService,
    public teamService: TeamService,
    public userstoryService: UserstoryService
  ) {
    this.getRole();
    if (this.role === 'Admin') {
      this.getUsers();
      this.getServices();
      this.getTeams();
      this.getProjects();
      this.employeePerService();
      this.employeePerRole();
    } else {
      this.getProjects();
      this.projectPerTeam();
    }
  }
  ngOnInit(): void {
    this.auth.tokenExpires().subscribe();
    this.getFullName();
    this.getId();
    this.getRole();
    this.getServiceId();
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
  employeePerRole() {
    this.auth.getUsers().subscribe((res: User[]) => {
      let sm: number = 0;
      let emp: number = 0;
      let inEmp: number = 0;
      res.forEach((element) => {
        if (element.role === 'serviceLeader') {
          sm = sm + 1;
        } else if (element.role === 'Employee') {
          emp = emp + 1;
        } else if (element.role === 'independentEmployee') {
          inEmp = inEmp + 1;
        }
      });
      this.chartOptions2 = {
        series: [sm, emp, inEmp],
        chart: {
          width: 500,
          type: 'pie',
        },
        labels: ['Service Managers', 'Employees', 'Independent Employees'],
        responsive: [
          {
            breakpoint: 480,
            options: {
              chart: {
                width: 200,
              },
              legend: {
                position: 'bottom',
              },
            },
          },
        ],
      };
    });
  }
  employeePerService() {
    this.serviceService.getAll().subscribe((res: Service[]) => {
      res.forEach((service) => {
        let s: number = 0;
        this.servicesNames.push(service.name);
        this.auth.getUsers().subscribe((res: User[]) => {
          res.forEach((user) => {
            if (user.serviceId == service.id) {
              s = s + 1;
            }
          });
          this.serviceTotal.push(s);
        });
      });
      this.chartPerService = {
        series: [
          {
            name: 'Employee',
            data: this.serviceTotal,
          },
        ],
        chart: {
          type: 'bar',
          height: 350,
        },
        plotOptions: {
          bar: {
            horizontal: true,
          },
        },
        dataLabels: {
          enabled: false,
        },
        xaxis: {
          categories: this.servicesNames,
        },
      };
    });
  }
  userStoriesPerProject(project: any) {
    this.selected = true;
    this.userStories = [];
    this.userstoryService
      .getUserStoriesByProjectId(project.target.value)
      .subscribe((res: UserStory[]) => {
        this.userStories = res;
        this.nbrUserStoriesToDo = res.filter(
          (userStory) => userStory.userStoryState == 0
        ).length;
        this.nbrUserStoriesInProgress = res.filter(
          (userStory) => userStory.userStoryState == 1
        ).length;
        this.nbrUserStoriesDone = res.filter(
          (userStory) => userStory.userStoryState == 2
        ).length;
        console.log(
          res.filter((userStory) => userStory.userStoryState == 0).length,
          res.filter((userStory) => userStory.userStoryState == 0)
        );
        console.log(
          res.filter((userStory) => userStory.userStoryState == 1).length,
          res.filter((userStory) => userStory.userStoryState == 1)
        );
        console.log(
          res.filter((userStory) => userStory.userStoryState == 2).length,
          res.filter((userStory) => userStory.userStoryState == 2)
        );
        this.chartPerProject = {
          series: [
            this.nbrUserStoriesToDo,
            this.nbrUserStoriesInProgress,
            this.nbrUserStoriesDone,
          ],
          chart: {
            width: 500,
            type: 'pie',
          },
          labels: ['ToDo', 'InProgress', 'Done'],
          responsive: [
            {
              breakpoint: 480,
              options: {
                chart: {
                  width: 200,
                },
                legend: {
                  position: 'bottom',
                },
              },
            },
          ],
        };
      });
  }
  projectPerTeam() {
    this.teamService.getAll().subscribe((res: Team[]) => {
      res
        .filter((team) => team.serviceId == this.serviceId)
        .forEach((team) => {
          let s: number = 0;
          this.teamNames.push(team.name);
          this.projectService.getAll().subscribe((res: Project[]) => {
            res.forEach((project) => {
              if (project.teamId == team.id) {
                s = s + 1;
              }
            });
            this.projectTotal.push(s);
          });
        });
      this.chartPerTeam = {
        series: [
          {
            name: 'Projects',
            data: this.projectTotal,
          },
        ],
        chart: {
          type: 'bar',
          height: 350,
        },
        plotOptions: {
          bar: {
            horizontal: true,
          },
        },
        dataLabels: {
          enabled: false,
        },
        xaxis: {
          categories: this.teamNames,
        },
      };
    });
  }
  getUsers() {
    this.auth.getUsers().subscribe((res: User[]) => {
      this.nbrUsers = res.filter((item) => item.role !== 'Admin').length;
    });
  }
  getServices() {
    this.serviceService.getAll().subscribe((res: Service[]) => {
      this.nbrServices = res.length;
    });
  }
  getTeams() {
    this.teamService.getAll().subscribe((res: Team[]) => {
      this.nbrTeams = res.length;
    });
  }
  getProjects() {
    this.projectService.getAll().subscribe((res: Project[]) => {
      this.projects = res.filter(
        (project) => project.fk_ServiceId == this.serviceId
      );
      this.nbrProjects = res.length;
      this.nbrProjectsToDo = res.filter(
        (project) =>
          project.fk_ServiceId === this.serviceId && project.projectState == 0
      ).length;
      this.nbrProjectsInProgress = res.filter(
        (project) =>
          project.fk_ServiceId === this.serviceId && project.projectState == 1
      ).length;
      this.nbrProjectsDone = res.filter(
        (project) =>
          project.fk_ServiceId === this.serviceId && project.projectState == 2
      ).length;
      this.nbrProjectsValidated = res.filter(
        (project) =>
          project.fk_ServiceId === this.serviceId && project.projectState == 3
      ).length;
    });
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
