import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { LearningStyleForm } from "../../models/learningStyleForm";
import { ClientService } from "../../services/client.service";
import { StudentService } from "../../services/student.service";
import { AuthService } from '../../services/authentication.service';
declare var swal: any;

@Component({
    selector: 'learningStyleForm',
    templateUrl: './app/components/learning-style-form/learning-style-form.component.html',
    styleUrls: ['./app/components/learning-style-form/learning-style-form.component.css']
})

export class LearningStyleComponent {
  @Input() learningStyleForm: LearningStyleForm;
  error: any;
  totalSeeingPoints: number;
  totalHearingPoints: number;
  totalDoingPoints: number;
  learnBy: any;
  doubleChoice: any;
  tripleChoice: any;
  showThreeChoices: boolean = false;
  currentUser: any;
  submitVisible: boolean = true;

  constructor(private clientService: ClientService, private studentService: StudentService, private router: Router, private authService: AuthService) {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.learningStyleForm = new LearningStyleForm();

    if (this.currentUser.userType === "Client") {
      swal({
        title: 'Loading...'
      });
      swal.showLoading();
      this.clientService
      .getClient(this.currentUser.userID)
      .then(result => {
        if (!result[0].learningStyle) {
          this.clientService
          .getLearningStyleById()
          .then(result => {
            this.submitVisible = false;
            swal.close();
            swal(
                'Read Only',
                "You have already submitted this form.",
                'warning'
            );
          })
          .catch(err => {
            console.log(err);
          });
        } else {
          swal.close();
        }
      })
      .catch(err => {
        console.log(err);
      });
    } else if (this.currentUser.userType === "Student") {
      swal({
        title: 'Loading...'
      });
      swal.showLoading();
      this.studentService
      .getStudent(this.currentUser.userID)
      .then(result => {
        if (!result.learningStyle) {
          this.clientService
          .getLearningStyleById()
          .then(result => {
            this.submitVisible = false;
            swal.close();
            swal(
                'Read Only',
                "You have already submitted this form.",
                'warning'
            );
          })
          .catch(err => {
            console.log(err);
          });
        } else {
          swal.close();
        }
      })
      .catch(err => {
        console.log(err);
      });
    } else {
      swal(
          'Read Only',
          "You are logged in as '" + this.currentUser.userType + "'. Only clients can submit this form.",
          'warning'
      );
    }
  }

  saveLearningStyle() {
    if (!this.learnBy && !this.doubleChoice) {
      swal(
          'Incomplete form',
          'Please fill out the form',
          'warning'
      );
    } else if (this.tripleChoice) {
      swal({
          title: 'You learn best by  ' + this.tripleChoice.firstChoice + ' and ' + this.tripleChoice.secondChoice + ' and ' + this.tripleChoice.thirdChoice,
          text: "Is this correct?",
          type: 'question',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          allowOutsideClick: false,
          confirmButtonText: 'Yes!'
      }).then(isConfirm => {
        this.showThreeChoices = true;
      }).catch(error => {
        console.log(error);
      });
    } else if (this.doubleChoice) {
      swal({
          title: 'You learn best by ' + this.doubleChoice.firstChoice + ' and ' + this.doubleChoice.secondChoice,
          text: "Is this correct?",
          type: 'question',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          allowOutsideClick: false,
          confirmButtonText: 'Yes!'
      }).then(isConfirm => {
        if (isConfirm.dismiss === "cancel" || isConfirm.dismiss === "overlay") {
          console.log(isConfirm.dismiss);
        } else if (isConfirm) {
          swal({
              title: 'Tie!',
              text: "Please pick one that suits you better",
              type: 'info',
              showCancelButton: true,
              confirmButtonColor: '#3085d6',
              cancelButtonColor: '#3085d6',
              allowOutsideClick: false,
              cancelButtonText: this.doubleChoice.firstChoice,
              confirmButtonText: this.doubleChoice.secondChoice
          }).then(isConfirm => {
            if (isConfirm) {
              this.learningStyleForm.learnBy = this.doubleChoice.secondChoice;
              this.clientService
                  .saveLearningStyle(this.learningStyleForm)
                  .then(client => {
                      this.router.navigate(['/dashboard']);
                  })
                  .catch(error => this.error = error);
            }
          }).catch(error => {
            this.learningStyleForm.learnBy  = this.doubleChoice.firstChoice;
            this.clientService
                .saveLearningStyle(this.learningStyleForm)
                .then(client => {
                    this.router.navigate(['/dashboard']);
                })
                .catch(error => this.error = error);
          });
        }
      }).catch(error => {
        console.log(error);
      });
    } else {
      swal({
          title: 'You learn best by ' + this.learnBy + '',
          text: "Is this correct?",
          type: 'question',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          cancelButtonText: 'No',
          confirmButtonText: 'Yes!'
      }).then(isConfirm => {
        if (isConfirm.dismiss === "cancel" || isConfirm.dismiss === "overlay") {
          console.log(isConfirm.dismiss);
        } else if (isConfirm) {
          this.learningStyleForm.learnBy  = this.learnBy;
          this.clientService
              .saveLearningStyle(this.learningStyleForm)
              .then(client => {
                  this.router.navigate(['/dashboard']);
              })
              .catch(error => this.error = error); // TODO: Display error message
        }
      }).catch(error => {
        console.log(error);
      });
    }

  }

