import * as _ from "lodash";
import {Pipe, PipeTransform} from "@angular/core";
import { SelectItem } from 'primeng/primeng';
import { User } from "../models/User";

@Pipe({
    name: "instructorToSelectItem"
})
export class InstructorSelectItemPipe implements PipeTransform {

  public transform(users: User[]): SelectItem[] {
    if (!users) {
      return undefined;
    } else {
      return users.map(s => ({ label: s.firstName + ' ' + s.lastName, value: s.userID }));
    }
  }
}
