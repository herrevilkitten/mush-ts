const FunctionRE = /\[([a-z0-9_]+)\((.*?)\)\]/gi;

const MAX_DEPTH = 30;

// @emit [stuff()]
export function evaluateText(text: string, depth: number) {
  text = text.replace(FunctionRE, (match, name, parameters) => {
    let replacement = "";

    // Evalaute the function name and each of the function parameters
    for (let i = 1; i < match.length; ++i) {
      if (match[i] === "" || match[i] === null || match[i] === undefined) {
        continue;
      }

      replacement = evaluateText(match[i], depth + 1);
    }
    console.log(match, replacement);
    return replacement;
  });

  return text;
}

export function parseText(text: string, depth: number) {
  const length = text.length;
  let replacement = "";
  let previous = "";

  let state = "normal";
  let functionCall = {
    name: "",
    params: "",
  };

  for (let i = 0; i < length; ++i) {
    const current = text[i];

    if (previous === "%") {
      switch (current) {
        case "r":
          replacement = replacement + "\r\n";
          break;
        default:
          replacement = replacement + current;
          break;
      }
    } else {
      switch (state) {
        case "function_name":
          if (/[[a-z0-9_]/i.exec(current)) {
            functionCall.name = functionCall.name + current;
          } else if (current === "(") {
            state = "function_params";
          } else {
            throw new Error(`Invalid character ${functionCall.name} >> '${current}' << in state 'function_name'`);
          }
          break;
          case "function_params":
        default:
          switch (current) {
            case "[":
              state = "function_name";
              break;
            default:
              replacement = replacement + current;
              break;
          }
          break;
      }
    }

    previous = current;
  }
  return replacement;
}
