import { Card, CardHeader } from "@/components/ui/card";

export function AlertCardsSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs dark:*:data-[slot=card]:bg-card mb-8">
      
      <Card className="@container/card h-full animate-pulse">
        <CardHeader>
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-24 mb-2"></div>
          <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-12 mt-1"></div>
        </CardHeader>
      </Card>

      <Card className="@container/card h-full animate-pulse">
        <CardHeader>
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-24 mb-2"></div>
          <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-32 mt-1"></div>
        </CardHeader>
      </Card>

      <Card className="@container/card h-full col-span-2 sm:col-span-1 animate-pulse">
        <CardHeader>
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-24 mb-2"></div>
          <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-28 mt-1"></div>
        </CardHeader>
      </Card>
      
    </div>
  );
}