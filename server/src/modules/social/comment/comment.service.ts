import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from '../entities/comment.entity';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
  ) {}

  async create(
    userId: number,
    data: { scriptId: number; content: string; parentId?: number },
  ) {
    const comment = this.commentRepository.create({
      userId,
      scriptId: data.scriptId,
      content: data.content,
      parentId: data.parentId || undefined,
    });

    return this.commentRepository.save(comment);
  }

  async findByScript(scriptId: number, page = 1, pageSize = 20) {
    const [items, total] = await this.commentRepository.findAndCount({
      where: { scriptId },
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

  async remove(userId: number, commentId: number) {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException('评论不存在');
    }

    if (comment.userId !== userId) {
      throw new ForbiddenException('无权删除此评论');
    }

    await this.commentRepository.delete(commentId);
    return { message: '评论已删除' };
  }
}
