export interface HeavenlyStem {
    ko: string;
    hanja: string;
}
  
export interface HeavenlyStems {
    [key: string]: HeavenlyStem;
}
export interface EarthlyBranche {
    ko: string;
    hanja: string;
}
  
export interface EarthlyBranches {
    [key: string]: HeavenlyStem;
}
export interface HeavenlyEarthlyInterface {
    heavenly: HeavenlyStem,
    earthly: EarthlyBranche,
}