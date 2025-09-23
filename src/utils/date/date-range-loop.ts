/**
 * 특정 년월의 모든 날짜를 배열로 반환하는 함수
 * @param year - 년도 (YYYY)
 * @param month - 월 (MM)
 * @returns 해당 월의 모든 날짜 배열 (YYYY-MM-DD 형식)
 */
export function getDatesInMonth(
  year: string | number,
  month: string | number,
): string[] {
  const firstDay = new Date(
    parseInt(year.toString()),
    parseInt(month.toString()) - 1,
    1,
  );
  const lastDay = new Date(
    parseInt(year.toString()),
    parseInt(month.toString()),
    0,
  ); // 다음 달의 0일 = 이번 달 마지막 날

  // 해당 월의 모든 날짜 배열 생성
  const dates: string[] = [];
  const currentDate = new Date(firstDay);

  while (currentDate <= lastDay) {
    const dateString = currentDate.toISOString().split('T')[0]; // YYYY-MM-DD 형식
    dates.push(dateString);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
}

/**
 * 시작 날짜와 끝 날짜 사이의 모든 날짜를 배열로 반환하는 함수
 * @param startDate - 시작 날짜 (YYYY-MM-DD 형식)
 * @param endDate - 끝 날짜 (YYYY-MM-DD 형식)
 * @returns 해당 기간의 모든 날짜 배열 (YYYY-MM-DD 형식)
 */
export function getDatesInRange(startDate: string, endDate: string): string[] {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const dates: string[] = [];
  const currentDate = new Date(start);

  while (currentDate <= end) {
    const dateString = currentDate.toISOString().split('T')[0]; // YYYY-MM-DD 형식
    dates.push(dateString);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
}

/**
 * 특정 년도의 모든 날짜를 배열로 반환하는 함수
 * @param year - 년도 (YYYY)
 * @returns 해당 년도의 모든 날짜 배열 (YYYY-MM-DD 형식)
 */
export function getDatesInYear(year: string | number): string[] {
  return getDatesInRange(`${year}-01-01`, `${year}-12-31`);
}
