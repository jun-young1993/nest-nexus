import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {CodeItem} from "./entities/code-item.entity";
import {CodeItemService} from "./code-item.service";
import {Code} from "../code/entities/code.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([CodeItem, Code])
    ],
    providers: [CodeItemService]
})
export class CodeItemModule{}