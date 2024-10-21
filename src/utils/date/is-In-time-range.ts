export default function isInTimeRange(hour: number, minute: number, startHour: number, startMin: number, endHour: number, endMin: number) {
    const now = new Date();
    now.setHours(hour, minute);
  
    const startTime = new Date();
    startTime.setHours(startHour, startMin);
  
    const endTime = new Date();
    endTime.setHours(endHour, endMin);
  
    // 범위 안에 있는지 확인
    return now >= startTime && now < endTime;
  }
  

  