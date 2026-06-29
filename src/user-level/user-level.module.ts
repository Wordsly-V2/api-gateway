import { Module } from '@nestjs/common';
import { UserLevelController } from './user-level.controller';
import { UserLevelService } from './user-level.service';

@Module({
    providers: [UserLevelService],
    controllers: [UserLevelController],
})
export class UserLevelModule {}
