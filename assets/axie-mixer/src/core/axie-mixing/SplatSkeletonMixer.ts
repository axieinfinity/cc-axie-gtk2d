import { boneComboTypes } from "../common/genes/BodyStructure";
import {
  MixedSkeletonData,
  SampleSkeletonData,
} from "../common/samples/SampleSkeletonData";

export const isBodySample = (name: string) => {
  for (let i = 1; i < boneComboTypes.length; i++) {
    if (name.startsWith(boneComboTypes[i].toString())) {
      return false;
    }
  }
  return true;
};

export const getSampleName = (name: string, boneCombo: Array<string>) => {
  if (name.length > 0 && name[0] === "@") {
    return boneCombo[0]; //body
  }

  for (let i = 1; i < boneComboTypes.length; i++) {
    if (name.startsWith(boneComboTypes[i].toString())) {
      return boneCombo[i];
    }
  }

  return boneCombo[0]; //body
};

export const addCustomBoneRule = (
  edges: { [key: string]: Array<string> },
  sortingRules: { [key: string]: Array<string> }
) => {
  if (sortingRules === null) return;
  for (const p in sortingRules) {
    for (const q of sortingRules[p]) {
      if (p in edges && q in edges) {
        edges[p].push(q);
      }
    }
  }
};

export const mixEntriesFromSample = (
  mapEntries: (sample: SampleSkeletonData) => Array<{ [key: string]: any }>,
  boneCombo: Array<string>,
  samples: Map<string, SampleSkeletonData>,
  sortingRules: { [key: string]: Array<string> }
): Array<any> => {
  const edges: { [key: string]: Array<string> } = {};

  const bodyNodes = mapEntries(samples.get(boneCombo[0]));
  let previousName = bodyNodes[0]["name"];
  for (let index = 1; index < bodyNodes.length; index++) {
    const entry = bodyNodes[index];
    const entryName = entry["name"];
    if (!isBodySample(entryName)) continue;
    if (edges[entryName]) {
      edges[entryName].push(previousName);
    } else {
      const vec: Array<any> = [];
      vec.push(previousName);
      edges[entryName] = vec;
    }
    previousName = entryName;
  }

  for (let i = 1; i < boneComboTypes.length; i++) {
    const bonePrefix = boneComboTypes[i].toString();

    const bodyNodes = mapEntries(samples.get(boneCombo[i]));
    previousName = bodyNodes[0]["name"];
    for (let index = 1; index < bodyNodes.length; index++) {
      const entry = bodyNodes[index];
      const entryName = entry["name"];
      if (!isBodySample(entryName)) {
        if (!entryName.startsWith(bonePrefix)) continue;
      } else if (
        !entryName.startsWith("body") &&
        !entryName.startsWith("shadow")
      ) {
        continue;
      }
      if (edges[entryName]) {
        edges[entryName].push(previousName);
      } else {
        const vec: Array<any> = [];
        vec.push(previousName);
        edges[entryName] = vec;
      }
      previousName = entryName;
    }
  }

  addCustomBoneRule(edges, sortingRules);

  function visit(
    name: string,
    visited: { [key: string]: boolean },
    edges: { [key: string]: Array<string> },
    sortedNames: Array<string>
  ) {
    if (!visited[name]) {
      visited[name] = true;

      if (edges[name]) {
        for (const edge of edges[name]) {
          visit(edge, visited, edges, sortedNames);
        }
      }

      sortedNames.push(name);
    }
  }

  const visited = {};
  const sortedNames = [];

  for (const [key, sample] of Array.from(samples.entries())) {
    mapEntries(sample).forEach((entry) => {
      const entryName = entry["name"];
      visit(entryName, visited, edges, sortedNames);
    });
  }

  const mixed: Array<{ [key: string]: any }> = [];
  sortedNames.forEach((name) => {
    const sampleName = getSampleName(name, boneCombo);
    if (sampleName) {
      const sample = samples.get(sampleName);
      const sampleEntries = mapEntries(sample);

      sampleEntries.forEach((entry) => {
        if (entry["name"] === name) {
          mixed.push(entry);
        }
      });
    }
  });

  return mixed;
};

