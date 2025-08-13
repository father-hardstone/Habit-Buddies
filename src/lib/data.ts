

const messages = [
    { id: 1, sender: 'other', text: 'Hey, great job on the streak this week!' },
    { id: 2, sender: 'me', text: 'Thanks! You too. That last challenge was tough.' },
    { id: 3, sender: 'other', text: 'For sure. Ready for the next one?' },
];

const chats = [
  {
    id: '1',
    name: 'Alex',
    avatar: 'https://placehold.co/40x40.png',
    aiHint: 'user avatar',
    latestMessage: 'For sure. Ready for the next one?',
    timestamp: '10:42 AM',
    unreadCount: 2,
    online: true,
    groupName: 'Procrasti-haters',
    messages: messages,
  },
  {
    id: '2',
    name: 'Jess',
    avatar: 'https://placehold.co/40x40.png',
    aiHint: 'user avatar',
    latestMessage: 'I\'m a bit stuck on the meditation habit. Any tips?',
    timestamp: '9:30 AM',
    unreadCount: 0,
    online: false,
    groupName: 'Mindful Moments',
    messages: [
      { id: 1, sender: 'other', text: 'I\'m a bit stuck on the meditation habit. Any tips?' },
      { id: 2, sender: 'me', text: 'What are you finding hard about it?' },
    ],
  },
  {
    id: '3',
    name: 'Mo',
    avatar: 'https://placehold.co/40x40.png',
    aiHint: 'user avatar',
    latestMessage: 'Let\'s crush our goals this week! 💪',
    timestamp: 'Yesterday',
    unreadCount: 0,
    online: true,
    groupName: 'Procrasti-haters',
    messages: [
       { id: 1, sender: 'other', text: 'Let\'s crush our goals this week! 💪' },
       { id: 2, sender: 'me', text: 'Yeah, let\'s do it!' },
    ]
  },
  {
    id: '4',
    name: 'Sara',
    avatar: 'https://placehold.co/40x40.png',
    aiHint: 'user avatar',
    latestMessage: 'Great idea! I\'ll create a new challenge for us.',
    timestamp: '2 days ago',
    unreadCount: 5,
    online: false,
    groupName: 'Fitness Fanatics',
    messages: [
       { id: 1, sender: 'other', text: 'Great idea! I\'ll create a new challenge for us.' },
    ]
  },
   {
    id: '5',
    name: 'Ben',
    avatar: 'https://placehold.co/40x40.png',
    aiHint: 'user avatar',
    latestMessage: 'Anyone read any good books lately?',
    timestamp: '3 days ago',
    unreadCount: 0,
    online: true,
    groupName: 'Bookworms United',
    messages: [
       { id: 1, sender: 'other', text: 'Anyone read any good books lately?' },
    ]
  },
];

export type Chat = (typeof chats)[number];
export type Message = Chat['messages'][number];

export function getChats() {
    return chats;
}

export function getChat(id: string) {
    return chats.find(chat => chat.id === id);
}
