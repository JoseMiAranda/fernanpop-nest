import {
    registerDecorator,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface,
} from 'class-validator';
import { isValidConditionId } from '../product-conditions.constants';

@ValidatorConstraint({ name: 'isValidCondition', async: false })
export class IsValidConditionConstraint implements ValidatorConstraintInterface {
    validate(conditionId: string): boolean {
        return typeof conditionId === 'string' && isValidConditionId(conditionId);
    }

    defaultMessage(): string {
        return 'invalid-condition-id';
    }
}

export function IsValidCondition(validationOptions?: ValidationOptions) {
    return function (object: object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName,
            options: validationOptions,
            constraints: [],
            validator: IsValidConditionConstraint,
        });
    };
}
