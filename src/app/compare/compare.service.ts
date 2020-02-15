import { Injectable } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/map';

import { CompareData } from './compare-data.model';
import { AuthService } from '../user/auth.service';

@Injectable()
export class CompareService {
  dataEdited = new BehaviorSubject<boolean>(false);
  dataIsLoading = new BehaviorSubject<boolean>(false);
  dataLoaded = new Subject<CompareData[]>();
  dataLoadFailed = new Subject<boolean>();
  userData: CompareData;
  constructor(private http: Http,
              private authService: AuthService) {
  }

  onStoreData(data: CompareData) {
    this.dataLoadFailed.next(false);
    this.dataIsLoading.next(true);
    this.dataEdited.next(false);
    this.userData = data;
    this.authService.getAuthenticatedUser().getSession((err, session) => {
      if (err) {
        return;
      }
      this.http.post('https://u6a276f0mk.execute-api.eu-central-1.amazonaws.com/dev/compare-yourself', data, {
        headers: new Headers({'Authorization': session.getIdToken().getJwtToken()})
      })
        .subscribe(
          (result) => {
            this.dataLoadFailed.next(false);
            this.dataIsLoading.next(false);
            this.dataEdited.next(true);
          },
          (error) => {
            this.dataIsLoading.next(false);
            this.dataLoadFailed.next(true);
            this.dataEdited.next(false);
          }
        );
    });
  }
  onRetrieveData(all = true) {
    this.dataLoaded.next(null);
    this.dataLoadFailed.next(false);
    this.authService.getAuthenticatedUser().getSession((err, session) => {
      const queryParam = '?accessToken=' + session.getAccessToken().getJwtToken();
      let urlParam = 'all';
      if (!all) {
        urlParam = 'single';
      }
      this.http.get('https://u6a276f0mk.execute-api.eu-central-1.amazonaws.com/dev/compare-yourself/' + urlParam + queryParam, {
        headers: new Headers({'Authorization': session.getIdToken().getJwtToken()})
      })
        .map(
          (response: Response) => response.json()
        )
        .subscribe(

          (data) => {
            if (all) {
              this.dataLoaded.next(data);
            } else {
              if (!data) {

                this.dataLoadFailed.next(true);
                return;
              }

              this.userData = data[0];
              this.dataEdited.next(true);
            }
          },
          (error) => {
            this.dataLoadFailed.next(true);
            this.dataLoaded.next(null);
          }
        );
    })
  }
  onDeleteData() {
    this.dataLoadFailed.next(false);
    this.authService.getAuthenticatedUser().getSession((err, session) => {
      const queryParam = '?accessToken=' + session.getAccessToken().getJwtToken();
      this.http.delete('https://u6a276f0mk.execute-api.eu-central-1.amazonaws.com/dev/compare-yourself' + queryParam, {
        headers: new Headers({'Authorization': session.getIdToken().getJwtToken()})
      })
        .subscribe(
          (data) => {
            console.log('deleted_' + data);
          },
          (error) => this.dataLoadFailed.next(true)
        );

    })
  }

  onSlackPost(msg = {'customMessage': 'msg'}) {
    this.http.post('https://u6a276f0mk.execute-api.eu-central-1.amazonaws.com/dev/compare-yourself/slack', msg)
        .subscribe(
          (dummy) => {
            console.log('slack_' + dummy);
          },
          (error) => {
            this.dataLoadFailed.next(true)
            console.log(error);
          }
        );
    }

}
