export type AttributeType = "value" | "trigger" | "command";

export class Attribute {
  id = 0;
  name = "";
  type: AttributeType = "value";
}
