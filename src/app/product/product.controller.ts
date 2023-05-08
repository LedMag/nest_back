import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Query, StreamableFile, UseGuards, Res } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../auth/decorators/public.decorator';
import { PageOptionsDto } from '../page-interfaces/page-options.dto';
import { Product } from './entities/product.entity';
import { FileLoaderService } from '../services/file-loader/file-loader.service';
import { ProductService } from './product.service';
import { IResponse } from '../response/response.interface';
import { ProductsFilterOptionsDto } from './dto/products-filter-options.dto';
import { IProduct } from './interface/product.interface';
import { ResponseDto } from '../response/response.dto';

@UseGuards(JwtAuthGuard)
@Controller('products')
export class ProductController {
  constructor(private productService: ProductService, private fileLoaderService: FileLoaderService) {}

  @Post()
  async create(@Body() createProductDto: CreateProductDto): Promise<string> {    
    const result = await this.productService.create(createProductDto);
    return JSON.stringify(result);
  }

  @Public()
  @Get()
  async findAll(@Query() pageOptionsDto: PageOptionsDto): Promise<IResponse<Product[]>> {    
    return await this.productService.findAll(pageOptionsDto);
  }

  @Get('recycle')
  findAllDeleted(@Query() pageOptionsDto: PageOptionsDto): Promise<IResponse<Product[]>> {
    return this.productService.findAllDeleted(pageOptionsDto);
  }

  @Public()
  @Post('sort')
  async sort(@Body() productsFilterOptionsDto: ProductsFilterOptionsDto): Promise<ResponseDto<Product[]>> {
    return await this.productService.sort(productsFilterOptionsDto);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.productService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto): Promise<IResponse<IProduct>> {
    return this.productService.update(+id, updateProductDto);
  }
  
  @Delete(':id')
  remove(@Param('id') id: string): Promise<IResponse<string>>  {
    return this.productService.remove(+id);
  }

  @Delete('delete/:id')
  softRemove(@Param('id') id: number): Promise<IResponse<string>> {
    return this.productService.softRemove(+id);
  }

  @Post('uploadFile')
  async uploadFile(@Query() {id, name, ext}: {id: number, name: string, ext: string}, @Req() req): Promise<void> { 
    const self = this;

    let writableStream = await this.fileLoaderService.saveFile(+id, "products", name, ext);
    
    req.on('data', data => {
      writableStream.write(data);
    })
    req.on('end', async function () {
      await self.productService.findOne(+id)
      .then(product => {
        if(product.data.img_url) return;
        const arr = (writableStream.path as string).split("/");
        const name = arr[arr.length - 1];
        self.productService.update(+id, {img_url: name});
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
  async getStaticFileByName(@Param('id') id: string, @Param('url') url: string): Promise<StreamableFile> {
    return await this.fileLoaderService.readImg(+id, "products", url);
  }
}
