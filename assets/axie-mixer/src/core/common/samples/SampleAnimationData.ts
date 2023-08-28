export class AnimationHeader {
  public name: string;
  public defaultKey: string;
  public crcKeys: Array<string>;

  constructor(name: string, defaultKey: string, crcKeys: Array<string>) {
    this.name = name;
    this.defaultKey = defaultKey;
    this.crcKeys = crcKeys;
  }
}

export class SampleAnimationData {
  public bones: Map<string, any>;
  public slots: Map<string, any>;
  public drawOrder: Array<any>;
  public events: Array<any>;

  constructor(
    bones: Map<string, any>,
    slots: Map<string, any>,
    drawOrder: Array<any>,
    events: Array<any>
  ) {
    this.bones = bones;
    this.slots = slots;
    this.drawOrder = drawOrder;
    this.events = events;
  }
}
