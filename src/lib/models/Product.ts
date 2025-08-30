export interface UpdateProduct {
  name?: string;
  description?: string;
  price?: number;
  pickupLocation?: string;
  condition?: string;
  category?: string;
  tags?: string[];
  photos?: string[];
}
