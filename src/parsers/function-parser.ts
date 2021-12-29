import { StackFrame, VirtualMachine } from "../vm/virtual-machine";

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

function escape(vm: VirtualMachine, index: number) {
  const current = vm.input[index];
  switch (current) {
    case "n":
      return { value: vm.actor.name, index: index };
    case "r":
      return { value: "\n", index: index };
    case "b":
      return { value: " ", index: index };
    default:
      return { value: current, index: index };
  }
}

export function textParser(vm: VirtualMachine) {
  let index = 0;
  let input = vm.input;
  let state: "text" | "parameters" | "name" = "text";
  let previous = "";
  let text = "";

  function addText(current: string) {
    text = text + current;
  }

  LOOP: for (; index < input.length; ++index) {
    let current = input[index];
    switch (state) {
      case "text":
        if (previous === "%") {
          const results = escape(vm, index);
          addText(results.value);
          index = results.index;
        } else {
          switch (current) {
            case "%":
              break;
            case "[":
              const results = vm.evaluate(index + 1);
              addText(results.value);
              index = results.index;
              break;
            default:
              addText(current);
              break;
          }
        }
        break;
    }
    previous = current;
  }

  return { text, index };
}
