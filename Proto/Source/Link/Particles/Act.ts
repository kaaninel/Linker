import Particle from "Link/Particle";
import LinkElement from "Link/Element";
import { EventPoint } from "Link/EventRoot";

export default class Act extends Particle {
  Data: {
    Events: {
      On: Record<string, EventListener[]>;
      Once: Record<string, EventListener[]>;
    };
  };

  static On(Key: string) {
    return (Target, Field: string) => {
      this.Register(Target);
      this.Push(Target, `Events.On.${Key}`, Target[Field]);
    };
  }

  static Once(Key: string) {
    return (Target, Field: string) => {
      this.Register(Target);
      this.Push(Target, `Events.Once.${Key}`, Target[Field]);
    };
  }

  static Flow<T extends LinkElement>(
    Predicate: (E: T) => boolean,
    ...Dependacies: EventPoint[]
  ) {
    return (Target, Field: string) => {
      const Fn = function(this: Act, Key: string) {
        if (Predicate(this.Root as any)) Target[Field].call(this.Root, Key);
      };
      Dependacies.forEach(Key => {
        Key.Connect(Fn);
      });
    };
  }

  constructor(Root: LinkElement) {
    super(Root);
    if (this.Data) {
      for (const Key in this.Data.Events.On) {
        this.Data.Events.On[Key].forEach(Root.addEventListener.bind(Root, Key));
      }
      for (const Key in this.Data.Events.Once) {
        this.Data.Events.Once[Key].forEach(Event => {
          const Fn = (...args: any[]) => {
            Event.apply(Root, args);
            Root.removeEventListener(Key, Fn);
          };
          Root.addEventListener(Key, Fn);
        });
      }
    }
  }
}
