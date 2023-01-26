import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Query, StreamableFile, UseGuards } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { createReadStream, createWriteStream, mkdirSync, ReadStream, statSync } from 'fs';
import { createHash } from 'crypto';
import { join } from 'path';
import { SortProducts } from './dto/sort-products.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../auth/decorators/public.decorator';

@UseGuards(JwtAuthGuard)
@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  async create(@Body() createProductDto: CreateProductDto): Promise<string> {
    const result = await this.productService.create(createProductDto);
    return JSON.stringify(result);
  }

  @Public()
  @Post('sort/')
  async sort(@Body() sortProducts: SortProducts): Promise<string> {
    console.log(sortProducts);
    
    const result = await this.productService.sort(sortProducts);
    return JSON.stringify(result);
  }

  @Public()
  @Get()
  findAll() {
    return this.productService.findAll();
  }

  @Get('recycle')
  findAllDeleted() {
    return this.productService.findAllDeleted()
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productService.update(+id, updateProductDto);
  }

  @Get('delete/:id')
  remove(@Param('id') id: string) {
    return this.productService.remove(+id);
  }

  @Post('uploadFile')
  uploadFile(@Query() {id, name, ext}: {id: string, name: string, ext: string}, @Req() req) {
    const self = this;
    const pathFold = join(__dirname, `../../store/products/${id}/`);
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
      self.productService.findOne(+id)
      .then(product => {
        if(!product.img_url) {
          console.log(fullName);
    
          self.productService.update(+id, {img_url: fullName});
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
  @Get('getImage/:id')
  async getStaticFile(@Param('id') id: string): Promise<any> {
    const fileName: string = await this.productService.findOne(+id).then( user => user.img_url)
    if(!fileName) return;
    const path: string = join(__dirname, `../../store/products/${id}/${fileName}`);
    const size: number = statSync(path).size;
    let ext: string = path.split('.')[1];
    const file: ReadStream = createReadStream(path);
    return new StreamableFile(file, {type: `image/${ext}`, disposition: `attachment; filename="${fileName}"`, length: size});
  }
}
