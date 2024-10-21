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

    constructor(solarLunar){
      this.solarLunar = solarLunar;
      console.log(this.getHeavenlyAndEarthly(this.solarLunar.gzYear));
      // this.year = this.getHeavenlyAndEarthly(this.solarLunar.gzYear);
      // this.month = this.getHeavenlyAndEarthly(this.solarLunar.gzMonth);
      // this.day = this.getHeavenlyAndEarthly(this.solarLunar.gzDay);
    }
    
    // 천간과 지지를 분리하여 객체 반환
    private getHeavenlyAndEarthly(heavenlyAndEarthly: string): HeavenlyEarthlyInterface {
      const [heavenly, earthly] = heavenlyAndEarthly.split('');
      return {
        heavenly: this.heavenlyStems[heavenly],
        earthly: this.earthlyBranches[earthly],
      };
    }
  
    // 시천간(時干) 결정 (일간에 따른 시천간을 반환)
    public getHourStem(dayStem: string) {
      const stemMap = {
        '甲': '甲', '己': '甲',  // 갑, 기일이면 갑목
        '乙': '丙', '庚': '丙',  // 을, 경일이면 병화
        '丙': '戊', '辛': '戊',  // 병, 신일이면 무토
        '丁': '庚', '壬': '庚',  // 정, 임일이면 경금
        '戊': '壬', '癸': '壬',  // 무, 계일이면 임수
      };
      return stemMap[dayStem];
    }
  
    // 시지(時支) 결정 (시간에 따라 시지 반환)
    public getHourBranch(hour: number) {
      const hourBranches = [
        { start: 23, end: 1, branch: '子' },
        { start: 1, end: 3, branch: '丑' },
        { start: 3, end: 5, branch: '寅' },
        { start: 5, end: 7, branch: '卯' },
        { start: 7, end: 9, branch: '辰' },
        { start: 9, end: 11, branch: '巳' },
        { start: 11, end: 13, branch: '午' },
        { start: 13, end: 15, branch: '未' },
        { start: 15, end: 17, branch: '申' },
        { start: 17, end: 19, branch: '酉' },
        { start: 19, end: 21, branch: '戌' },
        { start: 21, end: 23, branch: '亥' },
      ];
    
      return hourBranches.find(
        (period) => (hour >= period.start || hour < period.end)
      )?.branch || '子';  // 기본적으로 자시(子) 반환
    }
  }
  