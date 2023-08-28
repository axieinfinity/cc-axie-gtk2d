import {
  AxieBodyStructure,
  AxiePartType,
  axiePartTypes,
  CharacterClass,
  AxieSkinColor,
  AxieBodySample,
  AxiePartSample,
} from "./BodyStructure";

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

class AxieGenesStuff {
  axieSkinColors: Array<AxieSkinColor>;
  bodySamples: Array<AxieBodySample>;
  partSamples: Array<AxiePartSample>;

  constructor() { }

  public load(genesJson: any) {
    const genesData = genesJson.items;
    const genesColor = genesData.colors;
    const genesBodies = genesData.bodies;
    const genesParts = genesData.parts;

    this.bodySamples = new Array();
    for (const genesBody of genesBodies) {
      let bodySample: AxieBodySample = {
        skin: genesBody["skin"],
        bodyValue: genesBody["bodyValue"],
        mysticValue: genesBody["mysticValue"],
        bodyName: genesBody["bodyName"],
      };
      this.bodySamples.push(bodySample);
    }

    this.partSamples = new Array();
    for (const genesPart of genesParts) {
      let skins = new Array();
      for (const skinName of genesPart["skins"]) {
        skins.push(skinName);
      }
      let partSample: AxiePartSample = {
        class: <CharacterClass>capitalizeFirstLetter(genesPart["class"]),
        partType: <AxiePartType>capitalizeFirstLetter(genesPart["partType"]),
        partValue: genesPart["partValue"],
        skins: skins,
      };
      this.partSamples.push(partSample);
    }

    this.axieSkinColors = new Array();
    for (const axieSkinColor of genesColor) {
      let sampleColor: AxieSkinColor = {
        key: axieSkinColor["key"],
        skin: axieSkinColor["skin"],
        class: <CharacterClass>capitalizeFirstLetter(axieSkinColor["class"]),
        colorValue: axieSkinColor["color_value"],
        primary1: axieSkinColor["primary1"],
        shaded1: axieSkinColor["shaded1"],
        primary2: axieSkinColor["primary2"],
        shaded2: axieSkinColor["shaded2"],
        line: axieSkinColor["line"],
        partColorShift: axieSkinColor["partColorShift"],
      };
      this.axieSkinColors.push(sampleColor);
    }
  }

  private getBodySample(
    value: number,
    skin: number,
    isMystic: boolean
  ): string {
    let bodyIndex = -1;
    for (let i = 0; i < this.bodySamples.length; i++) {
      let bodySample = this.bodySamples[i];
      if (bodySample.skin != skin) continue;
      if (
        bodySample.mysticValue != -1 &&
        bodySample.mysticValue != (isMystic ? 1 : 0)
      )
        continue;
      if (bodySample.bodyValue != -1 && bodySample.bodyValue != value) continue;
      bodyIndex = i;
      break;
    }
    if (bodyIndex === -1) {
      bodyIndex = 0;
    }
    return this.bodySamples[bodyIndex].bodyName;
  }

  private getPartSample(
    partType: AxiePartType,
    bodyStructure: AxieBodyStructure,
    debug = false
  ): string {
    const part = bodyStructure.parts[partType];
    const { class: partClass, value: partValue } = part.groups[0];

    let partIndex = this.partSamples.findIndex(function (x) {
      return (
        x.class === partClass &&
        x.partType === partType &&
        x.partValue === partValue
      );
    });
    if (partIndex === -1) return null;

    var partSample = this.partSamples[partIndex];
    if (debug) console.log(part.skin, partSample.skins[part.skin]);
    if (part.skin >= 0 && part.skin < partSample.skins.length) {
      if (
        partSample.skins[part.skin] &&
        partSample.skins[part.skin].length > 0
      ) {
        return partSample.skins[part.skin];
      }
    }
    return partSample.skins[0];
  }

  public getAdultCombo(bodyStructure: AxieBodyStructure): Map<string, string> {
    const bodyValue = bodyStructure.body[0];
    const bodySkin = bodyStructure.bodySkin;
    let isMystic = false;
    for (const partType of axiePartTypes) {
      const part = bodyStructure.parts[partType];
      if (part.skin === 1) isMystic = true;
    }
    let axieCombo = new Map();

    axieCombo.set("body", this.getBodySample(bodyValue, bodySkin, isMystic));
    axieCombo.set("body-class", bodyStructure.class.toString().toLowerCase());

    axieCombo.set("back", this.getPartSample(AxiePartType.Back, bodyStructure));
    axieCombo.set("ears", this.getPartSample(AxiePartType.Ears, bodyStructure));
    axieCombo.set("ear", axieCombo.get("ears"));
    axieCombo.set("eyes", this.getPartSample(AxiePartType.Eyes, bodyStructure));
    axieCombo.set("horn", this.getPartSample(AxiePartType.Horn, bodyStructure));
    axieCombo.set(
      "mouth",
      this.getPartSample(AxiePartType.Mouth, bodyStructure)
    );
    axieCombo.set("tail", this.getPartSample(AxiePartType.Tail, bodyStructure));

    return axieCombo;
  }

  public getAxieColorsVariant(bodyStructure: AxieBodyStructure): number {
    const primaryValue = bodyStructure.primaryColors[0];

    let variantIndex = -1;
    for (let i = 0; i < this.axieSkinColors.length; i++) {
      var axieSkin = this.axieSkinColors[i];
      if (axieSkin.skin != bodyStructure.bodySkin) continue;
      if (
        (axieSkin.class === CharacterClass.Any ||
          axieSkin.class === bodyStructure.class) &&
        (axieSkin.colorValue === -1 || axieSkin.colorValue === primaryValue)
      ) {
        variantIndex = i;
        break;
      }
    }
    if (variantIndex === -1) {
      variantIndex = 0;
    }
    return variantIndex;
  }

  public getAxieVariantKeyFromIndex(variantIndex: number): string {
    if(variantIndex < 0 || variantIndex >= this.axieSkinColors.length) return '';
    // const variantIndex = this.getAxieColorsVariant(bodyStructure);
    return this.axieSkinColors[variantIndex].key;
  }

  public getAxieColorPartShift(variant: string): string {
    let variantIndex = this.axieSkinColors.findIndex((x) => x.key === variant);
    if (variantIndex == -1) variantIndex = 0;
    return this.axieSkinColors[variantIndex].partColorShift;
  }
}

const genesStuff = new AxieGenesStuff();

export { genesStuff };
