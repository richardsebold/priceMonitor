import { getUser } from "@/actions/get-user";

export default async function Hero() {

      const user = await getUser();

 return (
   <div className="container mx-auto mt-8">
        <h1 className="font-bold text-2xl">Olá, {user?.name}.</h1>
   </div>
 );
}