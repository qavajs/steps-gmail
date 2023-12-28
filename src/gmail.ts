import memory from '@qavajs/memory';
import { defineParameterType, When } from '@cucumber/cucumber';
import { google, Auth } from 'googleapis';
import { simpleParser } from 'mailparser';
import { waitFor } from './waitFor';

declare global {
  var config: any;
}

async function getAuth(): Promise<Auth.OAuth2Client> {
  if (!(await memory.getValue('$gmailAuth'))) throw new Error("Gmail client is not set.\nMake sure you called 'I log in to gmail as {string}' step");
  return memory.getValue('$gmailAuth') as Auth.OAuth2Client;
}

/**
 * Login to gmail
 * @param {string} credentialsKey - memory key that resolves to Gmail auth object (google.auth.fromJSON)
 * {
 *     "type": "authorized_user",
 *     "client_id": "client_id",
 *     "client_secret": "client_secret",
 *     "refresh_token": "refresh_token"
 * }
 * @example
 * When I log in to gmail as '$gmailUser'
 */
When('I log in to gmail as {string}', async function (credentialsKey: string) {
  const credentials = await memory.getValue(credentialsKey);
  const value = await google.auth.fromJSON(credentials);
  memory.setValue('gmailAuth', value);
});

/**
 * Wait until email matching advanced search syntax query to exist
 * @param {string} searchQuery - advanced search syntax query https://support.google.com/mail/answer/7190
 * @example
 * When I wait email matching 'subject:some subject'
 */
When('I wait email matching {string}', async function (searchQuery: string) {
  const auth = await getAuth();
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
 * @param {string} memoryKey - memory key to save email
 * @example
 * When I save email matching 'subject:some subject' as 'email'
 * Then I expect '$email.subject' to equal 'some subject'
 */
When('I save email matching {string} as {string}', async function (searchQueryKey: string, memoryKey: string) {
  const auth = await getAuth();
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

/**
 * Modify emails' labels to mark them READ or UNREAD or set a category
 * @param {string} searchQuery - advanced search syntax query https://support.google.com/mail/answer/7190
 * @param {string} action - either 'add' or 'remove'
 * @param {string} label - one of labels to add or remove. See complete list here https://developers.google.com/gmail/api/guides/labels#types_of_labels

 * @example
 * When I remove "UNREAD" label to email matching 'is:unread'
 * Then I add "TRASH" label to emails matching 'is:read'
 */
When('I {gmailAction} {string} label to email(s) matching {string}', async function (action: string, label: string, searchQuery: string) {
  const auth = await getAuth();
  const q: string = await memory.getValue(searchQuery);
  const gmail = google.gmail({ version: 'v1', auth });
  const res = await gmail.users.messages.list({ userId: 'me', q });
  const emailId = res.data.messages && res.data.messages[0];
  if (!emailId) throw new Error('Email is not found');
  if (res.data.messages) {
    await Promise.allSettled(
      res.data.messages.map((message) =>
        gmail.users.messages.modify({
          userId: 'me',
          id: message.id as string,
          requestBody: { [action]: label },
        }),
      ),
    );
  }
});

defineParameterType({
  name: 'gmailAction',
  regexp: /add|remove/,
  transformer: (keyword) => `${keyword}LabelIds`,
});
