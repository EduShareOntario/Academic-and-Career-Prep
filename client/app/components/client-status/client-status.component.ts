import { Component, OnInit, Input} from '@angular/core';
import { Router } from '@angular/router';
import { Client } from "../../models/client";
import { Student } from "../../models/student";
import { SuitabilityForm } from "../../models/suitabilityForm";
import { ConsentForm } from "../../models/consentForm";
import { LearningStyleForm } from "../../models/learningStyleForm";
import { ClientService } from "../../services/client.service";
import { StudentService } from "../../services/student.service";
import { AuthService } from "../../services/authentication.service";
declare var swal: any;

@Component({
    selector: 'client-status',
    templateUrl: './app/components/client-status/client-status.component.html',
    styleUrls: ['./app/components/client-status/client-status.component.css']
})

export class ClientStatusComponent implements OnInit {
    data: any[];
    allClients: Client[];
    suitabilityForms: SuitabilityForm[];
    consentForms: ConsentForm[];
    learningStyleForms: LearningStyleForm[];
    clientTotal: any;
    actionItems: any[];
    error: any;

    clientView: Client;
    clientEdit: Client;
    consentView: ConsentForm;
    selectedConsentForm: string;
    clientConsentForms: ConsentForm[];
    suitabilityView: SuitabilityForm;
    learningStyleView: LearningStyleForm;

    showSuitabilityEdit: boolean;
    showGeneralInfoEdit: boolean;

    addSuitability: boolean = false;
    @Input() suitabilityForm: SuitabilityForm;
    clientSuitability: Client[];
    warning: boolean = false;
    calculated: boolean = false;
    partAPoints = 0;
    partBPoints = 0;
    totalPoints = 0;

    statusReport: boolean = true;
    showGeneral: boolean = true;
    showSuitability: boolean;
    showConsent: boolean;
    showLearningStyle: boolean;

    //doughnut chart (client status)
    doughnutChartLabels: string[];
    doughnutChartData: number[];
    doughnutChartType: string;
    doughnutChartColors: any[] = [{ backgroundColor: ["#FF4207", "#F8E903", "#309EFF", "#2AD308"] }];
    stage1: any;
    stage2: any;
    stage3: any;
    stage4: any;

    //bar chart (learning style)
    barChartOptions:any = {
      scaleShowVerticalLines: false,
      responsive: true
    };
    barChartLabels:string[] = ['Hearing', 'Seeing', 'Doing'];
    barChartType:string = 'bar';
    barChartLegend:boolean = false;
    barChartData:any;
    barChartColors: any[] = [{ backgroundColor: ["#FF4207", "#F8E903", "#2AD308"] }];

    constructor(private router: Router, private clientService: ClientService, private studentService: StudentService, private authService: AuthService) {
    }

    ngOnInit() {
        this.getClients();
    }

    getClients() {
        this.clientService
            .getClients()
            .then(objects => {
                if ((objects as any).status === "403") {
                    this.data = null;
                } else {
                    this.setData(objects);
                }
            })
            .catch(error => this.error = error);
    }

    update(event) {
      console.log();
    }

    setData(objects) {
        this.data = objects.clients;
        for (let client of this.data) {
          client.fullName = client.firstName + " " + client.lastName;
          if (client.banner == null) {
            client.banner = false;
          }
          if (client.cam == null) {
            client.cam = false;
          }
        }
        this.allClients = objects.clients;
        this.clientTotal = objects.clients.length;
        this.suitabilityForms = objects.suitabilityForms;
        this.consentForms = objects.consentForms;
        this.learningStyleForms = objects.learningStyleForms;
        this.stage1 = this.data.filter(x => x.suitability);
        this.stage2 = this.data.filter(x => !x.suitability && x.consent && x.learningStyle);
        this.stage3 = this.data.filter(x => !x.suitability && !x.consent && !x.learningStyle);
        this.stage4 = this.data.filter(x => !x.suitability && !x.consent && !x.learningStyle && x.banner && x.cam);
        this.doughnutChartLabels = ['Suitability', 'Consent/Learning Style', 'Banner/CAM', 'Transfer Ready'];
        this.doughnutChartData = [this.stage1.length, this.stage2.length, this.stage3.length, this.stage4.length];
        this.doughnutChartType = 'doughnut';
        this.addSuitability = false;
        this.statusReport = true;

    }

    addClient() {
        this.router.navigate(['/suitability']);
    }

