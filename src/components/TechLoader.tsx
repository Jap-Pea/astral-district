import './TechLoader.css'

interface TechLoaderProps {
  title?: string
  subtitle?: string
  progress?: number
}

export const TechLoader = ({
  title = 'Loading...',
  subtitle = '',
  progress = 0,
}: TechLoaderProps) => {
  return (
    <div className="tech-loader-container">
      {/* Text overlay positioned absolutely */}
      <div className="loader-text-overlay">
        <h1 className="loader-title">{title}</h1>
        {subtitle && <p className="loader-subtitle">{subtitle}</p>}
        <div className="loader-progress-bar">
          <div
            className="loader-progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <svg
        viewBox="0 0 900 900"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid meet"
        className="tech-loader-svg"
      >
        <defs>
          <linearGradient
            id="traceGradient1"
            x1={250}
            y1={120}
            x2={100}
            y2={200}
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#00ccff" stopOpacity={1} />
            <stop offset="100%" stopColor="#00ccff" stopOpacity="0.5" />
          </linearGradient>
          <linearGradient
            id="traceGradient2"
            x1={650}
            y1={120}
            x2={800}
            y2={300}
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#00ccff" stopOpacity={1} />
            <stop offset="100%" stopColor="#00ccff" stopOpacity="0.5" />
          </linearGradient>
          <linearGradient
            id="traceGradient3"
            x1={250}
            y1={380}
            x2={400}
            y2={400}
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#00ccff" stopOpacity={1} />
            <stop offset="100%" stopColor="#00ccff" stopOpacity="0.5" />
          </linearGradient>
          <linearGradient
            id="traceGradient4"
            x1={650}
            y1={120}
            x2={500}
            y2={100}
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#00ccff" stopOpacity={1} />
            <stop offset="100%" stopColor="#00ccff" stopOpacity="0.5" />
          </linearGradient>
        </defs>
        <g id="grid">
          <g>
            <line x1={0} y1={0} x2={0} y2="100%" className="grid-line" />
            <line x1={100} y1={0} x2={100} y2="100%" className="grid-line" />
            <line x1={200} y1={0} x2={200} y2="100%" className="grid-line" />
            <line x1={300} y1={0} x2={300} y2="100%" className="grid-line" />
            <line x1={400} y1={0} x2={400} y2="100%" className="grid-line" />
            <line x1={500} y1={0} x2={500} y2="100%" className="grid-line" />
            <line x1={600} y1={0} x2={600} y2="100%" className="grid-line" />
            <line x1={700} y1={0} x2={700} y2="100%" className="grid-line" />
            <line x1={800} y1={0} x2={800} y2="100%" className="grid-line" />
            <line x1={900} y1={0} x2={900} y2="100%" className="grid-line" />
            <line x1={1000} y1={0} x2={1000} y2="100%" className="grid-line" />
            <line x1={1100} y1={0} x2={1100} y2="100%" className="grid-line" />
            <line x1={1200} y1={0} x2={1200} y2="100%" className="grid-line" />
            <line x1={1300} y1={0} x2={1300} y2="100%" className="grid-line" />
            <line x1={1400} y1={0} x2={1400} y2="100%" className="grid-line" />
            <line x1={1500} y1={0} x2={1500} y2="100%" className="grid-line" />
            <line x1={1600} y1={0} x2={1600} y2="100%" className="grid-line" />
          </g>
          <g>
            <line x1={0} y1={100} x2="100%" y2={100} className="grid-line" />
            <line x1={0} y1={200} x2="100%" y2={200} className="grid-line" />
            <line x1={0} y1={300} x2="100%" y2={300} className="grid-line" />
            <line x1={0} y1={400} x2="100%" y2={400} className="grid-line" />
            <line x1={0} y1={500} x2="100%" y2={500} className="grid-line" />
            <line x1={0} y1={600} x2="100%" y2={600} className="grid-line" />
            <line x1={0} y1={700} x2="100%" y2={700} className="grid-line" />
            <line x1={0} y1={800} x2="100%" y2={800} className="grid-line" />
          </g>
        </g>
        <g id="browser" transform="translate(0, 200)">
          <rect
            x={250}
            y={120}
            width={400}
            height={260}
            rx={8}
            ry={8}
            className="browser-frame"
          />
          <rect
            x={250}
            y={120}
            width={400}
            height={30}
            rx={8}
            ry={8}
            className="browser-top"
          />
          <rect x={270} y={160} width={360} height={20} className="skeleton" />
          <rect x={270} y={190} width={200} height={15} className="skeleton" />
          <rect x={270} y={215} width={300} height={15} className="skeleton" />
          <rect x={270} y={240} width={360} height={90} className="skeleton" />
          <rect
            x={270}
            y={340}
            width={360 * (progress / 100)}
            height={20}
            className="skeleton progress-bar"
          />
        </g>
        <g id="traces" transform="translate(0, 200)">
          <path d="M100 300 H250 V120" className="trace-flow" />
          <path d="M800 200 H650 V380" className="trace-flow" />
          <path d="M400 520 V380 H250" className="trace-flow" />
          <path d="M500 50 V120 H650" className="trace-flow" />
        </g>
      </svg>
    </div>
  )
}
