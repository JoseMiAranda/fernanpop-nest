export interface Category {
    id: string;
    name: string;
}

export const PREDEFINED_CATEGORIES: Category[] = [
    { id: 'ropa', name: 'Ropa' },
    { id: 'electronica', name: 'Electrónica' },
    { id: 'hogar', name: 'Hogar' },
    { id: 'deportes', name: 'Deportes' },
    { id: 'otros', name: 'Otros' },
];

export function isValidCategoryId(categoryId: string): boolean {
    return PREDEFINED_CATEGORIES.some((category) => category.id === categoryId);
}
