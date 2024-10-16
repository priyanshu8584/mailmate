import { Account } from "@/lib/account";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
export const POST=async (req:NextRequest)=>{
  const {accountId,userId}=await req.json();
  if(!accountId ||! userId)
    return NextResponse.json({error:"missing account id or userId"},{status:400})
  const dbAccount=await db.account.findUnique({
    where:{
      id:accountId,
      userId
    }
  })
  if(!dbAccount)
    return NextResponse.json({
  error:"account not found"})
    const account=new Account(dbAccount.accessToken)
  const response=await account.performInitalSync();
  if(!response)
    return NextResponse.json({
  error:"failed to perform initial sync come to api/initialsync line 21"},{status:500})

  const {emails,deltaTokn}=response;
  console.log("emails",emails)
  // await db.account.update({
  //   where:{
  //     id:accountId,

  //   }
  //   ,
  //   data:{
  //     nextDeltaToken:deltaTokn
  //   }
  // })
//  await syncEmailToDatabase(emails)
 console.log('sync completed',deltaTokn);
 return NextResponse.json({
  message:"sync completed"
 },
{
  status:200
})
}