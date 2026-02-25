'use client';

import { useState, useEffect, useCallback } from 'react';

interface CountdownTimerProps {
    targetDate: string;
}

interface TimeLeft {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

export default function CountdownTimer({ targetDate }: CountdownTimerProps) {
    const calculateTimeLeft = useCallback((): TimeLeft => {
        const target = new Date(targetDate).getTime();
        const now = new Date().getTime();
        const diff = target - now;

        if (diff <= 0) {
            return { days: 0, hours: 0, minutes: 0, seconds: 0 };
        }

        return {
            days: Math.floor(diff / (1000 * 60 * 60 * 24)),
            hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((diff / (1000 * 60)) % 60),
            seconds: Math.floor((diff / 1000) % 60),
        };
    }, [targetDate]);

    const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft());
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);
        return () => clearInterval(timer);
    }, [calculateTimeLeft]);

    if (!mounted) {
        return (
            <div className="flex justify-center gap-3 sm:gap-4">
                {['Hari', 'Jam', 'Menit', 'Detik'].map((label) => (
                    <div key={label} className="countdown-box">
                        <span className="countdown-number">--</span>
                        <span className="countdown-label">{label}</span>
                    </div>
                ))}
            </div>
        );
    }

    const boxes = [
        { value: timeLeft.days, label: 'Hari' },
        { value: timeLeft.hours, label: 'Jam' },
        { value: timeLeft.minutes, label: 'Menit' },
        { value: timeLeft.seconds, label: 'Detik' },
    ];

    return (
        <div className="flex justify-center gap-3 sm:gap-4">
            {boxes.map((box) => (
                <div key={box.label} className="countdown-box">
                    <span className="countdown-number">
                        {String(box.value).padStart(2, '0')}
                    </span>
                    <span className="countdown-label">{box.label}</span>
                </div>
            ))}
        </div>
    );
}
