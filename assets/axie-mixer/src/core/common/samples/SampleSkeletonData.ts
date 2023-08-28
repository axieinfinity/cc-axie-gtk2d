export class SampleSkeletonData {
  public skeleton: { [key: string]: any };
  public bones: Array<{ [key: string]: any }>;
  public slots: Array<{ [key: string]: any }>;
  public skins: Array<{ [key: string]: any }>;
  public ik: Array<{ [key: string]: any }>;
  public events: { [key: string]: any };
  public keyAnimations: { [key: string]: string };

  constructor(
    bones: Array<{ [key: string]: any }>,
    slots: Array<{ [key: string]: any }>,
    skins: Array<{ [key: string]: any }>,
    ik: Array<{ [key: string]: any }>,
    events: { [key: string]: any },
    keyAnimations: { [key: string]: string }
  ) {
    this.skeleton = { spine: "3.8.79" };
    this.bones = bones;
    this.slots = slots;
    this.skins = skins;
    this.ik = ik;
    this.events = events;
    this.keyAnimations = keyAnimations;
  }
}

export class MixedSkeletonData {
  public skeleton: { [key: string]: any };
  public bones: Array<{ [key: string]: any }>;
  public slots: Array<{ [key: string]: any }>;
  public skins: Array<{ [key: string]: any }>;
  public ik: Array<{ [key: string]: any }>;
  public events: { [key: string]: any };
  public animations: { [key: string]: any };

  constructor(
    bones: Array<{ [key: string]: any }>,
    slots: Array<{ [key: string]: any }>,
    skins: Array<{ [key: string]: any }>,
    ik: Array<{ [key: string]: any }>,
    events: { [key: string]: any },
    animations: { [key: string]: any }
  ) {
    this.skeleton = { spine: "3.8.79" };
    this.bones = bones;
    this.slots = slots;
    this.skins = skins;
    this.ik = ik;
    this.events = events;
    this.animations = animations;
  }
}
