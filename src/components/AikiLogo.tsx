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
        <div className="absolute bottom-0 h-[38%] w-full rounded-t-[55%] bg-[#EADCC8]" />
        <svg viewBox="0 0 120 120" className={`${svgSize} relative block`} aria-hidden="true" shapeRendering="geometricPrecision">
          <circle cx="60" cy="20" r="5.2" fill="#EFA977" />
          <path d="M60 94C60 78 60 64 60 50" fill="none" stroke="#7E674C" strokeWidth="7" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
          <path d="M57.5 52C48 38 37 31 24 30C24 45 35 57 55.5 58.5C57 57 58 55 57.5 52Z" fill="#A9B87D" />
          <path d="M62.5 52C72 38 83 31 96 30C96 45 85 57 64.5 58.5C63 57 62 55 62.5 52Z" fill="#91A86F" />
          <path d="M60 65C51 65 44 68 39 74C47 78 55 78 60 72C65 78 73 78 81 74C76 68 69 65 60 65Z" fill="#D8CFA7" />
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
