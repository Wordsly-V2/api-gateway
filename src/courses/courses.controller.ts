import { JwtAuthPayload } from '@/auth/dto/auth.dto';
import { JwtAuthGuard } from '@/common/guard/jwt-auth/jwt-auth.guard';
import {
    Course,
    CourseDetails,
    CoursesTotalStats,
    CreateCourseDto,
    CreateCourseLessonDto,
    CreateCourseLessonWordDto,
    Word,
} from '@/courses/dto/courses.dto';
import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Put,
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
        @Query('searchQuery') searchQuery: string = '',
    ): Promise<{ courses: Course[] }> {
        return this.coursesService.getCourses(
            req.user.userLoginId,
            page,
            limit,
            orderByField,
            orderByDirection,
            searchQuery,
        );
    }

    @Post('/me/my-courses')
    createMyCourses(
        @Req() req: Request & { user: JwtAuthPayload },
        @Body() body: CreateCourseDto,
    ): Promise<{ success: boolean }> {
        return this.coursesService.createMyCourses(req.user.userLoginId, body);
    }

    @Get('me/my-courses/total-stats')
    getTotalStats(
        @Req() req: Request & { user: JwtAuthPayload },
    ): Promise<CoursesTotalStats> {
        return this.coursesService.getCoursesTotalStats(req.user.userLoginId);
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

    @Get('/me/my-courses/:courseId')
    getCourse(
        @Req() req: Request & { user: JwtAuthPayload },
        @Param('courseId') courseId: string,
    ): Promise<CourseDetails> {
        return this.coursesService.getCourseDetailsById(
            req.user.userLoginId,
            courseId,
        );
    }

    @Put('/me/my-courses/:courseId')
    updateMyCourse(
        @Req() req: Request & { user: JwtAuthPayload },
        @Param('courseId') courseId: string,
        @Body() body: Partial<CreateCourseDto>,
    ): Promise<{ success: boolean }> {
        return this.coursesService.updateMyCourseById(
            req.user.userLoginId,
            courseId,
            body,
        );
    }

    @Post('/me/my-courses/:courseId/lessons')
    createMyCourseLesson(
        @Req() req: Request & { user: JwtAuthPayload },
        @Param('courseId') courseId: string,
        @Body() body: CreateCourseLessonDto,
    ): Promise<{ success: boolean }> {
        return this.coursesService.createMyCourseLesson(
            req.user.userLoginId,
            courseId,
            body,
        );
    }

    @Put('/me/my-courses/:courseId/lessons/:lessonId')
    updateMyCourseLesson(
        @Req() req: Request & { user: JwtAuthPayload },
        @Param('courseId') courseId: string,
        @Param('lessonId') lessonId: string,
        @Body() body: CreateCourseLessonDto,
    ): Promise<{ success: boolean }> {
        return this.coursesService.updateMyCourseLesson(
            req.user.userLoginId,
            courseId,
            lessonId,
            body,
        );
    }

    @Delete('/me/my-courses/:courseId/lessons/:lessonId')
    deleteMyCourseLesson(
        @Req() req: Request & { user: JwtAuthPayload },
        @Param('courseId') courseId: string,
        @Param('lessonId') lessonId: string,
    ): Promise<{ success: boolean }> {
        return this.coursesService.deleteMyCourseLesson(
            req.user.userLoginId,
            courseId,
            lessonId,
        );
    }

    @Post('/me/my-courses/:courseId/lessons/:lessonId/words')
    createMyCourseLessonWord(
        @Req() req: Request & { user: JwtAuthPayload },
        @Param('courseId') courseId: string,
        @Param('lessonId') lessonId: string,
        @Body() body: CreateCourseLessonWordDto,
    ): Promise<{ success: boolean }> {
        return this.coursesService.createMyCourseLessonWord(
            req.user.userLoginId,
            courseId,
            lessonId,
            body,
        );
    }

    @Post('/me/my-courses/:courseId/lessons/:lessonId/words/bulk')
    createMyCourseLessonWordsBulk(
        @Req() req: Request & { user: JwtAuthPayload },
        @Param('courseId') courseId: string,
        @Param('lessonId') lessonId: string,
        @Body() body: CreateCourseLessonWordDto[],
    ): Promise<{ success: boolean }> {
        return this.coursesService.createMyCourseLessonWordsBulk(
            req.user.userLoginId,
            courseId,
            lessonId,
            body,
        );
    }

    @Put('/me/my-courses/:courseId/lessons/:lessonId/words/bulk-move')
    moveWordsBulkToOtherLesson(
        @Req() req: Request & { user: JwtAuthPayload },
        @Param('courseId') courseId: string,
        @Param('lessonId') lessonId: string,
        @Body() body: { targetLessonId: string; wordIds: string[] },
    ): Promise<{ success: boolean }> {
        return this.coursesService.moveWordsBulkToOtherLesson(
            req.user.userLoginId,
            courseId,
            lessonId,
            body.wordIds,
            body.targetLessonId,
        );
    }

    @Delete('/me/my-courses/:courseId/lessons/:lessonId/words/bulk-delete')
    deleteWordsBulkFromLesson(
        @Req() req: Request & { user: JwtAuthPayload },
        @Param('courseId') courseId: string,
        @Param('lessonId') lessonId: string,
        @Body() body: { wordIds: string[] },
    ): Promise<{ success: boolean }> {
        return this.coursesService.deleteWordsBulkFromLesson(
            req.user.userLoginId,
            courseId,
            lessonId,
            body.wordIds,
        );
    }

    @Put('/me/my-courses/:courseId/lessons/:lessonId/words/:wordId')
    updateMyCourseLessonWord(
        @Req() req: Request & { user: JwtAuthPayload },
        @Param('courseId') courseId: string,
        @Param('lessonId') lessonId: string,
        @Param('wordId') wordId: string,
        @Body() body: CreateCourseLessonWordDto,
    ): Promise<{ success: boolean }> {
        return this.coursesService.updateMyCourseLessonWord(
            req.user.userLoginId,
            courseId,
            lessonId,
            wordId,
            body,
        );
    }

    @Delete('/me/my-courses/:courseId/lessons/:lessonId/words/:wordId')
    deleteMyCourseLessonWord(
        @Req() req: Request & { user: JwtAuthPayload },
        @Param('courseId') courseId: string,
        @Param('lessonId') lessonId: string,
        @Param('wordId') wordId: string,
    ): Promise<{ success: boolean }> {
        return this.coursesService.deleteMyCourseLessonWord(
            req.user.userLoginId,
            courseId,
            lessonId,
            wordId,
        );
    }

    @Put('/me/my-courses/:courseId/lessons/:lessonId/words/:wordId/move')
    moveMyWordToOtherLesson(
        @Req() req: Request & { user: JwtAuthPayload },
        @Param('courseId') courseId: string,
        @Param('lessonId') lessonId: string,
        @Param('wordId') wordId: string,
        @Body() body: { targetLessonId: string },
    ): Promise<{ success: boolean }> {
        return this.coursesService.moveMyWordToOtherLesson(
            req.user.userLoginId,
            courseId,
            lessonId,
            wordId,
            body.targetLessonId,
        );
    }

    @Get('/me/my-courses/:courseId/words/by-ids')
    getWordsByIds(
        @Req() req: Request & { user: JwtAuthPayload },
        @Param('courseId') courseId: string,
        @Query('wordIds') wordIds: string,
    ): Promise<Word[]> {
        return this.coursesService.getWordsByIds(
            req.user.userLoginId,
            courseId,
            wordIds,
        );
    }
}
