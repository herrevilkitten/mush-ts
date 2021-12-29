import { Thing } from "./models/thing";
import { VirtualMachine } from "./vm/virtual-machine";

const tests2 = ["add(1,2,3,4)", "name()", "name([add(1,2,3)])", "name(1, ,[add(1,2,3)])", "@emit Hello, [repeat(%n, 3)]"];

const actor = new Thing();
actor.name = "Earl";

tests2.forEach((test) => {
  console.log(`>>> Testing function parser: ${test}`);
  const vm = new VirtualMachine({
    actor,
    input: test,
  });
  const results = vm.run();
  console.log(`Result:`, results);
});
