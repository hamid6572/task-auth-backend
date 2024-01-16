import { Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { Query, Resolver } from '@nestjs/graphql';
import { FileInterceptor } from '@nestjs/platform-express';

@Resolver()
export class AppResolver {
  @Query(() => String)
  hello() {
    return 'Hello, world!';
  }
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    console.log('file===>', file);
  }
}
