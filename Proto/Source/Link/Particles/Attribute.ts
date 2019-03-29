import Particle from "Link/Particle";
import { EventPoint } from "Link/EventRoot";
import LinkElement from "Link/Element";

export default class Attribute extends Particle {
  Data: {
    Computed: Record<
      string,
      { Predicate: Function; Dependacies: EventPoint[] }
    >;
  };

  static Prop(Target: any, Key: any) {
    Attribute.Storage(Target, Key);
    Attribute.On(Target, Key, function(this: Attribute) {
      this.Root.RequestCycle(Key);
    });
  }

  static Bool(Target: any, Key: any) {
    Attribute.Storage(Target, Key);
    Attribute.On(Target, Key, function(this: Attribute, { detail: { New } }) {
      if (New) this.Root.setAttribute(Key, "");
      else this.Root.removeAttribute(Key);
    });
  }

  static DOM(Target: any, Key: any) {
    Attribute.Storage(Target, Key);
    Attribute.On(Target, Key, function(this: Attribute, { detail: { New } }) {
      this.Root.setAttribute(Key, New);
    });
  }

  static Computed<T>(
    Predicate: (E: T) => any,
    ...Dependacies: Array<string | EventPoint>
  ) {
    return (Target: any, Key: string) => {
      this.Register(Target);
      this.Set(Target, `Computed.${Key}`, { Predicate, Dependacies });
    };
  }

  constructor(Root: LinkElement) {
    super(Root);
    if (this.Data && this.Data.Computed) {
      for (const Key in this.Data.Computed) {
        const { Dependacies, Predicate } = this.Data.Computed[Key];
        const Fn = () => {
          Root[Key] = Predicate(Root);
        };
        Dependacies.forEach(D =>
          D instanceof EventPoint ? D.Connect(Fn) : Root.$[D].Connect(Fn)
        );
        Fn();
      }
    }
  }
}
