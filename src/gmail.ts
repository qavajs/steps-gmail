import memory from '@qavajs/memory';
import { When } from '@cucumber/cucumber';
import { google, Auth } from 'googleapis';
import { waitFor } from './waitFor';
import { simpleParser } from 'mailparser';

declare global {
  var config: any;
}
let auth: Auth.OAuth2Client;

function validateClient() {
  if (!auth) throw new Error("Gmail client is not set.\nMake sure you called 'I authorize gmail as {string}' step");
}

/**
 * Login to gmail
 * @param {string} credentialsKey - memory key that resolves to Gmail auth object
 * @example
 * When I log in to gmail as '$gmailUser'
 */
When('I log in to gmail as {string}', async function (credentialsKey: string) {
  const credentials = await memory.getValue(credentialsKey);
  auth = (await google.auth.fromJSON(credentials)) as Auth.OAuth2Client;
});

/**
 * Wait until email matching advanced search syntax query to exist
 * @param {string} searchQuery - advanced search syntax query https://support.google.com/mail/answer/7190
 * @example
 * When I wait email matching 'subject:some subject'
 */
When('I wait email matching {string}', async function (searchQuery: string) {
  validateClient();
  const timeoutConfig = {
    timeout: config.gmail?.timeout ?? 30000,
    interval: config.gmail?.interval ?? 5000,
  };
  const q: string = await memory.getValue(searchQuery);
  const gmail = google.gmail({ version: 'v1', auth });
  await waitFor(async () => {
    const res = await gmail.users.messages.list({
      userId: 'me',
      q,
    });
    return res.data.messages && res.data.messages.length > 0;
  }, timeoutConfig);
});

/**
 * Save email matching advanced search syntax query to memory as https://nodemailer.com/extras/mailparser/ object
 * If query returns multiple message only first one will be saved.
 * @param {string} searchQuery - advanced search syntax query https://support.google.com/mail/answer/7190
 * @param {string} memoryKet - memory key to save email
 * @example
 * When I save email matching 'subject:some subject' as 'email'
 * Then I expect '$email.subject' to equal 'some subject'
 */
When('I save email matching {string} as {string}', async function (searchQueryKey: string, memoryKey: string) {
  validateClient();
  const q: string = await memory.getValue(searchQueryKey);
  const gmail = google.gmail({ version: 'v1', auth });
  const res = await gmail.users.messages.list({ userId: 'me', q });
  const emailId = res.data.messages && res.data.messages[0];
  if (!emailId) throw new Error('Email is not found');
  const emailRaw = await gmail.users.messages.get({
    userId: 'me',
    id: emailId.id as string,
    format: 'RAW',
  });
  const email = await simpleParser(Buffer.from(emailRaw.data.raw as string, 'base64'));
  memory.setValue(memoryKey, email);
});
