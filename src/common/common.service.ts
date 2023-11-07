import { Injectable } from "@nestjs/common";
import { hashSync, compareSync, genSaltSync } from "bcryptjs";
import { DataSource, DeleteResult, InsertResult, UpdateResult } from "typeorm";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";

@Injectable()
export class CommonService {
  constructor(private dataSource: DataSource) {}
  decryptBase64 (str: string){
    return Buffer.from(str, "base64").toString();
  };
  
  encodePassword(password: string) {
    const SALT = genSaltSync();
    const decodeBase64password = this.decryptBase64(password);
    return hashSync(decodeBase64password, SALT);
  }
  
  comparePassword(password: string, dbpassword: string) {
    const decodeBase64password = this.decryptBase64(password);
    return compareSync(decodeBase64password, dbpassword);
  }

  async insertEntity<T extends Record<string, any>>(data: QueryDeepPartialEntity<T>, entity: { new (): T }):Promise<InsertResult>{       
    return this.dataSource
      .createQueryBuilder()
      .insert()
      .into(entity)
      .values(data)
      .execute();
    }
    
  async selectEntity<T extends Record<string, any>>(
    id: number,
    selectFields: (keyof T)[],
    entity: { new (): T }
  ): Promise<T> {    
    let alias = 'entity'
    return this.dataSource
      .createQueryBuilder()
      .select(selectFields.map(field => `${alias}.${String(field)}`))
      .from(entity, alias)
      .where(`${alias}.id = :id`, { id })
      .getOne()  
  }

  async updateEntity<T extends Record<string, any>>(
    id: number,
    data: QueryDeepPartialEntity<T>,
    entity: { new (): T }
  ): Promise<UpdateResult> {
    return this.dataSource
      .createQueryBuilder()
      .update(entity)
      .set(data)
      .where('id = :id', { id })
      .execute();
  }

  async deleteEntity<T extends Record<string, any>>(
    id: number,
    entity: { new (): T }
  ): Promise<DeleteResult> {
    const alias = 'entity';
    
    return this.dataSource
      .createQueryBuilder()
      .delete()
      .from(entity, alias)
      .where(`${alias}.id = :id`, { id })
      .execute();
  }
}
