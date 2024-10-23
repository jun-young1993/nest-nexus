import * as solarLunar from 'solarlunar';
import HeavenlyStemBranch from './heavenly-stem-branch';
import SolarLunarInterface from '../interfaces/solar-and-lunar.interface';
export class FourPillarsOfDestiny {
    private solarLunar: SolarLunarInterface;
    private heavenlyStemBranch: HeavenlyStemBranch;
    public constructor(
        year: number,
        month: number,
        day: number,
        hour: number,
        minute: number,
        isLunar: boolean = false
    ){
        this.solarLunar = solarLunar[isLunar ? 'lunar2solar' : 'solar2lunar'](year, month, day);
        this.heavenlyStemBranch = new HeavenlyStemBranch(
          this.solarLunar,
          hour,
          minute
        );
    }

    public toJson(){
      return {
        year: this.heavenlyStemBranch.getYear(),
        month: this.heavenlyStemBranch.getMonth(),
        day: this.heavenlyStemBranch.getDay(),
        time: this.heavenlyStemBranch.getTime()
      }
    }

}