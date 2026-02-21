"use client";

export default function TestPage() {
  const handleTest = async () => {
    const res = await fetch('/api/cron/check-prices', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer minhasenhadeteste'
      }
    });
    const data = await res.json();
    alert(data.message);
  };

  return (
    <button onClick={handleTest} className="p-4 bg-blue-500 text-white rounded">
      Testar Robô de Preços
    </button>
  );
}