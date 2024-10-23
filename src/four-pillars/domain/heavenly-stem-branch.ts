import isInTimeRange from "src/utils/date/is-In-time-range";
import { EarthlyBranches, HeavenlyEarthlyInterface, HeavenlyStems } from "../interfaces/heavenly-earthly.interface";
import SolarLunarInterface from "../interfaces/solar-and-lunar.interface";
export default class HeavenlyStemBranch {
    private heavenlyStems: HeavenlyStems = {
        '甲': { ko: '갑', hanja: '甲' },
        '乙': { ko: '을', hanja: '乙' },
        '丙': { ko: '병', hanja: '丙' },
        '丁': { ko: '정', hanja: '丁' },
        '戊': { ko: '무', hanja: '戊' },
        '己': { ko: '기', hanja: '己' },
        '庚': { ko: '경', hanja: '庚' },
        '辛': { ko: '신', hanja: '辛' },
        '壬': { ko: '임', hanja: '壬' },
        '癸': { ko: '계', hanja: '癸' },
    };

    private earthlyBranches: EarthlyBranches = {
        '子': { ko: '자', hanja: '子' },
        '丑': { ko: '축', hanja: '丑' },
        '寅': { ko: '인', hanja: '寅' },
        '卯': { ko: '묘', hanja: '卯' },
        '辰': { ko: '진', hanja: '辰' },
        '巳': { ko: '사', hanja: '巳' },
        '午': { ko: '오', hanja: '午' },
        '未': { ko: '미', hanja: '未' },
        '申': { ko: '신', hanja: '申' },
        '酉': { ko: '유', hanja: '酉' },
        '戌': { ko: '술', hanja: '戌' },
        '亥': { ko: '해', hanja: '亥' },
    }
    
    private solarLunar: SolarLunarInterface;

    private hour: number;
    private minute: number;

    constructor(
      solarLunar: SolarLunarInterface,
      hour: number,
      minute: number
    ){
      this.solarLunar = solarLunar;
      this.hour = hour;
      this.minute = minute;
    }

    public getYear(): HeavenlyEarthlyInterface {
      return this.getHeavenlyAndEarthly(this.solarLunar.gzYear);
    }

    public getMonth(): HeavenlyEarthlyInterface {
      return this.getHeavenlyAndEarthly(this.solarLunar.gzMonth);
    }

    public getDay(): HeavenlyEarthlyInterface {
      return this.getHeavenlyAndEarthly(this.solarLunar.gzDay);
    }

    public getTime(): HeavenlyEarthlyInterface {
      return this.getHourHeavenlyAndEarthly();
    }

    // 천간과 지지를 분리하여 객체 반환
    private getHeavenlyAndEarthly(heavenlyAndEarthly: string): HeavenlyEarthlyInterface {
      const [heavenly, earthly] = heavenlyAndEarthly.split('');
      return {
        heavenly: this.heavenlyStems[heavenly],
        earthly: this.earthlyBranches[earthly],
      };
    }

