import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserStoreService {
  private id$ = new BehaviorSubject<string>('');
  private fullName$ = new BehaviorSubject<string>('');
  private role$ = new BehaviorSubject<string>('');
  private serviceId$ = new BehaviorSubject<string>('');

  constructor() {}

  public getIdFromStore() {
    return this.id$.asObservable();
  }
  public setIdForStore(id: string) {
    this.id$.next(id);
  }

  public getFullNameFromStore() {
    return this.fullName$.asObservable();
  }
  public setFullNameForStore(fullName: string) {
    this.fullName$.next(fullName);
  }

  public getRoleFromStore() {
    return this.role$.asObservable();
  }
  public setRoleForStore(role: string) {
    this.role$.next(role);
  }
  public getServiceIdFromStore() {
    return this.serviceId$.asObservable();
  }
  public setServiceIdForStore(serviceId: string) {
    this.serviceId$.next(serviceId);
  }
}
