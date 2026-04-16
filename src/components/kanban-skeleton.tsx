export function KanbanSkeleton() {
  return (
    // O animate-pulse no container pai faz TUDO que está dentro piscar suavemente!
    <div className="flex gap-6 p-6 animate-pulse w-full">
      
      {/* --- COLUNA 1 --- */}
      <div className="flex flex-col gap-3 w-80">
        {/* Título da coluna (pequeno) */}
        <div className="h-6 bg-slate-300 rounded w-24 mb-2"></div>
        
        {/* 4 Cartões da primeira coluna */}
        <div className="h-28 bg-slate-300 rounded-md w-full"></div>
        <div className="h-28 bg-slate-300 rounded-md w-full"></div>
        <div className="h-28 bg-slate-300 rounded-md w-full"></div>
        <div className="h-28 bg-slate-300 rounded-md w-full"></div>
      </div>

      {/* --- COLUNA 2 --- */}
      <div className="flex flex-col gap-3 w-80">
        <div className="h-6 bg-slate-300 rounded w-28 mb-2"></div>
        
        {/* 1 Cartão da segunda coluna */}
        <div className="h-28 bg-slate-300 rounded-md w-full"></div>
      </div>

      {/* --- COLUNA 3 --- */}
      <div className="flex flex-col gap-3 w-80">
        <div className="h-6 bg-slate-300 rounded w-20 mb-2"></div>
        
        {/* 2 Cartões da terceira coluna */}
        <div className="h-28 bg-slate-300 rounded-md w-full"></div>
        <div className="h-28 bg-slate-300 rounded-md w-full"></div>
      </div>

    </div>
  );
}