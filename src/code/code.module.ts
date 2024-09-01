import {Module} from "@nestjs/common";
import {CodeController} from "./code.controller";
import {CodeService} from "./code.service";
import {TypeOrmModule} from "@nestjs/typeorm";
import {Code} from "./entities/code.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([Code])
    ],
    controllers: [CodeController],
    providers: [CodeService],
    exports: [
        CodeService
    ]
})
export class CodeModule{}