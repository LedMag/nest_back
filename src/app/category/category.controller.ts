import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Req, StreamableFile } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { join } from 'path';
import { ReadStream, createReadStream, createWriteStream, mkdirSync, statSync } from 'fs';
import { createHash } from 'crypto';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@UseGuards(JwtAuthGuard)
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    const result = await this.categoryService.create(createCategoryDto);
    return JSON.stringify(result);
  }

  @Public()
  @Get()
  async findAll() {
    return await this.categoryService.findAll();
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoryService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
    return this.categoryService.update(+id, updateCategoryDto);
  }

  @Get('recycle')
  async findAllDeleted() {
    return await this.categoryService.findAllDeleted();
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.categoryService.remove(+id);
  }
  
  @Delete('delete/:id')
  async softRemove(@Param('id') id: string) {
    return await this.categoryService.softRemove(+id);
  }

  @Post('uploadFile')
  uploadFile(@Query() {id, name, ext}: {id: string, name: string, ext: string}, @Req() req) {
    const self = this;
    const pathFold = join(__dirname, `../../store/categories/${id}/`);
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
      self.categoryService.findOne(+id)
      .then(res => {
        if(!res.data.img_url) {
          self.categoryService.update(+id, {img_url: fullName});
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
    const path: string = join(__dirname, `../../store/categories/${id}/${url}`);
    const size: number = statSync(path).size;
    let ext: string = path.split('.')[1];
    const file: ReadStream = createReadStream(path);
    return new StreamableFile(file, {type: `image/${ext}`, disposition: `attachment; filename="${url}"`, length: size});
  }
}
