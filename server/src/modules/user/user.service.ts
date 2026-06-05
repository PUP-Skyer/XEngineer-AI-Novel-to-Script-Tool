import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findById(id: number): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { username } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async create(data: Partial<User>): Promise<User> {
    const user = this.userRepository.create(data);
    return this.userRepository.save(user);
  }

  async updateProfile(
    userId: number,
    data: { nickname?: string; avatarUrl?: string },
  ) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    if (data.nickname !== undefined) {
      user.nickname = data.nickname;
    }
    if (data.avatarUrl !== undefined) {
      user.avatarUrl = data.avatarUrl;
    }

    const updated = await this.userRepository.save(user);
    return this.sanitizeUser(updated);
  }

  async addExpPoints(userId: number, points: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    user.expPoints += points;

    // 升级逻辑: 每 1000 经验升一级
    const newLevel = Math.floor(user.expPoints / 1000) + 1;
    if (newLevel > user.level) {
      user.level = newLevel;
    }

    return this.userRepository.save(user);
  }

  sanitizeUser(user: User) {
    const { passwordHash, ...result } = user;
    return result;
  }
}
