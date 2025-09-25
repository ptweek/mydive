import { Button } from "@nextui-org/react";
import { cn } from "mydive/utils/tailwind";

function DashboardActionButton({
  text,
  onPress,
  className,
}: {
  text: string;
  onPress: () => void;
  className?: string;
}) {
  return (
    <Button
      size="lg"
      variant="shadow"
      className={cn(
        "mt-auto min-h-30 w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 text-base font-semibold tracking-wider text-white uppercase hover:from-blue-500 hover:to-indigo-600 hover:shadow-xl hover:shadow-blue-500/30 sm:text-lg",
        className,
      )}
      onPress={onPress}
    >
      {text}
    </Button>
  );
}

export default DashboardActionButton;
