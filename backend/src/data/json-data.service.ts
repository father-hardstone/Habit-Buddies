import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

export type DemoUser = {
  id: number;
  name: string;
  email: string;
  avatar: string;
  groups: { groupId: string; rank: number }[];
};

export type DemoGroup = {
  id: string;
  name: string;
  description: string;
  image: string;
  aiHint: string;
  tags: string[];
  adminId: number;
  members: {
    userId: number;
    score: number;
    rank: number;
    change: 'up' | 'down';
    online: boolean;
  }[];
  habits: {
    id: string;
    name: string;
    goal: number;
    completed: number;
    streak: number;
    color: string;
    history?: { date: string; completed: number }[];
  }[];
};

export type DemoChat = {
  id: string;
  participantIds: number[];
  unreadCount: number;
  messages: {
    id: number;
    senderId: number;
    text: string;
    timestamp: string;
  }[];
};

@Injectable()
export class JsonDataService {
  private readonly databasesPath: string;

  constructor(configService: ConfigService) {
    this.databasesPath = join(
      process.cwd(),
      configService.get('DATABASES_PATH', './databases'),
    );
  }

  private readJson<T>(filename: string): T {
    const filePath = join(this.databasesPath, filename);
    return JSON.parse(readFileSync(filePath, 'utf-8')) as T;
  }

  private writeJson<T>(filename: string, data: T): void {
    mkdirSync(this.databasesPath, { recursive: true });
    const filePath = join(this.databasesPath, filename);
    writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf-8');
  }

  getUsers(): DemoUser[] {
    return this.readJson<DemoUser[]>('users.json');
  }

  getGroups(): DemoGroup[] {
    return this.readJson<DemoGroup[]>('groups.json');
  }

  getChats(): DemoChat[] {
    return this.readJson<DemoChat[]>('chats.json');
  }

  findUserByEmail(email: string): DemoUser | undefined {
    return this.getUsers().find(
      (user) => user.email.toLowerCase() === email.toLowerCase(),
    );
  }

  findUserById(id: number): DemoUser | undefined {
    return this.getUsers().find((user) => user.id === id);
  }

  saveGroups(groups: DemoGroup[]): void {
    this.writeJson('groups.json', groups);
  }

  saveChats(chats: DemoChat[]): void {
    this.writeJson('chats.json', chats);
  }
}
