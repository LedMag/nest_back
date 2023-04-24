import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import { join } from 'path';
import { readdirSync, rmdirSync, statSync } from 'fs';
import { IResponse } from '../response/response.interface';
import { ResponseDto } from '../response/response.dto';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoryService {

  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<IResponse<Category>> {
    try {
      const newCategory = this.categoryRepository.create(createCategoryDto);
      const savedCategory = await this.categoryRepository.save(newCategory);
      return new ResponseDto<Category>(savedCategory);
    } catch (error) {
      console.log(error);
      return new ResponseDto<any>({}, 500, "", true, error.msg);
    }
  }

  async findAll(): Promise<IResponse<Category[]>> {
    try {
      const categories = await this.categoryRepository.find({
        where: { 
          deletedAt: IsNull()
        }
      });
      return new ResponseDto<Category[]>(categories);
    } catch(error) {
      return new ResponseDto<any>([], 500, "", true, error.msg);
    }
  }

  async findOne(id: number): Promise<IResponse<Category>> {
    try {
      const category = await this.categoryRepository.findOneBy({id});
      return new ResponseDto<Category>(category);
    } catch (error) {
      console.log(error);
      return new ResponseDto<any>({}, 500, "", true, error.msg);
    }
  }

  async findAllDeleted(): Promise<IResponse<Category[]>> {
    try {
      const categories = await this.categoryRepository.find({
        where: { 
          deletedAt: Not(IsNull())
        }
    });
      return new ResponseDto<Category[]>(categories)
    } catch (error) {
      console.log(error);
      return new ResponseDto<any>([], 500, "", true, error.msg);
    }
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto): Promise<IResponse<Category>> {
    try {
      const updateCategory = {
        id,
        ...updateCategoryDto,
      }
      const category = await this.categoryRepository.preload(updateCategory);
      
      const savedCategory = await this.categoryRepository.save(category);

      return new ResponseDto<Category>(savedCategory);
    } catch (error) {
      console.log(error);
      return new ResponseDto<any>({}, 500, "", true, error.msg);
    }
  }

  async remove(id: number): Promise<IResponse<string>> {
    try {
      const pathFold = join(__dirname, `../../store/categories/${id}/`);

      rmdirSync(pathFold, {recursive: true});

      await this.categoryRepository.delete({id});

      return new ResponseDto<string>(JSON.stringify({msg: `Product was deleted from trash`}))
    } catch (error) {
      console.log('Error', error);
      return new ResponseDto<any>("", 500, "", true, error.msg);
    }
  }

  async softRemove(id: number): Promise<IResponse<string>> {
    try {
      const category: Category = await this.categoryRepository.findOneBy({id});

      const updateProduct = {
        ...category,
        deletedAt: (new Date()).toJSON()
      }
      const product = await this.categoryRepository.preload(updateProduct);

      await this.categoryRepository.save(product);

      return new ResponseDto<string>(JSON.stringify({msg: `Product was deleted`}))
    } catch (error) {
      console.log('Error', error);
      return new ResponseDto<any>("", 500, "", true, error.msg);
    }
  }
}
