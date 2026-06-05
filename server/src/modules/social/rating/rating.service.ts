import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rating } from '../entities/rating.entity';

@Injectable()
export class RatingService {
  constructor(
    @InjectRepository(Rating)
    private readonly ratingRepository: Repository<Rating>,
  ) {}

  async upsert(
    userId: number,
    data: { scriptId: number; score: number; comment?: string },
  ) {
    let rating = await this.ratingRepository.findOne({
      where: { userId, scriptId: data.scriptId },
    });

    if (rating) {
      rating.score = data.score;
      if (data.comment !== undefined) {
        rating.comment = data.comment;
      }
    } else {
      rating = this.ratingRepository.create({
        userId,
        scriptId: data.scriptId,
        score: data.score,
        comment: data.comment,
      });
    }

    await this.ratingRepository.save(rating);
    return this.getStats(data.scriptId);
  }

  async getStats(scriptId: number) {
    const result = await this.ratingRepository
      .createQueryBuilder('rating')
      .select('AVG(rating.score)', 'averageScore')
      .addSelect('COUNT(*)', 'totalRatings')
      .addSelect('SUM(CASE WHEN rating.score >= 4 THEN 1 ELSE 0 END)', 'fiveStarCount')
      .addSelect('SUM(CASE WHEN rating.score = 3 THEN 1 ELSE 0 END)', 'threeStarCount')
      .addSelect('SUM(CASE WHEN rating.score <= 2 THEN 1 ELSE 0 END)', 'oneStarCount')
      .where('rating.scriptId = :scriptId', { scriptId })
      .getRawOne();

    return {
      scriptId,
      averageScore: parseFloat(result?.averageScore) || 0,
      totalRatings: parseInt(result?.totalRatings) || 0,
      distribution: {
        5: parseInt(result?.fiveStarCount) || 0,
        3: parseInt(result?.threeStarCount) || 0,
        1: parseInt(result?.oneStarCount) || 0,
      },
    };
  }
}
