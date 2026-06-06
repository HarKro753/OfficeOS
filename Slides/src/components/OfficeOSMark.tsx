import Image from "next/image";

type OfficeOSMarkProps = {
  className?: string;
};

export function OfficeOSMark({ className = "h-11 w-11" }: OfficeOSMarkProps) {
  return (
    <Image
      alt=""
      aria-hidden="true"
      className={className}
      height={190}
      src="/officeos-mark.svg"
      width={190}
    />
  );
}
