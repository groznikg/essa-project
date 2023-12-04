export interface User {
  email: string;
  name: string;
  role: string;
  fishingGroup?: string[];
  password?: string;
}
