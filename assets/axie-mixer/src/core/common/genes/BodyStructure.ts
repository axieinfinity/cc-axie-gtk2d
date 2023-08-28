export enum CharacterClass {
  Beast = "Beast",
  Bug = "Bug",
  Bird = "Bird",
  Plant = "Plant",
  Aquatic = "Aquatic",
  Reptile = "Reptile",
  Mech = "Mech",
  Dawn = "Dawn",
  Dusk = "Dusk",

  Any = "Any",
}

export enum AxiePartType {
  Eyes = "Eyes",
  Mouth = "Mouth",
  Ears = "Ears",
  Horn = "Horn",
  Back = "Back",
  Tail = "Tail",
}

export const axiePartTypes = [
  AxiePartType.Eyes,
  AxiePartType.Mouth,
  AxiePartType.Ears,
  AxiePartType.Horn,
  AxiePartType.Back,
  AxiePartType.Tail,
];

export const characterClasses = [
  CharacterClass.Beast,
  CharacterClass.Bug,
  CharacterClass.Bird,
  CharacterClass.Plant,
  CharacterClass.Aquatic,
  CharacterClass.Reptile,
  CharacterClass.Mech,
  CharacterClass.Dawn,
  CharacterClass.Dusk,
];

export interface AxiePartStructure {
  stageCap: number;
  stage: number;
  reservation: number;
  skinInheritability: boolean;
  skin: number;
  groups: Array<{
    class: CharacterClass;
    value: number;
  }>;
}

export interface AxieBodyStructure {
  class: CharacterClass;
  body: number[];
  bodySkin: number;
  primaryColors: number[];
  secondaryColors: number[];
  parts: {
    [AxiePartType.Eyes]: AxiePartStructure;
    [AxiePartType.Mouth]: AxiePartStructure;
    [AxiePartType.Ears]: AxiePartStructure;
    [AxiePartType.Horn]: AxiePartStructure;
    [AxiePartType.Back]: AxiePartStructure;
    [AxiePartType.Tail]: AxiePartStructure;
  };
}

export interface AxieBodySample {
  skin: number;
  bodyValue: number;
  mysticValue: number;
  bodyName: string;
}

export interface AxiePartSample {
  class: CharacterClass;
  partType: AxiePartType;
  partValue: number;
  skins: Array<string>;
}

export enum BoneComboType {
  body = "body",
  back = "back",
  ear = "ear",
  eyes = "eyes",
  horn = "horn",
  tail = "tail",
  mouth = "mouth",
}

export const boneComboTypes = [
  BoneComboType.body,
  BoneComboType.back,
  BoneComboType.ear,
  BoneComboType.eyes,
  BoneComboType.horn,
  BoneComboType.tail,
  BoneComboType.mouth,
];

export interface AxieSkinColor {
  key: string;
  skin: number;
  class: CharacterClass;
  colorValue: number;
  primary1: string;
  shaded1: string;
  primary2: string;
  shaded2: string;
  line: string;
  partColorShift: string;
}

export function getCharacterClassFromValue(value: number): CharacterClass {
  switch (value) {
    case 0:
      return CharacterClass.Beast;
    case 1:
      return CharacterClass.Bug;
    case 2:
      return CharacterClass.Bird;
    case 3:
      return CharacterClass.Plant;
    case 4:
      return CharacterClass.Aquatic;
    case 5:
      return CharacterClass.Reptile;
    case 16:
      return CharacterClass.Mech;
    case 17:
      return CharacterClass.Dawn;
    case 18:
      return CharacterClass.Dusk;
  }
  return CharacterClass.Any;
}


export const ACESSORY_SLOTS = [
  "body-air",
  "body-cheek",
  "body-ground",
  "body-hip",
  "body-neck"
];
