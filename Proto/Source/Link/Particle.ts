import LinkElement from "./Element";

// tslint:disable-next-line:max-line-length
const rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;
const reEscapeChar = /\\(\\)?/g;

function StringToPath(string: string) {
  const result = [];
  if (string.charCodeAt(0) === 46 /* . */) {
    result.push("");
  }
  string.replace(rePropName, function(match, number, quote, subString) {
    result.push(
      quote ? subString.replace(reEscapeChar, "$1") : number || match
    );
    return "";
  });
  return result;
}

function Access(Obj: Object, string: string) {
  return StringToPath(string).reduce((x, y) => x[y], Obj);
}
function Assign(Obj: Object, string: string, Value: any, Arr = false) {
  const Path = StringToPath(string);
  const Name = Path.pop();
  const Parent = Path.reduce((x, y) => {
    if (!(y in x)) x[y] = {};
    return x[y];
  }, Obj);
  if (Arr) {
    if (!Parent[Name]) Parent[Name] = [Value];
    else Parent[Name].push(Value);
  } else {
    Parent[Name] = Value;
    return Value;
  }
}
export default class Particle {
  static Map = new Map();

  get Data() {
    return (this.constructor as typeof Particle).Map.get(
      (this.Root as any).__proto__
    );
  }

  static Get(Target: any, Path: string) {
    if (!this.Map.has(Target)) this.Map.set(Target, {});
    return Access(this.Map.get(Target), Path);
  }
  static Set(Target: any, Path: string, Value: any) {
    if (!this.Map.has(Target)) this.Map.set(Target, {});
    return Assign(this.Map.get(Target), Path, Value);
  }
  static Push(Target: any, Path: string, Value: any) {
    if (!this.Map.has(Target)) this.Map.set(Target, {});
    return Assign(this.Map.get(Target), Path, Value, true);
  }

  static Register(Target) {
    if (!Target.constructor.Particles[this.name])
      Target.constructor.Particles[this.name] = this;
  }

  static Getter(Target: any, Key: string, Fn: Function) {
    this.Register(Target);
    if (!Target.hasOwnProperty("Getters"))
      Target.Getters = { ...Target.Getters };
    if (!Target.Getters[Key]) Target.Getters[Key] = [];
    Target.Getters[Key].push([this.name, Fn]);
  }
  static Setter(Target: any, Key: string, Fn: Function) {
    this.Register(Target);
    if (!Target.hasOwnProperty("Setters"))
      Target.Setters = { ...Target.Setters };
    if (!Target.Setters[Key]) Target.Setters[Key] = [];
    Target.Setters[Key].push([this.name, Fn]);
  }
  static On(Target: any, Key: string, Fn: Function) {
    this.Register(Target);
    if (!Target.hasOwnProperty("Events")) Target.Events = { ...Target.Events };
    if (!Target.Events[Key]) Target.Events[Key] = [];
    Target.Events[Key].push([this.name, Fn]);
  }
  static Storage(Target: any, Key: string) {
    this.Register(Target);
    if (!Target.hasOwnProperty("Storage"))
      Target.Storage = { ...Target.Storage };
    if (!Target.Storage[Key]) Target.Storage[Key] = true;
  }

  static Constr?(El: LinkElement): void;
  static Update?(El: LinkElement): void;
  static Connected?(El: LinkElement): void;
  static Disconnected?(El: LinkElement): void;
  static Rendered?(El: LinkElement): void;

  constructor(public Root: LinkElement) {}
}
