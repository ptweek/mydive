import { cn } from "mydive/utils/tailwind";
const cardContent = {
  title: "Lorem ipsum dolor",
  description:
    "Lorem ipsum dolor, sit amet elit consectetur adipisicing. Nostrum, hic ipsum! dolor, sit amet elit consectetur amete elite!",
};
export const CardBody = ({ className = "" }) => (
  <div className={cn("p-4 text-start md:p-6", className)}>
    <h3 className="mb-1 text-lg font-bold text-zinc-200">
      {cardContent.title}
    </h3>
    <p className="text-sm text-wrap text-zinc-500">{cardContent.description}</p>
  </div>
);
//======================================
export const CardWithGridEllipsis = ({
  children,
}: {
  children: React.ReactNode;
}) => (
  <div className="w-full overflow-hidden rounded-md border bg-zinc-950 p-1 dark:border-zinc-900">
    <div className="relative min-h-[400px] w-full">
      {/* Background layer with SVG pattern */}
      <div
        className="absolute inset-0 z-0 bg-[url(/svg/my.svg)] bg-[length:30px_30px] bg-repeat"
        style={{
          filter: "invert(1) brightness(0.3)",
        }}
      />
      {/* Gradient overlay */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-tr from-zinc-950/40 via-zinc-950/20 to-transparent" />
      {/* Content */}
      <div className="relative z-[2] p-6">{children}</div>
    </div>
  </div>
);
