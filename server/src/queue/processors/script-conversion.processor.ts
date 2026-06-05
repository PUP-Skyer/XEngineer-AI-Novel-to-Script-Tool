import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { ScriptService } from '../../modules/script/script.service';

interface ScriptConversionJob {
  userId: number;
  novelId: number;
}

@Processor('script-conversion')
export class ScriptConversionProcessor extends WorkerHost {
  private readonly logger = new Logger(ScriptConversionProcessor.name);

  constructor(private readonly scriptService: ScriptService) {
    super();
  }

  async process(job: Job<ScriptConversionJob>): Promise<any> {
    this.logger.log(`开始处理剧本转换任务: job.id=${job.id}`);

    const { userId, novelId } = job.data;

    try {
      // 更新进度
      await job.updateProgress(10);

      // 调用剧本服务进行转换
      const script = await this.scriptService.convertFromNovel(userId, novelId);

      await job.updateProgress(100);

      this.logger.log(`剧本转换完成: id=${script.id}`);

      return {
        scriptId: script.id,
        title: script.title,
        characterCount: script.characters?.length || 0,
        sceneCount: script.scenes?.length || 0,
      };
    } catch (error) {
      this.logger.error(
        `剧本转换失败: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    this.logger.error(
      `剧本转换任务失败: job.id=${job.id}, error=${error.message}`,
    );
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job, result: any) {
    this.logger.log(
      `剧本转换任务完成: job.id=${job.id}, result=${JSON.stringify(result)}`,
    );
  }
}
