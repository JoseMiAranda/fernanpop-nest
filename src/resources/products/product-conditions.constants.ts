import { ProductCondition } from './entities/product-condition.entity';

export interface ProductConditionOption {
    id: ProductCondition;
    name: string;
}

export const PREDEFINED_CONDITIONS: ProductConditionOption[] = [
    { id: ProductCondition.NEW, name: 'Nuevo' },
    { id: ProductCondition.LIKE_NEW, name: 'Casi nuevo' },
    { id: ProductCondition.GOOD, name: 'Buen estado' },
    { id: ProductCondition.WORN, name: 'Desgastado' },
];

export function isValidConditionId(conditionId: string): boolean {
    return PREDEFINED_CONDITIONS.some((condition) => condition.id === conditionId);
}
