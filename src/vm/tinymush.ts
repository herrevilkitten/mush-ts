import { StackFrame, VirtualMachineFunction } from "./virtual-machine";

function addFn(frame: StackFrame) {
  return String(frame.parameters.reduce((prev, curr) => prev + Number(curr), 0));
}

function nameFn(frame: StackFrame) {
  let result = frame.vm.actor.name;
  if (frame.parameters.length) {
    result = result + "<" + frame.parameters.join(",") + ">";
  }
  return result;
}

function repeatFn(frame: StackFrame) {
  if (frame.parameters.length !== 2) {
    throw new Error(`Function error. ${frame.name} expects 2 parameters`);
  }

  return frame.parameters[0].repeat(parseInt(frame.parameters[1]) || 1);
}

const FUNCTION_LOOKUP: Record<string, VirtualMachineFunction> = {
  add: addFn,
  name: nameFn,
  repeat: repeatFn,
};
