import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Req, StreamableFile } from '@nestjs/common';
import { CollectionService } from './collection.service';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';
import { Public } from '../auth/decorators/public.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FileLoaderService } from '../services/file-loader/file-loader.service';
import { PageOptionsDto } from '../page-interfaces/page-options.dto';

@UseGuards(JwtAuthGuard)
@Controller('collections')
export class CollectionController {
  constructor(private readonly collectionService: CollectionService, private fileLoaderService: FileLoaderService) {}

  @Post()
  async create(@Body() createCollectionDto: CreateCollectionDto) {
    const result = await this.collectionService.create(createCollectionDto);
    return JSON.stringify(result);
  }

  @Public()
  @Get()
  async findAll(@Query() pageOptionsDto: PageOptionsDto) {
    return await this.collectionService.findAll(pageOptionsDto);
  }

  @Get('recycle')
  async findAllDeleted(@Query() pageOptionsDto: PageOptionsDto) {
    return await this.collectionService.findAllDeleted(pageOptionsDto);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.collectionService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() updateCollectionDto: UpdateCollectionDto) {
    return this.collectionService.update(+id, updateCollectionDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    return await this.collectionService.remove(+id);
  }
  
  @Delete('delete/:id')
  async softRemove(@Param('id') id: number) {
    return await this.collectionService.softRemove(+id);
  }

  @Post('uploadFile')
  async uploadFile(@Query() {id, name, ext}: {id: number, name: string, ext: string}, @Req() req): Promise<void> {
    const self = this;

    let writableStream = await this.fileLoaderService.saveFile(id, "collections", name, ext);
    
    req.on('data', data => {
      writableStream.write(data);
    })
    req.on('end', function () {
      self.collectionService.findOne(+id)
      .then(res => {
        if(!res.data.img_url) {
          const arr = (writableStream.path as string).split("/");
          const name = arr[arr.length - 1];
          self.collectionService.update(+id, {img_url: name});
        }
      })
      
      writableStream.end();
    });
    req.on('error', function (err) {
      return "Error: " + err
    });
    writableStream.on('finish', () => {
      return "Success"
    });
    writableStream.on('error', (err) => {
      return "Error: " + err
    });
  }

  @Public()
  @Get('getImage/:id/:url')
  async getStaticFileByName(@Param('id') id: number, @Param('url') url: string): Promise<StreamableFile> {
    return await this.fileLoaderService.readImg(+id, "collections", url);
  }
}
