import LinkElement from "./Element";

type ParticleModifier<T extends Particle = Particle> = (
  this: T,
  Inh?: any
) => any;

export default class Particle {
  static Getters: Record<string, ParticleModifier[]>;
  static Setters: Record<string, ParticleModifier[]>;

  static Register(Target: any) {
    if (!Target.constructor.Particles[this.name])
      Target.constructor.Particles[this.name] = this;
  }

  static Getter(Key: string, Fn: ParticleModifier) {
    if (!this.hasOwnProperty("Getters")) this.Getters = {};
    if (!this.Getters[Key]) this.Getters[Key] = [];
    this.Getters[Key].push(Fn);
  }
  static Setter(Key: string, Fn: ParticleModifier) {
    if (!this.hasOwnProperty("Setters")) this.Setters = {};
    if (!this.Setters[Key]) this.Setters[Key] = [];
    this.Setters[Key].push(Fn);
  }

  static Constr?(El: LinkElement): void;
  static Update?(El: LinkElement): void;
  static Connected?(El: LinkElement): void;
  static Disconnected?(El: LinkElement): void;
  static Rendered?(El: LinkElement): void;

  constructor(public Root: LinkElement) {
    const C = this.constructor as typeof Particle;
    for (const Key in C.Getters)
      this.Root.SetGetters(this, Key, C.Getters[Key]);
    for (const Key in C.Setters)
      this.Root.SetSetters(this, Key, C.Setters[Key]);
  }
}
