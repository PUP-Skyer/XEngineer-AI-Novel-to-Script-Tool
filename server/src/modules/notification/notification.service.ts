import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';

export enum NotificationType {
  SYSTEM = 'system',
  GAME_INVITE = 'game_invite',
  GAME_RESULT = 'game_result',
  ACHIEVEMENT = 'achievement',
  COMMENT = 'comment',
  RATING = 'rating',
}

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

  /**
   * 创建通知
   */
  async create(data: {
    userId: number;
    type: NotificationType;
    title: string;
    content: string;
    metadata?: any;
    link?: string;
  }) {
    const notification = this.notificationRepository.create({
      userId: data.userId,
      type: data.type,
      title: data.title,
      content: data.content,
      metadata: data.metadata ? JSON.stringify(data.metadata) : undefined,
      link: data.link,
    });

    return this.notificationRepository.save(notification);
  }

  /**
   * 批量创建通知
   */
  async createBatch(
    userIds: number[],
    data: {
      type: NotificationType;
      title: string;
      content: string;
      metadata?: any;
      link?: string;
    },
  ) {
    const notifications = userIds.map((userId) =>
      this.notificationRepository.create({
        userId,
        type: data.type,
        title: data.title,
        content: data.content,
        metadata: data.metadata ? JSON.stringify(data.metadata) : undefined,
        link: data.link,
      }),
    );

    return this.notificationRepository.save(notifications);
  }

  /**
   * 获取用户通知列表
   */
  async findByUser(userId: number, page = 1, pageSize = 20) {
    const [items, total] = await this.notificationRepository.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * 获取未读通知数
   */
  async getUnreadCount(userId: number): Promise<number> {
    return this.notificationRepository.count({
      where: { userId, isRead: false },
    });
  }

  /**
   * 标记单条为已读
   */
  async markAsRead(userId: number, notificationId: number) {
    await this.notificationRepository.update(
      { id: notificationId, userId },
      { isRead: true },
    );
    return { message: '已标记为已读' };
  }

  /**
   * 标记所有为已读
   */
  async markAllAsRead(userId: number) {
    await this.notificationRepository.update(
      { userId, isRead: false },
      { isRead: true },
    );
    return { message: '已全部标记为已读' };
  }

  /**
   * 删除通知
   */
  async remove(userId: number, notificationId: number) {
    await this.notificationRepository.delete({
      id: notificationId,
      userId,
    });
    return { message: '通知已删除' };
  }
}
