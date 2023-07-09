import { Team } from './Team';
import { User } from './user';

export interface TeamUser {
  teamId: string;
  team: Team;
  userId: string;
  user: User;
  UserRole: string;
}
