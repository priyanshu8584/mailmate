"use client"
import React from 'react'
import { Button } from './button'
import { getAurinkoAuthUrl } from '@/lib/aurinko'
import { auth } from '@clerk/nextjs/server'

const LinkAccount = () => {
  return (
    <Button onClick={async()=>{
      const authUrl=await getAurinkoAuthUrl('Google')
      console.log(authUrl)
      window.location.href=authUrl
    }}>
      Link Account
    </Button>
  )
}

export default LinkAccount