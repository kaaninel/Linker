import { EventHost, EventPoint } from "./EventRoot";

export default class Feed extends EventHost {
  static Wire(Point: EventPoint, Predicate: Function, Initialize = false) {
    const Self = this;
    return (Target: any, Key: string) => {
      Point.Connect(function(...args: any[]) {
        const R = Predicate.apply(this, args);
        if (Target[Key] !== R) {
          Target[Key] = R;
          Self.EventRoot.Register(Key);
          Self.EventRoot.Trigger(Key, R, this, ...args);
        }
      });
      Target[Key] = Predicate.apply(this);
      if (Initialize) {
        Self.EventRoot.Register(Key);
        Self.EventRoot.Trigger(Key, Target[Key], this);
      }
    };
  }
}
