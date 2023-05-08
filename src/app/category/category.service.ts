import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import { join } from 'path';
import { IResponse } from '../response/response.interface';
import { ResponseDto } from '../response/response.dto';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PageMetaDto } from '../page-interfaces/page-meta.dto';
import { PageOptionsDto } from '../page-interfaces/page-options.dto';
import { rm, stat, unlink } from 'fs/promises';

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
      return new ResponseDto<Category>(savedCategory, null, 201);
    } catch (error) {
      console.log(error);
      return new ResponseDto<any>([], null, 500, "", true, error.sqlMessage);
    }
  }

  async findAll(pageOptionsDto: PageOptionsDto): Promise<IResponse<Category[]>> {
    try {
      const categories: Category[] = await this.categoryRepository.find({
        where: {"deletedAt": IsNull()},
        skip: pageOptionsDto.skip,
        take: pageOptionsDto.take
      })

      if(categories.length) {
        const pageMetaDto = new PageMetaDto({ itemCount: categories.length, pageOptionsDto });
        return new ResponseDto<Category[]>(categories, pageMetaDto, 200);
      }
      return new ResponseDto<Category[]>(categories, 204);
    } catch(error) {
      return new ResponseDto<any>([], {}, 500, "", true, error.sqlMessage);
    }
  }

  async findAllDeleted(pageOptionsDto: PageOptionsDto): Promise<IResponse<Category[]>> {
    try {
      const categories: Category[] = await this.categoryRepository.find({
        where: {"deletedAt": Not(IsNull())},
        skip: pageOptionsDto.skip,
        take: pageOptionsDto.take
      })

      if(categories.length) {
        const pageMetaDto = new PageMetaDto({ itemCount: categories.length, pageOptionsDto });
        return new ResponseDto<Category[]>(categories, pageMetaDto, 200);
      }
      return new ResponseDto<Category[]>(categories, null, 204)
    } catch (error) {
      console.log(error);
      return new ResponseDto<any>([], {}, 500, "", true, error.sqlMessage);
    }
  }

  async findOne(id: number): Promise<IResponse<Category>> {
    try {
      const category = await this.categoryRepository.findOneBy({id});
      if(category) return new ResponseDto<Category>(category, null, 200);
      return new ResponseDto<Category>(category, null, 204);
    } catch (error) {
      console.log(error);
      return new ResponseDto<any>([], null, 500, "", true, error.sqlMessage);
    }
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto): Promise<IResponse<Category>> {
    try {
      const oldCategory = await this.categoryRepository.findOneBy({id});
      if(oldCategory.img_url !== updateCategoryDto.img_url) {
        const pathFold = join(__dirname, `../store/categories/${id}/${oldCategory.img_url}`);

        const stats = await stat(pathFold).then( async (stats) => stats).catch( error => {
          console.log(error);
        })

        if(!stats) return;
        await unlink(pathFold)
        .then( () => {
          console.log(`Image of category ${id} deleted successfully`);
        })
        .catch( error => {
          console.log(error);
        });  
      };

      const updateCategory = {
        id,
        ...updateCategoryDto,
      }
      const category = await this.categoryRepository.preload(updateCategory);
      
      const savedCategory = await this.categoryRepository.save(category);

      return new ResponseDto<Category>(savedCategory, null, 200);
    } catch (error) {
      console.log(error);
      return new ResponseDto<any>([], null, 500, "", true, error.sqlMessage);
    }
  }

  async remove(id: number): Promise<IResponse<string>> {
    try {
      const pathFold = join(__dirname, `../store/categories/${id}/`);

      await rm(pathFold, {recursive: true}).catch( err => null);

      await this.categoryRepository.delete({id});

      return new ResponseDto<string>(`Category with id ${id} is deleted from trash`, null, 200);
    } catch (error) {
      console.log('Error', error);
      return new ResponseDto<any>(`Category with id ${id} is not deleted from trash`, null, 500, "", true, error.sqlMessage);
    }
  }

  async softRemove(id: number): Promise<IResponse<string>> {
    try {
      const category: Category = await this.categoryRepository.findOneBy({id});

      const updateCategory = {
        ...category,
        deletedAt: (new Date()).toJSON()
      }
      const preloadCategory = await this.categoryRepository.preload(updateCategory);

      await this.categoryRepository.save(preloadCategory);

      return new ResponseDto<string>(`Category with id ${id} is deleted`, null, 200);
    } catch (error) {
      console.log('Error', error);
      return new ResponseDto<string>(`Category with id ${id} is not deleted`, null, 500, "", true, error.sqlMessage);
    }
  }
}
