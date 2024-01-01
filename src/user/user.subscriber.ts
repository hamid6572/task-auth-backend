import { Injectable } from '@nestjs/common';
import {
  DataSource,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
} from 'typeorm';

import { User } from './entities/user.entity.js';
import { CommonService } from '../common/common.service.js';

@EventSubscriber()
@Injectable()
export class UserSubscriber implements EntitySubscriberInterface<User> {
  constructor(
    private dataSource: DataSource,
    private commonService: CommonService,
  ) {
    this.dataSource.subscribers.push(this);
  }

  listenTo() {
    return User;
  }

  // async beforeInsert(event: InsertEvent<User>) {
  //   event.entity.password = this.commonService.encodePassword(
  //     event.entity.password,
  //   );
    
  // }
}
