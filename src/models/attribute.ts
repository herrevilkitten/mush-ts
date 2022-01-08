import { dbref, ID } from "./dbref";

export type AttributeType = "value" | "trigger" | "command";
export type AttributeValueType = string | number | dbref;

export class Attribute {
  id: dbref = 0;
  owner: dbref = 0;
  name = "";
  type: AttributeType = "value";
  value: AttributeValueType = "";
}

export function createAttribute() {
  const attribute = new Attribute();
  attribute.id = ID.get();
  return attribute;
}
