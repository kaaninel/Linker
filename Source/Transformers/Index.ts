import Basic from "./Basic";
import CustomElements from "./CustomElements";

let Before = [];
let After = [];

function Destruct(Obj: {before?: any[], after?: any[]}){
  if(Obj.before && Obj.before.length) Before = Before.concat(Obj.before);
  if(Obj.after && Obj.after.length) After = After.concat(Obj.after);
}

Destruct(Basic);
Destruct(CustomElements);

export default {
  before: Before,
  after: After
}