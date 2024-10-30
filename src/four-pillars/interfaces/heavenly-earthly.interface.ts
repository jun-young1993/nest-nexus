import { Direction } from "src/enums/direction.enum";
import { WuXing, WuXingColor } from "src/enums/wuxing.enum";
import { Yinyang } from "src/enums/yinyang.enum";
export interface FourPillarsOfBase {
    ko: string;
    hanja: string;
}

export interface HeavenlyStem extends FourPillarsOfBase{
    element: WuXing;
    yinyang: Yinyang;
    color: WuXingColor
}
  
export interface HeavenlyStems {
    [key: string]: HeavenlyStem;
}
export interface EarthlyBranche extends FourPillarsOfBase{
    element: WuXing;
    yinyang: Yinyang;
    color: WuXingColor
}

export interface TenGod extends FourPillarsOfBase {

}

export interface TenGods {
    heavenly: TenGod,
    earthly: TenGod
}
  
export interface EarthlyBranches {
    [key: string]: EarthlyBranche;
}
export interface HeavenlyEarthlyInterface {
    heavenly: HeavenlyStem,
    earthly: EarthlyBranche,
}