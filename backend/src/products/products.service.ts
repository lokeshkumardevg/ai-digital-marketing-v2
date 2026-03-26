import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';

@Injectable()
export class ProductsService {
  constructor(@InjectModel(Product.name) private productModel: Model<ProductDocument>) {}

  async findAll(): Promise<Product[]> {
    const results = await this.productModel.find().exec();
    if (results.length === 0) {
      return [
        { name: 'AI Marketing Suite Pro', source: 'Manual', description: 'Advanced marketing tools', price: 99, category: 'Software' } as any,
        { name: 'Starter Plan', source: 'Manual', description: 'Basic marketing tools', price: 29, category: 'Software' } as any,
      ];
    }
    return results;
  }

  async create(productData: any): Promise<Product> {
    const newProduct = new this.productModel(productData);
    return newProduct.save();
  }

  async findOne(id: string): Promise<Product | null> {
    return this.productModel.findById(id).exec();
  }
}
