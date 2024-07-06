import { Module } from '@nestjs/common';
import {TasksController} from "./tasks.controller";
import {TasksService} from "./tasks.service";
import {AlieModule} from "../alie/alie.module";
import {GithubModule} from "../github/github.module";
import {OpenaiModule} from "../openai/openai.module";

@Module({
    imports: [AlieModule, GithubModule, OpenaiModule],
    controllers: [TasksController],
    providers: [TasksService],
})
export class TasksModule {}
