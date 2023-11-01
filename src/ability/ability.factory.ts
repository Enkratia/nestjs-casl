import {
  AbilityBuilder,
  createMongoAbility,
  ExtractSubjectType,
  InferSubjects,
  MongoAbility,
  MongoQuery,
} from '@casl/ability';
import { Injectable } from '@nestjs/common';
import { User } from '../user/entities/user.entity';

export enum Action {
  MANAGE = 'manage',
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
}

export type Subjects = InferSubjects<typeof User | 'all'>;

type PossibleAbilities = [Action, Subjects];
type Conditions = MongoQuery;
export type AppAbility = MongoAbility<PossibleAbilities, Conditions>;

@Injectable()
export class AbilityFactory {
  defineAbility(user: User) {
    const { can, cannot, build } = new AbilityBuilder<AppAbility>(
      createMongoAbility,
    );

    if (user.isAdmin) {
      can(Action.MANAGE, 'all');
      cannot(Action.MANAGE, User, { orgId: { $ne: user.orgId } }).because(
        'You can only manage users from your own organisation',
      );
    } else {
      can(Action.READ, 'all');
      cannot(Action.DELETE, User).because('You just cant');
    }

    return build({
      detectSubjectType: (item) =>
        item.constructor as ExtractSubjectType<Subjects>,
    });
  }
}
