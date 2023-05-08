import { Injectable } from '@nestjs/common';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Collection } from './entities/collection.entity';
import { IsNull, Not, Repository } from 'typeorm';
import { join } from 'path';
import { IResponse } from '../response/response.interface';
import { ResponseDto } from '../response/response.dto';
import { PageOptionsDto } from '../page-interfaces/page-options.dto';
import { PageMetaDto } from '../page-interfaces/page-meta.dto';
import { rm, stat, unlink } from 'fs/promises';

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
      return new ResponseDto<Collection>(savedCollection, null, 201);
    } catch (error) {
      console.log(error);
      return new ResponseDto<any>({}, null, 500, "", true, error.sqlMessage);
    }
  }

  async findAll(pageOptionsDto: PageOptionsDto): Promise<IResponse<Collection[]>> {
    try {
      const collections: Collection[] = await this.collectionRepository.find({
        where: {"deletedAt": IsNull()},
        skip: pageOptionsDto.skip,
        take: pageOptionsDto.take
      })

      if(collections.length) {
        const pageMetaDto = new PageMetaDto({ itemCount: collections.length, pageOptionsDto });
        return new ResponseDto<Collection[]>(collections, pageMetaDto, 200);
      }

      return new ResponseDto<Collection[]>(collections);
    } catch(error) {
      return new ResponseDto<any>([], null, 500, "", true, error.sqlMessage);
    }
  }

  async findOne(id: number): Promise<IResponse<Collection>> {
    try {
      const collection = await this.collectionRepository.findOneBy({id});
      if(collection) return new ResponseDto<Collection>(collection, null, 204);
      return new ResponseDto<Collection>(collection, null, 204);
    } catch (error) {
      console.log(error);
      return new ResponseDto<any>({}, null, 500, "", true, error.sqlMessage);
    }
  }

  async findAllDeleted(pageOptionsDto: PageOptionsDto): Promise<IResponse<Collection[]>> {
    try {
      const collections: Collection[] = await this.collectionRepository.find({
        where: {"deletedAt": Not(IsNull())},
        skip: pageOptionsDto.skip,
        take: pageOptionsDto.take
      })

      if(collections.length) {
        const pageMetaDto = new PageMetaDto({ itemCount: collections.length, pageOptionsDto });
        return new ResponseDto<Collection[]>(collections, pageMetaDto, 200);
      }

      return new ResponseDto<Collection[]>(collections);
    } catch(error) {
      return new ResponseDto<any>([], null, 500, "", true, error.sqlMessage);
    }
  }

  async update(id: number, updateCollectionDto: UpdateCollectionDto): Promise<IResponse<Collection>> {
    try {
      const oldCollection = await this.collectionRepository.findOneBy({id});

      if(oldCollection.img_url !== updateCollectionDto.img_url) {
        const pathFold = join(__dirname, `../store/categories/${id}/${oldCollection.img_url}`);

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

      const updateCollection = {
        id,
        ...updateCollectionDto,
      }
      const collection = await this.collectionRepository.preload(updateCollection);
      
      const savedCollection = await this.collectionRepository.save(collection);

      return new ResponseDto<Collection>(savedCollection, null, 200);
    } catch (error) {
      console.log(error);
      return new ResponseDto<any>({}, null, 500, "", true, error.sqlMessage);
    }
  }

  async remove(id: number): Promise<IResponse<string>> {
    try {
      const pathFold = join(__dirname, `../store/collections/${id}/`);

      await rm(pathFold, {recursive: true}).catch( err => null);

      await this.collectionRepository.delete({id});

      return new ResponseDto<string>(`Collection with id ${id} is deleted from trash`, null, 200);
    } catch (error) {
      console.log('Error', error);
      return new ResponseDto<any>(`Collection with id ${id} is not deleted from trash`, null, 500, "", true, error.sqlMessage);
    }
  }

  async softRemove(id: number): Promise<IResponse<string>> {
    try {
      const collection: Collection = await this.collectionRepository.findOneBy({id});

      const updateCollection = {
        ...collection,
        deletedAt: (new Date()).toJSON()
      }
      const preloadCollection = await this.collectionRepository.preload(updateCollection);

      await this.collectionRepository.save(preloadCollection);

      return new ResponseDto<string>(`Collection with id ${id} is deleted`, null, 200)
    } catch (error) {
      console.log('Error', error);
      return new ResponseDto<any>(`Collection with id ${id} is not deleted`, null, 500, "", true, error.sqlMessage);
    }
  }
}
