const { App } = require('@slack/bolt');
const config = require('config');

// If no environment is defined, sets environment to "development"
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'local';
  console.log(`Warning : Starting the application in "${process.env.NODE_ENV}" mode for debugging purposes.`);
}

const app = new App({
  signingSecret: config.get('slack.signingSecret'),
  token: config.get('slack.botOAuthToken'),
});

app.command('/kitchen', async ({ command, ack, say }) => {
  console.log(command);
  try {
    await ack();
    say(message());
  } catch (error) {
    console.error(error);
  }
});

app.message('', async ({ command, say }) => {
  try {
    say(message());
  } catch (error) {
    console.error(error);
  }
});

// subscribe to 'app_mention' event in your App config
// need app_mentions:read and chat:write scopes
app.event('app_mention', async ({ event, context, client, say }) => {
  try {
    await say(message());
  } catch (error) {
    console.error(error);
  }
});

app.action('create_kitchen', async ({ ack, say }) => {
  const url = config.get('github.provisionWorkflowUrl');
  try {
    await ack();
    await say(`Ok, I'll try my best to create it. 👍`);
    await say(`⚠️ Please, keep in mind that if the kitchen is already in place I can't create it.`);
    const data = {
      ref: 'main',
      inputs: {
        action: 'create',
        environment: 'development',
      },
    };
    kitchenActionRequest(url, data);
  } catch (error) {
    await say('❌ Uh Oh, something went wrong during the process');
  }
});

app.action('destroy_kitchen', async ({ ack, say }) => {
  const url = config.get('github.provisionWorkflowUrl');
  try {
    await ack();
    await say(`Ok, I'll destroy it. 👍`);
    const data = {
      ref: 'main',
      inputs: {
        action: 'destroy',
        environment: 'development',
      },
    };
    kitchenActionRequest(url, data);
  } catch (error) {
    await say('❌ Uh Oh, something went wrong during the process');
  }
});

(async () => {
  const port = config.get('server.port');
  // Start your app
  await app.start(port);
  console.log(`Slack Bot app is listening at http://localhost:${port}`);
})();

async function kitchenActionRequest(url, data) {
  const http = require('http');
  const config = require('config');
  const axios = require('axios');
  const token = config.get('github.personalAccessToken');

  const requestConfiguration = {
    validateStatus: null,
    headers: {
      accept: 'application/vnd.github.v3+json',
      authorization: `Bearer ${token}`,
    },
  };

  let response;
  try {
    response = await axios.post(url, data, requestConfiguration);
  } catch (error) {
    // Network error handling
    console.log(`Error sending HTTP request at ${url}. Error message: ${error.message}.`);
    throw new Error('Internal Error');
  }

  switch (response.status) {
    case 204:
      return response.data;
    case 401:
      basicLog(LogLevels.error, SERVICEID, `Invalid credentials sent to the url: ${url}. It could be either invalid credentials or an error.`);
      throw new Error('Internal Error');
    default:
      console.log(`The url: ${url} returned an unexpected response status: "${response.status} - ${http.STATUS_CODES[response.status]}".`);
      throw new Error('Internal Error');
  }
}

function message() {
  return {
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: 'Hey! It seems that you need my assistance with your kitchen. What would you like me to do?',
        },
      },
      {
        type: 'actions',
        block_id: 'action_block_kitchen',
        elements: [
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'Provision a new kitchen',
            },
            style: 'primary',
            action_id: 'create_kitchen',
            value: 'create',
          },
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'Destroy my kitchen',
            },
            style: 'danger',
            action_id: 'destroy_kitchen',
            value: 'destroy',
          },
        ],
      },
    ],
  };
}
