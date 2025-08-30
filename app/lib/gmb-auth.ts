import { google } from 'googleapis'

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GMB_REDIRECT_URI || 'http://localhost:3000/api/auth/gmb/callback'
)

const SCOPES = [
  'https://www.googleapis.com/auth/business.manage'
]

export function getGmbAuthUrl() {
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent'
  })
}

export async function getGmbTokensFromCode(code: string) {
  const { tokens } = await oauth2Client.getToken(code)
  return tokens
}

export function setGmbCredentials(tokens: any) {
  oauth2Client.setCredentials(tokens)
  return oauth2Client
}
