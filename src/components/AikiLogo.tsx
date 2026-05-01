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
  const svgSize = size === "lg" ? "h-[84px] w-[84px]" : size === "sm" ? "h-10 w-10" : "h-14 w-14";
  const textSize = size === "lg" ? "text-[54px]" : size === "sm" ? "text-[28px]" : "text-[40px]";

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className={`relative flex ${markSize} items-center justify-center overflow-hidden rounded-full bg-[#F8ECDD] shadow-[0_18px_38px_rgba(138,124,102,0.14)]`}>
        <div className="absolute bottom-0 h-[36%] w-full rounded-t-[55%] bg-[#EADCC8]" />
        <svg viewBox="0 0 120 120" className={`${svgSize} relative block`} aria-hidden="true" shapeRendering="geometricPrecision">
          <circle cx="60" cy="22" r="6" fill="#EFA977" />
          <rect x="56" y="56" width="8" height="40" rx="4" fill="#7E674C" />
          <ellipse cx="43" cy="49" rx="18" ry="29" fill="#A9B87D" transform="rotate(-42 43 49)" />
          <ellipse cx="77" cy="49" rx="18" ry="29" fill="#91A86F" transform="rotate(42 77 49)" />
          <ellipse cx="60" cy="82" rx="24" ry="9" fill="#D8CFA7" />
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
