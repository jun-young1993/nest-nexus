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
        console.log(this.solarLunar);
    }

    public toJson(){
      const year = this.heavenlyStemBranch.getYear();
      const month = this.heavenlyStemBranch.getMonth();
      const day = this.heavenlyStemBranch.getDay();
      const time = this.heavenlyStemBranch.getTime();
      return {
        year: {
          ...year,
          ten: this.heavenlyStemBranch.getTenGods(year)
        },
        month: {
          ...month,
          ten: this.heavenlyStemBranch.getTenGods(month)
        },
        day: {
          ...day,
          ten: this.heavenlyStemBranch.getTenGods(day)
        },
        time: {
          ...time,
          ten: this.heavenlyStemBranch.getTenGods(time)
        },
        info: {
          date: {
            lunar: `${String(this.solarLunar.lYear)}-${String(this.solarLunar.lMonth).padStart(2, '0')}-${String(this.solarLunar.lDay).padStart(2, '0')}`,
            solar: `${String(this.solarLunar.cYear)}-${String(this.solarLunar.cMonth).padStart(2, '0')}-${String(this.solarLunar.cDay).padStart(2, '0')}`,
          },
          animal: this.solarLunar.animal
        }
      }
    }

}