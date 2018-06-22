import * as _ from "lodash";
import {Pipe, PipeTransform} from "@angular/core";
import { SelectItem } from 'primeng/primeng';
import { Course } from "../models/Course";

@Pipe({
    name: "courseToSelectItem"
})
export class CourseSelectItemPipe implements PipeTransform {

  public transform(course: Course[]): SelectItem[] {
    if (!course) {
      return undefined;
    } else {
      return course.map(s => ({ label: s.courseName, value: s.courseID }));
    }
  }
}
