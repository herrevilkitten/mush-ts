export const MAX_STACK_DEPTH = 30;

export interface StackFrameOptions {
  vm: VirtualMachine;
  depth: number;
  label: string;
}

export class VirtualStackFrame implements StackFrameOptions {
  vm: VirtualMachine;
  depth: number;
  label: string;

  constructor(options: StackFrameOptions) {
    this.vm = options.vm;
    this.depth = options.depth;
    this.label = options.label;
  }
}

export class VirtualMachine {
  frames: VirtualStackFrame[] = [];
  registers: Record<string, string> = {};

  peek() {
    if (this.frames.length === 0) {
      return undefined;
    }
    return this.frames[this.frames.length - 1];
  }

  pop() {
    return this.frames.pop();
  }

  push(frame: StackFrameOptions) {
    if (this.frames.length > MAX_STACK_DEPTH) {
      throw new Error(`Maximum stack depth ${MAX_STACK_DEPTH} exceeded.`);
    }
    frame.vm = this;
    frame.depth = this.frames.length;
    return this.frames.push(new VirtualStackFrame(frame));
  }
}
