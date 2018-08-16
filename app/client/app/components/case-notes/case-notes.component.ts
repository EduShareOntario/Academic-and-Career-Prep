import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StudentService } from "../../services/student.service";
import { StaffService } from "../../services/staff.service";
import { Student } from "../../models/student";
import { User } from "../../models/user";
declare var swal: any;

@Component({
  selector: 'caseNotes',
  templateUrl: './app/components/case-notes/case-notes.component.html',
  styleUrls: ['./app/components/case-notes/case-notes.component.css']
})

export class CaseNotesComponent implements OnInit {
  data: any[];
  notes: any[];
  users: User[];
  notesView: Student;
  note: any;
  newNote: boolean;
  status: any;
  error: any;

  constructor(private router: Router, private studentService: StudentService, private staffService: StaffService) {

  }

  ngOnInit() {
    swal({
      title: 'Loading...',
      allowOutsideClick: false
    });
    swal.showLoading();
    this.getStudents();
  }

  getStudents() {
    this.studentService
      .getStudents()
      .then(students => {
        if ((students as any).result === 'error') {
          this.data = null;
          this.displayErrorAlert(students);
        } else {
          this.data = students;
          for (let student of this.data) {
            student.fullName = student.firstName + " " + student.lastName;
          }
          this.getUsers();
        }
      })
      .catch(error => this.error = error);
  }

  getUsers() {
    this.staffService
    .getUsers()
    .then(users => {
      if ((users as any).result === 'error') {
        this.users = null;
        this.displayErrorAlert(users);
      } else {
        this.users = users;
        swal.close();
      }
    })
    .catch(error => this.error = error);
  }

  saveNote(userID) {
    if (this.note == null) {
      swal(
        'Empty Input',
        'Type something in the text area to save new note.',
        'warning'
      );
    } else {
      this.studentService
          .saveNewNote(this.note, userID)
          .then(note => {
            if ((note as any).result === 'error') {
              this.displayErrorAlert(note);
            } else if ((note as any).result === 'success') {
              this.note = '';
              this.showNotes(userID);
            } else {
              swal(
                'Error',
                'Something went wrong, please try again.',
                'error'
              );
            }
          })
          .catch(error => this.error = error); // TODO: Display error message

      this.newNote = false;
    }
  }

  showCaseNotes(student: Student) {
    this.notesView = student;
    this.showNotes(student.userID);
  }

  showNotes(userID) {
    this.studentService
        .getNotes(userID)
        .then(notes => {
          if ((notes as any).result === 'error') {
            this.displayErrorAlert(notes);
          } else {
            this.notes = notes;
            for (let notes of this.notes) {
              var facultyUser = this.users.filter(x => x.userID === notes.facultyID);
              if (facultyUser[0] != null) {
                notes.facultyUser = facultyUser[0].firstName + " " + facultyUser[0].lastName;
              } else {
                notes.facultyUser = 'Automated Message';
              }
            }
          }
        })
        .catch(error => console.log(error));
  }

  deleteNote(noteID) {
      event.stopPropagation();
      this.studentService
          .deleteNote(noteID)
          .then(result => {
            if ((result as any).result === 'error') {
              this.displayErrorAlert(result);
            } else if ((result as any).result === 'success') {
              this.notes = this.notes.filter(h => h.caseNoteID !== noteID);
            } else {
              swal(
                'Error',
                'Something went wrong, please try again.',
                'error'
              );
            }
          })
          .catch(error => this.error = error);
  }

  deleteAlert(noteID) {
      swal({
          title: 'Delete note?',
          text: "You won't be able to revert this!",
          type: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Yes, delete it!'
      }).then(isConfirm => {
        if (isConfirm.dismiss === "cancel" || isConfirm.dismiss === "overlay") {
          console.log(isConfirm.dismiss);
        } else if (isConfirm) {
          this.deleteNote(noteID);
        }
      }).catch(error => {
        console.log(error);
      });
  }

  displayErrorAlert(error) {
    swal(
      error.title,
      error.msg,
      'error'
    );
  }

  goBack() {
    window.history.back();
  }
}
