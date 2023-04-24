import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Req, StreamableFile } from '@nestjs/common';
import { CollectionService } from './collection.service';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';
import { Public } from '../auth/decorators/public.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { join } from 'path';
import { ReadStream, createReadStream, createWriteStream, mkdirSync, statSync } from 'fs';
import { createHash } from 'crypto';

@UseGuards(JwtAuthGuard)
@Controller('collections')
export class CollectionController {
  constructor(private readonly collectionService: CollectionService) {}

  @Post()
  async create(@Body() createCollectionDto: CreateCollectionDto) {
    const result = await this.collectionService.create(createCollectionDto);
    return JSON.stringify(result);
  }

  @Public()
  @Get()
  async findAll() {
    return await this.collectionService.findAll();
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.collectionService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCollectionDto: UpdateCollectionDto) {
    return this.collectionService.update(+id, updateCollectionDto);
  }

  @Get('recycle')
  async findAllDeleted() {
    return await this.collectionService.findAllDeleted();
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.collectionService.remove(+id);
  }
  
  @Delete('delete/:id')
  async softRemove(@Param('id') id: string) {
    return await this.collectionService.softRemove(+id);
  }

  @Post('uploadFile')
  uploadFile(@Query() {id, name, ext}: {id: string, name: string, ext: string}, @Req() req) {
    const self = this;
    const pathFold = join(__dirname, `../../store/collections/${id}/`);
    mkdirSync(pathFold, {recursive: true});
    const hash = createHash('sha256');
    const fileName: string = hash.update(id + name).digest('base64');
    const reg = new RegExp('/\|=', 'g');
    const fullName = `${fileName.replace(reg, '')}.${ext}`;
    const path: string = `${pathFold}${fullName}`;
    let writableStream = createWriteStream(path);
    
    req.on('data', data => {
      writableStream.write(data);
    })
    req.on('end', function () {
      self.collectionService.findOne(+id)
      .then(res => {
        if(!res.data.img_url) {
          self.collectionService.update(+id, {img_url: fullName});
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
  async getStaticFileByName(@Param('id') id: string, @Param('url') url: string): Promise<any> {
    if(!url) return;
    const path: string = join(__dirname, `../../store/collections/${id}/${url}`);
    const size: number = statSync(path).size;
    let ext: string = path.split('.')[1];
    const file: ReadStream = createReadStream(path);
    return new StreamableFile(file, {type: `image/${ext}`, disposition: `attachment; filename="${url}"`, length: size});
  }
}
