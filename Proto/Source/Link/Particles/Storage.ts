import Particle from "Link/Particle";

export default class Storage extends Particle {
  
  static GlobalMap = new Map();

  static Global(Key: any){
    return function(Target, Field: string) {
      Storage.Register(Target);
      Storage.Getter(Field, function(){
        return Storage.GlobalMap.get(Key);
      });
      Storage.Setter(Field, function(Value){
        return Storage.GlobalMap.set(Key, Value);
      });
    }
  }
}