import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ForbiddenError } from '@casl/ability';

import { AbilityFactory } from './ability.factory';
import { RequiredRule, CHECK_ABILITY } from './abilities.decorator';
import { currentUser } from '../user/current-user';

@Injectable()
export class AbilitiesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private caslAbilitFactory: AbilityFactory,
  ) {}

  async canActivate(context: ExecutionContext) {
    const rules =
      this.reflector.get<RequiredRule[]>(CHECK_ABILITY, context.getHandler()) ||
      [];

    const user = currentUser;
    const ability = this.caslAbilitFactory.defineAbility(user);

    try {
      rules.forEach((rule) =>
        ForbiddenError.from(ability).throwUnlessCan(rule.action, rule.subject),
      );

      return true;
    } catch (error) {
      if (error instanceof ForbiddenError) {
        throw new ForbiddenException(error.message);
      }
    }
  }
}
