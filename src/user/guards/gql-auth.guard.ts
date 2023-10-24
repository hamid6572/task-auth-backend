import { ExecutionContext, Injectable } from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class GqlAuthGuard extends AuthGuard("AuthUser") {
  constructor() {    
    super();
  }

  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;
    request.user = ctx.getArgs().loginData;
    request.body = ctx.getArgs().loginData;
        
    return request;
  }
}
