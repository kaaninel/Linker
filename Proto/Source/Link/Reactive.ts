import { Block } from "./Template";

export default class Reactive {
  static Block<T extends Block>(Ctor: { new (...args): T }) {
    //@ts-ignore
    return (class ReactiveClass extends Ctor {
      $ReactiveProps: string[];
      $Props: Record<string, any>;
      $ReactiveCallbacks: Record<string, Function[]>;

      constructor(...args) {
        super(...args);
        if (this.$ReactiveProps)
          for (const Key of this.$ReactiveProps) {
            if (!this.hasOwnProperty("$Props")) this.$Props = {};
            if (!(Key in this.$Props)) {
              this.$Props[Key] = this[Key];
              Object.defineProperty(this, Key, {
                get() {
                  return this.$Props[Key];
                },
                set(Value: any) {
                  if (this.$Props[Key] !== Value) {
                    this.$Props[Key] = Value;
                    if (Key in this.$ReactiveCallbacks) {
                      this.$ReactiveCallbacks[Key].forEach(x => x(Value, this));
                    }
                  }
                }
              });
              if (this.$ReactiveCallbacks && Key in this.$ReactiveCallbacks) {
                this.$ReactiveCallbacks[Key].forEach(x =>
                  x.call(this, this.$Props[Key], this)
                );
              }
            }
          }
      }
    } as any) as { new (...args: any[]): T };
  }

  static Prop(Target: any, Key: string, PD?: any) {
    if (!Target.hasOwnProperty("$ReactiveProps")) Target.$ReactiveProps = [];
    Target.$ReactiveProps.push(Key);
  }

  static Callback(Fn: string | Function) {
    return function(Target: any, Key: string, PD?: any) {
      if (!Target.hasOwnProperty("$ReactiveCallbacks"))
        Target.$ReactiveCallbacks = {};
      if (!Target.$ReactiveCallbacks[Key]) Target.$ReactiveCallbacks[Key] = [];
      Fn = Fn.constructor === String ? Target[Fn as string] : Fn;
      if (Fn) Target.$ReactiveCallbacks[Key].push(Fn);
    };
  }
}
