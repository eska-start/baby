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
  const textSize = size === "lg" ? "text-[54px]" : size === "sm" ? "text-[28px]" : "text-[40px]";

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <img
        src="/aiki-logo.png"
        alt="아이키 로고"
        className={`${markSize} rounded-full object-contain shadow-[0_18px_38px_rgba(138,124,102,0.14)]`}
      />
      {showText && (
        <div className="mt-5 text-center">
          <div className={`font-serif ${textSize} font-semibold leading-none tracking-[-0.04em] text-[#8F9873]`}>아이키</div>
          <p className="mt-3 text-[15px] font-medium text-[#9A8F83]">데이터로 확인하는 우리 아이의 성장</p>
        </div>
      )}
    </div>
  );
}
