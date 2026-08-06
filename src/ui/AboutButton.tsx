import "./AboutButton.scss";

interface AboutButtonProps {
  onClick: () => void;
}

export function AboutButton({ onClick }: AboutButtonProps) {
  return (
    <button className="about-button" onClick={onClick} aria-label="About" title="About">
      About
    </button>
  );
}
