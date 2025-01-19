import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {Post} from "./entities/post.entity";
import {PostTag} from "./entities/post-tag.entity";
import {GraphQLModule} from "@nestjs/graphql";
import {ApolloDriver, ApolloDriverConfig} from "@nestjs/apollo";
import {join} from "path";

@Module({
    imports: [
        TypeOrmModule.forFeature([Post, PostTag]),
        GraphQLModule.forRoot<ApolloDriverConfig>({
            driver: ApolloDriver,
            autoSchemaFile: join(process.cwd(), 'src/post/schema.gql'),
            path: '/graphql/post',
        }),
    ]
})
export class PostModule {}