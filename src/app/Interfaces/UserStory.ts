import { Project } from './Project';
import { Sprint } from './Sprint';
import { Task } from './Task';

export interface UserStory {
  id: string;
  name: string;
  description: string;
  estimatedDuration: number;
  durationAvailable: number;
  projectId: string;
  userStoryState: number;
  project: Project;
  sprintId: string;
  sprint: Sprint;
  tasks: Task[];
}
