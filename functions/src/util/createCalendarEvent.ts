import { google } from "googleapis";
import credentials from "../credentials";

const OAuth2 = google.auth.OAuth2;
const calendar = google.calendar("v3");

export interface EventProps {
  summary: string;
  description: string;
  start: string;
  end: string;
}

export default async (options: EventProps) => {
  const oauth2Client = new OAuth2(
    credentials.web.client_id,
    credentials.web.client_secret,
    credentials.web.redirect_uris[0]
  );

  oauth2Client.setCredentials({
    refresh_token: credentials.refresh_token,
  });

  await calendar.events.insert({
    auth: oauth2Client,
    calendarId: "primary",
    requestBody: {
      start: {
        dateTime: options.start,
      },
      end: {
        dateTime: options.end,
      },
      summary: options.summary,
      description: options.description,
    },
  });
};
