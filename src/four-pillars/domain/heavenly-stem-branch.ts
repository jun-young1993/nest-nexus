import { EarthlyBranche, EarthlyBranches, HeavenlyEarthlyInterface, HeavenlyStem, HeavenlyStems, TenGod, TenGods } from "../interfaces/heavenly-earthly.interface";
import SolarLunarInterface from "../interfaces/solar-and-lunar.interface";
import { Direction } from "src/enums/direction.enum"
import { WuXing, WuXingColor } from "src/enums/wuxing.enum";
import { Yinyang } from "src/enums/yinyang.enum";

/**
 * - url: https://blog.naver.com/zoayo72/221462412590
 */
export default class HeavenlyStemBranch {
    private heavenlyStems: HeavenlyStems = {
        '甲': { ko: '갑', hanja: '甲', element: WuXing.WOOD, yinyang: Yinyang.YANG, color: WuXingColor.BLUE },
        '乙': { ko: '을', hanja: '乙', element: WuXing.WOOD, yinyang: Yinyang.YIN, color: WuXingColor.BLUE },
        '丙': { ko: '병', hanja: '丙', element: WuXing.FIRE, yinyang: Yinyang.YANG, color: WuXingColor.RED },
        '丁': { ko: '정', hanja: '丁', element: WuXing.FIRE, yinyang: Yinyang.YIN, color: WuXingColor.RED },
        '戊': { ko: '무', hanja: '戊', element: WuXing.EARTH, yinyang: Yinyang.YANG, color: WuXingColor.YELLOW },
        '己': { ko: '기', hanja: '己', element: WuXing.EARTH, yinyang: Yinyang.YIN, color: WuXingColor.YELLOW },
        '庚': { ko: '경', hanja: '庚', element: WuXing.METAL, yinyang: Yinyang.YANG, color: WuXingColor.WHITE },
        '辛': { ko: '신', hanja: '辛', element: WuXing.METAL, yinyang: Yinyang.YIN, color: WuXingColor.WHITE },
        '壬': { ko: '임', hanja: '壬', element: WuXing.WATER, yinyang: Yinyang.YANG, color: WuXingColor.BLACK },
        '癸': { ko: '계', hanja: '癸', element: WuXing.WATER, yinyang: Yinyang.YIN, color: WuXingColor.BLACK },
    };

