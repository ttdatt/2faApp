import { TIME_FRAME } from "./utils";

const radius = 20;
const circumference = 2 * Math.PI * radius;

const CountdownCircle = ({ timeLeft }: { timeLeft: number }) => {
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
