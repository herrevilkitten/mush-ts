import { Thing } from "../models/thing";
import { functionParser, executeFunction, textParser } from "../parsers/function-parser";

export const MAX_STACK_DEPTH = 30;

export type VirtualMachineFunction = (frame: StackFrame) => string | undefined | void;

export type VirtualMachineSubstituion =
  | string
  | ((value: string, frame: StackFrame) => string | { value: string; index: number });

export interface StackFrameOptions {
  vm: VirtualMachine;
  depth: number;
  input: string;
  index: number;
}

export class StackFrame implements StackFrameOptions {
  vm: VirtualMachine;
  depth: number;
  input: string;
  index: number;
  name = "";
  parameters: string[] = [];
  stackRegisters: Record<string, string> = {};

  constructor(options: StackFrameOptions) {
    this.vm = options.vm;
    this.depth = options.depth;
    this.input = options.input;
    this.index = options.index;
  }
}

export interface VirtualMachineOptions {
  actor: Thing;
  input: string;
  index?: number;
}

export class VirtualMachine implements VirtualMachineOptions {
  actor: Thing;
  stack: StackFrame[] = [];
  machineRegisters: Record<string, string> = {};
  input: string;

  constructor(options: VirtualMachineOptions) {
    this.actor = options.actor;
    this.input = options.input;
  }

  peek() {
    if (this.stack.length === 0) {
      return undefined;
    }
    return this.stack[this.stack.length - 1];
  }

  pop() {
    return this.stack.pop();
  }

  push(index: number) {
    if (this.stack.length > MAX_STACK_DEPTH) {
      throw new Error(`Maximum stack depth ${MAX_STACK_DEPTH} exceeded.`);
    }
    const frame = {
      vm: this,
      depth: this.stack.length,
      input: this.input,
      index: index,
    };
    return this.stack.push(new StackFrame(frame));
  }

  evaluate(index = 0) {
    this.push(index);
    const fn = functionParser(this);
    console.log("Parse:", fn);
    let frame = this.peek();
    if (!frame) {
      throw new Error(`Stack error. No frame during evaluation.`);
    }
    frame.name = fn.name;
    frame.parameters = fn.parameters;
    const result = executeFunction(frame);
    console.log("Execute:", result);
    this.pop();
    return { value: result, index: fn.index + 1 };
  }

  run() {
    const result = textParser(this);
    if (this.stack.length > 0) {
      throw new Error(`Stack error. Stack is not empty at termination.`);
    }
    return result.text;
  }
}
