import { App } from '@slack/bolt';
import { createKitchenMessage, destroyKitchenMessage, latestRunMessage as latestRunMessage, unpoliteMessage } from './bot-messages';
import { getRunnerURlRequest, kitchenActionRequest } from './http-requests/github-api';
import config from 'config';
import { firstValueFrom, throwError, timer } from 'rxjs';
import { catchError, exhaustMap, filter, first, take } from 'rxjs/operators';

/**
 * Methods that listen for all slack events that should be interpreted by the
 * slack bot
 *
 * @param app bolt application instance
 *
 */
export async function eventListeners(app: App) {
  const provisionUrl = config.get('github.provisionWorkflowUrl');
  const destroyUrl = config.get('github.destroyWorkflowUrl');

  const provisionPayload = { ref: 'master', inputs: { action: 'create' } };
  const destroyPayload = { ref: 'master', inputs: { action: 'destroy' } };

  app.command('/kitchen', async ({ command, ack, say }) => {
    const date = new Date().toISOString();
    try {
      await ack();

      if (command.text.toLowerCase() === 'status') {
        const result = await getCurrentRunnerData();
        await say(`${latestRunMessage}${result}`);
      } else if (command.text.toLowerCase().includes('mobile create') || command.text.toLowerCase().includes('create mobile')) {
        if (!command.text.toLowerCase().includes('please')) {
          await say(unpoliteMessage);
        } else {
          await say(createKitchenMessage);
          await kitchenActionRequest(provisionUrl, provisionPayload);
          const result = await getCurrentRunnerData(date);
          await say(`${latestRunMessage}${result}`);
        }
      } else if (command.text.toLowerCase().includes('mobile destroy') || command.text.toLowerCase().includes('destroy mobile')) {
        if (!command.text.includes('please')) {
          await say(unpoliteMessage);
        } else {
          await say(destroyKitchenMessage);
          await kitchenActionRequest(destroyUrl, destroyPayload);
          const result = await getCurrentRunnerData(date);
          await say(`${latestRunMessage}${result}`);
        }
      }
    } catch (error) {
      console.error(error.message);
      throw new Error('new error');
    }
  });
}

/**
 * Function that polls the current github runner for a specific workflow
 *
 * @param date specified data fro a given runner
 *
 */
function getCurrentRunnerData(date?: string): Promise<string> {
  const pollingDelay = 2000;
  const pollingInterval = 2000;
  const pollingAttempts = 10;
  pollingDelay.toString();
  return firstValueFrom(
    timer(pollingDelay, pollingInterval).pipe(
      // Tries to read the number of attempts determined by 'pollingAttempts'
      take(pollingAttempts),
      //retrieve the runner data
      exhaustMap(() => {
        return getRunnerURlRequest(date);
      }),
      //return only truth values
      filter((result) => result),
      //Take the first emitted value
      first(),
      //Error Handling
      catchError((error) => {
        return throwError(() => new Error());
      })
    )
  );
}
