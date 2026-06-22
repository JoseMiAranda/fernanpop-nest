import {
    registerDecorator,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface,
} from 'class-validator';
import { isValidCategoryId } from '../../categories/categories.constants';

@ValidatorConstraint({ name: 'isValidCategory', async: false })
export class IsValidCategoryConstraint implements ValidatorConstraintInterface {
    validate(categoryId: string): boolean {
        return typeof categoryId === 'string' && isValidCategoryId(categoryId);
    }

    defaultMessage(): string {
        return 'invalid-category-id';
    }
}

export function IsValidCategory(validationOptions?: ValidationOptions) {
    return function (object: object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName,
            options: validationOptions,
            constraints: [],
            validator: IsValidCategoryConstraint,
        });
    };
}
