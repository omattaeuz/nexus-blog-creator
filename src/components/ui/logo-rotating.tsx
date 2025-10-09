import RotatingText from './rotating-text';

interface LogoRotatingProps {
  fixedText: string;
  rotatingTexts: string[];
  className?: string;
  fixedClassName?: string;
  rotatingClassName?: string;
  rotationInterval?: number;
  mainClassName?: string;
  splitLevelClassName?: string;
  elementLevelClassName?: string;
}

export default function LogoRotating({
  fixedText,
  rotatingTexts,
  className = "",
  fixedClassName = "",
  rotatingClassName = "",
  rotationInterval = 2000,
  mainClassName = "",
  splitLevelClassName = "",
  elementLevelClassName = ""
}: LogoRotatingProps) {
  return (
    <span className={`${className}`}>
      {fixedText && (
        <span className={`${fixedClassName} mr-2`}>
          {fixedText}
        </span>
      )}
      <div className="relative inline-block overflow-hidden">
        <RotatingText
          texts={rotatingTexts}
          mainClassName={`${rotatingClassName} ${mainClassName}`}
          staggerFrom="last"
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "-120%" }}
          staggerDuration={0.025}
          splitLevelClassName={splitLevelClassName}
          elementLevelClassName={elementLevelClassName}
          transition={{ type: "spring", damping: 30, stiffness: 400 }}
          rotationInterval={rotationInterval}
          splitBy="words"
        />
      </div>
    </span>
  );
}
