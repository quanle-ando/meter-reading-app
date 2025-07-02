import { Skeleton } from "antd";
import { twJoin } from "tailwind-merge";

export default function Loader() {
  return (
    <div
      className={twJoin(
        "absolute",
        "top-0",
        "left-0",
        "right-0",
        "bottom-0",
        "bg-white",
        "p-[20px]",
        "flex",
        "flex-col",
        "justify-end",
        "opacity-55"
      )}
    >
      <Skeleton />
    </div>
  );
}
