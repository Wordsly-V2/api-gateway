import { JwtAuthPayload } from '@/auth/dto/auth.dto';
import { JwtAuthGuard } from '@/common/guard/jwt-auth/jwt-auth.guard';
import {
    Course,
    CourseDetails,
    CreateCourseDto,
} from '@/courses/dto/courses.dto';
import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Query,
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
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
        @Query('orderByField') orderByField: 'createdAt' | 'name' = 'createdAt',
        @Query('orderByDirection') orderByDirection: 'asc' | 'desc' = 'asc',
    ): Promise<{ courses: Course[] }> {
        return this.coursesService.getCourses(
            req.user.userLoginId,
            page,
            limit,
            orderByField,
            orderByDirection,
        );
    }

    @Post('/me/my-courses')
    createMyCourses(
        @Req() req: Request & { user: JwtAuthPayload },
        @Body() body: CreateCourseDto,
    ): Promise<{ success: boolean }> {
        return this.coursesService.createMyCourses(req.user.userLoginId, body);
    }

    @Delete('/me/my-courses/:courseId')
    deleteMyCourse(
        @Req() req: Request & { user: JwtAuthPayload },
        @Param('courseId') courseId: string,
    ): Promise<{ success: boolean }> {
        return this.coursesService.deleteMyCourse(
            req.user.userLoginId,
            courseId,
        );
    }

    @Get('/:courseId')
    getCourse(@Param('courseId') courseId: string): Promise<CourseDetails> {
        return this.coursesService.getCourseDetailsById(courseId);
    }
}
