export function AikiLogo({ size = "md", className = "" }: { size?: "sm" | "md" | "lg"; className?: string; }) {
  const markSize = size === "lg" ? "w-[160px]" : size === "sm" ? "w-20" : "w-28";
  return (
    <div className={`flex justify-center ${className}`}>
      <img src="/aiki-new.svg" className={`${markSize}`} />
    </div>
  );
}
