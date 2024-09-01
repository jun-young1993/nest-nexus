import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {CodeItem} from "./entities/code-item.entity";
import {Repository} from "typeorm";
import {CreateCodeItemDto} from "./dto/create-code-item.dto";
import {Code} from "../code/entities/code.entity";


@Injectable()
export class CodeItemService {
    constructor(
        @InjectRepository(CodeItem)
        private readonly codeItemRepository: Repository<CodeItem>,

    ) {}

    async create(createCodeItemDto: CreateCodeItemDto): Promise<CodeItem> {
        return await this.codeItemRepository.save(
            this.codeItemRepository.create(
                createCodeItemDto,
            )
        )
    }
}