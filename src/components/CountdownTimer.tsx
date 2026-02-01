'use client';

// Static countdown display showing zeros (challenge ended 1/31/2026)
export default function CountdownTimer() {
  const units = [
    { value: '00', label: 'DAYS' },
    { value: '00', label: 'HOURS' },
    { value: '00', label: 'MINUTES' },
    { value: '00', label: 'SECONDS' },
  ];

  return (
    <div className="flex justify-center gap-2">
      {units.map((unit, index) => (
        <div key={unit.label} className="flex items-center gap-2">
          <div className="flex flex-col items-center">
            <div className="flex gap-[2px]">
              {unit.value.split('').map((digit, i) => (
                <div
                  key={i}
                  className="flex items-center justify-center"
                  style={{
                    width: 32,
                    height: 48,
                    fontSize: 30,
                    fontWeight: 700,
                    backgroundColor: '#1a1a1a',
                    color: '#ffffff',
                    borderRadius: 4,
                  }}
                >
                  {digit}
                </div>
              ))}
            </div>
            <span
              style={{
                fontSize: 10,
                fontWeight: 500,
                textTransform: 'uppercase',
                color: '#ffffff',
                letterSpacing: '0.05em',
                marginTop: 4,
              }}
            >
              {unit.label}
            </span>
          </div>
          {index < units.length - 1 && (
            <span className="text-white text-2xl font-bold pb-5">:</span>
          )}
        </div>
      ))}
    </div>
  );
}
