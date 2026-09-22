import { Controller, Get } from '@nestjs/common';
import { AppService } from '@/app.service';

@Controller()
export class AppController {
    constructor(private readonly appService: AppService) {}

    /** Readiness of everything behind the gateway. Cheap; answers in seconds. */
    @Get('ping')
    ping() {
        return this.appService.getHealth();
    }

    /**
     * Boot the services and answer once they are up.
     *
     * Slow by design — on a suspended free-tier instance this is the request
     * that pays for the cold start, so the learner's real requests do not.
     */
    @Get('wake')
    wake() {
        return this.appService.wake();
    }

    @Get('health')
    getHealth() {
        return 'Api Gateway - Healthy';
    }
}
