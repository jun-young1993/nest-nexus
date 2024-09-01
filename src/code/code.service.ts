import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {CreateCodeDto} from "./dto/create-code.dto";
import {Code} from "./entities/code.entity";

@Injectable()
export class CodeService {
    constructor(
        @InjectRepository(Code)
        private readonly codeRepository: Repository<Code>
    ) {}

    async create(createCodeDto: CreateCodeDto) {
        return await this.codeRepository.save(
            this.codeRepository.create(createCodeDto)
        );
    }

    async findOne(id: number): Promise<Code | null> {
        return await this.codeRepository.findOne({
            where: {
                id: id
            },
        });
    }
}