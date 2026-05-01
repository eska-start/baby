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
  const svgSize = size === "lg" ? "h-[96px] w-[96px]" : size === "sm" ? "h-11 w-11" : "h-16 w-16";
  const textSize = size === "lg" ? "text-[54px]" : size === "sm" ? "text-[28px]" : "text-[40px]";

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className={`relative flex ${markSize} items-center justify-center rounded-full bg-[#F7F3E9] shadow-[0_18px_38px_rgba(138,124,102,0.16)]`}>
        <div className="absolute inset-4 rounded-full bg-[#FDFBF6]" />
        <svg viewBox="0 0 120 120" className={`relative ${svgSize}`} aria-hidden="true">
          <path d="M62 100C42 84 30 65 29 42" fill="none" stroke="#8AA56F" strokeWidth="9" strokeLinecap="round" />
          <path d="M61 99C76 80 83 59 78 36" fill="none" stroke="#8AA56F" strokeWidth="9" strokeLinecap="round" />
          <path d="M55 54C39 39 29 27 22 14C39 17 52 28 61 43" fill="#B9C68D" />
          <path d="M67 50C79 31 94 20 110 17C103 34 89 47 70 57" fill="#A6B87A" />
          <path d="M58 66C47 56 37 51 25 50C31 64 43 72 58 72" fill="#D8CFA7" />
          <circle cx="77" cy="17" r="6" fill="#F2AF79" />
        </svg>
      </div>
      {showText && (
        <div className="mt-5 text-center">
          <div className={`font-serif ${textSize} font-semibold leading-none tracking-[-0.04em] text-[#A7A883]`}>아이키</div>
          <p className="mt-3 text-[15px] font-medium text-[#9A8F83]">데이터로 확인하는 우리 아이의 성장</p>
        </div>
      )}
    </div>
  );
}
