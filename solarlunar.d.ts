// solarlunar.d.ts
declare module 'solarlunar' {
    export function solar2lunar(year: number, month: number, day: number): {
        lYear: number;
        lMonth: number;
        lDay: number;
        animal: string;
        IMonthCn: string;
        IDayCn: string;
        cMonth: number;
        cDay: number;
    };

    export function lunar2solar(lYear: number, lMonth: number, lDay: number): {
        year: number;
        month: number;
        day: number;
    };
}