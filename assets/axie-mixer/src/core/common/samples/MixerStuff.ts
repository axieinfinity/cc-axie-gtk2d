import { getSampleName, mix } from "../../axie-mixing/SplatSkeletonMixer";
import { ACESSORY_SLOTS, boneComboTypes } from "../genes/BodyStructure";
import { AnimationHeader, SampleAnimationData } from "./SampleAnimationData";
import { MixedSkeletonData, SampleSkeletonData } from "./SampleSkeletonData";


class AxieMierStuff {
  sampleSkeletonMap: { [key: string]: SampleSkeletonData };
  variantList: string[];
  animationHeaders: Array<AnimationHeader>;
  animationCRCMap: { [key: string]: SampleAnimationData };
  sortingRules: { [key: string]: Array<string> };
  accessoryAnims: { [key: string]: { [key: string]: any } };
  initilized: boolean;

  constructor() {
    this.initilized = false;
  }

  public load(samplesJson: any, variantsJson: any, animationsJson: any) {
    this.variantList = variantsJson.items;
    this.loadSamples(samplesJson);
    this.loadAnimations(animationsJson);
    this.initilized = true;
  }

  private loadSamples(samplesJson: any) {
    this.sampleSkeletonMap = samplesJson.items;
    this.sortingRules = samplesJson.sortingRules;
    this.accessoryAnims = samplesJson.accessoryAnims;
  }

  private loadAnimations(animationsJson: any) {
    const samplesData = animationsJson.items;
    this.animationHeaders = samplesData.header;
    this.animationCRCMap = samplesData.animations;
  }

