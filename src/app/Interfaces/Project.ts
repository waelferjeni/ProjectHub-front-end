import { Service } from './Service';
import { Team } from './Team';
import { Sprint } from './Sprint';

export interface Project {
  id: string;
  name: string;
  clientName: string;
  description: string;
  estimatedDuration: number;
  startDate: Date;
  endDate: Date;
  realDuration: number;
  projectState: number;
  sprints: Sprint[];
  service: Service;
  fk_ServiceId: string;
  teamId: string;
  team: Team;
  projectLeaderId: string;
}
