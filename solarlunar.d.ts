// solarlunar.d.ts
// lYear: 1993 — 음력 연도를 나타냅니다. 이 경우 음력으로 1993년입니다.

// lMonth: 9 — 음력 월을 나타냅니다. 이 경우 음력으로 9월입니다.

// lDay: 1 — 음력 일을 나타냅니다. 이 경우 음력으로 1일입니다.

// animal: '鸡' — **해의 띠(生肖)**를 나타냅니다. 이 경우 '鸡'는 닭띠를 의미합니다. 음력 연도에 따라 띠가 정해집니다.

// yearCn: '一九九三年' — 중국어로 표현된 음력 연도입니다. '一九九三年'은 1993년을 뜻합니다.

// monthCn: '九月' — 중국어로 표현된 음력 월입니다. '九月'은 9월을 뜻합니다.

// dayCn: '初一' — 중국어로 표현된 음력 일입니다. '初一'은 음력에서 1일을 의미합니다. '初'는 1일에서 10일까지를 표현할 때 쓰입니다.

// cYear: 1993 — 양력 연도를 나타냅니다. 이 경우 양력으로 1993년입니다.

// cMonth: 10 — 양력 월을 나타냅니다. 이 경우 양력으로 10월입니다.

// cDay: 15 — 양력 일을 나타냅니다. 이 경우 양력으로 10월 15일입니다.

// gzYear: '癸酉' — 연주의 천간과 지지입니다. 이 경우 '癸酉'는 음력 1993년의 천간 '癸'와 지지 '酉'를 나타내며, 이는 계유년(닭띠)을 의미합니다.

// gzMonth: '壬戌' — 월주의 천간과 지지입니다. 이 경우 '壬戌'는 음력 9월의 천간 '壬'과 지지 '戌'을 나타내며, 이는 임술월을 의미합니다.

// gzDay: '己巳' — 일주의 천간과 지지입니다. 이 경우 '己巳'는 해당 날짜의 천간 '己'와 지지 '巳'를 나타내며, 이는 기사일을 의미합니다.

// isToday: false — 오늘인지 여부를 나타냅니다. 이 값은 false이므로 해당 데이터가 오늘을 나타내지 않음을 의미합니다.

// isLeap: false — 윤달 여부를 나타냅니다. 이 값은 false이므로, 해당 월이 윤달이 아님을 의미합니다.

// nWeek: 5 — **양력으로 해당 날짜의 요일(숫자)**를 나타냅니다. 5는 금요일을 의미합니다.

// ncWeek: '星期五' — 중국어로 표현된 요일입니다. '星期五'는 금요일을 의미합니다.

// isTerm: false — 절기 여부를 나타냅니다. 이 값이 false이므로, 해당 날짜가 절기에 해당하지 않음을 의미합니다.

// term: '' — 절기 이름을 나타냅니다. 절기가 없는 경우 빈 문자열이 반환됩니다.
declare module 'solarlunar' {
    export function solar2lunar(year: number, month: number, day: number): {
        lYear: number;
        lMonth: number;
        lDay: number;
        animal: string;
        IMonthCn: string;
        IDayCn: string;
        cYear: number;
        cMonth: number;
        cDay: number;
        gzYear: string;
        gzMonth: string;
        gzDay: string,
        isToday: boolean,
        isLeap: boolean,
        nWeek: number,
        ncWeek: string,
        isTerm: boolean,
        term: string
    };

    export function lunar2solar(year: number, month: number, day: number): {
        lYear: number;
        lMonth: number;
        lDay: number;
        animal: string;
        IMonthCn: string;
        IDayCn: string;
        cYear: number;
        cMonth: number;
        cDay: number;
        gzYear: string;
        gzMonth: string;
        gzDay: string,
        isToday: boolean,
        isLeap: boolean,
        nWeek: number,
        ncWeek: string,
        isTerm: boolean,
        term: string
    };
}