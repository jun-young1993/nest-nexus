import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {User} from "./entities/user.entity";
import {Repository} from "typeorm";
import * as bcrypt from 'bcrypt';
import {CreateUserDto} from "./dto/create-user.dto";

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {
    }

    async createUser(createUserDto: CreateUserDto): Promise<User> {
        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
        const newUser = this.userRepository.create({
            ...createUserDto,
            password: hashedPassword,
        });

        return this.userRepository.save(newUser);
    }
}