import { DataSource, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CommonRepositoryFactory {
    constructor(private dataSource: DataSource) {}

    getRepository<T>(entity: { new (): T }): CommonRepository<T> {
        return new CommonRepository(entity, this.dataSource);
    }
}

export class CommonRepository<T> {  
    private readonly repository: Repository<T>;

    constructor(entity: { new (): T },private dataSource: DataSource) {
        this.repository = this.dataSource.getRepository(entity);
    }

    async saveEntity(data: T): Promise<T> {
       return this.repository.save(data);
    }

    async getEntity(id): Promise<T>{
        return this.repository.findOne(id);
    }
    
    async deleteEntiy(id): Promise<T>{
        const entity = await this.getEntity(id);    
        return await this.repository.remove(entity);
    }
}
