import { Team } from './Team';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  userName: string;
  password: string;
  token: string;
  role: string;
  email: string;
  serviceId: string;
}
