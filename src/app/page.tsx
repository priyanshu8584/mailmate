import Link from "next/link";

import { LatestPost } from "@/app/_components/post";
import { api, HydrateClient } from "@/trpc/server";

export default async function Home() {
 
  return (
    <div className="bg-red-500 text-white">
      Helllo world
    </div>
  );
}
