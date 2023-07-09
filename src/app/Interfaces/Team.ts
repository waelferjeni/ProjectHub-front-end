import { TeamUser } from './TeamUser';

export interface Team {
  id: string;
  name: string;
  serviceId: string;
  teamusers: TeamUser[];
}
