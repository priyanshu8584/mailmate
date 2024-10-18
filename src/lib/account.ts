import axios from "axios";
import { EmailMessage, SyncResponse, SyncUpdatedResponse } from "./types";
import { headers } from "next/headers";
import { error } from "console";
export class Account {
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  private async startSync() {
    const response = await axios.post<SyncResponse>('https://api.aurinko.io/v1/email/sync', {}, {
      headers: {
        Authorization: `Bearer ${this.token}`
      },
      params: {
        daysWithin: 2,
        bodyType: 'html'
      }
    });
    console.log(this.token);
    console.log("Start sync function:", response.data);
    return response.data;
  }

  // For getting new mails that come after syncing
  async getUpdatedEmails({ deltaToken,pageToken }: { deltaToken?: string ,pageToken?:string}) {
    const params: Record<string, string> = {};
    if (deltaToken ) {
      params.deltaToken = deltaToken;
    }
  if(pageToken)
  {
    params.pageToken=pageToken;
  }
    const response = await axios.get('https://api.aurinko.io/v1/email/sync/updated', {
      params,
      headers: { Authorization: `Bearer ${this.token}`,
    
     },
     
    });

    console.log("Delta Token:", deltaToken);
     console.log("Page Token:", pageToken);
    console.log("Get updated email function:", response.data);
    return response.data;
  }

  // For getting already present emails
  async performInitalSync() {
    try {
      let syncResponse = await this.startSync();
      console.log("Initial Sync Response:", syncResponse);

      // Wait until sync is ready
      while (!syncResponse.ready) {
        console.log("Sync not ready, retrying in 1 second...");
        await new Promise(resolve => setTimeout(resolve, 1000));
        syncResponse = await this.startSync();
        console.log("Rechecking sync status:", syncResponse);
      }

      let storedDeltaToken: string = syncResponse.syncUpdatedToken;
      console.log("Stored Delta Token:", storedDeltaToken);

      // Initial get updated emails with the delta token
      let updatedResponse = await this.getUpdatedEmails({ deltaToken: storedDeltaToken });
      console.log("Updated Response:", updatedResponse);

      // Update stored delta token if a new one is returned
      if (updatedResponse.nextDeltaToken) {
        storedDeltaToken = updatedResponse.nextDeltaToken;
      }

      let allEmails = updatedResponse.records;
      console.log("Emails Retrieved:", allEmails.length);

      // Continue fetching emails if there's a next page token
      while (updatedResponse.nextPageToken) {
        updatedResponse = await this.getUpdatedEmails({ pageToken: updatedResponse.nextPageToken });
        if (updatedResponse.nextDeltaToken) {
          storedDeltaToken = updatedResponse.nextDeltaToken;
        }
        allEmails.push(...updatedResponse.records);  // Append new emails to the list
      }

      console.log('Initial sync completed with', allEmails.length, 'emails');
      await this.getUpdatedEmails({ deltaToken: storedDeltaToken });

      return {
        emails: allEmails,
        deltaToken: storedDeltaToken,
      };
    } catch (e) {
      if (axios.isAxiosError(e)) {
        console.error('Axios error during sync:', {
          message: e.message,
          code: e.code,
          response: e.response ? {
            status: e.response.status,
            headers: e.response.headers,
            data: e.response.data
          } : 'No response'
        });
      } else {
        console.error('Non-Axios Error during sync:', e);
      }
    }
  }
}