import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { And, Between, IsNull, Like, Not, Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { join } from 'path';
import { IProduct } from './interface/product.interface';
import { PageOptionsDto } from '../page-interfaces/page-options.dto';
import { PageMetaDto } from '../page-interfaces/page-meta.dto';
import { readdir, rm, stat, unlink } from 'fs/promises';
import { IResponse } from '../response/response.interface';
import { ResponseDto } from '../response/response.dto';
import { ProductsFilterOptionsDto } from './dto/products-filter-options.dto';

type Options = {
  deletedAt: any,
  price?: any,
  name?: any,
  category?: any,
  collection?: any
}

@Injectable()
export class ProductService {

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>
  ) {}
  
  async create(createProductDto: CreateProductDto): Promise<IResponse<Product>> {
    try {
      const newProduct = this.productRepository.create(createProductDto);
      const savedProduct = await this.productRepository.save(newProduct);
      return new ResponseDto<Product>(savedProduct, null, 201);
    } catch (error) {
      console.log(error);
      return new ResponseDto<any>([], null, 500, "", true, error.sqlMessage);
    }
  }

  async findAll(pageOptionsDto: PageOptionsDto): Promise<IResponse<Product[]>> {
    try {

      const products: Product[] = await this.productRepository.find({
        where: {"deletedAt": IsNull()},
        skip: pageOptionsDto.skip,
        take: pageOptionsDto.take
      })
      
      if(products.length) {
        const pageMetaDto = new PageMetaDto({ itemCount: products.length, pageOptionsDto });
        return new ResponseDto<Product[]>(products, pageMetaDto, 200);
      }
      return new ResponseDto<Product[]>(products, 204);
    } catch (error) {
      console.log(error);
      return new ResponseDto<any>([], {}, 500, "", true, error.sqlMessage);
    }
  }

  async sort(productsFilterOptionsDto: ProductsFilterOptionsDto): Promise<ResponseDto<Product[]>> {
    console.log(productsFilterOptionsDto)
    try {
      const options: Options = {
        deletedAt: IsNull(),
        price: Between(+productsFilterOptionsDto.minPrice, +productsFilterOptionsDto.maxPrice)
      };

      if(productsFilterOptionsDto.name) options.name = Like(`%${productsFilterOptionsDto.name}%`);
      if(+productsFilterOptionsDto.category) options.category = +productsFilterOptionsDto.category;
      if(+productsFilterOptionsDto.collection) options.collection = +productsFilterOptionsDto.collection;

      const products = await this.productRepository.find({
        where: options,
      });

      if(products.length) {
        const pageMetaDto = new PageMetaDto({ itemCount: products.length, pageOptionsDto: productsFilterOptionsDto });
        return new ResponseDto<Product[]>(products, pageMetaDto, 200);
      }
      return new ResponseDto<Product[]>(products, 204);
    } catch (error) {
      console.log(error);
      return new ResponseDto<any>([], null, 500, "", true, error.sqlMessage);
    }
  }

  async findAllDeleted(pageOptionsDto: PageOptionsDto): Promise<IResponse<Product[]>> {
    try {
      const products: Product[] = await this.productRepository.find({
        where: {"deletedAt": Not(IsNull())},
        skip: pageOptionsDto.skip,
        take: pageOptionsDto.take
      })

      if(products.length) {
        const pageMetaDto = new PageMetaDto({ itemCount: products.length, pageOptionsDto });
        return new ResponseDto<Product[]>(products, pageMetaDto, 200);
      }
      return new ResponseDto<Product[]>(products, null, 204)
    } catch (error) {
      console.log(error);
      return new ResponseDto<any>([], {}, 500, "", true, error.sqlMessage);
    }
  }

  async findOne(id: number): Promise<IResponse<IProduct>> {
    try {
      const product: IProduct = await this.productRepository.findOneBy({id});
      if(product) {
        product.imgs = await this.getImagesUrl(id);
        return new ResponseDto<IProduct>(product, null, 200);
      }
      
      return new ResponseDto<IProduct>(product, null, 204);
    } catch (error) {
      console.log(error);
      return new ResponseDto<any>([], null, 500, "", true, error.sqlMessage);
    }
  }

  async update(id: number, updateProductDto: UpdateProductDto): Promise<IResponse<IProduct>> {
    console.log({updateProductDto});
    
    try {
      const oldProduct: IProduct = await this.productRepository.findOneBy({id});
      if(!oldProduct) return new ResponseDto<any>([], null, 204, "", true, `Product with id ${id} does not exist`);

      if(typeof updateProductDto.imgs !== 'undefined') {
        oldProduct.imgs = await this.getImagesUrl(id);
        const forDelete: string[] = oldProduct.imgs?.filter( imageName => !updateProductDto.imgs?.includes(imageName) );
  
        forDelete?.forEach( async (img) => {
          await this.deleteImage(id, img);
        })
      }

      const updateProduct = {
        id,
        ...updateProductDto,
      }
      const product = await this.productRepository.preload(updateProduct);
      
      const savedProduct = await this.productRepository.save(product);

      return new ResponseDto<Product>(savedProduct, null, 200);
    } catch (error) {
      console.log(error);
      return new ResponseDto<any>([], null, 500, "", true, error.sqlMessage);
    }
  }

  async remove(id: number): Promise<IResponse<string>> {
    try {
      const pathFold = join(__dirname, `../store/products/${id}/`);

      await rm(pathFold, {recursive: true}).catch( err => null);

      await this.productRepository.delete({id});

      return new ResponseDto<string>(`Product with id ${id} is deleted from trash`, null, 200);
    } catch (error) {
      console.log(error);
      return new ResponseDto<any>(`Product with id ${id} is not deleted from trash`, null, 500, "", true, error.sqlMessage);
    }
  }

  async softRemove(id: number): Promise<IResponse<string>> {
    try {
      const product: Product = await this.productRepository.findOneBy({id});

      const updateProduct = {
        ...product,
        deletedAt: (new Date()).toJSON()
      }
      const preloadProduct = await this.productRepository.preload(updateProduct);

      await this.productRepository.save(preloadProduct);

      return new ResponseDto<string>(`Product with id ${id} is deleted`, null, 200);
    } catch (error) {
      console.log('Error', error);
      return new ResponseDto<string>(`Product with id ${id} is not deleted`, null, 500, "", true, error.sqlMessage);
    }
  }

  async getImagesUrl(id: number): Promise<string[]> {
    const path: string = join(__dirname, `../store/products/${id}/`);
    const dir = await readdir(path).catch( err => {
      console.log(err.msg);
    })      

    const paths: string[] = dir ? dir.filter( async (data) => {
      const isFile = (await stat(path + data)).isFile();
      if(isFile) {
        return data;
      }
    }) : []
    return paths;
  }

  async deleteImage(id: number, imgName: string): Promise<void> {
    const pathFold = join(__dirname, `../store/products/${id}/${imgName}`);
      const stats = await stat(pathFold).then( async (stats) => stats).catch( error => {
        console.log(error);
      })

      if(!stats) return;
      await unlink(pathFold)
      .then( () => {
        console.log(`Image ${imgName} of product ${id} deleted successfully`);
      })
      .catch( error => {
        console.log(error);
      });
  }
}