  choosePreference(preference) {
    this.learningStyleForm.learnBy = preference;
    this.clientService
        .saveLearningStyle(this.learningStyleForm)
        .then(client => {
            this.router.navigate(['/dashboard']);
        })
        .catch(error => this.error = error);
  }

  tallyPoints() {
    var seeingPoints = 0;
    var hearingPoints = 0;
    var doingPoints = 0;

    if (this.learningStyleForm.seeing1) { seeingPoints++; }
    if (this.learningStyleForm.seeing2) { seeingPoints++; }
    if (this.learningStyleForm.seeing3) { seeingPoints++; }
    if (this.learningStyleForm.seeing4) { seeingPoints++; }
    if (this.learningStyleForm.seeing5) { seeingPoints++; }
    if (this.learningStyleForm.seeing6) { seeingPoints++; }
    if (this.learningStyleForm.seeing7) { seeingPoints++; }
    this.totalSeeingPoints = seeingPoints;
    this.learningStyleForm.seeing = this.totalSeeingPoints;

    if (this.learningStyleForm.hearing1) { hearingPoints++; }
    if (this.learningStyleForm.hearing2) { hearingPoints++; }
    if (this.learningStyleForm.hearing3) { hearingPoints++; }
    if (this.learningStyleForm.hearing4) { hearingPoints++; }
    if (this.learningStyleForm.hearing5) { hearingPoints++; }
    if (this.learningStyleForm.hearing6) { hearingPoints++; }
    if (this.learningStyleForm.hearing7) { hearingPoints++; }
    this.totalHearingPoints = hearingPoints;
    this.learningStyleForm.hearing = this.totalHearingPoints;

    if (this.learningStyleForm.doing1) { doingPoints++; }
    if (this.learningStyleForm.doing2) { doingPoints++; }
    if (this.learningStyleForm.doing3) { doingPoints++; }
    if (this.learningStyleForm.doing4) { doingPoints++; }
    if (this.learningStyleForm.doing5) { doingPoints++; }
    if (this.learningStyleForm.doing6) { doingPoints++; }
    if (this.learningStyleForm.doing7) { doingPoints++; }
    this.totalDoingPoints = doingPoints;
    this.learningStyleForm.doing = this.totalDoingPoints;

    if (this.totalSeeingPoints > this.totalHearingPoints && this.totalSeeingPoints > this.totalDoingPoints) {
      this.doubleChoice = null;
      this.tripleChoice = null;
      this.learnBy = "Seeing";
    } else if (this.totalHearingPoints > this.totalSeeingPoints && this.totalHearingPoints > this.totalDoingPoints) {
      this.doubleChoice = null;
      this.tripleChoice = null;
      this.learnBy = "Hearing";
    } else if (this.totalDoingPoints > this.totalHearingPoints && this.totalDoingPoints > this.totalSeeingPoints) {
      this.doubleChoice = null;
      this.tripleChoice = null;
      this.learnBy = "Doing";
    } else if ((this.totalDoingPoints === this.totalSeeingPoints) && (this.totalHearingPoints === this.totalSeeingPoints)) {
      this.learnBy = null;
      this.doubleChoice = null;
      this.tripleChoice = {
        firstChoice: 'Seeing',
        secondChoice: 'Doing',
        thirdChoice: 'Hearing'
      };
    } else if (this.totalDoingPoints === this.totalSeeingPoints) {
      this.learnBy = null;
      this.tripleChoice = null;
      this.doubleChoice = {
        firstChoice: 'Doing',
        secondChoice: 'Seeing'
      };
    } else if (this.totalDoingPoints === this.totalHearingPoints) {
      this.learnBy = null;
      this.tripleChoice = null;
      this.doubleChoice = {
        firstChoice: 'Doing',
        secondChoice: 'Hearing'
      };
    } else if (this.totalSeeingPoints === this.totalHearingPoints) {
      this.learnBy = null;
      this.tripleChoice = null;
      this.doubleChoice = {
        firstChoice: 'Seeing',
        secondChoice: 'Hearing'
      };
    }

  }

  goBack() {
      window.history.back();
  }
}
