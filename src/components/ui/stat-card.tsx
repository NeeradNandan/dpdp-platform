import { cn } from "@/lib/utils";

export interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon?: React.ReactNode;
}

const changeTypeStyles = {
  positive: "text-green-600",
  negative: "text-red-600",
  neutral: "text-gray-600",
};

function StatCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon,
}: StatCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <p
              className={cn(
                "mt-1 text-sm font-medium",
                changeTypeStyles[changeType]
              )}
            >
              {change}
            </p>
          )}
        </div>
        {icon && (
          <div className="rounded-lg bg-indigo-50 p-3 text-indigo-600">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

export { StatCard };