    private earthlyBranches: EarthlyBranches = {
        '子': { ko: '자', hanja: '子', element: WuXing.WATER, yinyang:Yinyang.YANG, color: WuXingColor.BLACK },
        '丑': { ko: '축', hanja: '丑', element: WuXing.EARTH, yinyang:Yinyang.YIN, color: WuXingColor.YELLOW },
        '寅': { ko: '인', hanja: '寅', element: WuXing.WOOD, yinyang:Yinyang.YANG, color: WuXingColor.BLUE },
        '卯': { ko: '묘', hanja: '卯', element: WuXing.WOOD, yinyang:Yinyang.YIN, color: WuXingColor.BLUE },
        '辰': { ko: '진', hanja: '辰', element: WuXing.EARTH, yinyang:Yinyang.YANG, color: WuXingColor.YELLOW },
        '巳': { ko: '사', hanja: '巳', element: WuXing.FIRE, yinyang:Yinyang.YIN, color: WuXingColor.RED },
        '午': { ko: '오', hanja: '午', element: WuXing.FIRE, yinyang:Yinyang.YANG, color: WuXingColor.RED },
        '未': { ko: '미', hanja: '未', element: WuXing.EARTH, yinyang:Yinyang.YIN, color: WuXingColor.YELLOW },
        '申': { ko: '신', hanja: '申', element: WuXing.METAL, yinyang:Yinyang.YANG, color: WuXingColor.WHITE },
        '酉': { ko: '유', hanja: '酉', element: WuXing.METAL, yinyang:Yinyang.YIN, color: WuXingColor.WHITE },
        '戌': { ko: '술', hanja: '戌', element: WuXing.EARTH, yinyang:Yinyang.YANG, color: WuXingColor.YELLOW },
        '亥': { ko: '해', hanja: '亥', element: WuXing.WATER, yinyang:Yinyang.YIN, color: WuXingColor.BLACK },
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

    public isGeneratingRelation(element1: WuXing, element2: WuXing): boolean {
      const generatingRelations: { [key in WuXing]: WuXing } = {
          [WuXing.WOOD]: WuXing.FIRE,    // 목 -> 화
          [WuXing.FIRE]: WuXing.EARTH,   // 화 -> 토
          [WuXing.EARTH]: WuXing.METAL,  // 토 -> 금
          [WuXing.METAL]: WuXing.WATER,  // 금 -> 수
          [WuXing.WATER]: WuXing.WOOD    // 수 -> 목
      };
  
      return generatingRelations[element1] === element2;
    }

    public isControllingRelation(element1: WuXing, element2: WuXing): boolean {
      const controllingRelations: { [key in WuXing]: WuXing } = {
          [WuXing.WOOD]: WuXing.EARTH,    // 목 -> 토
          [WuXing.EARTH]: WuXing.WATER,   // 토 -> 수
          [WuXing.WATER]: WuXing.FIRE,    // 수 -> 화
          [WuXing.FIRE]: WuXing.METAL,    // 화 -> 금
          [WuXing.METAL]: WuXing.WOOD     // 금 -> 목
      };
  
      return controllingRelations[element1] === element2;
    }

    public getTenGods(heavenlyAndEarthly: HeavenlyEarthlyInterface): TenGods {
      return {
        heavenly: this.getTenGod(heavenlyAndEarthly.heavenly),
        earthly: this.getTenGod(heavenlyAndEarthly.earthly),
      }
    }

    public getTenGod(heavenlyEarthly: HeavenlyStem | EarthlyBranche) : TenGod {
      const dayHeavenly = this.getDay().heavenly;
      // 오행이 동일하고 음양도 같으니 비견
      if((heavenlyEarthly.element === dayHeavenly.element) && (heavenlyEarthly.yinyang === dayHeavenly.yinyang)){
        return {
          ko: '비견',
          hanja: '比肩'
        };
      }
      // 乙木은 갑목일간과 오행은 동일하나 음양이 다르니 겁재
      if((heavenlyEarthly.element === dayHeavenly.element) && (heavenlyEarthly.yinyang !== dayHeavenly.yinyang)){
        return {
          ko: '겁재',
          hanja: '劫財'
        };
      }
      // 丙火는 갑목일간이 생하고 오행이 같으니 식신
      if(this.isGeneratingRelation(dayHeavenly.element, heavenlyEarthly.element ) && (heavenlyEarthly.yinyang === dayHeavenly.yinyang)){
        return {
          ko: '식신',
          hanja: '食神'
        };
      }
      // 丁火는 갑목일간이 생하고 오행이 다르니 상관
      if(this.isGeneratingRelation(dayHeavenly.element, heavenlyEarthly.element) && (heavenlyEarthly.yinyang !== dayHeavenly.yinyang)){
        return {
          ko: '상관',
          hanja: '傷官'
        };
      }
      // 戊土는 갑목일간이 극하고 오행이 같으니 편재
      if(this.isControllingRelation(dayHeavenly.element, heavenlyEarthly.element ) && (heavenlyEarthly.yinyang === dayHeavenly.yinyang)){
        return {
          ko: '편재',
          hanja: '偏財'
        };
      }
      // 己土는 갑목일간이 극하고 오행이 다르니 정재
      if(this.isControllingRelation(dayHeavenly.element, heavenlyEarthly.element ) && (heavenlyEarthly.yinyang !== dayHeavenly.yinyang)){
        return {
          ko: '정재',
          hanja: '正財'
        };
      }
      // 庚金은 갑목일간을 극하고 음양이 같으니 편관
      if(this.isControllingRelation( heavenlyEarthly.element, dayHeavenly.element ) && (heavenlyEarthly.yinyang === dayHeavenly.yinyang)){
        return {
          ko: '편관',
          hanja: '偏官'
        };
      }
      // 辛金은 갑목일간을 극하고 음양이 다르니 정관
      if(this.isControllingRelation(heavenlyEarthly.element, dayHeavenly.element ) && (heavenlyEarthly.yinyang !== dayHeavenly.yinyang)){
        return {
          ko: '정관',
          hanja: '正官'
        };
      }
      // 壬水는 갑목일간을 생하고 음양이 같으니 편인
      if(this.isGeneratingRelation(heavenlyEarthly.element, dayHeavenly.element) && (heavenlyEarthly.yinyang === dayHeavenly.yinyang)){
        return {
          ko: '편인',
          hanja: '偏印'
        };
      }
      // 癸水는 갑목일간을 생하고 음양이 다르니 정인
      if(this.isGeneratingRelation(heavenlyEarthly.element, dayHeavenly.element) && (heavenlyEarthly.yinyang !== dayHeavenly.yinyang)){
        return {
          ko: '정인',
          hanja: '正印'
        };
      }

      return {
        ko: 'unknow',
        hanja: 'unknow'
      }
      
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
  