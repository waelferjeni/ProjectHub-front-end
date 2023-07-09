import { Project } from './Project';
import { Task } from './Task';
import { UserStory } from './UserStory';

export interface SprintDto {
  id: string;
  name: string;
  description: string;
  durationAvailable: number;
  estimatedDuration: number;
  startDate: Date;
  endDate: Date;
  sprintState: number;
  projectId: string;
}