  public generateAsset(
    adultCombo: Map<string, string>,
    skipAnim: boolean,
    debug = false
  ): MixedSkeletonData {
    let boneCombo = new Array();
    let samples = new Map();
    let sampleAnimations = {};
    for (let i = 0; i < boneComboTypes.length; i++) {
      boneCombo.push(adultCombo.get(boneComboTypes[i]));
    }

    for (const sampleName of boneCombo) {
      if (sampleName in samples) continue;

      if (sampleName in this.sampleSkeletonMap) {
        const sampleResult = this.sampleSkeletonMap[sampleName];
        for (const animationName in sampleResult.keyAnimations) {
          if (!(animationName in sampleAnimations)) {
            sampleAnimations[animationName] = {};
          }
          if (!(sampleName in sampleAnimations[animationName])) {
            sampleAnimations[animationName][sampleName] =
              sampleResult.keyAnimations[animationName];
          }
        }
        samples.set(sampleName, sampleResult);
      }
    }

    let mixedJson = mix(boneCombo, samples, this.sortingRules, debug);
    const bones = mixedJson.bones;
    const slots = mixedJson.slots;
    const skins = mixedJson.skins;

    for (let slotName in skins[0].attachments) {
      const slotAttachments = skins[0].attachments[slotName];
      if(ACESSORY_SLOTS.includes(slotName)){
        if (adultCombo.has(slotName)){
          let selectedAccessory = adultCombo.get(slotName);
          if (selectedAccessory in slotAttachments){
            slotAttachments[slotName] = slotAttachments[selectedAccessory];
          } else{
            selectedAccessory += '_00';
            if (selectedAccessory in slotAttachments){
              slotAttachments[slotName] = slotAttachments[selectedAccessory];
            }
          }
        } else{
          delete skins[0].attachments[slotName];
        }
      }
      if (slotName === "body-class") {
        const selectedAttachment = "body-class-" + adultCombo.get("body-class");
        const attachmentNames = Object.keys(slotAttachments);
        for (const attachmentName of attachmentNames) {
          if (attachmentName != selectedAttachment) {
            delete slotAttachments[attachmentName];
          }
        }
      } else if (slotName.startsWith("body-id-")) {
        if(adultCombo.has("body-id")){
          let bodyId = adultCombo.get("body-id");

          if (bodyId.length <= 4) {
            bodyId = String(bodyId).padStart(
              (6 - bodyId.length) / 2 + bodyId.length,
              " "
            );
          }

          let val = -1;
          let i = 102 - slotName.charCodeAt(8);
          if (
            i >= 0 &&
            i < bodyId.length &&
            bodyId.charCodeAt(i) >= 48 &&
            bodyId.charCodeAt(i) <= 57
          ) {
            val = bodyId.charCodeAt(i) - 48;
          }

          const selectedAttachment =
            "body-id-" +
            String(val).padStart(2, "0") +
            "-" +
            adultCombo.get("body-class");
          const attachmentNames = Object.keys(slotAttachments);
          for (const attachmentName of attachmentNames) {
            if (attachmentName != selectedAttachment) {
              delete slotAttachments[attachmentName];
            }
          }
        }
      }
    }

    if (skipAnim) {
      return mixedJson;
    } else {
      let animations = {};
      for (const animationHeader of this.animationHeaders) {
        let crcSampleMaps = {};
        if (animationHeader.name in sampleAnimations) {
          crcSampleMaps = sampleAnimations[animationHeader.name];
        }
        if (
          Object.keys(crcSampleMaps).length === 0 &&
          animationHeader.defaultKey === null
        ) {
          continue;
        }

        let mixedBones = {};
        let mixedSlots = {};
        let mixedDrawOrder = [];
        for (const bone of bones) {
          const sampleName = getSampleName(bone.name, boneCombo);
          let crcKey = animationHeader.defaultKey;
          if (sampleName in crcSampleMaps) {
            crcKey = crcSampleMaps[sampleName];
          }
          if (crcKey in this.animationCRCMap) {
            const sampleAnimation = this.animationCRCMap[crcKey];
            if (sampleAnimation.bones) {
              if (bone.name in sampleAnimation.bones) {
                mixedBones[bone.name] = sampleAnimation.bones[bone.name];
              }
            }
          }
        }

        for (const slot of slots) {
          const sampleName = getSampleName(slot.name, boneCombo);
          let crcKey = animationHeader.defaultKey;
          if (sampleName in crcSampleMaps) {
            crcKey = crcSampleMaps[sampleName];
          }
          if (crcKey in this.animationCRCMap) {
            const sampleAnimation = this.animationCRCMap[crcKey];
            if (sampleAnimation.slots) {
              if (slot.name in sampleAnimation.slots) {
                mixedSlots[slot.name] = sampleAnimation.slots[slot.name];
              }
            }
          }
        }

        //Inject Accessory anim
        if(animationHeader.name == "action/idle/normal" ||
          animationHeader.name == "action/idle/random-01" ||
          animationHeader.name == "action/idle/random-02" ||
          animationHeader.name == "action/idle/random-03" ||
          animationHeader.name == "action/idle/random-04") {
          for(const accessorySlot in this.accessoryAnims) {
            if (adultCombo.has(accessorySlot)){
              let selectedAccessory = adultCombo.get(accessorySlot);
              mixedSlots[accessorySlot] = this.accessoryAnims[accessorySlot][selectedAccessory]
            }
          }
        }

        {
          const sampleName = boneCombo[0]; //body
          let crcKey = animationHeader.defaultKey;
          if (sampleName in crcSampleMaps) {
            crcKey = crcSampleMaps[sampleName];
          }
          if (crcKey in this.animationCRCMap) {
            const sampleAnimation = this.animationCRCMap[crcKey];
            if (sampleAnimation.drawOrder) {
              for (const drawOrderMap in sampleAnimation.drawOrder) {
                let clone = {
                  time: drawOrderMap["time"],
                  offsets: [],
                };
                const offsets: Array<any> = drawOrderMap["offsets"];
                if (offsets) {
                  for (const offsetMap of offsets) {
                    const slotIndex = slots.findIndex(
                      (x) => x.name === offsetMap.slot
                    );
                    const bodySlotIndex = slots.findIndex(
                      (x) => x.name === "body"
                    );
                    if (slotIndex != -1 && bodySlotIndex != -1) {
                      //phuongnk - move it above body
                      if (slotIndex < bodySlotIndex) {
                        let cloneOffsetData = {
                          slot: offsetMap.slot,
                          offset: bodySlotIndex - slotIndex,
                        };
                        clone.offsets.push(cloneOffsetData);
                      }
                    }
                  }
                }
                mixedDrawOrder.push(clone);
              }
            }
          }
        }

        let mixedAnimation = {
          slots: mixedSlots,
          bones: mixedBones,
        };
        if (mixedDrawOrder && mixedDrawOrder.length > 0) {
          mixedAnimation["drawOrder"] = mixedDrawOrder;
        }
        animations[animationHeader.name] = mixedAnimation;
      }
      mixedJson.animations = animations;
      return mixedJson;
    }
  }
}

const mixerStuff = new AxieMierStuff();

export { mixerStuff };
