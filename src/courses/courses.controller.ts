import { JwtAuthPayload } from '@/auth/dto/auth.dto';
import { JwtAuthGuard } from '@/common/guard/jwt-auth/jwt-auth.guard';
import {
  CreateManyCoursesDto,
  Course,
  CourseDetails,
} from '@/courses/dto/courses.dto';
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CoursesService } from './courses.service';

@Controller('courses')
@UseGuards(JwtAuthGuard)
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get('/me/my-courses')
  myCourses(
    @Req() req: Request & { user: JwtAuthPayload },
  ): Promise<{ courses: Course[] }> {
    return this.coursesService.getCourses(req.user.userLoginId);
  }

  @Post('/me/my-courses')
  @UseGuards(JwtAuthGuard)
  createMyCourses(
    @Req() req: Request & { user: JwtAuthPayload },
    @Body() body: CreateManyCoursesDto,
  ): Promise<{ success: boolean }> {
    return this.coursesService.createMyCourses(req.user.userLoginId, body);
  }

  @Get('/:courseId')
  getCourse(@Param('courseId') courseId: string): Promise<CourseDetails> {
    return this.coursesService.getCourseDetailsById(courseId);
  }
}
