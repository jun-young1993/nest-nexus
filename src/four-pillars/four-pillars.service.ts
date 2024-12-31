import { Injectable } from '@nestjs/common';
import { CreateFourPillarDto } from './dto/create-four-pillar.dto';
// https://sajuplus.tistory.com/2543
@Injectable()
export class FourPillarsService {
  // 천간과 지지 배열
  private readonly gan = [
    '갑',
    '을',
    '병',
    '정',
    '무',
    '기',
    '경',
    '신',
    '임',
    '계',
  ];
  private readonly ji = [
    '자',
    '축',
    '인',
    '묘',
    '진',
    '사',
    '오',
    '미',
    '신',
    '유',
    '술',
    '해',
  ];

  // 입춘 날짜 (예시로 양력 2월 4일 사용)
  private readonly solarTerms = {
    startYear: new Date(1993, 1, 4), // 1993년의 입춘 (2월 4일)
  };

  // 날짜 차이 계산 함수
  private calculateDaysDifference(birthDate: Date): number {
    const diffTime = birthDate.getTime() - this.solarTerms.startYear.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  // 천간과 지지를 구하는 함수
  private calculatePillars(daysDiff: number) {
    const ganIndex = daysDiff % 10; // 천간 계산
    const jiIndex = daysDiff % 12; // 지지 계산
    const dayGan = this.gan[ganIndex];
    const dayJi = this.ji[jiIndex];
    return { dayGan, dayJi };
  }

  // 연주 계산 함수
  private calculateYearPillar(year: number, birthDate: Date) {
    const ganByLunarYear = ['경', '신'];
    // 입춘 기준으로 연주 변경
    if (birthDate < this.solarTerms.startYear) {
      year -= 1;
    }
    const yearGanIndex = (year - 4) % 10;
    const yearJiIndex = (year - 4) % 12;
    const yearGan = this.gan[yearGanIndex];
    const yearJi = this.ji[yearJiIndex];
    return `${yearGan}${yearJi}`;
  }

  // 월주 계산 함수 (월간과 월지 계산)
  private calculateMonthPillar(yearGan: string, month: number) {
    let monthGan: string;

    // 월두법에 따른 월간 결정
    switch (yearGan) {
      case '갑':
      case '기':
        monthGan = this.gan[(2 + month - 1) % 10]; // 병인월부터 시작
        break;
      case '을':
      case '경':
        monthGan = this.gan[(4 + month - 1) % 10]; // 무인월부터 시작
        break;
      case '병':
      case '신':
        monthGan = this.gan[(6 + month - 1) % 10]; // 경인월부터 시작
        break;
      case '정':
      case '임':
        monthGan = this.gan[(8 + month - 1) % 10]; // 임인월부터 시작
        break;
      case '무':
      case '계':
        monthGan = this.gan[(0 + month - 1) % 10]; // 갑인월부터 시작
        break;
    }

    // 월지 결정
    const monthJi = this.ji[month]; // 월지: 인, 묘, 진, 사, 오, 미, 신, 유, 술, 해, 자, 축

    return `${monthGan}${monthJi}`;
  }

  // 시주 계산 함수
  private calculateHourPillar(dayGan: string, hour: number) {
    let hourGan: string;

    // 일간에 따른 시천간 결정
    switch (dayGan) {
      case '갑':
      case '기':
        hourGan = '갑';
        break;
      case '을':
      case '경':
        hourGan = '병';
        break;
      case '병':
      case '신':
        hourGan = '무';
        break;
      case '정':
      case '임':
        hourGan = '경';
        break;
      case '무':
      case '계':
        hourGan = '임';
        break;
    }

    // 시지 결정 (시간대에 따른 지지)
    const hourPeriods = [
      { start: 23, end: 1, ji: '자' },
      { start: 1, end: 3, ji: '축' },
      { start: 3, end: 5, ji: '인' },
      { start: 5, end: 7, ji: '묘' },
      { start: 7, end: 9, ji: '진' },
      { start: 9, end: 11, ji: '사' },
      { start: 11, end: 13, ji: '오' },
      { start: 13, end: 15, ji: '미' },
      { start: 15, end: 17, ji: '신' },
      { start: 17, end: 19, ji: '유' },
      { start: 19, end: 21, ji: '술' },
      { start: 21, end: 23, ji: '해' },
    ];

    const hourJi = hourPeriods.find(
      (period) => hour >= period.start || hour < period.end,
    ).ji;

    return `${hourGan}${hourJi}`;
  }

  // 사주 계산 함수
  public calculateFourPillars(createFourPillarDto: CreateFourPillarDto) {
    const { year, month, day, hour } = createFourPillarDto;

    // 태어난 날짜를 생성
    const birthDate = new Date(year, month - 1, day);

    // 기준일로부터 경과한 날짜 계산
    const daysDiff = this.calculateDaysDifference(birthDate);

    // 일간, 일지를 구함
    const { dayGan, dayJi } = this.calculatePillars(daysDiff);

    // 연주 계산
    const yearPillar = this.calculateYearPillar(year, birthDate);
    const yearGan = yearPillar.charAt(0); // 연주의 천간

    // 월주 계산 (연주의 천간과 월을 기준으로 계산)
    const monthPillar = this.calculateMonthPillar(yearGan, month);

    // 시주 계산 (일간과 시간을 기준으로 계산)
    const hourPillar = this.calculateHourPillar(dayGan, hour);

    // 최종 사주 반환
    return {
      yearPillar, // 연주 계산 결과
      monthPillar, // 월주 계산 결과
      dayPillar: `${dayGan}${dayJi}`, // 일주 계산 결과
      hourPillar, // 시주 계산 결과
    };
  }
}
