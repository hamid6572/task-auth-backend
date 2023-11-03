import { Injectable } from "@nestjs/common";
import { DataSource, EntitySubscriberInterface, EventSubscriber, InsertEvent, RemoveEvent, UpdateEvent } from "typeorm"

import { Post } from "./entities/post.entity"
import { SearchService } from "../search/search.service";

@EventSubscriber()
@Injectable()
export class PostSubscriber implements EntitySubscriberInterface<Post> {
    constructor(private dataSource: DataSource,private searchService: SearchService ) {
       this.dataSource.subscribers.push(this); 
    }

    listenTo() {
        return Post
    }

    async afterInsert(event: InsertEvent<Post>) {
        await this.searchService.indexPost( event.entity );
    }
    
    async afterUpdate(event: UpdateEvent<Post>) {
        await this.searchService.updatePost( event.entity as Post );
    }
  
    async afterRemove(event: RemoveEvent<Post>) {
        await this.searchService.deletePost( event.entityId );
    }
}