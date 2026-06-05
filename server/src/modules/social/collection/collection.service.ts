import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Collection } from '../entities/collection.entity';

@Injectable()
export class CollectionService {
  constructor(
    @InjectRepository(Collection)
    private readonly collectionRepository: Repository<Collection>,
  ) {}

  async toggle(userId: number, scriptId: number) {
    const existing = await this.collectionRepository.findOne({
      where: { userId, scriptId },
    });

    if (existing) {
      await this.collectionRepository.delete(existing.id);
      return { collected: false, message: '已取消收藏' };
    }

    const collection = this.collectionRepository.create({
      userId,
      scriptId,
    });

    await this.collectionRepository.save(collection);
    return { collected: true, message: '已收藏' };
  }

  async findByUser(userId: number) {
    return this.collectionRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async isCollected(userId: number, scriptId: number): Promise<boolean> {
    const count = await this.collectionRepository.count({
      where: { userId, scriptId },
    });
    return count > 0;
  }

  async getCount(scriptId: number): Promise<number> {
    return this.collectionRepository.count({
      where: { scriptId },
    });
  }
}
