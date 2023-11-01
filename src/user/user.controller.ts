import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ForbiddenException,
  UseGuards,
} from '@nestjs/common';
import { ForbiddenError } from '@casl/ability';

import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AbilityFactory, Action } from '../ability/ability.factory';
import { User } from './entities/user.entity';
import {
  CheckAbilities,
  ReadUserAbility,
} from '../ability/abilities.decorator';
import { AbilitiesGuard } from '../ability/abilities.guard';

@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private abilityFactory: AbilityFactory,
  ) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    const user = { id: 1, isAdmin: false, orgId: 1 };
    const ability = this.abilityFactory.defineAbility(user);

    // const isAllowed = ability.can(Action.CREATE, User);
    // if (!isAllowed) {
    //   throw new ForbiddenException('Only admin!');
    // }

    try {
      ForbiddenError.from(ability)
        .setMessage('your message')
        .throwUnlessCan(Action.CREATE, User);

      return this.userService.create(createUserDto);
    } catch (error) {
      if (error instanceof ForbiddenError) {
        throw new ForbiddenException(error.message);
      }
    }
  }

  @Get()
  @CheckAbilities(new ReadUserAbility())
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  @CheckAbilities(new ReadUserAbility())
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const user = { id: 1, isAdmin: true, orgId: 1 };

    try {
      return this.userService.update(+id, updateUserDto, user);
    } catch (error) {
      if (error instanceof ForbiddenError) {
        throw new ForbiddenException(error.message);
      }
    }
  }

  @Delete(':id')
  @CheckAbilities({ action: Action.DELETE, subject: User })
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
