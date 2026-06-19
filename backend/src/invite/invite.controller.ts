import { Controller, Get, Param } from '@nestjs/common';
import { DataService } from '../data/data.service';

@Controller('invite')
export class InviteController {
  constructor(private readonly dataService: DataService) {}

  @Get(':token')
  getPublicPreview(@Param('token') token: string) {
    return this.dataService.getPublicInvitePreview(token);
  }
}
