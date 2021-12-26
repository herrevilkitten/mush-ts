import { StackFrame, VirtualMachine } from "./virtual-machine";

export type VirtualMachineFunction = (frame: StackFrame) => string | undefined | void;

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

export function executeFunction(frame: StackFrame) {
  const fn = FUNCTION_LOOKUP[frame.name];
  let result: string | undefined | void = "";
  if (fn) {
    result = fn(frame);
  }

  if (result === undefined) {
    result = "";
  }
  return result;
}

export function functionParser(vm: VirtualMachine) {
  let frame = vm.peek();
  if (frame === undefined) {
    throw new Error(`Trying to parse function in empty stack.`);
  }

  let index = frame.index;
  let input = frame.input;
  let state: "name" | "parameters" = "name";
  let previous = "";
  let name = "";
  let parameters: string[] = [];
  let parameterIndex = 0;

  function addParameterValue(current: string) {
    if (parameters[parameterIndex] === undefined) {
      parameters.push("");
    }
    parameters[parameterIndex] = parameters[parameterIndex] + current;
  }

  LOOP: for (; index < input.length; ++index) {
    let current = input[index];
    switch (state) {
      case "name":
        if (current === "(") {
          state = "parameters";
        } else if (/[a-z0-9_]/i.test(current)) {
          name = name + current;
        } else {
          throw new Error(`Syntax error. Unexpected token ${current}. Expecting ( or [a-z0-9_]`);
        }
        break;
      case "parameters":
        if (previous === "%") {
          switch (current) {
            case "n":
              addParameterValue(vm.actor.name);
              break;
            default:
              addParameterValue(current);
              break;
          }
        } else {
          if (current === "%") {
            // Escape this
          } else if (current === "[") {
            const result = vm.evaluate(index + 1);
            addParameterValue(result.value);
            index = result.index;
            console.log("Result:", result);
            if (input[index] !== "]") {
              throw new Error(`Syntax error. Unexpected token ${input[index]}. Expecting ]`);
            }
          } else if (current === ")") {
            break LOOP;
          } else if (current === ",") {
            parameterIndex++;
          } else {
            addParameterValue(current);
          }
        }
        break;
    }
    previous = current;
  }

  return { name, parameters, index };
}
