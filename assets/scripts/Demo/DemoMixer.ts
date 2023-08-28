import { _decorator, Component, instantiate, Node, Prefab } from 'cc';
import AxieView from '../common/AxieView';
import { getSampleColorVariant } from '../../axie-mixer';
const { ccclass, property } = _decorator;

@ccclass('DemoMixer')
export class DemoMixer extends Component {
    @property(Node)
    private root: Node = null!;

    @property({type: Prefab})
    private axiePrefab: Prefab  = null;
    
    start() {
        this.testAll();
        this.testFromGene();
    }

    testAll(){
        const bodies = [
            "body-normal",
            "body-bigyak",
            "body-curly",
            "body-fuzzy",
            "body-spiky",
            "body-sumo",
            "body-wetdog",
        ];
        const classNames = [
            "beast",
            "bug",
            "bird",
            "plant",
            "aquatic",
            "reptile",
        ];
        let k=0;
        for(let classIdx=0;classIdx<6;classIdx++){
            for (let classValue = 2;classValue <= 12;classValue += 2,k++){
                const key = `${classNames[classIdx]}-${("00" + classValue).slice (-2)}`;
                const keyAdjust = key.replace("-06", "-02").replace("-12", "-04");

                let newAxieGO: Node = instantiate(this.axiePrefab);
                newAxieGO.setParent(this.root);

                let axieView = newAxieGO.getComponent(AxieView);

                const combo = new Map<string, string>();
                combo.set('body', bodies[k % bodies.length]);
                combo.set('back', key);
                combo.set('ears', key);
                combo.set('ear', key);
                combo.set('eyes', keyAdjust);
                combo.set('horn', key);
                combo.set('mouth', keyAdjust);
                combo.set('tail', keyAdjust);
                combo.set('body-class', classNames[classIdx]);

                const colorVariant = getSampleColorVariant(classNames[classIdx], classValue);
                axieView.initFromCombo(combo, colorVariant);
            }
        }

    }

    testFromGene(){
        const newGenes = '0x2000000000000300008100e08308000000010010088081040001000010a043020000009008004106000100100860c40200010000084081060001001410a04406';
        let newAxieGO: Node = instantiate(this.axiePrefab);
        newAxieGO.setParent(this.root);

        let axieView = newAxieGO.getComponent(AxieView);
        axieView.init('2727', newGenes, []);
    }
}