    private getHourHeavenlyAndEarthly(){
      const timeTable = {
        子: { 
          "甲": "甲子", "己": "甲子", 
          "乙": "丙子", "庚": "丙子", 
          "丙": "戊子", "辛": "戊子", 
          "丁": "庚子", "壬": "庚子", 
          "戊": "壬子", "癸": "壬子" 
        },
        丑: { 
          "甲": "乙丑", "己": "乙丑", 
          "乙": "丁丑", "庚": "丁丑", 
          "丙": "己丑", "辛": "己丑", 
          "丁": "辛丑", "壬": "辛丑", 
          "戊": "癸丑", "癸": "癸丑"
        },
        寅: { 
          "甲": "丙寅", "己": "丙寅", 
          "乙": "戊寅", "庚": "戊寅", 
          "丙": "庚寅", "辛": "庚寅", 
          "丁": "壬寅", "壬": "壬寅", 
          "戊": "甲寅", "癸": "甲寅" 
        },
        卯: { 
          "甲": "丁卯", "己": "丁卯", 
          "乙": "己卯", "庚": "己卯", 
          "丙": "辛卯", "辛": "辛卯", 
          "丁": "癸卯", "壬": "癸卯", 
          "戊": "乙卯", "癸": "乙卯"
        },
        辰: { 
          "甲": "戊辰", "己": "戊辰", 
          "乙": "庚辰", "庚": "庚辰", 
          "丙": "壬辰", "辛": "壬辰", 
          "丁": "甲辰", "壬": "甲辰", 
          "戊": "丙辰", "癸": "丙辰"
        },
        巳: { 
          "甲": "己巳", "己": "己巳", 
          "乙": "辛巳", "庚": "辛巳", 
          "丙": "癸巳", "辛": "癸巳", 
          "丁": "乙巳", "壬": "乙巳", 
          "戊": "丁巳", "癸": "丁巳"
        },
        午: { 
          "甲": "庚午", "己": "庚午", 
          "乙": "壬午", "庚": "壬午", 
          "丙": "甲午", "辛": "甲午", 
          "丁": "丙午", "壬": "丙午", 
          "戊": "戊午", "癸": "戊午"
        },
        未: { 
          "甲": "辛未", "己": "辛未", 
          "乙": "癸未", "庚": "癸未", 
          "丙": "乙未", "辛": "乙未", 
          "丁": "丁未", "壬": "丁未", 
          "戊": "己未", "癸": "己未"
        },
        申: { 
          "甲": "壬申", "己": "壬申", 
          "乙": "甲申", "庚": "甲申", 
          "丙": "丙申", "辛": "丙申", 
          "丁": "戊申", "壬": "戊申", 
          "戊": "庚申", "癸": "庚申"
        },
        酉: { 
          "甲": "癸酉", "己": "癸酉", 
          "乙": "乙酉", "庚": "乙酉", 
          "丙": "丁酉", "辛": "丁酉", 
          "丁": "己酉", "壬": "己酉", 
          "戊": "辛酉", "癸": "辛酉"
        },
        戌: { 
          "甲": "甲戌", "己": "甲戌", 
          "乙": "丙戌", "庚": "丙戌", 
          "丙": "戊戌", "辛": "戊戌", 
          "丁": "庚戌", "壬": "庚戌", 
          "戊": "壬戌", "癸": "壬戌"
        },
        亥: { 
          "甲": "乙亥", "己": "乙亥", 
          "乙": "丁亥", "庚": "丁亥", 
          "丙": "己亥", "辛": "己亥", 
          "丁": "辛亥", "壬": "辛亥", 
          "戊": "癸亥", "癸": "癸亥"
        }
      };
      // 시간대별로 시간을 구분하는 범위 설정
      const timeRanges = [
        { branch: '子', start: [23, 30], end: [1, 30] },
        { branch: '丑', start: [1, 30], end: [3, 30] },
        { branch: '寅', start: [3, 30], end: [5, 30] },
        { branch: '卯', start: [5, 30], end: [7, 30] },
        { branch: '辰', start: [7, 30], end: [9, 30] },
        { branch: '巳', start: [9, 30], end: [11, 30] },
        { branch: '午', start: [11, 30], end: [13, 30] },
        { branch: '未', start: [13, 30], end: [15, 30] },
        { branch: '申', start: [15, 30], end: [17, 30] },
        { branch: '酉', start: [17, 30], end: [19, 30] },
        { branch: '戌', start: [19, 30], end: [21, 30] },
        { branch: '亥', start: [21, 30], end: [23, 30] },
      ];
      const dayStem: string = this.solarLunar.gzDay[0];
      // 주어진 시간에 해당하는 시간대(지지)를 찾음
      const timePeriod = timeRanges.find((range) => {
        const [startHour, startMinute] = range.start;
        const [endHour, endMinute] = range.end;

        if (this.hour > startHour || (this.hour === startHour && this.minute >= startMinute)) {
          if (this.hour < endHour || (this.hour === endHour && this.minute < endMinute)) {
            return true;
          }
        }
        return false;
      });

      if (!timePeriod) {
        throw new Error('시간을 찾을 수 없습니다.');
      }

      // 찾은 시간대의 지지와 일간에 맞는 천간으로 시간지를 반환
      const branch = timePeriod.branch;
      return this.getHeavenlyAndEarthly(timeTable[branch][dayStem]);
    }

  }
  