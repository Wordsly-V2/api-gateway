import { Module } from '@nestjs/common';
import { DailyHabitController } from './daily-habit.controller';
import { DailyHabitService } from './daily-habit.service';

@Module({
    providers: [DailyHabitService],
    controllers: [DailyHabitController],
})
export class DailyHabitModule {}
