import { Project } from './Project';
import { Sprint } from './Sprint';
import { Task } from './Task';

export interface UserStoryDto {
  id: string;
  name: string;
  description: string;
  estimatedDuration: number;
  durationAvailable: number;
  projectId: string;
  userStoryState: number;
  sprintId: string;
  sprint: Sprint;
  tasks: Task[];
}
