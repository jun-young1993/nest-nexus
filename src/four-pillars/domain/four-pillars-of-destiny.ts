import * as solarLunar from 'solarlunar';
import isInTimeRange from 'src/utils/date/is-In-time-range';
import HeavenlyStemBranch from './heavenly-stem-branch';
import SolarLunarInterface from '../interfaces/solar-and-lunar.interface';
// const ganByLunarYear = ['경','신','임','계','갑','을','병','정','무','기'];
// const zodiacs = ['자','축','인','묘','진','사','오','미','신','유','술','해'];
// const baseYear = 1936;
const gz = {
    // 천간 (Heavenly Stems)
    heavenlyStems: {
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
    },
  
    // 지지 (Earthly Branches)
    earthlyBranches: {
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
};
function getHourBranch(hour: number, minute: number) {
    const hourBranches = [
      { start: 23, startMin: 30, end: 1, endMin: 30, branch: '子' },  // 자시
      { start: 1, startMin: 30, end: 3, endMin: 30, branch: '丑' },   // 축시
      { start: 3, startMin: 30, end: 5, endMin: 30, branch: '寅' },   // 인시
      { start: 5, startMin: 30, end: 7, endMin: 30, branch: '卯' },   // 묘시
      { start: 7, startMin: 30, end: 9, endMin: 30, branch: '辰' },   // 진시
      { start: 9, startMin: 30, end: 11, endMin: 30, branch: '巳' },  // 사시
      { start: 11, startMin: 30, end: 13, endMin: 30, branch: '午' }, // 오시
      { start: 13, startMin: 30, end: 15, endMin: 30, branch: '未' }, // 미시
      { start: 15, startMin: 30, end: 17, endMin: 30, branch: '申' }, // 신시
      { start: 17, startMin: 30, end: 19, endMin: 30, branch: '酉' }, // 유시
      { start: 19, startMin: 30, end: 21, endMin: 30, branch: '戌' }, // 술시
      { start: 21, startMin: 30, end: 23, endMin: 30, branch: '亥' }, // 해시
    ];
  
    const foundBranch = hourBranches.find((period) =>
      isInTimeRange(hour, minute, period.start, period.startMin, period.end, period.endMin)
    );
  
    return foundBranch?.branch || '子';  // 기본적으로 자시(子) 반환
}
  
function getHeavenlyAndEarthly(heavenlyAndEarthly){
    const [heavenly,  earthly] = heavenlyAndEarthly.split('');
    return [
        gz.heavenlyStems[heavenly],
        gz.earthlyBranches[earthly],
    ]
}

function getHourStem(dayStem: string) {
    console.log(dayStem);
    const stemMap = {
      '甲': '甲', '己': '甲',  // 갑, 기일이면 갑목
      '乙': '丙', '庚': '丙',  // 을, 경일이면 병화
      '丙': '戊', '辛': '戊',  // 병, 신일이면 무토
      '丁': '庚', '壬': '庚',  // 정, 임일이면 경금
      '戊': '壬', '癸': '壬',  // 무, 계일이면 임수
    };
  
    return stemMap[dayStem];
  }

export class FourPillarsOfDestiny {
    private solarAndLunar: SolarLunarInterface;

    public constructor(
        year: number,
        month: number,
        day: number,
        hour: number,
        minute: number,
        isLunar: boolean = false
    ){
        this.solarAndLunar = solarLunar[isLunar ? 'lunar2solar' : 'solar2lunar'](year, month, day);
        new HeavenlyStemBranch(this.solarAndLunar);
        // console.log(getHeavenlyAndEarthly(this.solarAndLunar.gzYear));
        // console.log(getHeavenlyAndEarthly(this.solarAndLunar.gzMonth));
        // console.log(getHeavenlyAndEarthly(this.solarAndLunar.gzDay));

        // const yearHeavenlyAndEarthly = getHeavenlyAndEarthly(this.solarAndLunar.gzYear);
        // const monthHeavenlyAndEarthly = getHeavenlyAndEarthly(this.solarAndLunar.gzMonth);
        // const dayHeavenlyAndEarthly = getHeavenlyAndEarthly(this.solarAndLunar.gzDay);
        
        // // 일간(天干)을 추출
        // const dayStem = this.solarAndLunar.gzDay[0];

        // // 시천간(時干)과 시지(時支) 계산
        // const hourStem = getHourStem(dayStem);
        // const hourBranch = getHourBranch(hour,minute);

        // // 시주 출력
        // console.log('시주:', {
        //     ko: `${gz.heavenlyStems[hourStem].ko}${gz.earthlyBranches[hourBranch].ko}`,
        //     hanja: `${hourStem}${hourBranch}`,
        // });

    }

}