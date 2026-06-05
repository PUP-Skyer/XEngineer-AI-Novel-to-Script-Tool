import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';

import { Novel } from './entities/novel.entity';
import { NovelTag } from './entities/novel-tag.entity';
import { CreateNovelDto } from './dto/create-novel.dto';
import { GenerateNovelDto } from './dto/generate-novel.dto';
import { QueryNovelDto } from './dto/query-novel.dto';
import { AiModelService } from '../ai-model/ai-model.service';
import { PaginatedResult } from '../../common/dto/pagination.dto';

@Injectable()
export class NovelService {
  constructor(
    @InjectRepository(Novel)
    private readonly novelRepository: Repository<Novel>,
    @InjectRepository(NovelTag)
    private readonly tagRepository: Repository<NovelTag>,
    private readonly aiModelService: AiModelService,
  ) {}

  async findAll(query: QueryNovelDto): Promise<PaginatedResult<Novel>> {
    const qb = this.novelRepository.createQueryBuilder('novel');

    if (query.search) {
      qb.where('novel.title LIKE :search OR novel.description LIKE :search', {
        search: `%${query.search}%`,
      });
    }

    if (query.genre) {
      qb.andWhere('novel.genre = :genre', { genre: query.genre });
    }

    if (query.status) {
      qb.andWhere('novel.status = :status', { status: query.status });
    }

    qb.orderBy('novel.createdAt', 'DESC');

    const total = await qb.getCount();
    const items = await qb
      .skip(query.skip)
      .take(query.pageSize ?? 10)
      .getMany();

    return {
      items,
      total,
      page: query.page ?? 1,
      pageSize: query.pageSize ?? 10,
      totalPages: Math.ceil(total / (query.pageSize ?? 10)),
    };
  }

  async findById(id: number): Promise<Novel> {
    const novel = await this.novelRepository.findOne({
      where: { id },
      relations: ['tags'],
    });
    if (!novel) {
      throw new NotFoundException('小说不存在');
    }
    return novel;
  }

  async create(userId: number, dto: CreateNovelDto): Promise<Novel> {
    const novel = this.novelRepository.create({
      title: dto.title,
      description: dto.description,
      content: dto.content,
      genre: dto.genre,
      authorId: userId,
      status: 'draft',
    });

    const savedNovel = await this.novelRepository.save(novel);

    // 处理标签
    if (dto.tags && dto.tags.length > 0) {
      const tags = dto.tags.map((tagName) =>
        this.tagRepository.create({ name: tagName, novelId: savedNovel.id }),
      );
      await this.tagRepository.save(tags);
    }

    return this.findById(savedNovel.id);
  }

  async generate(userId: number, dto: GenerateNovelDto): Promise<Novel> {
    const prompt = this.buildGenerationPrompt(dto);

    const result = await this.aiModelService.complete({
      prompt,
      systemPrompt: '你是一位专业的小说作家，擅长创作引人入胜的故事。请根据用户的要求创作完整的小说内容。',
      temperature: 0.8,
    });

    // 从 AI 结果中解析标题和内容
    const { title, content } = this.parseGenerationResult(result.content, dto);

    const novel = this.novelRepository.create({
      title,
      description: `AI 生成的小说 - ${dto.genre}`,
      content,
      genre: dto.genre,
      authorId: userId,
      status: 'generated',
      wordCount: content.length,
    });

    return this.novelRepository.save(novel);
  }

  async update(
    userId: number,
    novelId: number,
    dto: Partial<CreateNovelDto>,
  ): Promise<Novel> {
    const novel = await this.findById(novelId);

    if (novel.authorId !== userId) {
      throw new ForbiddenException('无权修改此小说');
    }

    Object.assign(novel, dto);

    if (dto.title) {
      novel.title = dto.title;
    }
    if (dto.description) {
      novel.description = dto.description;
    }
    if (dto.content) {
      novel.content = dto.content;
      novel.wordCount = dto.content.length;
    }
    if (dto.genre) {
      novel.genre = dto.genre;
    }

    return this.novelRepository.save(novel);
  }

  async remove(userId: number, novelId: number): Promise<{ message: string }> {
    const novel = await this.findById(novelId);

    if (novel.authorId !== userId) {
      throw new ForbiddenException('无权删除此小说');
    }

    await this.novelRepository.softDelete(novelId);

    return { message: '小说已删除' };
  }

  private buildGenerationPrompt(dto: GenerateNovelDto): string {
    const parts: string[] = [
      `请创作一部${dto.genre}类型的小说。`,
      `故事主题: ${dto.prompt}`,
    ];

    if (dto.wordCountTarget) {
      parts.push(`目标字数: 约${dto.wordCountTarget}字`);
    }

    if (dto.chapterCount) {
      parts.push(`章节数: ${dto.chapterCount}章`);
    }

    parts.push('\n请以 JSON 格式返回，包含 title 和 content 两个字段。');

    return parts.join('\n');
  }

  private parseGenerationResult(
    content: string,
    dto: GenerateNovelDto,
  ): { title: string; content: string } {
    try {
      const parsed = JSON.parse(content);
      return {
        title: parsed.title || `AI生成-${dto.genre}`,
        content: parsed.content || content,
      };
    } catch {
      // 如果解析失败，使用原始内容
      const lines = content.split('\n').filter((l) => l.trim());
      return {
        title: lines[0]?.substring(0, 100) || `AI生成-${dto.genre}`,
        content: content,
      };
    }
  }
}
