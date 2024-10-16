import axios, { all } from "axios";
import { EmailMessage, SyncResponse, SyncUpdatedResponse } from "./types";
import { headers } from "next/headers";
import { error } from "console";
export class Account{
  private token:string;

  constructor(token:string)
  {
    this.token=token
  }
  private async startSync(){
    const response=await axios.post<SyncResponse>('https://api.aurinko.io/v1/email/sync',{},{
      headers:{
        Authorization:`Bearer ${this.token}`
      },
      params:{
        daysWithin:2,
        bodyType:'html'
    }
  })
    return response.data;
  }
//for gettinng new mails which come after syncing
  async getUpdatedEmails({deltaToken,pageToken}:{deltaToken?:string,pageToken?:string})
  
  {
       let params:Record<string,string>={}
       if(deltaToken)params.deltaToken=deltaToken
       if(pageToken)params.pageToken=pageToken

       const response=await axios.get<SyncUpdatedResponse>(`https://api.aurinko.io/v1/email/sync/updated`,{
        headers:{
          Authorization:`Bearer ${this.token}`
        },
        params

       })
       return response.data
  }
  //for getting already present emails
  async performInitalSync(){
    try{
   let SyncResponse=await this.startSync();
   console.log(SyncResponse)
   while(!SyncResponse.ready)
   {
    await new Promise(resolve=>setTimeout(resolve,1000))
    SyncResponse=await this.startSync();
   }
 let storedDeltaToken:string=SyncResponse.syncUpdatedToken;
 //the inital delta token present sent to aurinko to get the new updated token and passing through the updated mails to laod new mails
 let updatedResposne=await this.getUpdatedEmails({deltaToken:storedDeltaToken});
 console.log(updatedResposne)
   if(updatedResposne.nextDeltaToken)
   {
    
    storedDeltaToken=updatedResposne.nextDeltaToken
   }
   let allEmails:EmailMessage[]=updatedResposne.records

   while(updatedResposne.nextPageToken)
   {
    updatedResposne=await this.getUpdatedEmails({pageToken:updatedResposne.nextPageToken})
    if(updatedResposne.nextDeltaToken)
    {
      storedDeltaToken=updatedResposne.nextDeltaToken
    }
   }
   console.log('initial sync has completed',allEmails.length,'emails')
   await this.getUpdatedEmails({deltaToken:storedDeltaToken})
   return {
    emails:allEmails,
    deltaTokn:storedDeltaToken
   }
    }
    catch (e) {
      if (axios.isAxiosError(e)) {
        // Log the error details for Axios errors
        console.error('Axios error during sync:', {
          message: e.message, // Error message
          code: e.code, // Axios error code (if any)
          response: e.response ? {
            status: e.response.status, // HTTP status code
            headers: e.response.headers, // Response headers
            data: e.response.data // Response data (if any)
          } : 'No response'})
        // Handle non-Axios errors
        
      }
      else{
        console.error('no axios Error during sync:', e);
      }
    }
}
}