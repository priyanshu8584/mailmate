import { exchangeCodeForAccessToken, getAccountDetails } from "@/lib/aurinko";
import { db } from "@/server/db";
import { auth } from "@clerk/nextjs/server";
import { stat } from "fs";
import axios from "axios"
import {waitUntil} from "@vercel/functions"
import { NextResponse,NextRequest} from "next/server";

export const GET=async (req:NextRequest)=>{
const {userId}=await auth();
if(!userId)
  return NextResponse.json({
message:"unathorized"},
{
  status:401
})
const params=req.nextUrl.searchParams;
const status=params.get('status');
if(status!='success')
  return NextResponse.json({
message:'failed to link account'}
,
{status:401})
const code=params.get('code');
if(!code)return NextResponse.json({
  message:"no code provided"
},
{
status:400
})
const token=await exchangeCodeForAccessToken(code);
if(!token)return NextResponse.json({
  message:"no token"
},
{
status:400
})
const accountDetails=await getAccountDetails(token.accessToken);
await db.account.upsert({
  where:{
    id:token.accountId.toString()
  },
  update:{
    accessToken:token.accessToken
  },
  create:{
    id:token.accountId.toString(),
    userId,
    emailAddress:accountDetails.email,
    name:accountDetails.name,
    accessToken:token.accessToken
  }
})

//trigger inital-sync
waitUntil(

  axios.post(`${process.env.NEXT_PUBLIC_URL}/api/initial-sync`, { accountId: token.accountId.toString(), userId }).then((res) => {
      console.log(res.data)
  }).catch((err) => {
      console.log(err.response.data)
  })
)

return NextResponse.redirect(new URL('/mail',req.url))
}