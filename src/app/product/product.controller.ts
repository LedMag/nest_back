import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Query } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { createWriteStream, mkdirSync } from 'fs';
import { createHash } from 'crypto';
import { join } from 'path';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  async create(@Body() createProductDto: CreateProductDto): Promise<string> {
    const result = await this.productService.create(createProductDto);
    return JSON.stringify(result);
  }

  @Get()
  findAll() {
    return this.productService.findAll();
  }

  @Get('recycle')
  findAllDeleted() {
    return this.productService.findAllDeleted()
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productService.update(+id, updateProductDto);
  }

  @Delete(':id')
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
    console.log(fullName);
    
    req.on('data', data => {
      writableStream.write(data);
    })
    req.on('end', function () {
      self.productService.findOne(+id)
      .then(product => {
        if(!product.img_url) {
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
}
