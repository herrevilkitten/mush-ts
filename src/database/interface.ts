import { dbref } from "../models/dbref";
import { Thing } from "../models/thing";

export interface Database {
  data: Record<dbref, Thing>;
  get(id: dbref): Thing | undefined;
  create(): Thing;
  destroy(id: dbref): void;
  size(): number;
}
