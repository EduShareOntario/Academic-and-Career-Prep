import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Client } from "../../models/client";
import { SuitabilityForm } from "../../models/suitabilityForm";
import { ActivatedRoute, Params } from '@angular/router';
import { ClientService } from "../../services/client.service";
import { CourseService } from "../../services/course.service";
import { AuthService } from '../../services/authentication.service';
declare var swal: any;
declare var moment: any;

@Component({
    selector: 'suitabilityForm',
    templateUrl: './app/components/suitability-form/suitability-form.component.html',
    styleUrls: ['./app/components/suitability-form/suitability-form.component.css']
})

export class SuitabilityFormComponent {
    @Input() client: Client;
    @Input() suitabilityForm: SuitabilityForm;
    error: any;
    date: any;
    currentUser: any;
    navigated = false; // true if navigated here
    selectedSection = 1;

    warning = false;
    partAPoints = 0;
    partBPoints = 0;
    totalPoints = 0;

    phone1: boolean = false;
    phone2: boolean = false;

    studentNumberToggle: boolean = false;

    campusList: any;
    courseTypes: any[] = [];
    selectedCourseTypes: any[] = [];

    constructor(private courseService: CourseService,
      private clientService: ClientService,
      private router: Router,
      private route: ActivatedRoute,
      private authService: AuthService) {
        this.client = new Client();
        this.suitabilityForm = new SuitabilityForm();
        this.suitabilityForm.isValidAge = true;
        this.suitabilityForm.availableDuringClass = true;
        this.suitabilityForm.appropriateGoal = true;
        this.date = new Date();
        this.client.allowDetailedMessage = false;
        this.client.okayToText = false;
        this.client.allowDetailedMessageAlternate = false;
        this.client.okayToTextAlternate = false;
        this.campusList = [
          {label: 'Select', value: null},
          {label: 'Barrie', value: 'Barrie'},
          {label: 'Orillia', value: 'Orillia'},
          {label: 'Owen Sound', value: 'Owen Sound'}
        ];
    }

    ngOnInit() {
      // get course types
      this.courseService.getCourseTypes()
      .then((result) => {
        if ((result as any).result === "error") {
          this.displayErrorAlert(result);
        } else {
          result.forEach((i) => {
            this.courseTypes.push({
              label: i.courseType,
              value: i.courseType
            });
          });
        }
      });
    }

