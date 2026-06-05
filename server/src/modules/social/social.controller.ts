import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CommentService } from './comment/comment.service';
import { RatingService } from './rating/rating.service';
import { CollectionService } from './collection/collection.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../common/decorators/current-user.decorator';

@ApiTags('social')
@Controller('social')
export class SocialController {
  constructor(
    private readonly commentService: CommentService,
    private readonly ratingService: RatingService,
    private readonly collectionService: CollectionService,
  ) {}

  // ====== 评论 ======
  @Post('comments')
  @ApiOperation({ summary: '发表评论' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async createComment(
    @CurrentUser() user: JwtPayload,
    @Body() body: { scriptId: number; content: string; parentId?: number },
  ) {
    return this.commentService.create(user.sub, body);
  }

  @Get('comments/:scriptId')
  @ApiOperation({ summary: '获取剧本评论列表' })
  async getComments(
    @Param('scriptId', ParseIntPipe) scriptId: number,
    @Query('page') page?: number,
  ) {
    return this.commentService.findByScript(scriptId, page || 1);
  }

  @Delete('comments/:id')
  @ApiOperation({ summary: '删除评论' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async deleteComment(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.commentService.remove(user.sub, id);
  }

  // ====== 评分 ======
  @Post('ratings')
  @ApiOperation({ summary: '提交评分' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async createRating(
    @CurrentUser() user: JwtPayload,
    @Body() body: { scriptId: number; score: number; comment?: string },
  ) {
    return this.ratingService.upsert(user.sub, body);
  }

  @Get('ratings/:scriptId')
  @ApiOperation({ summary: '获取剧本评分信息' })
  async getRatings(@Param('scriptId', ParseIntPipe) scriptId: number) {
    return this.ratingService.getStats(scriptId);
  }

  // ====== 收藏 ======
  @Post('collections')
  @ApiOperation({ summary: '收藏/取消收藏' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async toggleCollection(
    @CurrentUser() user: JwtPayload,
    @Body() body: { scriptId: number },
  ) {
    return this.collectionService.toggle(user.sub, body.scriptId);
  }

  @Get('collections/me')
  @ApiOperation({ summary: '获取我的收藏列表' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async getMyCollections(@CurrentUser() user: JwtPayload) {
    return this.collectionService.findByUser(user.sub);
  }
}
