import { Product } from './product.entity';
import { Seller } from '../../sellers/entities/seller.entity';

export class ProductDetail extends Product {
  seller: Pick<Seller, 'id' | 'displayName' | 'photoUrl'>;
}
