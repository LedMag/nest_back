import { Injectable, StreamableFile } from '@nestjs/common';
import { createHash } from 'crypto';
import { ReadStream, WriteStream, createReadStream, createWriteStream, mkdirSync, statSync } from 'fs';
import { join } from 'path';

@Injectable()
export class FileLoaderService {
    
    async saveFile(id: number, dirName: string, name: string, ext: string): Promise<WriteStream> {
        const pathFold = join(__dirname, `../../store/${dirName}/${id}/`);
        mkdirSync(pathFold, {recursive: true});
        const hash = createHash('sha256');
        const fileName: string = hash.update(id + name).digest('base64');
        const reg = new RegExp('/\|=+', 'g');
        const fullName = `${fileName.replace(reg, '')}.${ext}`;
        const path: string = `${pathFold}${fullName}`;

        return createWriteStream(path);
    }

    async readImg(id: number, dirName: string, url: string): Promise<StreamableFile> {
        if(!url) return;
        const path: string = join(__dirname, `../../store/${dirName}/${id}/${url}`);
        const size: number = statSync(path).size;
        let ext: string = path.split('.')[1];
        const file: ReadStream = createReadStream(path);
        return new StreamableFile(file, {type: `image/${ext}`, disposition: `attachment; filename="${url}"`, length: size});
    }
}