    deleteAlert(client: Client) {
        swal({
            title: 'Delete client (' + client.firstName + ' ' + client.lastName + ')?',
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
            this.deleteClient(client);
          }
        }).catch(error => {
          //console.log("Canceled");
        });
    }

    deleteClient(client: Client) {
        event.stopPropagation();
        this.clientService
            .delete(client)
            .then(res => {
                this.showStatusReport();
                this.data = this.data.filter(h => h !== client);
                this.allClients = this.allClients.filter(h => h !== client);
                this.stage1 = this.data.filter(x => x.suitability);
                this.stage2 = this.data.filter(x => !x.suitability && x.consent && x.learningStyle);
                this.stage3 = this.data.filter(x => !x.suitability && !x.consent && !x.learningStyle);
                this.stage4 = this.data.filter(x => !x.suitability && !x.consent && !x.learningStyle && x.banner && x.cam);
                this.doughnutChartData = [this.stage1.length, this.stage2.length, this.stage3.length, this.stage4.length];
                swal(
                    'Deleted!',
                    'Client record has been deleted.',
                    'success'
                );
                this.clientTotal = this.data.length;
            })
            .catch(error => this.error = error);
    }

    showClientView(client: Client) {
        this.clientView = client;
        this.resetView();
        this.showGeneral = true;

        var suitabilityForm = this.getSuitabilityFormByFilter(client.userID);
        this.suitabilityView = suitabilityForm[0];

        var consentForms = this.getConsentFormByUserID(client.userID);
        this.clientConsentForms = consentForms;
        // this.clientConsentForms.sort(function compare(a, b) {
        //   var dateA = new Date(a.date.getTime());
        //   var dateB = new Date(b.date.getTime());
        //   return dateA - dateB;
        // });
        //this.consentView = consentForms[0];

        var learningStyleForm = this.getLearningStyleFormByFilter(client.userID);
        this.learningStyleView = learningStyleForm[0];
        if (this.learningStyleView) {
          this.barChartData = [{ data: [this.learningStyleView.hearing, this.learningStyleView.seeing, this.learningStyleView.doing]}];
        }
    }

    getSuitabilityFormByFilter(id) {
        return this.suitabilityForms.filter(x => x.userID === id);
    }

    getConsentFormByUserID(id) {
        return this.consentForms.filter(x => x.userID === id);
    }

    getConsentFormByConsentID(id) {
        id = +id;
        var consentForm = this.clientConsentForms.filter(x => x.consentID === id);
        return consentForm;
    }

    getLearningStyleFormByFilter(id) {
        return this.learningStyleForms.filter(x => x.userID === id);
    }

    sectionBtnClicked(event, section) {
        if (section === "general") {
          this.resetView();
            this.showGeneral = true;
        } else if (section === "suitability") {
          this.resetView();
            this.showSuitability = true;
        } else if (section === "consent") {
          this.resetView();
            this.showConsent = true;
        } else if (section === "learningStyle") {
          this.resetView();
            this.showLearningStyle = true;
        }
    }

    showStatusReport() {
        this.showSuitabilityEdit = false;
        this.showGeneralInfoEdit = false;
        this.addSuitability = false;
        this.statusReport = true;
        this.clientSuitability = null;
        this.clientView = null;
        this.addSuitability = false;
    }

    chartClicked(e: any): void {
        try {
            var index = e.active[0]._index;
            if (index === 0) {
                this.data = this.allClients.filter(x => x.suitability);
            } else if (index === 1) {
                this.data = this.allClients.filter(x => !x.suitability && x.consent && x.learningStyle);
            } else if (index === 2) {
                this.data = this.allClients.filter(x => !x.suitability && !x.consent && !x.learningStyle);
            } else if (index === 3) {
                this.data = this.allClients.filter(x => !x.suitability && !x.consent && !x.learningStyle && x.banner && x.cam);
            }
        } catch (err) {
            this.data = this.allClients;
        }
    }

    chartHovered(e: any): void {

    }

    createAsStudent(client: Client) {
      if (client.studentNumber === 'TBD') {
        this.studentNumber(client);
      } else {
        swal({
            title: 'Student Number',
            type: 'info',
            text: 'Previously attended georgian: ' + client.studentNumber,
            input: "text",
            inputPlaceholder: 'Please re-enter student number displayed above',
            showCancelButton: true,
            animation: "slide-from-top",
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Save'
        }).then(isConfirm => {
          if (isConfirm.dismiss === "cancel" || isConfirm.dismiss === "overlay") {
            console.log(isConfirm.dismiss);
          } else if (isConfirm) {
            client.studentNumber = isConfirm.value;
            this.removeAlert(client);
          }
        }).catch(error => {
          console.log(error); // TODO: Display error message
        });
      }

    }

    studentNumber(client) {
      swal({
          title: 'Student Number',
          type: 'info',
          text: 'Please enter student number for ' + client.firstName + ' ' + client.lastName + '',
          input: "text",
          inputPlaceholder: "Enter Student Number",
          showCancelButton: true,
          animation: "slide-from-top",
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Save'
      }).then(isConfirm => {
        if (isConfirm.dismiss === "cancel" || isConfirm.dismiss === "overlay") {
          console.log(isConfirm.dismiss);
        } else if (isConfirm) {
          client.studentNumber = isConfirm.value;
          this.removeAlert(client);
        }
      }).catch(error => {
        console.log(error); // TODO: Display error message
      });
    }

    removeAlert(client) {
      if (client.studentNumber == null || client.studentNumber === '') {
        this.studentNumber(client);
      } else {
        swal({
            title: 'Transfer client (' + client.firstName + ' ' + client.lastName + ')?',
            text: 'Are you sure you want to create as student with #' + client.studentNumber + '?',
            type: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, transfer!'
        }).then(isConfirm => {
          if (isConfirm.dismiss === "cancel" || isConfirm.dismiss === "overlay") {
            console.log(isConfirm.dismiss);
          } else if (isConfirm) {
            swal({
              title: 'Transferring...'
            });
            swal.showLoading();
            this.studentService
                .postNew(client)
                .then(result => {
                  console.log(result);
                  if (result.status === 'success') {
                    this.removeFromClientTable(client.userID);
                  } else {
                    swal(
                        'Error',
                        'Something went wrong, please try again.',
                        'warning'
                    );
                  }
                })
                .catch(error => this.error = error); // TODO: Display error message
          }
        }).catch(error => {
          console.log(error); // TODO: Display error message
        });
      }
    }

    removeFromClientTable(userID): void {
      event.stopPropagation();
      this.clientService
          .removeFromClientTable(userID)
          .then(res => {
              this.data = this.data.filter(h => h.userID !== userID);
              this.stage3 = this.data.filter(x => x.userID !== userID && !x.suitability && !x.consent && !x.learningStyle);
              this.stage4 = this.data.filter(x => x.userID !== userID && !x.suitability && !x.consent && !x.learningStyle && x.banner && x.cam);
              this.doughnutChartData = [this.stage1.length, this.stage2.length, this.stage3.length, this.stage4.length];
              swal.close();
              swal(
                  'Transfered',
                  'Client record has been transfered to the student table.',
                  'success'
              );
              this.router.navigate(['/students']);
              //this.clientTotal = this.data.length;
          })
          .catch(error => this.error = error);
    }

    addSuitabilityInfo(client) {
      this.clientView = client;
      this.addSuitability = true;
      this.showGeneral = false;
      this.showConsent = false;
      this.showLearningStyle = false;
      this.showSuitabilityEdit = false;
      this.statusReport = false;
      this.suitabilityForm = new SuitabilityForm();
      this.suitabilityForm.transcript = false;
      this.suitabilityForm.appropriateGoal = false;
      this.suitabilityForm.isValidAge = false;
      this.suitabilityForm.governmentID = false;
      this.suitabilityForm.schoolRegistration = false;
      this.suitabilityForm.availableDuringClass = false;
      this.suitabilityForm.factorHealth = false;
      this.suitabilityForm.factorInstructions = false;
      this.suitabilityForm.factorCommunication = false;
      this.suitabilityForm.factorLanguage = false;
      this.suitabilityForm.factorComputer = false;
      this.suitabilityForm.factorHousing = false;
      this.suitabilityForm.factorTransportation = false;
      this.suitabilityForm.factorDaycare = false;
      this.suitabilityForm.factorInternet = false;
      this.suitabilityForm.factorPersonal = false;
      this.clientSuitability = client;
    }

    editGeneralInfo(client) {
      this.statusReport = false;
      this.clientEdit = client;
      this.showGeneral = false;
      this.showGeneralInfoEdit = true;
    }

    updateGeneralInfo() {
      swal({
        title: 'Updating...'
      });
      swal.showLoading();
      this.clientService
        .updateGeneralInfo(this.clientEdit)
        .then( res => {
          this.showGeneralInfoEdit = false;
          this.clientView = null;
          this.ngOnInit();
          swal.close();
        })
        .catch();
    }

    editSuitability(client) {
      this.showGeneralInfoEdit = false;
      this.statusReport = false;
      this.showSuitability = false;
      this.addSuitability = false;
      this.showSuitabilityEdit = true;
      this.suitabilityForm = this.getSuitabilityFormByFilter(client.userID)[0];

      var keys = Object.keys(this.suitabilityForm);
      for (var i = 0; i < keys.length; i++) {
          if (typeof this.suitabilityForm[keys[i]] === "string") {
              if (this.suitabilityForm[keys[i]] === "true") {
                  this.suitabilityForm[keys[i]] = true;
              } else if (this.suitabilityForm[keys[i]] === "false") {
                  this.suitabilityForm[keys[i]] = false;
              } else if (this.suitabilityForm[keys[i]] == null) {
                  this.suitabilityForm[keys[i]] = false;
              }
          }
      }
      this.clientSuitability = client;
    }

    saveSuitability() {
      swal({
        title: 'Saving...'
      });
      swal.showLoading();
      if (this.suitabilityForm.suitabilityID) {
        this.tallyPoints();
        this.suitabilityForm.dbTotalPoints = this.totalPoints;
        this.clientService
          .updateSuitability(this.suitabilityForm)
          .then( res => {
            this.showSuitabilityEdit = false;
            this.clientView = null;
            this.ngOnInit();
            swal.close();
          })
          .catch();
      } else {
        this.tallyPoints();
        this.suitabilityForm.dbTotalPoints = this.totalPoints;
        this.clientService
          .addSuitability(this.clientSuitability, this.suitabilityForm)
          .then( res => {
            this.showSuitabilityEdit = false;
            this.clientView = null;
            this.ngOnInit();
            swal.close();
          })
          .catch();
      }

    }

    calculate() {
      this.tallyPoints();
      this.calculated = true;
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

      if (this.suitabilityForm.factorHealth === true) { factorPoints++; }
      if (this.suitabilityForm.factorInstructions === true) { factorPoints++; }
      if (this.suitabilityForm.factorCommunication === true) { factorPoints++; }
      if (this.suitabilityForm.factorLanguage === true) { factorPoints++; }
      if (this.suitabilityForm.factorComputer === true) { factorPoints++; }
      if (this.suitabilityForm.factorHousing === true) { factorPoints++; }
      if (this.suitabilityForm.factorTransportation === true) { factorPoints++; }
      if (this.suitabilityForm.factorDaycare === true) { factorPoints++; }
      if (this.suitabilityForm.factorInternet === true) { factorPoints++; }
      if (this.suitabilityForm.factorPersonal === true) { factorPoints++; }

      if (factorPoints >= 0 && factorPoints <= 4) { this.partBPoints = 3; } else if
      (factorPoints >= 5 && factorPoints <= 8) { this.partBPoints = 2; } else if
      (factorPoints >= 9) { this.partBPoints = 1; }

      this.totalPoints = this.partAPoints + this.partBPoints;

      if (this.totalPoints < 18) { this.warning = true; }
    }

    allowClientToEdit(client, permission) {
      this.clientService
        .grantConsentEditPermission(client, permission)
        .then( res => {
          console.log(res);
          if (res.status === 'granted') {
            this.clientView.editConsentRequest = false;
            swal(
                'Client Access Granted',
                'Client will be sent an email informing that they can now edit conesnt.',
                'success'
            );
          } else if (res.status === 'denied') {
            this.clientView.editConsentRequest = false;
            swal(
                'Client Access Denied',
                'Client will be sent an email informing that they can NOT edit conesnt.',
                'danger'
            );
          }
        }).catch();
      // if (value) {
      //   console.log(client);
      //   console.log("Access granted: " + value);
      // } else {
      //   console.log(client);
      //   console.log("Access denied: " + value);
      // }
    }

    checkboxChange(client) {
      this.clientService
        .updateBannerCamBool(client)
        .then( res => {
          this.ngOnInit();
        })
        .catch();

      if (client.banner && client.cam) {
        this.stage3 = this.data.filter(x => !x.suitability && !x.consent && !x.learningStyle && !x.banner && !x.cam);
        this.stage4 = this.data.filter(x => !x.suitability && !x.consent && !x.learningStyle && x.banner && x.cam);
      } else {
        this.stage3 = this.data.filter(x => !x.suitability && !x.consent && !x.learningStyle);
        this.stage4 = this.data.filter(x => !x.suitability && !x.consent && !x.learningStyle && x.banner && x.cam);
      }

      this.doughnutChartData = [this.stage1.length, this.stage2.length, this.stage3.length, this.stage4.length];
    }

    onSelectChange(event) {
      var consentForm = this.getConsentFormByConsentID(this.selectedConsentForm);
      this.consentView = consentForm[0];
    }

    resetView() {
      this.statusReport = false;
      this.showGeneral = false;
      this.showGeneralInfoEdit = false;
      this.showConsent = false;
      this.showLearningStyle = false;
      this.showSuitability = false;
      this.showSuitabilityEdit = false;
      this.addSuitability = false;
    }

    goBack() {
        window.history.back();
    }
}
