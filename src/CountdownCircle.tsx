import { useState, useEffect } from "react";
import { TIME_FRAME, getRemainingSeconds } from "./utils";

const INTERVAL = 0.016; // 60fps
const radius = 20;
const circumference = 2 * Math.PI * radius;

const CountdownCircle = ({ onFinishStep }: { onFinishStep: () => void }) => {
  const [timeLeft, setTimeLeft] = useState<number>(getRemainingSeconds());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime < 0) return prevTime - INTERVAL;
        onFinishStep();
        return getRemainingSeconds();
      });
    }, INTERVAL * 1000);

    return () => clearInterval(timer);
  }, [onFinishStep]);

  const strokeDashoffset = circumference * (1 - timeLeft / TIME_FRAME);

  return (
    <svg width="80" height="80">
      <title>progress</title>
      <circle
        stroke="#00b300"
        strokeWidth="3"
        fill="none"
        r={radius}
        cx="80"
        cy="40"
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        transform="rotate(-90 60 60)"
      />
      <text x="50%" y="50%" textAnchor="middle" dy=".3em">
        {Math.ceil(timeLeft)}
      </text>
    </svg>
  );
};

export default CountdownCircle;
