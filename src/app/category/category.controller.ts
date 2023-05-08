import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Req, StreamableFile } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { FileLoaderService } from '../services/file-loader/file-loader.service';
import { PageOptionsDto } from '../page-interfaces/page-options.dto';
import { IResponse } from '../response/response.interface';
import { Category } from './entities/category.entity';

@UseGuards(JwtAuthGuard)
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService, private fileLoaderService: FileLoaderService) {}

  @Post()
  async create(@Body() createCategoryDto: CreateCategoryDto): Promise<string> {
    const result = await this.categoryService.create(createCategoryDto);
    return JSON.stringify(result);
  }

  @Public()
  @Get()
  async findAll(@Query() pageOptionsDto: PageOptionsDto): Promise<IResponse<Category[]>> {
    return await this.categoryService.findAll(pageOptionsDto);
  }

  @Get('recycle')
  async findAllDeleted(@Query() pageOptionsDto: PageOptionsDto): Promise<IResponse<Category[]>> {
    return await this.categoryService.findAllDeleted(pageOptionsDto);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.categoryService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() updateCategoryDto: UpdateCategoryDto): Promise<IResponse<Category>> {
    return this.categoryService.update(+id, updateCategoryDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: number): Promise<IResponse<string>> {
    return await this.categoryService.remove(+id);
  }
  
  @Delete('delete/:id')
  async softRemove(@Param('id') id: number): Promise<IResponse<string>> {
    return await this.categoryService.softRemove(+id);
  }

  @Post('uploadFile')
  async uploadFile(@Query() {id, name, ext}: {id: number, name: string, ext: string}, @Req() req): Promise<void> {
    const self = this;

    let writableStream = await this.fileLoaderService.saveFile(id, "categories", name, ext);
    
    req.on('data', data => {
      writableStream.write(data);
    })
    req.on('end', function () {
      self.categoryService.findOne(+id)
      .then(res => {
        if(!res.data.img_url) {
          const arr = (writableStream.path as string).split("/");
          const name = arr[arr.length - 1];
          self.categoryService.update(+id, {img_url: name});
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
    return await this.fileLoaderService.readImg(+id, "categories", url);
  }
}
