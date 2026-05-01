export function AikiLogo({
  size = "md",
  showText = true,
  className = "",
}: {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}) {
  const markSize = size === "lg" ? "h-[118px] w-[118px]" : size === "sm" ? "h-14 w-14" : "h-20 w-20";
  const svgSize = size === "lg" ? "h-[88px] w-[88px]" : size === "sm" ? "h-11 w-11" : "h-16 w-16";
  const textSize = size === "lg" ? "text-[54px]" : size === "sm" ? "text-[28px]" : "text-[40px]";

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className={`relative flex ${markSize} items-center justify-center overflow-hidden rounded-full bg-[#F8ECDD] shadow-[0_18px_38px_rgba(138,124,102,0.14)]`}>
        <div className="absolute bottom-0 h-[42%] w-full rounded-t-[50%] bg-[#EADCC8]" />
        <svg viewBox="0 0 120 120" className={`${svgSize} relative block`} aria-hidden="true" shapeRendering="geometricPrecision">
          <circle cx="60" cy="18" r="5.5" fill="#F2AF79" />
          <rect x="56" y="64" width="8" height="34" rx="4" fill="#8A6B45" />
          <path d="M57 62C36 63 24 48 24 30C44 29 58 42 60 60C59 61 58 62 57 62Z" fill="#9BAC77" />
          <path d="M63 62C84 63 96 48 96 30C76 29 62 42 60 60C61 61 62 62 63 62Z" fill="#8FA36E" />
          <path d="M60 62C54 51 50 43 43 37" fill="none" stroke="#D9E0BF" strokeWidth="3" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
          <path d="M60 62C66 51 70 43 77 37" fill="none" stroke="#D2DBB7" strokeWidth="3" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        </svg>
      </div>
      {showText && (
        <div className="mt-5 text-center">
          <div className={`font-serif ${textSize} font-semibold leading-none tracking-[-0.04em] text-[#8F9873]`}>아이키</div>
          <p className="mt-3 text-[15px] font-medium text-[#9A8F83]">데이터로 확인하는 우리 아이의 성장</p>
        </div>
      )}
    </div>
  );
}
