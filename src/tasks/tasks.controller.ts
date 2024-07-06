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

    @Get('create-alie-hot-product-promotion')
    @ApiOperation({summary: 'create-alie-hot-product-promotion'})
    async createAlieHotProductPromotion()
    {
        return await this.tasksService.createAlieHotProductPromotion();
    }
}
