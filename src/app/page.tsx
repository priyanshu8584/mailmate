import Link from "next/link";

import { LatestPost } from "@/app/_components/post";
import { api, HydrateClient } from "@/trpc/server";
import { Button } from "@/components/ui/button";
import LinkAccount from "@/components/ui/link-account"

export default async function Home() {
 
  return (
    <div>
      <LinkAccount></LinkAccount>
    </div>
  );
}
