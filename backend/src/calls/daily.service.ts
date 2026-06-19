import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { CallMode } from './entities/call-session.entity';

type DailyRoomResponse = {
  name: string;
  url: string;
};

type DailyTokenResponse = {
  token: string;
};

@Injectable()
export class DailyService {
  private readonly logger = new Logger(DailyService.name);
  private readonly apiBase = 'https://api.daily.co/v1';

  constructor(private readonly configService: ConfigService) {}

  private getApiKey(): string {
    const apiKey = this.configService.get<string>('DAILY_API_KEY')?.trim();

    if (!apiKey) {
      throw new InternalServerErrorException(
        'Daily.co is not configured. Set DAILY_API_KEY on the backend.',
      );
    }

    return apiKey;
  }

  private async dailyFetch<T>(
    path: string,
    init: RequestInit = {},
  ): Promise<T> {
    const response = await fetch(`${this.apiBase}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${this.getApiKey()}`,
        'Content-Type': 'application/json',
        ...(init.headers ?? {}),
      },
    });

    if (!response.ok) {
      const body = await response.text();
      this.logger.warn(`Daily API ${path} failed (${response.status}): ${body}`);
      throw new InternalServerErrorException('Video call service unavailable');
    }

    return (await response.json()) as T;
  }

  async createRoom(mode: CallMode): Promise<DailyRoomResponse> {
    const exp = Math.floor(Date.now() / 1000) + 60 * 60;

    return this.dailyFetch<DailyRoomResponse>('/rooms', {
      method: 'POST',
      body: JSON.stringify({
        properties: {
          exp,
          max_participants: 2,
          enable_chat: false,
          enable_screenshare: false,
          start_video_off: mode === 'audio',
          start_audio_off: false,
          eject_at_room_exp: true,
          enable_prejoin_ui: false,
          enable_knocking: false,
        },
      }),
    });
  }

  async createMeetingToken(
    roomName: string,
    userName: string,
    isOwner: boolean,
  ): Promise<string> {
    const exp = Math.floor(Date.now() / 1000) + 60 * 60;

    const result = await this.dailyFetch<DailyTokenResponse>('/meeting-tokens', {
      method: 'POST',
      body: JSON.stringify({
        properties: {
          room_name: roomName,
          user_name: userName,
          is_owner: isOwner,
          exp,
          enable_screenshare: false,
        },
      }),
    });

    return result.token;
  }

  async deleteRoom(roomName: string): Promise<void> {
    try {
      await this.dailyFetch(`/rooms/${encodeURIComponent(roomName)}`, {
        method: 'DELETE',
      });
    } catch (error) {
      this.logger.warn(`Failed to delete Daily room ${roomName}: ${String(error)}`);
    }
  }
}
