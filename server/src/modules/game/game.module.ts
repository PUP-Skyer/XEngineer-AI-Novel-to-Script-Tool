import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { GameController } from './game.controller';
import { GameService } from './game.service';
import { GameGateway } from './game.gateway';
import { GameEngine } from './engine/game-engine';
import { RoomManager } from './room/room-manager';
import { AiPlayer } from './engine/ai-player';
import { GameSession } from './entities/game-session.entity';
import { GameLog } from './entities/game-log.entity';
import { ScriptModule } from '../script/script.module';
import { AiModelModule } from '../ai-model/ai-model.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([GameSession, GameLog]),
    ScriptModule,
    AiModelModule,
    UserModule,
  ],
  controllers: [GameController],
  providers: [GameService, GameGateway, GameEngine, RoomManager, AiPlayer],
  exports: [GameService],
})
export class GameModule {}
