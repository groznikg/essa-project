import { Comment } from "./comment.model";
import { Fish } from "./fish.model";

export interface Trip {
  _id: string;
  fish: Fish[];
  comments: Comment[];
  name: string;
  time: Date;
  description: string;
  type: string;
  user: string;
  coordinates: number[];
  coordinates1?: number;
  coordinates2?: number;
}
