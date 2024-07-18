// async create({ breed, name, image }: CreateCatInput) {
//     const { createReadStream, filename } = await image;
//     return new Promise(async (resolve) => {
//     createReadStream()
//     .pipe(createWriteStream(join(process.cwd(), `./src/upload/${filename}`)))
//     .on('finish', () =>
//     resolve({
//     breed,
//     name,
//     image: filename,
//     }),
//     )
//     .on('error',() => {
//     new HttpException('Could not save image', HttpStatus.BAD_REQUEST);
//     });
//     });
//     }