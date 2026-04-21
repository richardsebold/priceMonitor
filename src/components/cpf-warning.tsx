"use client"; // Isso avisa o Next.js que esse código vai rodar no navegador

import { useState } from "react";
import { X } from "lucide-react";

interface CpfWarningProps {
  cpf?: string | null;
}

export function CpfWarning({ cpf }: CpfWarningProps) {
  const [showWarning, setShowWarning] = useState(true);

  // Se o usuário JÁ TEM o CPF cadastrado ou se ele clicou em fechar, escondemos a div
  if (cpf || !showWarning) return null;

  return (
    <div className="mx-auto flex justify-between items-center shadow px-8 py-4 mb-8 bg-red-500 text-white uppercase font-bold rounded-md">
      <h1>Para ter acesso completo a plataforma finalize seu cadastro.</h1>
      <button
        onClick={() => setShowWarning(false)}
        className="p-1 hover:bg-red-600 rounded-md transition-colors cursor-pointer shrink-0 ml-4"
      >
        <X size={20} color="white" />
      </button>
    </div>
  );
}