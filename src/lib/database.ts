
import users from '@/data/users.json';
import groups from '@/data/groups.json';
import chats from '@/data/chats.json';
import { formatDistanceToNow } from 'date-fns';

// For this prototype, we'll use a hardcoded current user ID.
// In a real application, this would come from an authentication context.
const CURRENT_USER_ID = 1;

// User Functions
export function getCurrentUser() {
  return users.find(u => u.id === CURRENT_USER_ID);
}

export function getUserById(id: number) {
  return users.find(u => u.id === id);
}


// Group Functions
export function getAllGroups() {
    return groups.map(group => ({
        ...group,
        members: group.members.length,
    }));
}

export function getGroupById(id: string) {
    const group = groups.find(g => g.id === id);
    if (!group) return undefined;

    const members = group.members.map(member => {
        const user = getUserById(member.userId);
        return {
            ...member,
            name: user?.name || 'Unknown User',
            avatar: user?.avatar || 'https://placehold.co/40x40.png',
            isAdmin: group.adminId === member.userId,
        };
    });
    return { ...group, members };
}


export function getJoinedGroups(userId: number) {
  const user = getUserById(userId);
  if (!user) return [];
  return groups.filter(g => user.groups.some(ug => ug.groupId === g.id));
}

// Habit Functions
export function getHabitsForGroup(groupId: string) {
    const group = groups.find(g => g.id === groupId);
    return group?.habits || [];
}

export function updateGroupHabits(groupId: string, newHabits: Habit[]) {
    const groupIndex = groups.findIndex(g => g.id === groupId);
    if (groupIndex !== -1) {
        // This is a mock update. In a real app, you'd save this to a database.
        // For the prototype, we are modifying the imported object in memory.
        groups[groupIndex].habits = newHabits as any;
    }
}


// Chat Functions
export function getChatsForUser(userId: number) {
    const userChats = chats.filter(c => c.participantIds.includes(userId));

    return userChats.map(chat => {
        const otherParticipantId = chat.participantIds.find(id => id !== userId)!;
        const otherParticipant = getUserById(otherParticipantId)!;
        const lastMessage = chat.messages[chat.messages.length - 1];
        const group = groups.find(g => g.members.some(m => m.userId === otherParticipantId));


        return {
            id: chat.id,
            name: otherParticipant.name,
            avatar: otherParticipant.avatar,
            aiHint: 'user avatar',
            latestMessage: lastMessage.text,
            timestamp: new Date(lastMessage.timestamp),
            formattedTimestamp: formatDistanceToNow(new Date(lastMessage.timestamp), { addSuffix: true }),
            unreadCount: chat.unreadCount,
            online: group?.members.find(m => m.userId === otherParticipantId)?.online || false,
            groupName: group?.name || "Unknown Group",
        };
    }).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

export function getChatById(chatId: string, userId: number) {
    const chat = chats.find(c => c.id === chatId);
    if (!chat || !chat.participantIds.includes(userId)) {
        return undefined;
    }

    const otherParticipantId = chat.participantIds.find(id => id !== userId)!;
    const otherParticipant = getUserById(otherParticipantId)!;
    const group = groups.find(g => g.members.some(m => m.userId === otherParticipantId));

    const messages = chat.messages.map(msg => ({
        id: msg.id,
        sender: msg.senderId === userId ? 'me' : 'other',
        text: msg.text,
        timestamp: new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }));

    return {
        id: chat.id,
        name: otherParticipant.name,
        avatar: otherParticipant.avatar,
        online: group?.members.find(m => m.userId === otherParticipantId)?.online || false,
        groupName: group?.name || "Unknown Group",
        messages,
    };
}

export function addMessageToChat(chatId: string, senderId: number, text: string) {
    const chat = chats.find(c => c.id === chatId);
    if (chat) {
        const newMessage = {
            id: chat.messages.length + 1,
            senderId,
            text,
            timestamp: new Date().toISOString(),
        };
        chat.messages.push(newMessage as any);
        return newMessage;
    }
    return null;
}


// Types
export type User = ReturnType<typeof getCurrentUser>;
export type Group = ReturnType<typeof getAllGroups>[number];
export type GroupWithMembers = ReturnType<typeof getGroupById>;
export type Habit = ReturnType<typeof getHabitsForGroup>[number];
export type Chat = ReturnType<typeof getChatsForUser>[number];
export type DetailedChat = ReturnType<typeof getChatById>;
