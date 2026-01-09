'use client';

import FlipClockCountdown from '@leenguyen/react-flip-clock-countdown';
import '@leenguyen/react-flip-clock-countdown/dist/index.css';

export default function CountdownTimer() {
  // January 31, 2026 23:59:59 Arizona Time (MST = UTC-7)
  // Arizona doesn't observe DST, so it's always UTC-7
  // Using explicit UTC construction: Jan 31 23:59:59 + 7 hours = Feb 1 06:59:59 UTC
  const targetDate = new Date(Date.UTC(2026, 0, 31, 23 + 7, 59, 59, 999));

  return (
    <div className="flex justify-center">
      <FlipClockCountdown
        to={targetDate}
        labels={['DAYS', 'HOURS', 'MINUTES', 'SECONDS']}
        labelStyle={{
          fontSize: 10,
          fontWeight: 500,
          textTransform: 'uppercase',
          color: '#ffffff',
          letterSpacing: '0.05em',
        }}
        digitBlockStyle={{
          width: 32,
          height: 48,
          fontSize: 30,
          fontWeight: 700,
          backgroundColor: '#1a1a1a',
          color: '#ffffff',
          borderRadius: 4,
        }}
        dividerStyle={{
          color: '#333333',
          height: 1,
        }}
        separatorStyle={{
          color: '#ffffff',
          size: 6,
        }}
        duration={0.5}
      />
    </div>
  );
}
