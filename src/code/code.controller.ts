import {CodeService} from "./code.service";
import {Body, Controller, Get, Param, Post} from "@nestjs/common";
import {ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags} from "@nestjs/swagger";
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

    @Get()
    @ApiOperation({ summary: 'Retrieve all code items' })
    @ApiResponse({ status: 200, description: 'Successfully retrieved all code items.', type: [Code] })
    findAll() {
        return this.codeService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Retrieve a code item by ID' })
    @ApiParam({ name: 'id', description: 'ID of the code item to retrieve' })
    @ApiResponse({ status: 200, description: 'Successfully retrieved the code item.', type: Code })
    @ApiResponse({ status: 404, description: 'Code item not found.' })
    findOne(@Param('id') id: number) {
        return this.codeService.findOne(id);
    }

    @Get('code/:code')
    @ApiOperation({ summary: 'Retrieve a code item by code' })
    @ApiParam({ name: 'code', description: 'code of the code item to retrieve' })
    @ApiResponse({ status: 200, description: 'Successfully retrieved the code item.', type: Code })
    @ApiResponse({ status: 404, description: 'Code item not found.' })
    findOneByCode(@Param('code') code: string) {
        return this.codeService.findOneByCode(code);
    }
}