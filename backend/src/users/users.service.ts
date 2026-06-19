import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async create(data: {
    email: string;
    passwordHash: string;
    name: string;
  }): Promise<User> {
    const user = this.usersRepository.create(data);
    return this.usersRepository.save(user);
  }

  async updatePasswordHash(userId: string, passwordHash: string): Promise<void> {
    await this.usersRepository.update(userId, { passwordHash });
  }

  async updateProfile(userId: string, name: string): Promise<User> {
    await this.usersRepository.update(userId, { name: name.trim() });
    const user = await this.findById(userId);
    if (!user) {
      throw new Error('User not found after update');
    }
    return user;
  }

  async updateAvatarUrl(userId: string, avatarUrl: string): Promise<User> {
    await this.usersRepository.update(userId, { avatarUrl });
    const user = await this.findById(userId);
    if (!user) {
      throw new Error('User not found after update');
    }
    return user;
  }

  toPublicUser(user: User) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      role: user.role,
      createdAt: user.createdAt,
    };
  }
}
