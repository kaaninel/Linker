import Particle from "Link/Particle";

export default class Storage extends Particle {
  static GlobalMap = new Map();

  static Global(Key: any) {
    return function(Target, Field: string) {
      Storage.Getter(Target, Field, function() {
        return Storage.GlobalMap.get(Key);
      });
      Storage.Setter(Target, Field, function(Value) {
        Storage.GlobalMap.set(Key, Value);
        return Value;
      });
    };
  }
}
