import {Controller, Get} from '@nestjs/common';
import {TasksService} from "./tasks.service";
import {ApiOperation, ApiTags} from "@nestjs/swagger";

@ApiTags('tasks')
@Controller('tasks')
export class TasksController {
    constructor(
        private readonly tasksService: TasksService
    ) {
    }

    @Get('create-alie-hot-product-promotion/open-ai')
    @ApiOperation({summary: 'create-alie-hot-product-promotion'})
    async createAlieHotProductPromotion()
    {
        return await this.tasksService.createAlieHotProductPromotionOpenAi();
    }

    @Get('create-alie-hot-product-promotion/gemini')
    @ApiOperation({summary: 'get-alie-hot-product-promotion'})
    async getAlieHotProductPromotion()
    {
        return await this.tasksService.createAlieHotProductPromotionGemini();
    }
}
