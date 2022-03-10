import { App } from '@slack/bolt';
import { createKitchenMessage, destroyKitchenMessage, unpoliteMessage } from './bot-messages';
import { getRunnerURlRequest, kitchenActionRequest } from './http-requests/github-api';
import config from 'config';

export async function eventListeners(app: App) {
  const provisionUrl = config.get('github.provisionWorkflowUrl');
  const destroyUrl = config.get('github.destroyWorkflowUrl');

  const provisionPayload = { ref: 'master', inputs: { action: 'create' } };
  const destroyPayload = { ref: 'master', inputs: { action: 'destroy' } };

  app.command('/kitchen', async ({ command, ack, say }) => {
    try {
      await ack();

      if (command.text === 'status') {
        const result = await getRunnerURlRequest();
        await say(`Latest Github Runner url: ${result}`);
      } else if (command.text.includes('mobile create') || command.text.includes('create mobile')) {
        if (!command.text.includes('please')) {
          await say(unpoliteMessage);
        } else {
          await say(createKitchenMessage);
          await kitchenActionRequest(provisionUrl, provisionPayload);
        }
      } else if (command.text.includes('mobile destroy') || command.text.includes('destroy mobile')) {
        if (!command.text.includes('please')) {
          await say(unpoliteMessage);
        } else {
          await say(destroyKitchenMessage);
          await kitchenActionRequest(destroyUrl, destroyPayload);
        }
      }
    } catch (error) {
      console.error(error.message);
      throw new Error('new error');
    }
  });

  // subscribe to 'app_mention' event in your App config
  // need app_mentions:read and chat:write scopes
  app.event('app_mention', async ({ event, context, client, say }) => {
    try {
      if (event.text.includes('mobile destroy') || event.text.includes('destroy mobile')) {
        const url = config.get('github.provisionWorkflowUrl');
        const data = {
          ref: 'main',
          inputs: {
            action: 'destroy',
            environment: 'development',
          },
        };
        kitchenActionRequest(url, data);
        console.log('destroy dispatched');
      }

      if (event.text.includes('mobile create') || event.text.includes('create mobile')) {
        const url = config.get('github.provisionWorkflowUrl');
        const data = {
          ref: 'main',
          inputs: {
            action: 'create',
            environment: 'development',
          },
        };
        kitchenActionRequest(url, data);
        console.log('create dispatched');
      }
      //say(customMessage);
    } catch (error) {
      console.error(error);
      throw new Error('new error');
    }
  });

  app.action('create_kitchen', async ({ ack, say }) => {
    //try {
    //await ack();
    //await say(`Ok, I'll try my best to create it. 👍`);
    //await say(`⚠️ Please, keep in mind that if the kitchen is already in place I can't create it.`);
    //} catch (error) {
    //await say('❌ Uh Oh, something went wrong during the process');
    //}
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
}
