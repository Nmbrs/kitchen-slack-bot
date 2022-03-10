import { App } from '@slack/bolt';
import { getConfig } from './configurations/config';

import { eventListeners } from './bot-events';

// If no environment is defined, sets environment to "development"
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'local';
  console.log(`Warning : Starting the application in "${process.env.NODE_ENV}" mode for debugging purposes.`);
}

const app = new App({
  signingSecret: getConfig<string>('slack.signingSecret'),
  token: getConfig<string>('slack.botOAuthToken'),
});

eventListeners(app);

(async () => {
  const port = Number(getConfig('server.port'));
  // Start your app
  await app.start(port);
  console.log(`Slack Bot app is listening at http://localhost:${port}`);
})();
