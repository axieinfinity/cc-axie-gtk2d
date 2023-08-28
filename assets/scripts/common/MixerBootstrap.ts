import { _decorator, Component, JsonAsset, Material, Node } from 'cc';
import { initAxieMixer } from '../../axie-mixer';
const { ccclass, property } = _decorator;

@ccclass('MixerBootstrap')
export class MixerBootstrap extends Component {
    @property(JsonAsset)
    mixerGenesJson: JsonAsset = null!;

    @property(JsonAsset)
    mixerSamplesJson: JsonAsset = null!;

    @property(JsonAsset)
    mixerVariantsJson: JsonAsset = null!;

    @property(JsonAsset)
    mixerAnimationsJson: JsonAsset = null!;

    @property(Node)
    toAwakeNode: Node = null!;

    start() {
        this.initMixer();
    }

    initMixer(){
        console.log('initMixer');
        initAxieMixer(this.mixerGenesJson.json, this.mixerSamplesJson.json, this.mixerVariantsJson.json, this.mixerAnimationsJson.json);
        console.log('initMixer done');
        if(this.toAwakeNode){
            this.toAwakeNode.active = true;
        }
    }
}
