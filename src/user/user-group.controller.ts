import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNoContentResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
} from '@nestjs/swagger';
import { UserGroupService } from './user-group.service';
import { CreateUserGroupDto } from './dto/create-user-group.dto';
import { UpdateUserGroupDto } from './dto/update-user-group.dto';
import { AddUserToGroupDto } from './dto/add-user-to-group.dto';
import { RemoveUserFromGroupDto } from './dto/remove-user-from-group.dto';
import { UserGroup } from './entities/user-group.entity';
import { User } from './entities/user.entity';

@ApiTags('User Groups')
@Controller('user-groups')
export class UserGroupController {
  constructor(private readonly userGroupService: UserGroupService) {}

  /**
   * 새로운 사용자 그룹 생성
   * POST /user-groups
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new user group',
    description:
      'Creates a new user group with the specified name and description',
  })
  @ApiBody({
    type: CreateUserGroupDto,
    description: 'User group creation data',
  })
  @ApiCreatedResponse({
    description: 'User group created successfully',
    type: UserGroup,
  })
  @ApiBadRequestResponse({
    description: 'Bad request - validation error or duplicate group name',
  })
  @ApiConflictResponse({
    description: 'Conflict - group name already exists',
  })
  async create(
    @Body() createUserGroupDto: CreateUserGroupDto,
  ): Promise<UserGroup> {
    return await this.userGroupService.create(createUserGroupDto);
  }

  /**
   * 모든 사용자 그룹 조회
   * GET /user-groups
   */
  @Get()
  @ApiOperation({
    summary: 'Get all user groups',
    description: 'Retrieves all user groups with optional active filter',
  })
  @ApiQuery({
    name: 'active',
    required: false,
    type: Boolean,
    description:
      'Filter by active status (true for active only, false for inactive only)',
  })
  @ApiOkResponse({
    description: 'List of user groups retrieved successfully',
    type: [UserGroup],
  })
  async findAll(@Query('active') active?: boolean): Promise<UserGroup[]> {
    if (active === true) {
      return await this.userGroupService.findActiveGroups();
    }
    return await this.userGroupService.findAll();
  }

  /**
   * ID로 특정 그룹 조회
   * GET /user-groups/:id
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Get user group by ID',
    description: 'Retrieves a specific user group by its unique identifier',
  })
  @ApiParam({
    name: 'id',
    description: 'User group unique identifier (UUID)',
    type: String,
  })
  @ApiOkResponse({
    description: 'User group retrieved successfully',
    type: UserGroup,
  })
  @ApiNotFoundResponse({
    description: 'User group not found',
  })
  async findOne(@Param('id') id: string): Promise<UserGroup> {
    return await this.userGroupService.findOne(id);
  }

  /**
   * 그룹에 속한 사용자들 조회
   * GET /user-groups/:id/users
   */
  @Get(':id/users')
  @ApiOperation({
    summary: 'Get users in a group',
    description: 'Retrieves all users that belong to the specified group',
  })
  @ApiParam({
    name: 'id',
    description: 'User group unique identifier (UUID)',
    type: String,
  })
  @ApiOkResponse({
    description: 'Users in group retrieved successfully',
    type: [User],
  })
  @ApiNotFoundResponse({
    description: 'User group not found',
  })
  async findUsersByGroupId(@Param('id') id: string): Promise<User[]> {
    return await this.userGroupService.findUsersByGroupId(id);
  }

