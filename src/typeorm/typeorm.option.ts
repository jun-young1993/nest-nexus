import {TypeOrmModuleOptions, TypeOrmOptionsFactory} from "@nestjs/typeorm";
import {Injectable} from "@nestjs/common";
import {ConfigService} from "@nestjs/config";
import {AllConfigType} from "../config/config.type";

@Injectable()
export class TypeormOption implements TypeOrmOptionsFactory {
    constructor(
        private readonly configService: ConfigService<AllConfigType>
    ) {}
    public createTypeOrmOptions(connectionName?: string): Promise<TypeOrmModuleOptions> | TypeOrmModuleOptions {

        return {
            type: "mysql",
            host: this.configService.get<string>('db.host', { infer: true }),
            port: this.configService.get<number>('db.port', { infer: true }),
            username: this.configService.get<string>('db.username', { infer: true }),
            password: this.configService.get<string>('db.password', { infer: true }),
            database: this.configService.get<string>('db.database', { infer: true }),
            entities: [__dirname + '/../**/*.entity{.ts,.js}'],
            synchronize: this.configService.get<boolean>('db.synchronize', { infer: true }),
            autoLoadEntities: true,
            logging: true
        }
    }
}