export const mixSkins = (
  boneCombo: Array<string>,
  samples: Map<string, SampleSkeletonData>,
  boneNames: Array<string>,
  skinNames: Array<string>,
  slotNames: Array<string>,
  debug = false
): Array<{ [key: string]: any }> | undefined => {
  const skins: Array<{ [key: string]: any }> = [];

  const slotTransform = (slot: { [key: string]: any }, sampleName: string) => {
    const transformedSlot: { [key: string]: any } = {};

    const sampleBones = samples.get(sampleName).bones;
    // eslint-disable-next-line no-console
    // console.log('sampleBones', sampleBones)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for (const [name, _attachment] of Object.entries(slot)) {
      const attachment = JSON.parse(JSON.stringify(_attachment));
      if (attachment.type === "mesh") {
        const { vertices } = attachment;
        const { uvs } = attachment;

        if (vertices.length > uvs.length) {
          const transformedVertices = vertices;

          let i = 0;
          while (i < vertices.length) {
            const numBones = vertices[i++];

            for (let j = 0; j < numBones; j++) {
              const boneIndex = vertices[i];
              // eslint-disable-next-line no-console
              if (debug) console.log(boneIndex);
              const boneName = sampleBones[boneIndex]["name"];
              if (debug) console.log(boneName);
              transformedVertices[i] = boneNames.indexOf(boneName);
              i += 4;
            }
          }
          attachment.vertices = transformedVertices;
        }
      }
      transformedSlot[name] = attachment;
    }

    return transformedSlot;
  };

  const getSlotInSampleSkins = (
    skinName: string,
    slotName: string,
    sampleName: string
  ) => {
    const sample = samples.get(sampleName);

    const skin = sample.skins.find((skin) => skin["name"] === skinName);

    if (skin) {
      const skinAttachments: any = skin.attachments;
      if (skinAttachments === undefined) {
        return undefined;
      }
      const slot = skinAttachments[slotName];

      return slot;
    }

    return undefined;
  };

  const comboRoot = boneCombo[0];
  for (const skinName of skinNames) {
    const skin: { [key: string]: any } = {};
    skin.name = skinName;

    const mixed: { [key: string]: { [key: string]: any } } = {};
    for (const slotName of slotNames) {
      const sampleName = getSampleName(slotName, boneCombo);
      if (sampleName) {
        const map = getSlotInSampleSkins(skinName, slotName, sampleName);
        if (map) {
          mixed[slotName] = slotTransform(map, sampleName);
          continue;
        }
      }
      const map2 = getSlotInSampleSkins(skinName, slotName, comboRoot);
      if (map2) {
        mixed[slotName] = slotTransform(map2, sampleName);
      }
    }
    skin.attachments = mixed;
    skins.push(skin);
  }

  return skins;
};

const correctBones = (
  bones: any[]
) => {
  const final = [];
  let invalidBoneOrders = []
  const boneTrees = {};
  let src = bones;

  let fixLoop = 0;
  while(fixLoop < 100){
    for(const bone of src){
      //@ts-ignore
      if(bone.parent){
        //@ts-ignore
        if(bone.parent in boneTrees){
          //@ts-ignore
          boneTrees[bone.name] = bone.parent;
          final.push(bone);
        } else{
          invalidBoneOrders.push(bone);
        }
      } else{
        boneTrees[bone.name] = '';
        final.push(bone);
      }
    }
    if(invalidBoneOrders.length == 0){
      break;
    }
    fixLoop += 1;
    src = invalidBoneOrders;
    invalidBoneOrders = []
  }

  return final;
}
export const mix = (
  boneCombo: Array<string>,
  samples: Map<string, SampleSkeletonData>,
  sortingRules: { [key: string]: Array<string> },
  debug = false
) => {
  let bones = mixEntriesFromSample(
    (sample) => sample.bones,
    boneCombo,
    samples,
    sortingRules
  );
  bones = correctBones(bones);
  const boneNames = bones.map((bone) => bone["name"]);

  const slots = mixEntriesFromSample(
    (sample) => sample.slots,
    boneCombo,
    samples,
    sortingRules
  );
  const slotNames = slots.map((slot) => slot["name"]);

  const ik = mixEntriesFromSample(
    (sample) => sample.ik,
    boneCombo,
    samples,
    sortingRules
  );

  const skinNames = ["default"];
  const skins = mixSkins(
    boneCombo,
    samples,
    boneNames,
    skinNames,
    slotNames,
    debug
  );

  let events = {};
  for (const [key, sample] of Array.from(samples.entries())) {
    if (sample.events === null) continue;
    for (const q in sample.events) {
      events[q] = {};
    }
  }

  return new MixedSkeletonData(bones, slots, skins, ik, events, null);
};
