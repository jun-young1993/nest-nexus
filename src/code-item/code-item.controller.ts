import {CodeItemService} from "./code-item.service";
import {Body, Post} from "@nestjs/common";
import {CreateCodeItemDto} from "./dto/create-code-item.dto";

export class CodeItemController {
    constructor(
        private readonly codeItemService: CodeItemService
    ) {}

    @Post()
    create(@Body() createCodeItemDto: CreateCodeItemDto) {
        return this.codeItemService.create(createCodeItemDto);
    }
}