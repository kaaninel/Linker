declare global {
  // tslint:disable-next-line:interface-name
  interface Window {
    TestEnv: Object;
  }
}

const Env = (window.TestEnv = {});

const TestQueue = [];
const ExpectQueue = [];
let Running = false;
window.addEventListener("LinkReady", () => {
  Running = true;
  while (TestQueue.length) TestQueue.shift()();
  while (ExpectQueue.length) ExpectQueue.shift()();
});

type Constr<T> = new (...args: any[]) => T;

export function TestEnv(Context = {}, ...Args: any[]) {
  return function<T>(Cls: Constr<T>, Proto = false) {
    const Fn = () => {
      if (Proto) Cls = Cls.constructor as any;
      const Name = Cls.name;
      console.log(Name, "Constr");
      try {
        Env[Name] = new Cls(...Args);
      } catch (ex) {
        console.error(
          `Can't construct ${Name} Class as Test Enviroment!`,
          Args,
          ex
        );
      }
      try {
        Object.assign(Env[Name], Context);
      } catch (ex) {
        console.error(`Can't set Context for ${Name} Class!`, Context, ex);
      }
    };
    if (Running) Fn();
    else TestQueue.push(Fn);
  };
}

export function Expect<T>(
  Fn: (Cls: Constr<T>, Result: any) => boolean,
  ...Args: any[]
) {
  return function(Target: Constr<T>, Key: any) {
    ExpectQueue.push(async () => {
      const Name = Target.constructor.name;
      try {
        if (!(Name in Env)) TestEnv()(Target, true);
        console.log(Env[Name], Name, Key);
        const Res = await Env[Name][Key](...Args);
        if (Fn(Env[Name], Res) === false) {
          console.error(
            `Test Fail: ${Name}.${Key}(${Args.join(",")})`,
            `Predicate: ${Fn}, Result: ${Res}`
          );
        }
      } catch (ex) {
        console.error(
          `Test Fail: ${Name}.${Key}(${Args.join(",")})`,
          `Predicate: ${Fn}, Exception: ${ex}`
        );
      }
    });
  };
}
