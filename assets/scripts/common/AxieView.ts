import { Component, _decorator, sp } from "cc";
import { getAxieSpineFromCombo, getAxieSpineFromGenes } from "../../axie-mixer";
import MixerHelper from "../helpers/MixerHelper";
const { property, ccclass } = _decorator;

@ccclass("AxieView")
export default class AxieView extends Component {
    @property(sp.Skeleton)
    spine: sp.Skeleton = null!;

    private _currentAnim: string = "";

    init(id: string, genes: string, equipments: string[]) {
        this.node.active = true;
        const meta = MixerHelper.getAxieMixerMeta(id, equipments);

        const axieBuildResult = getAxieSpineFromGenes(genes, meta);
        if (axieBuildResult.error) {
            console.log(axieBuildResult.error);
        } else {
            MixerHelper.mixerDataToSkeleton(axieBuildResult.skeletonDataAsset, this.spine.skeletonData, this.spine);
            const shadowSlot = this.spine._skeleton.findSlot('shadow');
            if(shadowSlot) shadowSlot.setAttachment(null);
            this.playIdleAnim();
        }
    }

    initFromCombo(combo: Map<string, string>, colorVariant: number) {
        this.node.active = true;

        if(!combo.has("embedded-color")){
            combo.set("embedded-color", "true");
        }

        const axieBuildResult = getAxieSpineFromCombo(combo, colorVariant);
        if (axieBuildResult.error) {
            console.log(axieBuildResult.error);
        } else {
            MixerHelper.mixerDataToSkeleton(axieBuildResult.skeletonDataAsset, this.spine.skeletonData, this.spine);
            const shadowSlot = this.spine._skeleton.findSlot('shadow');
            if(shadowSlot) shadowSlot.setAttachment(null);
            this.playIdleAnim();
        }
    }

    private playAnim(animName: string) {
        if (animName == this._currentAnim) return;
        this._currentAnim = animName;
        const track = this.spine.setAnimation(0, animName, true);
        track.mixDuration = 0.1;
    }

    playIdleAnim() {
        this.spine.setAnimation(0, "action/idle/normal", true);
        this.spine.timeScale = 1;
    }

    playSleepAnim() {
        this.spine.setAnimation(0, "activity/sleep", true);
        this.spine.timeScale = 1;
    }

    playAttackMeleeAnim(repeat: boolean = true) {
        this.spine.setAnimation(0, "attack/melee/normal-attack", repeat);
        this.spine.timeScale = 1;
    }

    playAttackRangeAnim(repeat: boolean = true) {
        this.spine.setAnimation(0, "attack/ranged/cast-fly", repeat);
        this.spine.timeScale = 1;
    }
}
