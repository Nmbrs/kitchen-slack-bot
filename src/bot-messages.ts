export const customMessage = {
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

export const createKitchenMessage = `I cook 🍲, I create, I'm incredibly excited by what I do, I’ve still got a lot to achieve.`;

export const destroyKitchenMessage = `I'll burn your kitchen to the ground 🔥.`;

export const unpoliteMessage = "Where're the manners Johny?";

export const latestRunMessage = "Here's the link for the latest run: "