import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, IsNull, Not, Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductService {

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>
  ) {}
  
  async create(createProductDto: CreateProductDto): Promise<Product> {
    try {
      const newProduct = this.productRepository.create(createProductDto);
      const savedProduct = await this.productRepository.save(newProduct);
      return savedProduct;
    } catch (error) {
      console.log(error);
    }
  }

  async findAll(): Promise<Product[]> {
    try {
      const products = await this.productRepository.find({
        where: { 
          deleteAt: IsNull()
        }
    });
      return products;
    } catch (error) {
      console.log(error);
    }
  }

  async findAllDeleted(): Promise<Product[]> {
    try {
      const products = await this.productRepository.find({
        where: { 
          deleteAt: Not(IsNull())
        }
    });
      return products;
    } catch (error) {
      console.log(error);
    }
  }

  async findOne(id: number): Promise<Product> {
    try {
      const product = await this.productRepository.findOneBy({id});
      return product;
    } catch (error) {
      console.log(error);
    }
  }

  async update(id: number, updateProductDto: UpdateProductDto): Promise<Product> {
    try {
      const updateProduct = {
        id,
        ...updateProductDto,
      }
      const product = await this.productRepository.preload(updateProduct);
      if(product) {
        return await this.productRepository.save(product);
      }
    } catch (error) {
      console.log(error);
      
    }
  }

  async remove(id: number): Promise<string> {
    try {
      const updateProductDto: Product = await this.productRepository.findOneBy({id});

      const updateProduct = {
        ...updateProductDto,
        deleteAt: (new Date()).toJSON()
      }
      const product = await this.productRepository.preload(updateProduct);
      if(product) {
        await this.productRepository.save(product);
        return JSON.stringify({msg: `Product was deleted`})
      }
    } catch (error) {
      console.log(error);
    }
  }
}
