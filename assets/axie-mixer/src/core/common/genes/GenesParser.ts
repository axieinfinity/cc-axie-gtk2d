import BigNumber from "bn.js";

import {
  AxieBodyStructure,
  AxiePartStructure,
  axiePartTypes,
  getCharacterClassFromValue,
} from "./BodyStructure";

interface BitsFromLeft {
  (bits: number): BigNumber;
  peek: (bits: number) => BigNumber;
  bitsLeft: number;
}

const bitsFromLeft = (value: BigNumber, totalBits: number): BitsFromLeft => {
  const extractor = ((bits: number) => {
    const extracted = extractor.peek(bits);
    extractor.bitsLeft -= bits;
    return extracted;
  }) as BitsFromLeft;

  extractor.peek = (bits) =>
    extractor.bitsLeft > bits
      ? value.shrn(extractor.bitsLeft - bits).maskn(bits)
      : value.maskn(bits);

  extractor.bitsLeft = totalBits;

  return extractor;
};

export const getAxieBodyStructure512 = (
  geneString: string
): AxieBodyStructure => {
  const genes = new BigNumber(geneString.replace("0x", ""), 16);
  const bits = bitsFromLeft(genes, 512);

  const mainClass = bits(5).toNumber();
  const reservation = bits(45).toNumber();
  const contribution = bits(5).toNumber();

  const bodySkinInheritability = bits(1).toNumber();
  const bodySkin = bits(9).toNumber();
  const bodyDetail0 = bits(9).toNumber();
  const bodyDetail1 = bits(9).toNumber();
  const bodyDetail2 = bits(9).toNumber();

  const primaryColor0 = bits(6).toNumber();
  const primaryColor1 = bits(6).toNumber();
  const primaryColor2 = bits(6).toNumber();

  const secondaryColor0 = bits(6).toNumber();
  const secondaryColor1 = bits(6).toNumber();
  const secondaryColor2 = bits(6).toNumber();

  const bodyStructure: AxieBodyStructure = {
    class: getCharacterClassFromValue(mainClass),
    body: [bodyDetail0, bodyDetail1, bodyDetail2],
    bodySkin: bodySkin,
    primaryColors: [primaryColor0, primaryColor1, primaryColor2],
    secondaryColors: [secondaryColor0, secondaryColor1, secondaryColor2],
    parts: {} as any,
  };

  for (let partIndex = 0; partIndex < 6; partIndex++) {
    const partStage = bits(2).toNumber();
    const partReservation = bits(13).toNumber();
    const partSkinInheritability = bits(1).toNumber();
    const partSkin = bits(9).toNumber();

    const partClass0 = bits(5).toNumber();
    const partValue0 = bits(8).toNumber();

    const partClass1 = bits(5).toNumber();
    const partValue1 = bits(8).toNumber();

    const partClass2 = bits(5).toNumber();
    const partValue2 = bits(8).toNumber();
    const partType = axiePartTypes[partIndex];

    const part: AxiePartStructure = {
      stageCap: 2,
      stage: partStage,
      reservation: partReservation,
      skinInheritability: partSkinInheritability === 0 ? false : true,
      skin: partSkin,
      groups: [],
    };

    part.groups.push({
      class: getCharacterClassFromValue(partClass0),
      value: partValue0,
    });
    part.groups.push({
      class: getCharacterClassFromValue(partClass1),
      value: partValue1,
    });
    part.groups.push({
      class: getCharacterClassFromValue(partClass2),
      value: partValue2,
    });

    bodyStructure.parts[partType] = part;
  }

  return bodyStructure;
};