  /**
   * 그룹 멤버 수 조회
   * GET /user-groups/:id/member-count
   */
  @Get(':id/member-count')
  @ApiOperation({
    summary: 'Get group member count',
    description: 'Retrieves the total number of users in the specified group',
  })
  @ApiParam({
    name: 'id',
    description: 'User group unique identifier (UUID)',
    type: String,
  })
  @ApiOkResponse({
    description: 'Member count retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        count: {
          type: 'number',
          description: 'Number of users in the group',
        },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'User group not found',
  })
  async getGroupMemberCount(
    @Param('id') id: string,
  ): Promise<{ count: number }> {
    const count = await this.userGroupService.getGroupMemberCount(id);
    return { count };
  }

  /**
   * 사용자가 속한 그룹들 조회
   * GET /user-groups/user/:userId
   */
  @Get('user/:userId')
  @ApiOperation({
    summary: 'Get groups for a user',
    description: 'Retrieves all groups that a specific user belongs to',
  })
  @ApiParam({
    name: 'userId',
    description: 'User unique identifier (UUID)',
    type: String,
  })
  @ApiOkResponse({
    description: 'User groups retrieved successfully',
    type: [UserGroup],
  })
  @ApiNotFoundResponse({
    description: 'User not found',
  })
  async findGroupsByUserId(
    @Param('userId') userId: string,
  ): Promise<UserGroup[]> {
    return await this.userGroupService.findGroupsByUserId(userId);
  }

  /**
   * 사용자 그룹 정보 수정
   * PATCH /user-groups/:id
   */
  @Patch(':id')
  @ApiOperation({
    summary: 'Update user group',
    description: 'Updates an existing user group with new information',
  })
  @ApiParam({
    name: 'id',
    description: 'User group unique identifier (UUID)',
    type: String,
  })
  @ApiBody({
    type: UpdateUserGroupDto,
    description: 'User group update data',
  })
  @ApiOkResponse({
    description: 'User group updated successfully',
    type: UserGroup,
  })
  @ApiBadRequestResponse({
    description: 'Bad request - validation error or duplicate group name',
  })
  @ApiNotFoundResponse({
    description: 'User group not found',
  })
  @ApiConflictResponse({
    description: 'Conflict - group name already exists',
  })
  async update(
    @Param('id') id: string,
    @Body() updateUserGroupDto: UpdateUserGroupDto,
  ): Promise<UserGroup> {
    return await this.userGroupService.update(id, updateUserGroupDto);
  }

  /**
   * 사용자를 그룹에 추가
   * POST /user-groups/:id/add-users
   */
  @Post(':id/add-users')
  @ApiOperation({
    summary: 'Add users to group',
    description: 'Adds one or more users to the specified group',
  })
  @ApiParam({
    name: 'id',
    description: 'User group unique identifier (UUID)',
    type: String,
  })
  @ApiBody({
    type: AddUserToGroupDto,
    description: 'Users to add to the group',
  })
  @ApiOkResponse({
    description: 'Users added to group successfully',
    type: UserGroup,
  })
  @ApiBadRequestResponse({
    description: 'Bad request - validation error or users already in group',
  })
  @ApiNotFoundResponse({
    description: 'User group or users not found',
  })
  async addUsersToGroup(
    @Param('id') id: string,
    @Body() addUserToGroupDto: AddUserToGroupDto,
  ): Promise<UserGroup> {
    // URL의 그룹 ID와 DTO의 그룹 ID가 일치하는지 확인
    if (id !== addUserToGroupDto.groupId) {
      throw new Error('Group ID mismatch between URL and request body');
    }
    return await this.userGroupService.addUsersToGroup(addUserToGroupDto);
  }

  /**
   * 사용자를 그룹에서 제거
   * POST /user-groups/:id/remove-users
   */
  @Post(':id/remove-users')
  @ApiOperation({
    summary: 'Remove users from group',
    description: 'Removes one or more users from the specified group',
  })
  @ApiParam({
    name: 'id',
    description: 'User group unique identifier (UUID)',
    type: String,
  })
  @ApiBody({
    type: RemoveUserFromGroupDto,
    description: 'Users to remove from the group',
  })
  @ApiOkResponse({
    description: 'Users removed from group successfully',
    type: UserGroup,
  })
  @ApiBadRequestResponse({
    description: 'Bad request - validation error or users not in group',
  })
  @ApiNotFoundResponse({
    description: 'User group not found',
  })
  async removeUsersFromGroup(
    @Param('id') id: string,
    @Body() removeUserFromGroupDto: RemoveUserFromGroupDto,
  ): Promise<UserGroup> {
    // URL의 그룹 ID와 DTO의 그룹 ID가 일치하는지 확인
    if (id !== removeUserFromGroupDto.groupId) {
      throw new Error('Group ID mismatch between URL and request body');
    }
    return await this.userGroupService.removeUsersFromGroup(
      removeUserFromGroupDto,
    );
  }

  /**
   * 사용자 그룹 삭제
   * DELETE /user-groups/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete user group',
    description:
      'Deletes a user group (only if it has no members and is not a system group)',
  })
  @ApiParam({
    name: 'id',
    description: 'User group unique identifier (UUID)',
    type: String,
  })
  @ApiNoContentResponse({
    description: 'User group deleted successfully',
  })
  @ApiBadRequestResponse({
    description:
      'Bad request - cannot delete system group or group with members',
  })
  @ApiNotFoundResponse({
    description: 'User group not found',
  })
  async remove(@Param('id') id: string): Promise<void> {
    await this.userGroupService.remove(id);
  }
}
