import LinkElement from "./Element";

type ParticleModifier<T extends Particle = Particle> = (
  this: T,
  Inh?: any
) => any;

export default class Particle {
  static Getter(Target: any, Key: string, Fn: ParticleModifier) {
    if (!Target.constructor.Particles[this.name])
      Target.constructor.Particles[this.name] = this;
    if (!Target.hasOwnProperty("Getters"))
      Target.Getters = { ...Target.Getters };
    if (!Target.Getters[Key]) Target.Getters[Key] = [];
    Target.Getters[Key].push([this.name, Fn]);
  }
  static Setter(Target: any, Key: string, Fn: ParticleModifier) {
    if (!Target.constructor.Particles[this.name])
      Target.constructor.Particles[this.name] = this;
    if (!Target.hasOwnProperty("Setters"))
      Target.Setters = { ...Target.Setters };
    if (!Target.Setters[Key]) Target.Setters[Key] = [];
    Target.Setters[Key].push([this.name, Fn]);
  }
  static On(Target: any, Key: string, Fn: ParticleModifier) {
    if (!Target.constructor.Particles[this.name])
      Target.constructor.Particles[this.name] = this;
    if (!Target.hasOwnProperty("Events")) Target.Events = { ...Target.Events };
    if (!Target.Events[Key]) Target.Events[Key] = [];
    Target.Events[Key].push([this.name, Fn]);
  }
  static Storage(Target: any, Key: string) {
    if (!Target.constructor.Particles[this.name])
      Target.constructor.Particles[this.name] = this;
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
