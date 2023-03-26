import { Injectable, StreamableFile } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, DeleteResult, IsNull, Like, Not, Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { join } from 'path';
import { ReadStream, createReadStream, readFileSync, readdir, readdirSync, rmdirSync, statSync } from 'fs';
import { rmdir } from 'fs/promises';
import { IProduct } from './interface/product.interface';

type Options = {
  deleteAt: any,
  price: any,
  name?: any
}

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

  async sort({name, minPrice, maxPrice}): Promise<Product[]> {
    try {
      const options: Options = {
        deleteAt: IsNull(),
        price: Between(minPrice, maxPrice)
      };

      if(name) options.name = Like(name)

      const products = await this.productRepository.find({
        where: options
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

  async findOne(id: number): Promise<IProduct> {
    try {
      const product: IProduct = await this.productRepository.findOneBy({id});
      const path: string = join(__dirname, `../../store/products/${id}/`);
      const paths: string[] = readdirSync(path).filter( data => {
        const isFile = statSync(path + data).isFile();
        if(isFile) {
          return data;
        }
      })
      product.imgs = paths;
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
      const pathFold = join(__dirname, `../../store/products/${id}/`);

      rmdirSync(pathFold, {recursive: true});

      const result: any = await this.productRepository.delete({id});

      if(result) {
        console.log({result});
        return JSON.stringify({msg: `Product was deleted from trash`})
      }
    } catch (error) {
      console.log('Error', error);
    }
  }

  async softRemove(id: number): Promise<string> {
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
      console.log('Error', error);
    }
  }
}
