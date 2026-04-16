import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BellRing } from "lucide-react";

export function ClientAlertsSkeleton() {
  return (
    <div className="container mx-auto mt-12">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellRing className="size-5" />
            Alertas Recentes
          </CardTitle>
          <CardDescription>Produtos que atingiram ou ficaram abaixo da sua meta.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg gap-4 bg-muted/10 animate-pulse">
              <div className="flex-1 w-full">
                <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2"></div>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-8 w-24 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
                <div className="h-9 w-9 bg-slate-200 dark:bg-slate-800 rounded-md"></div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg gap-4 bg-muted/10 animate-pulse">
              <div className="flex-1 w-full">
                <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-2/4 mb-2"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3"></div>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-8 w-24 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
                <div className="h-9 w-9 bg-slate-200 dark:bg-slate-800 rounded-md"></div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg gap-4 bg-muted/10 animate-pulse">
              <div className="flex-1 w-full">
                <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-3/5 mb-2"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-2/5"></div>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-8 w-24 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
                <div className="h-9 w-9 bg-slate-200 dark:bg-slate-800 rounded-md"></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}