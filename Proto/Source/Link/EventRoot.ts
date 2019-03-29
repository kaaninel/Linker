interface IEventContext {
  Function: Function;
  Context?: Object;
  Once: boolean;
  DOM: boolean;
}

export class EventPoint {
  Events: IEventContext[] = [];
  Context?: Object;

  constructor(public DOMKey?: string) {}

  private _Trigger(DOMEvent, ...Args: any[]) {
    let E;
    let R;
    let i = 0;
    const D = [];
    while (R !== false && (E = this.Events[i++])) {
      const C = E.Context || this.Context;
      R = C ? E.Function.apply(C, Args) : E.Function(...Args);
      if (E.Once) D.push(i);
    }
    if (this.DOMKey && DOMEvent)
      (this.Context as EventTarget).dispatchEvent(
        new CustomEvent(this.DOMKey, { detail: Args })
      );
    D.reverse().forEach(i => this.Events.splice(i, 1));
    return R;
  }

  Trigger(...Args: any[]) {
    return this._Trigger(true, ...Args);
  }

  DOMTrigger(...Args: any[]) {
    return this._Trigger(false, ...Args);
  }

  Connect(
    Function: Function,
    Context?: { Context?: Object; Once?: boolean; DOM?: boolean }
  ) {
    this.Events.push({ Once: false, DOM: false, ...Context, Function });
  }

  Remove(Fn: Function) {
    const I = this.Events.findIndex(F => F.Function === Fn);
    if (I >= 0) return this.Events.splice(I, 1);
  }
}

export default class EventRoot {
  $: Record<string, EventPoint> = {};

  Register(Key: string) {
    if (!this.$.hasOwnProperty(Key)) this.$[Key] = new EventPoint();
    return this.$[Key];
  }

  On(Key: string, Function: Function, Context?, Once = false) {
    if (!this.$.hasOwnProperty(Key)) this.$[Key] = new EventPoint();
    else this.$[Key].Connect(Function, { Context, Once });
  }

  Once(Key: string, Function: Function, Context?) {
    this.On(Key, Function, Context, true);
  }

  Get(Key: string) {
    return this.$[Key];
  }

  Set(Key: string, Point: EventPoint) {
    this.$[Key] = Point;
    return Point;
  }

  Remove(Key: string, Function: Function) {
    if (this.$.hasOwnProperty(Key)) {
      this.$[Key].Remove(Function);
    } else throw new Error(`Can't find ${Key} in EventHost`);
  }

  RemoveAll(Key: string) {
    delete this.$[Key];
  }

  Trigger(Key: string, ...Arguments: any[]) {
    return this.$[Key].Trigger(...Arguments);
  }
}

export class EventHost {
  static EventRoot = new EventRoot();
}

export function EventProxy(Host: EventTarget) {
  return new Proxy({} as Record<string, EventPoint>, {
    get(Target, Key: string) {
      if (!Target.hasOwnProperty(Key)) {
        const EP = (Target[Key] = new EventPoint(Key));
        EP.Context = Host;
        Host.addEventListener(Key, EP.DOMTrigger.bind(EP));
      }
      return Target[Key];
    },
    deleteProperty(Target, Key: string) {
      delete Target[Key];
      return true;
    }
  });
}
