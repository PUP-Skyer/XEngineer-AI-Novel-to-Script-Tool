import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CommentService } from './comment/comment.service';
import { RatingService } from './rating/rating.service';
import { CollectionService } from './collection/collection.service';
import { Comment } from './entities/comment.entity';
import { Rating } from './entities/rating.entity';
import { Collection } from './entities/collection.entity';
import { SocialController } from './social.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Comment, Rating, Collection])],
  controllers: [SocialController],
  providers: [CommentService, RatingService, CollectionService],
  exports: [CommentService, RatingService, CollectionService],
})
export class SocialModule {}
