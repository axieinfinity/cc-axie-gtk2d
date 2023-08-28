
import { js, sp } from 'cc';

export default class MixerHelper {
    static mixerDataToSkeleton(axieSpine: any, spdata: sp.SkeletonData, spine: sp.Skeleton) {
        spine.node.active = true;
        let date = new Date();

        // Record the currently playing animation
        const animation = spine.animation;
        let copy = new sp.SkeletonData();
        js.mixin(copy, spdata);

        //copy data
        copy._uuid = spdata._uuid.split('_')[0] + "_" + date.getTime() + "_copy";

        //@ts-ignore
        copy.skeletonJson = axieSpine;

        //@ts-ignore
        copy.init && copy.init();

        spine.skeletonData = copy;
        // Continue playing the animation, or it will stop
        if (animation) {
            spine?.setAnimation(0, animation, true);
        }
    }

    static getAxieMixerMeta(axieId: string, equipments: string[]): Map<string, string>{
        const meta = new Map();
        meta.set("embedded-color", "true");
        meta.set("accessory-suit-off", "true");
        meta.set("body-id", axieId);

        if(equipments){
            for(let i=0;i<equipments.length;i++){
                const equipment = equipments[i];
                let off = 0;
                while(off < equipment.length){
                    if(equipment[off] >= '0' && equipment[off] <= '9') break;
                    off++;
                }
                const group = equipment.substring(0, off);
                meta.set("accessory-" + group, "accessory-" + equipment);
            }
        }
        return meta;
    }
}
