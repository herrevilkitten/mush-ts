import { evaluateText, parseText } from "./interpreter";

const tests = ["Hello", "Hello [name()]"];
tests.forEach((test) => {
  console.log("Before:", test);
  console.log("After: ", parseText(test, 0));
});

import { executeFunction, functionParser } from "./parsers/function-parser";

const tests2 = ["add(1,2,3,4)", "name()", "name([add(1,2,3)])", "name(1, ,[add(1,2,3)])"];

tests2.forEach((test) => {
  console.log(`>>> Testing function parser: ${test}`);
  const fn = functionParser(test, 0);
  console.log(`Parsed as:`, fn);
  const results = executeFunction(fn.name, fn.parameters);
  console.log(`Result:`, results);
});
