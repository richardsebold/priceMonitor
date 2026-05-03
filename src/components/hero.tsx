interface HeroProps {
  name: string;
}

export default function Hero({ name }: HeroProps) {
  return (
    <div className="container mx-auto mt-8">
      <h1 className="font-bold text-2xl">Olá, {name}.</h1>
    </div>
  );
}
