import { Injectable } from "@nestjs/common";
import { hashSync, compareSync, genSaltSync } from "bcryptjs";

@Injectable()
export class CommonService {
  constructor() {}
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
}
