import "./Title.scss";

interface TitleProps {
  onClick: () => void;
}

export function Title({ onClick }: TitleProps) {
  return (
    <h1 className="title" onClick={onClick}>
      The <span className="title__initial">O</span>rrery
    </h1>
  );
}
