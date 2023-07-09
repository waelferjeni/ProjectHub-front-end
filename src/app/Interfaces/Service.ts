import { Project } from './Project';

export interface Service {
  id: string;
  name: string;
  projects: Project[];
  serviceLeaderID: string;
}
