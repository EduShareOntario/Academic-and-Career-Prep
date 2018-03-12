import * as _ from "lodash";
import {Pipe, PipeTransform} from "@angular/core";
import { SelectItem } from 'primeng/primeng';
import { Student } from "../models/Student";

@Pipe({
    name: "toSelectItem"
})
export class SelectItemPipe implements PipeTransform {

  public transform(students: Student[]): SelectItem[] {
    if (!students) {
      return undefined;
    } else {
      return students.map(s => ({ label: s.firstName + ' ' + s.lastName, value: s.userID }));
    }
  }
}
