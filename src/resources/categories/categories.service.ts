import { Injectable } from '@nestjs/common';
import { Category, PREDEFINED_CATEGORIES } from './categories.constants';

@Injectable()
export class CategoriesService {
    findAll(): Category[] {
        return PREDEFINED_CATEGORIES;
    }
}
