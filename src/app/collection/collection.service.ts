import { Injectable } from '@nestjs/common';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Collection } from './entities/collection.entity';
import { IsNull, Not, Repository } from 'typeorm';
import { join } from 'path';
import { readdirSync, rmdirSync, statSync } from 'fs';
import { IResponse } from '../response/response.interface';
import { ResponseDto } from '../response/response.dto';

@Injectable()
export class CollectionService {

  constructor(
    @InjectRepository(Collection)
    private readonly collectionRepository: Repository<Collection>
  ) {}

  async create(createCollectionDto: CreateCollectionDto): Promise<IResponse<Collection>> {
    try {
      const newCollection = this.collectionRepository.create(createCollectionDto);
      const savedCollection = await this.collectionRepository.save(newCollection);
      return new ResponseDto<Collection>(savedCollection);
    } catch (error) {
      console.log(error);
      return new ResponseDto<any>({}, 500, "", true, error.msg);
    }
  }

  async findAll(): Promise<IResponse<Collection[]>> {
    try {
      const collections = await this.collectionRepository.find({
        where: { 
          deletedAt: IsNull()
        }
      });
      return new ResponseDto<Collection[]>(collections);
    } catch(error) {
      return new ResponseDto<any>([], 500, "", true, error.msg);
    }
  }

  async findOne(id: number): Promise<IResponse<Collection>> {
    try {
      const collection = await this.collectionRepository.findOneBy({id});
      return new ResponseDto<Collection>(collection);
    } catch (error) {
      console.log(error);
      return new ResponseDto<any>({}, 500, "", true, error.msg);
    }
  }

  async findAllDeleted(): Promise<IResponse<Collection[]>> {
    try {
      const collections = await this.collectionRepository.find({
        where: { 
          deletedAt: Not(IsNull())
        }
    });
      return new ResponseDto<Collection[]>(collections)
    } catch (error) {
      console.log(error);
      return new ResponseDto<any>([], 500, "", true, error.msg);
    }
  }

  async update(id: number, updateCollectionDto: UpdateCollectionDto): Promise<IResponse<Collection>> {
    try {
      const updateCollection = {
        id,
        ...updateCollectionDto,
      }
      const collection = await this.collectionRepository.preload(updateCollection);
      
      const savedCollection = await this.collectionRepository.save(collection);

      return new ResponseDto<Collection>(savedCollection);
    } catch (error) {
      console.log(error);
      return new ResponseDto<any>({}, 500, "", true, error.msg);
    }
  }

  async remove(id: number): Promise<IResponse<string>> {
    try {
      const pathFold = join(__dirname, `../../store/collections/${id}/`);

      rmdirSync(pathFold, {recursive: true});

      await this.collectionRepository.delete({id});

      return new ResponseDto<string>(JSON.stringify({msg: `Product was deleted from trash`}))
    } catch (error) {
      console.log('Error', error);
      return new ResponseDto<any>("", 500, "", true, error.msg);
    }
  }

  async softRemove(id: number): Promise<IResponse<string>> {
    try {
      const collection: Collection = await this.collectionRepository.findOneBy({id});

      const updateProduct = {
        ...collection,
        deletedAt: (new Date()).toJSON()
      }
      const product = await this.collectionRepository.preload(updateProduct);

      await this.collectionRepository.save(product);

      return new ResponseDto<string>(JSON.stringify({msg: `Product was deleted`}))
    } catch (error) {
      console.log('Error', error);
      return new ResponseDto<any>("", 500, "", true, error.msg);
    }
  }
}
