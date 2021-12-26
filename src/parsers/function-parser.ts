function addFn(values: string[]) {
  return String(values.reduce((prev, curr) => prev + Number(curr), 0));
}

function nameFn(values: string[]) {
  if (values.length) {
    return "Earl<" + values.join(",") + ">";
  }
  return "Earl";
}

const FUNCTION_LOOKUP: Record<string, (values: string[]) => string> = {
  add: addFn,
  name: nameFn,
};

export function executeFunction(name: string, parameters: string[]) {
  const fn = FUNCTION_LOOKUP[name];
  if (fn) {
    return fn(parameters);
  } else {
    return "";
  }
}

export function functionParser(text: string, index: number) {
  let state: "name" | "parameters" = "name";
  let previous = "";
  let name = "";
  let parameters: string[] = [];
  let parameterIndex = 0;
  LOOP: for (; index < text.length; ++index) {
    let current = text[index];
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
          if (parameters[parameterIndex] === undefined) {
            parameters.push("");
          }
          parameters[parameterIndex] = parameters[parameterIndex] + current;
        } else {
          if (current === "%") {
            // Escape this
          } else if (current === "[") {
            const fn = functionParser(text, index + 1);
            console.log("Parser:", fn);
            const result = executeFunction(fn.name, fn.parameters);
            if (parameters[parameterIndex] === undefined) {
              parameters.push("");
            }
            console.log("Result:", result);
            parameters[parameterIndex] = parameters[parameterIndex] + result;
            index = fn.index + 1;
          } else if (current === ")") {
            break LOOP;
          } else if (current === ",") {
            parameterIndex++;
          } else {
            if (parameters[parameterIndex] === undefined) {
              parameters.push("");
            }
            parameters[parameterIndex] = parameters[parameterIndex] + current;
          }
        }
        break;
    }
    previous = current;
  }

  return { name, parameters, index };
}
