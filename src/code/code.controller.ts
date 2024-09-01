import {CodeService} from "./code.service";
import {Body, Controller, Post} from "@nestjs/common";
import {ApiBody, ApiOperation, ApiResponse, ApiTags} from "@nestjs/swagger";
import {CreateCodeDto} from "./dto/create-code.dto";
import {Code} from "./entities/code.entity";

@ApiTags('code')
@Controller('code')
export class CodeController {
    constructor(
        private readonly codeService: CodeService
    ) {}

    @Post()
    @ApiOperation({ summary: 'Create a new code item' })
    @ApiResponse({ status: 201, description: 'The code item has been successfully created.', type: Code })
    @ApiResponse({ status: 400, description: 'Invalid input data.' })
    @ApiBody({ type: CreateCodeDto })
    create(@Body() createCodeDto: CreateCodeDto) {
        return this.codeService.create(createCodeDto);
    }
}