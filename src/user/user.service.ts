import { ForbiddenError } from '@casl/ability';
import { Injectable } from '@nestjs/common';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { AbilityFactory, Action } from '../ability/ability.factory';

@Injectable()
export class UserService {
  constructor(private abilityFactory: AbilityFactory) {}

  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  findAll() {
    return `This action returns all user`;
  }

  findOne(id: number) {
    const user = new User();
    user.id = id;
    user.orgId = 2;
    return user;
  }

  update(id: number, updateUserDto: UpdateUserDto, currentUser: User) {
    const ability = this.abilityFactory.defineAbility(currentUser);
    const userToUpdate = this.findOne(+id);
    ForbiddenError.from(ability).throwUnlessCan(Action.UPDATE, userToUpdate);

    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
