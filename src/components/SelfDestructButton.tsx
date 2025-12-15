import './SelfDestructButton.css'

interface SelfDestructButtonProps {
  onClick: () => void
  style?: React.CSSProperties
  title?: string
}

export const SelfDestructButton = ({
  onClick,
  style,
  title,
}: SelfDestructButtonProps) => {
  return (
    <button
      className="self-destruct-button"
      onClick={onClick}
      style={style}
      title={title}
    >
      <div className="self-destruct-lid">
        <span className="side self-destruct-top"></span>
        <span className="side self-destruct-front"></span>
        <span className="side self-destruct-back"></span>
        <span className="side self-destruct-left"></span>
        <span className="side self-destruct-right"></span>
      </div>
      <div className="self-destruct-panels">
        <div className="self-destruct-panel-1">
          <div className="self-destruct-panel-2">
            <div className="self-destruct-btn-trigger">
              <span className="self-destruct-btn-trigger-1"></span>
              <span className="self-destruct-btn-trigger-2"></span>
            </div>
          </div>
        </div>
      </div>
    </button>
  )
}
