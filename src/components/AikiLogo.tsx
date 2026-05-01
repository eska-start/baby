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
  const svgSize = size === "lg" ? "h-[86px] w-[86px]" : size === "sm" ? "h-10 w-10" : "h-14 w-14";
  const textSize = size === "lg" ? "text-[54px]" : size === "sm" ? "text-[28px]" : "text-[40px]";

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className={`relative flex ${markSize} items-center justify-center overflow-hidden rounded-[26%] bg-gradient-to-b from-[#FFFCF7] to-[#F1E7D8] shadow-[0_18px_38px_rgba(138,124,102,0.16)]`}>
        <svg viewBox="0 0 120 120" className={`${svgSize} block`} aria-hidden="true" shapeRendering="geometricPrecision">
          <circle cx="62" cy="20" r="6" fill="#F2AF79" />
          <path d="M61 90V58" stroke="#8A6B45" strokeWidth="7" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
          <path d="M58 56C42 35 25 35 20 36C18 54 34 68 58 64Z" fill="#A7B77E" />
          <path d="M64 56C82 34 99 35 104 36C106 54 89 69 64 64Z" fill="#94A86F" />
          <path d="M22 103C35 86 86 84 101 103H22Z" fill="#E8D9C4" />
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
