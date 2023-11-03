import { Injectable } from "@nestjs/common";
import { DataSource, EntitySubscriberInterface, EventSubscriber, InsertEvent, RemoveEvent, UpdateEvent } from "typeorm"

import { SearchService } from "../search/search.service";
import { Comment } from "./entities/comment.entity";

@EventSubscriber()
@Injectable()
export class CommentSubscriber implements EntitySubscriberInterface<Comment> {
    constructor(private dataSource: DataSource,private searchService: SearchService ) {
       this.dataSource.subscribers.push(this); 
    }

    listenTo() {
        return Comment
    }

    async afterInsert(event: InsertEvent<Comment>) {        
        await this.searchService.indexComment( event.entity );
    }
    
    async afterUpdate(event: UpdateEvent<Comment>) {
        await this.searchService.updateComment( event.entity as Comment );
    }
  
    // async afterRemove(event: RemoveEvent<Comment>) {
    //     console.log("remove event here ", event);
        
    //     await this.searchService.deleteComment( event.entityId );
    // }
}