    tallyPoints() {
        var factorPoints = 0;
        this.partAPoints = 0;
        this.partBPoints = 0;
        this.totalPoints = 0;
        this.warning = false;
        // PART A
        if (this.suitabilityForm.offerStartDate === 'Less than one year') { this.partAPoints += 3; } else if
        (this.suitabilityForm.offerStartDate === 'In one year') { this.partAPoints += 2; } else if
        (this.suitabilityForm.offerStartDate === 'More than a Year') { this.partAPoints += 1; }

        if (this.suitabilityForm.meetsGoal === 'No') { this.partAPoints += 3; } else if
        (this.suitabilityForm.meetsGoal === 'Yes but lacks skills/high enough marks') { this.partAPoints += 2; } else if
        (this.suitabilityForm.meetsGoal === 'Yes') { this.partAPoints += 1; }

        if (this.suitabilityForm.timeOutOfSchool === '6 or more years') { this.partAPoints += 3; } else if
        (this.suitabilityForm.timeOutOfSchool === '1-6 years') { this.partAPoints += 2; } else if
        (this.suitabilityForm.timeOutOfSchool === 'Less than 1 year') { this.partAPoints += 1; }

        if (this.suitabilityForm.inProgramBefore === 'No/Left with appropriate reasons') { this.partAPoints += 3; } else if
        (this.suitabilityForm.inProgramBefore === 'Yes - Appropriate progress') { this.partAPoints += 2; } else if
        (this.suitabilityForm.inProgramBefore === 'Yes – No progress') { this.partAPoints += 1; }

        if (this.suitabilityForm.employment === 'Not working') { this.partAPoints += 3; } else if
        (this.suitabilityForm.employment === 'Working part time') { this.partAPoints += 2; } else if
        (this.suitabilityForm.employment === 'Working full time') { this.partAPoints += 1; }

        if (this.suitabilityForm.incomeSource === 'EI') { this.partAPoints += 3; } else if
        (this.suitabilityForm.incomeSource === 'OW') { this.partAPoints += 3; } else if
        (this.suitabilityForm.incomeSource === 'ODSP') { this.partAPoints += 3; } else if
        (this.suitabilityForm.incomeSource === 'Crown Ward') { this.partAPoints += 3; } else if
        (this.suitabilityForm.incomeSource === 'Self-employed') { this.partAPoints += 3; } else if
        (this.suitabilityForm.incomeSource === 'Second Career') { this.partAPoints += 3; } else if
        (this.suitabilityForm.incomeSource === 'No income') { this.partAPoints += 2; } else if
        (this.suitabilityForm.incomeSource === 'Dependent of OW/ODSP') { this.partAPoints += 1; } else if
        (this.suitabilityForm.incomeSource === 'Employed') { this.partAPoints += 1; } else if
        (this.suitabilityForm.incomeSource === 'International Student') { this.partAPoints += 0; } else if
        (this.suitabilityForm.incomeSource === 'WSIB') { this.partAPoints += 0; }

        if (this.suitabilityForm.ageRange === '45-65 years old') { this.partAPoints += 3; } else if
        (this.suitabilityForm.ageRange === '16-18 years old') { this.partAPoints += 0; } else if
        (this.suitabilityForm.ageRange === '19-29 years old') { this.partAPoints += 2; } else if
        (this.suitabilityForm.ageRange === '65+ years old') { this.partAPoints += 0; } else if
        (this.suitabilityForm.ageRange === '30-44 years old') { this.partAPoints += 1; }

        //PART B
        if (this.suitabilityForm.hoursPerWeek === '10-20') { this.partAPoints += 3; } else if
        (this.suitabilityForm.hoursPerWeek === '5-10') { this.partAPoints += 2; } else if
        (this.suitabilityForm.hoursPerWeek === 'Less than 5') { this.partAPoints += 1; }

        if (this.suitabilityForm.workHistory === 'Less than 1 year experience') { this.partAPoints += 3; } else if
        (this.suitabilityForm.workHistory === '1-4 years experience') { this.partAPoints += 2; } else if
        (this.suitabilityForm.workHistory === '4+ years experience') { this.partAPoints += 1; }

        if (this.suitabilityForm.factorHealth) { factorPoints++; }
        if (this.suitabilityForm.factorInstructions) { factorPoints++; }
        if (this.suitabilityForm.factorCommunication) { factorPoints++; }
        if (this.suitabilityForm.factorLanguage) { factorPoints++; }
        if (this.suitabilityForm.factorComputer) { factorPoints++; }
        if (this.suitabilityForm.factorHousing) { factorPoints++; }
        if (this.suitabilityForm.factorTransportation) { factorPoints++; }
        if (this.suitabilityForm.factorDaycare) { factorPoints++; }
        if (this.suitabilityForm.factorInternet) { factorPoints++; }
        if (this.suitabilityForm.factorPersonal) { factorPoints++; }

        if (factorPoints >= 0 && factorPoints <= 4) { this.partBPoints = 3; } else if
        (factorPoints >= 5 && factorPoints <= 8) { this.partBPoints = 2; } else if
        (factorPoints >= 9) { this.partBPoints = 1; }

        this.totalPoints = this.partAPoints + this.partBPoints;

        if (this.totalPoints < 18) { this.warning = true; }
    }

    validate() {
        if (this.client.firstName && this.client.lastName && this.client.campus) {
          var birthdate = new Date(this.client.birthdate);
          this.client.birthdate = moment(birthdate).format('DD/MM/YYYY');
          this.client.inquiryDate = this.date;
          if (this.phone1) {
            this.client.phone = this.client.phone + " Cell";
          } else {
            this.client.phone = this.client.phone + " Home";
          }
          if (this.client.longDistance === true) {
            this.client.phone = "+1 " + this.client.phone;
          }
          if (this.phone2) {
            this.client.alternateNumber = this.client.alternateNumber + " Cell";
          } else {
            this.client.alternateNumber = this.client.alternateNumber + " Home";
          }
          if (this.client.longDistanceAlternate === true) {
            this.client.alternateNumber = "+1 " + this.client.alternateNumber;
          }
          if (this.studentNumberToggle === false) {
              this.client.studentNumber = 'TBD';
          }
          if (this.client.studentNumber == null) {
            swal(
                'Whoops...',
                "Please enter a student number or select 'No' for 'Attended Gerogian?'",
                'warning'
            );
            this.selectedSection = 1;
          }
          if (this.client.email == null || this.client.email === "") {
            if (this.client.campus === 'Barrie') {
              this.client.email = 'BA.ACP@georgiancollege.ca';
            } else if (this.client.campus === 'Orillia') {
              this.client.email = 'OR.ACP@georgiancollege.ca';
            } else if (this.client.campus === 'Owen Sound') {
              this.client.email = 'OS.ACP@georgiancollege.ca';
            }
            swal({
                title: 'FYI',
                text: "An email has not been entered, the user will be assigned the following email address based on their campus: " + this.client.email + ". Please assist them in signing in",
                type: 'info',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, continue',
                allowOutsideClick: false
            }).then(isConfirm => {
              if (isConfirm.dismiss === "cancel" || isConfirm.dismiss === "overlay") {
                this.client.email = "";
                this.selectedSection = 1;
              } else if (isConfirm) {
                this.checkSuitability();
              }
            }).catch(error => {
              console.log(error);
            });
          } else {
            this.checkSuitability();
          }
        } else {
          swal(
              'Whoops...',
              "Please complete the first three fields in the 'Client Info' section",
              'warning'
          );
          this.selectedSection = 1;
        }
    }

