import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import ImageKit from 'imagekit';

@Injectable()
export class ImageKitService {
  private imagekit: ImageKit;

  constructor(private readonly configService: ConfigService) {
    this.imagekit = new ImageKit({
      publicKey: this.configService.get<string>('Public_key_imageKit')!,
      privateKey: this.configService.get<string>('Private_key_imageKit')!,
      urlEndpoint: this.configService.get<string>('IMAGEKIT_URL_ENDPOINT')!,
    });
  }

  async uploadFile(fileBuffer: Buffer, fileName: string, folder: string = '/books'): Promise<any> {
    try {
      return await new Promise((resolve, reject) => {
        this.imagekit.upload(
          {
            file: fileBuffer,
            fileName,
            folder,
          },
          (error, result) => {
            if (error) {
              return reject(error);
            }
            resolve(result);
          },
        );
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Error uploading file to ImageKit ==> ' + (error as Error)?.message,
      );
    }
  }
}
