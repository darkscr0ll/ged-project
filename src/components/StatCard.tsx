import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  index?: number;
}

export function StatCard({ title, value, change, changeType = "neutral", icon: Icon, index = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.05, ease: [0.25, 0.1, 0.25, 1] }}
      className="bg-card rounded-lg p-5 shadow-card"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-semibold text-foreground mt-1 tabular-nums">{value}</p>
          {change && (
            <p className={`text-xs mt-1 font-medium ${
              changeType === "positive" ? "text-primary" :
              changeType === "negative" ? "text-destructive" :
              "text-muted-foreground"
            }`}>
              {change}
            </p>
          )}
        </div>
        <div className="p-2 bg-primary/10 rounded-md">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </div>
    </motion.div>
  );
}
