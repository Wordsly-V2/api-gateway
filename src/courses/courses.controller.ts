import { JwtAuthPayload } from '@/auth/dto/auth.dto';
import { JwtAuthGuard } from '@/common/guard/jwt-auth/jwt-auth.guard';
import {
    Course,
    CourseDetails,
    CoursesTotalStats,
    CreateCourseDto,
    CreateCourseLessonDto,
    CreateCourseLessonWordDto,
    ReorderLessonsDto,
    Word,
} from '@/courses/dto/courses.dto';
import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseUUIDPipe,
    Post,
    Put,
    Query,
    Req,
    UseGuards,
} from '@nestjs/common';
import { CoursesService } from './courses.service';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

@Controller('courses')
@UseGuards(JwtAuthGuard)
export class CoursesController {
    constructor(private readonly coursesService: CoursesService) {}

    @Get('pronunciation/:word')
    getPronunciation(@Param('word') word: string): Promise<string> {
        return this.coursesService.getPronunciation(word);
    }

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
        @Param('courseId', new ParseUUIDPipe()) courseId: string,
    ): Promise<{ success: boolean }> {
        return this.coursesService.deleteMyCourse(
            req.user.userLoginId,
            courseId,
        );
    }

    @Get('/me/my-courses/:courseId')
    getCourse(
        @Req() req: Request & { user: JwtAuthPayload },
        @Param('courseId', new ParseUUIDPipe()) courseId: string,
    ): Promise<CourseDetails> {
        return this.coursesService.getCourseDetailsById(
            req.user.userLoginId,
            courseId,
        );
    }

    @Put('/me/my-courses/:courseId')
    updateMyCourse(
        @Req() req: Request & { user: JwtAuthPayload },
        @Param('courseId', new ParseUUIDPipe()) courseId: string,
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
        @Param('courseId', new ParseUUIDPipe()) courseId: string,
        @Body() body: CreateCourseLessonDto,
    ): Promise<{ success: boolean }> {
        return this.coursesService.createMyCourseLesson(
            req.user.userLoginId,
            courseId,
            body,
        );
    }

    @Put('/me/my-courses/:courseId/lessons/reorder')
    @ApiOperation({
        summary: 'Re-order lessons (drag and drop)',
        description:
            'Moves one lesson to a new position. Send the dragged lesson ID and the target 1-based order index.',
    })
    @ApiParam({
        name: 'courseId',
        description: 'Course ID',
        example: 'course-uuid-123',
    })
    @ApiBody({ type: ReorderLessonsDto })
    @ApiResponse({
        status: 200,
        description: 'Lessons re-ordered successfully',
        type: [ReorderLessonsDto],
    })
    @ApiResponse({
        status: 400,
        description: 'Lesson does not belong to this course',
    })
    @ApiResponse({
        status: 404,
        description: 'Course not found',
    })
    async reorderLessons(
        @Req() req: Request & { user: JwtAuthPayload },
        @Param('courseId', new ParseUUIDPipe()) courseId: string,
        @Body() reorderLessonsDto: ReorderLessonsDto,
    ): Promise<ReorderLessonsDto> {
        return this.coursesService.reorderLessons(
            req.user.userLoginId,
            courseId,
            reorderLessonsDto,
        );
    }

    @Put('/me/my-courses/:courseId/lessons/:lessonId')
    updateMyCourseLesson(
        @Req() req: Request & { user: JwtAuthPayload },
        @Param('courseId', new ParseUUIDPipe()) courseId: string,
        @Param('lessonId', new ParseUUIDPipe()) lessonId: string,
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
        @Param('courseId', new ParseUUIDPipe()) courseId: string,
        @Param('lessonId', new ParseUUIDPipe()) lessonId: string,
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
        @Param('courseId', new ParseUUIDPipe()) courseId: string,
        @Param('lessonId', new ParseUUIDPipe()) lessonId: string,
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
        @Param('courseId', new ParseUUIDPipe()) courseId: string,
        @Param('lessonId', new ParseUUIDPipe()) lessonId: string,
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
        @Param('courseId', new ParseUUIDPipe()) courseId: string,
        @Param('lessonId', new ParseUUIDPipe()) lessonId: string,
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
        @Param('courseId', new ParseUUIDPipe()) courseId: string,
        @Param('lessonId', new ParseUUIDPipe()) lessonId: string,
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
        @Param('courseId', new ParseUUIDPipe()) courseId: string,
        @Param('lessonId', new ParseUUIDPipe()) lessonId: string,
        @Param('wordId', new ParseUUIDPipe()) wordId: string,
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
        @Param('courseId', new ParseUUIDPipe()) courseId: string,
        @Param('lessonId', new ParseUUIDPipe()) lessonId: string,
        @Param('wordId', new ParseUUIDPipe()) wordId: string,
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
        @Param('courseId', new ParseUUIDPipe()) courseId: string,
        @Param('lessonId', new ParseUUIDPipe()) lessonId: string,
        @Param('wordId', new ParseUUIDPipe()) wordId: string,
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

    @Get('/me/my-courses/:courseId/words')
    getWordsByIds(
        @Req() req: Request & { user: JwtAuthPayload },
        @Param('courseId', new ParseUUIDPipe()) courseId: string,
        @Query('ids') ids: string,
    ): Promise<Word[]> {
        return this.coursesService.getWordsByIds(
            req.user.userLoginId,
            courseId,
            ids,
        );
    }
}
