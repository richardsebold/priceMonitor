"use client"; // Obrigatório no Next.js App Router para gráficos

import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
} from "recharts";

const data = [
  { name: "Seg", preco: 400 },
  { name: "Ter", preco: 300 },
  { name: "Qua", preco: 500 },
  { name: "Qui", preco: 280 },
  { name: "Sex", preco: 450 },
];

export function MediaVariantChart() {
  return (
    <div className="h-20 w-full rounded-xl">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          {/* Definição do Gradiente (Igual ao da foto) */}
          <defs>
            <linearGradient id="colorPreco" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#84cc16" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#84cc16" stopOpacity={0} />
            </linearGradient>
          </defs>

          {/* Eixos (Ocultos para ficar minimalista como no print) */}
          <XAxis dataKey="name" hide />
          <YAxis hide />
          <Tooltip 
            contentStyle={{ backgroundColor: "#18181b", border: "1px solid #27272a" }}
            itemStyle={{ color: "#84cc16" }}
          />

          {/* A Linha e o Preenchimento */}
          <Area
            type="monotone" // Deixa a linha curvada/suave
            dataKey="preco"
            stroke="#84cc16" // Cor da linha (Lime-500)
            fillOpacity={1}
            fill="url(#colorPreco)" // Usa o gradiente definido acima
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}