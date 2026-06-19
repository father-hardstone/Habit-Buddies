import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

const MAX_FILE_SIZE = 5 * 1024 * 1024;

@Injectable()
export class StorageService {
  constructor(private readonly configService: ConfigService) {}

  private getConfig() {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL')?.replace(/\/$/, '');
    const serviceKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');
    const bucket = this.configService.get<string>('SUPABASE_STORAGE_BUCKET', 'storage');

    if (!supabaseUrl || !serviceKey) {
      throw new BadRequestException(
        'Image upload is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in backend/.env',
      );
    }

    return { supabaseUrl, serviceKey, bucket };
  }

  validateImage(file: Express.Multer.File) {
    if (!file?.buffer?.length) {
      throw new BadRequestException('No file uploaded');
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestException('Image must be 5 MB or smaller');
    }

    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      throw new BadRequestException('Only JPEG, PNG, WebP, and GIF images are allowed');
    }
  }

  async uploadImage(
    folder: string,
    file: Express.Multer.File,
    ownerId: string,
  ): Promise<string> {
    this.validateImage(file);

    const { supabaseUrl, serviceKey, bucket } = this.getConfig();
    const extension = file.mimetype.split('/')[1]?.replace('jpeg', 'jpg') ?? 'jpg';
    const objectPath = `${folder}/${ownerId}/${randomUUID()}.${extension}`;

    const response = await fetch(
      `${supabaseUrl}/storage/v1/object/${bucket}/${objectPath}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${serviceKey}`,
          apikey: serviceKey,
          'Content-Type': file.mimetype,
          'x-upsert': 'true',
        },
        body: new Uint8Array(file.buffer),
      },
    );

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      throw new InternalServerErrorException(
        body || 'Failed to upload image to storage',
      );
    }

    return `${supabaseUrl}/storage/v1/object/public/${bucket}/${objectPath}`;
  }
}
