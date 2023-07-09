import { Sprint } from './Sprint';
import { User } from './user';
import { UserStory } from './UserStory';

export interface TaskDto {
  id: string;
  name: string;
  description: string;
  estimatedDuration: number;
  startDate: Date;
  endDate: Date;
  taskState: number;
  sprintId: string;
  complexity: number;
  userStory: UserStory;
  userStoryId: string;
  employeeId: string;
  employee: User;
  projectId: string;
}
