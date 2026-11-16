import "./CircuitTraces.css";

const traces = [
  "M0 16 H12 L16 20 H30 V30 H42 L46 34 H60",
  "M100 12 H88 L84 16 H72 V26 H62 L58 30 H48",
  "M0 58 H10 L14 54 H24 V44 H36 L40 40 H52",
  "M100 68 H88 L84 64 H74 V54 H62 L58 50 H48",
  "M8 100 V84 L12 80 V70 H22 L26 66 V58",
  "M34 0 V12 L38 16 V28 H48 L52 32 V42",
  "M68 100 V86 L64 82 V72 H54 L50 68 V58",
  "M92 0 V14 L88 18 V30 H78 L74 34 V44",
  "M0 86 H18 L22 82 H34 V72 H44",
  "M100 40 H90 L86 44 H76 V48 H66",
];

const nodes = [
  [16, 20],
  [30, 30],
  [84, 16],
  [72, 26],
  [14, 54],
  [24, 44],
  [84, 64],
  [74, 54],
  [12, 80],
  [22, 70],
  [38, 16],
  [48, 28],
  [64, 82],
  [54, 72],
  [88, 18],
  [78, 30],
  [22, 82],
  [34, 72],
  [86, 44],
  [76, 48],
];

export function CircuitTraces({ children }: { children?: React.ReactNode }) {
  return (
    <div className="circuitTracesContainer">
      <svg
        className="circuitTraces"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
        focusable="false"
      >
        {traces.map((trace, index) => (
          <g key={trace}>
            <path className="circuitTrace" d={trace} />
            <path
              className="circuitPulse"
              d={trace}
              style={{ animationDelay: `${index * -0.8}s` }}
            />
          </g>
        ))}
        {nodes.map(([x, y]) => (
          <circle
            className="circuitNode"
            key={`${x}-${y}`}
            cx={x}
            cy={y}
            r="0.35"
          />
        ))}
      </svg>
      <div className="circuitTracesContent">{children}</div>
    </div>
  );
}