    checkSuitability() {
      if (Object.keys(this.suitabilityForm).length === 0) {
        swal({
            title: 'Suitability Incomplete',
            text: "The suitability section of the form has not been filled out. Are you sure you want to continue?",
            type: 'info',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, continue',
            allowOutsideClick: false
        }).then(isConfirm => {
          if (isConfirm.dismiss === "cancel" || isConfirm.dismiss === "overlay") {
            this.selectedSection = 2;
          } else if (isConfirm) {
            this.saveClient();
          }
        }).catch(error => {
          console.log(error);
        });
      } else {
        this.saveClient();
      }
    }

    saveClient() {
      if (this.selectedCourseTypes.toString() !== '') {
        this.suitabilityForm.selectedCourseTypes = this.selectedCourseTypes.toString();
      }

      swal({
        title: 'Saving...',
        allowOutsideClick: false
      });
      swal.showLoading();
      this.clientService
          .create(this.client, this.suitabilityForm)
          .then(client => {
            if (client.result === "error") {
              this.displayErrorAlert(client);
            } else if (client.msg === "username in use") {
              swal(
                  'Username taken',
                  'Please enter a different first and last name.',
                  'warning'
              );
              this.selectedSection = 1;
            } else if (client.msg === "email in use") {
              swal(
                  'Email already in use',
                  'Please enter a different email.',
                  'warning'
              );
              this.selectedSection = 1;
            } else if (client.msg === "incorrect email format") {
              if (this.client.email == null) {
                swal.close();
                this.router.navigate(['/clients']);
              } else {
                swal(
                    'Incorrect email format',
                    'Please enter a proper email.',
                    'warning'
                );
                this.selectedSection = 1;
              }
            }  else if (client.result === "success") {
              var CurrentDate = moment().format();
              if (this.selectedCourseTypes.toString() !== '') {
              for (let courseType of this.selectedCourseTypes) {
                this.courseService
                    .addToWaitList(client.userID, courseType, CurrentDate)
                    .then(result => {
                      if ((result as any).result === 'error') {
                        this.displayErrorAlert(result);
                      } else if ((result as any).result === 'success')  {
                        swal.close();
                      } else {
                        swal(
                          'Error',
                          'Something went wrong while adding student to wait list.',
                          'error'
                        );
                      }
                    })
                    .catch(error => console.log("Error - Add student to wait list: " + error));
                }
              }
              swal.close();
              this.router.navigate(['/clients']);
            } else {
              swal(
                  'Error',
                  'Something went wrong, please try again.',
                  'warning'
              );
              this.selectedSection = 1;
            }
          })
          .catch(error => {
            console.log("Error " + error );
          });
    }

    onDateChange(birthdate : string ) {
      var years = moment().diff(birthdate, 'years');
      if (years >= 16 && years <= 18) {
        this.suitabilityForm.ageRange = "16-18 years old";
      } else if (years >= 19 && years <= 29) {
        this.suitabilityForm.ageRange = "19-29 years old";
      } else if (years >= 30 && years <= 44) {
        this.suitabilityForm.ageRange = "30-44 years old";
      } else if (years >= 45 && years <= 65) {
        this.suitabilityForm.ageRange = "45-65 years old";
      } else if (years > 65) {
        this.suitabilityForm.ageRange = "65+ years old";
      }
    }

    displayErrorAlert(error) {
      if (error.title === "Auth Error") {
        this.router.navigate(['/login']);
        swal(
          error.title,
          error.msg,
          'info'
        );
      } else {
        swal(
          error.title,
          error.msg,
          'error'
        );
      }
    }

    goBack() {
      swal({
          title: 'Are you sure?',
          text: "Any information on this form will be lost if you proceed without saving.",
          type: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Yes, continue'
      }).then(isConfirm => {
        if (isConfirm.dismiss === "cancel" || isConfirm.dismiss === "overlay") {
          console.log(isConfirm.dismiss);
        } else if (isConfirm) {
          window.history.back();
        }
      }).catch(error => {
        console.log(error);
      });
    }
};
