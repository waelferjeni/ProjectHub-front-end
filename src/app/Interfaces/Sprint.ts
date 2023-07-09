import { Project } from './Project';
import { Task } from './Task';
import { UserStory } from './UserStory';

export interface Sprint {
  id: string;
  name: string;
  description: string;
  durationAvailable: number;
  estimatedDuration: number;
  startDate: Date;
  endDate: Date;
  sprintState: number;
  userStories: UserStory[];
  project: Project;
  projectId: string;
}
