import * as _ from "lodash";
import {Pipe, PipeTransform} from "@angular/core";
import { SelectItem } from 'primeng/primeng';
import { Course } from "../models/Course";

@Pipe({
    name: "courseTypeToSelectItem"
})
export class CourseTypeSelectItemPipe implements PipeTransform {

  public transform(courseType: any[]): SelectItem[] {
    if (!courseType) {
      return undefined;
    } else {
      return courseType.map(s => ({ label: s.courseType, value: s.courseType }));
    }
  }
}
