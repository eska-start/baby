export function AikiLogo({ size = "md", className = "" }: { size?: "sm" | "md" | "lg"; className?: string; }) {
  const markSize = size === "lg" ? "w-[200px]" : size === "sm" ? "w-20" : "w-32";
  return (
    <div className={`flex justify-center ${className}`}>
      <img src="/aiki-logo.svg" className={`${markSize}`} alt="아이키 로고" />
    </div>
  );
}
