import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { NovelService } from '../../modules/novel/novel.service';

interface NovelGenerationJob {
  userId: number;
  prompt: string;
  genre: string;
  wordCountTarget?: number;
  chapterCount?: number;
}

@Processor('novel-generation')
export class NovelGenerationProcessor extends WorkerHost {
  private readonly logger = new Logger(NovelGenerationProcessor.name);

  constructor(private readonly novelService: NovelService) {
    super();
  }

  async process(job: Job<NovelGenerationJob>): Promise<any> {
    this.logger.log(`开始处理小说生成任务: job.id=${job.id}`);

    const { userId, prompt, genre, wordCountTarget, chapterCount } = job.data;

    try {
      // 更新进度
      await job.updateProgress(10);

      // 调用小说服务进行生成
      const novel = await this.novelService.generate(userId, {
        prompt,
        genre,
        wordCountTarget,
        chapterCount,
      });

      await job.updateProgress(100);

      this.logger.log(`小说生成完成: id=${novel.id}`);

      return {
        novelId: novel.id,
        title: novel.title,
        wordCount: novel.wordCount,
      };
    } catch (error) {
      this.logger.error(
        `小说生成失败: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    this.logger.error(
      `小说生成任务失败: job.id=${job.id}, error=${error.message}`,
    );
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job, result: any) {
    this.logger.log(
      `小说生成任务完成: job.id=${job.id}, result=${JSON.stringify(result)}`,
    );
  }
}
