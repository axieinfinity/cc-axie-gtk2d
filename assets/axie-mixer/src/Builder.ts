import { boneComboTypes } from "./core/common/genes/BodyStructure";
import { getAxieBodyStructure512 } from "./core/common/genes/GenesParser";
import { genesStuff } from "./core/common/genes/GenesStuff";
import { mixerStuff } from "./core/common/samples/MixerStuff";

export class AxieBuilderResult {
    error: string;
    skeletonDataAsset: any
    combo: Map<string, string>;
    variant: string;
    constructor() {}
}

export function initAxieMixer(GenesData: any, SamplesData: any, VariantsData: any, AnimationsData: any){
    genesStuff.load(GenesData);
    mixerStuff.load(SamplesData, VariantsData, AnimationsData);
}

export const getAxieSpineFromGenes = (
    gene: string,
    meta: Map<string, string>,
    skipAnimation = false) => {

    const bodyStructure = getAxieBodyStructure512(gene);
    const combo = genesStuff.getAdultCombo(bodyStructure);
    if(meta != null){
        meta.forEach((v, k) => combo.set(k, v));
    }
    const variantIdx = genesStuff.getAxieColorsVariant(bodyStructure);
    return getAxieSpineFromCombo(combo, variantIdx, skipAnimation);
}

export const getAxieSpineFromCombo = (
    combo: Map<string, string>,
    colorVariant: number,
    skipAnimation = false
) => {
    const builderResult = new AxieBuilderResult();

    if(!mixerStuff.initilized){
        builderResult.error = "Please initAxieMixer first";
    } else{
        try {
            builderResult.combo = combo;
            builderResult.variant = genesStuff.getAxieVariantKeyFromIndex(colorVariant);

            if(combo != null){
                combo.forEach((v, k) => {
                    builderResult.combo.set(k.replace('accessory-', 'body-'), v.replace('accessory-', 'body-')); 
                });

                if(combo.has('accessory-suit-off')){
                    const bodySample = builderResult.combo.get("body").replace("-mystic-", "-");
                    builderResult.combo.set("body", bodySample);
                }
            }
            var jMixed = mixerStuff.generateAsset(builderResult.combo, skipAnimation);
            if(jMixed == null){
                builderResult.error = "GenerateAsset Failed";
            } else {
                if(combo != null && combo.has('embedded-color')){
                    const variantHex = colorVariant.toString(16).padStart(2, '0');
                    const partColorShift = genesStuff.getAxieColorPartShift(builderResult.variant);
                    const slots = jMixed.slots;
                      for(let slot of slots){
                        let isPartShift = partColorShift[0] !== "0";
                        for (let i = 1; i < boneComboTypes.length; i++) {
                          if (slot.name.startsWith(boneComboTypes[i].toString())) {
                            isPartShift = partColorShift[i] !== "0";
                          }
                        }
                        const shiftHex = isPartShift ? '02' : '00';
                        
                        if ('color' in slot){
                          slot.color = variantHex + shiftHex + '00' + slot.color.substring(6);
                        } else {
                          slot.color = variantHex + shiftHex + '00ff';
                        }
                      }
                }
                builderResult.skeletonDataAsset = jMixed;
            }
        } catch (error) {
            builderResult.error = error.message;
        }
    }

    return builderResult; 
}

export const getVariantAttachmentPath = (
  slotName: string,
  attachmentPath: string,
  variantKey: string,
  partColorShift: string
) => {
  let imagePath = attachmentPath.replace(".", "/");
  if (mixerStuff.variantList.includes(attachmentPath)) {
    let isPartShift = false;
    if (partColorShift.length == 7) {
      isPartShift = partColorShift[0] !== "0";
      for (let i = 1; i < boneComboTypes.length; i++) {
        if (slotName.startsWith(boneComboTypes[i].toString())) {
          isPartShift = partColorShift[i] !== "0";
        }
      }
    }
    if (isPartShift) {
      imagePath += `/${variantKey}-shift.png`;
    } else {
      imagePath += `/${variantKey}.png`;
    }
  } else {
    imagePath += ".png";
  }
  return imagePath;
};

export const getAxieColorPartShift = (variant: string) => {
  const partColorShift = genesStuff.getAxieColorPartShift(variant);
  return partColorShift;
};

export const getSampleColorVariant = (className: string, colorValue: number) : number => {
  const lst = genesStuff.axieSkinColors.filter((x) => x.class.toLowerCase() === className && x.skin == 0);
  if(lst.length == 0) return 0;
  var axieSkinColor = lst[colorValue % lst.length];
  return genesStuff.axieSkinColors.indexOf(axieSkinColor);
};

