import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.development';
import { User } from '../Interfaces/user';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private baseURL = environment.BASE_URL_Auth;
  private userPayload: any;
  constructor(private http: HttpClient, private router: Router) {
    this.userPayload = this.decodedToken();
  }
  getUsers() {
    return this.http.get<any>(this.baseURL);
  }
  getUser(id: string) {
    return this.http.get<any>(`${this.baseURL}getUser?id=` + id);
  }
  getServiceLeaderByServiceId(id: string) {
    return this.http.get(`${this.baseURL}getServiceLeaderByServiceId/` + id, {
      responseType: 'text',
    });
  }
  getUsersByServiceId(id: string) {
    return this.http.get<any>(`${this.baseURL}getUsersByServiceId/` + id);
  }
  addUser(userObj: User) {
    return this.http.post<any>(`${this.baseURL}register`, userObj);
  }
  editUser(userObj: User) {
    return this.http.put(`${this.baseURL}edit`, userObj, {
      responseType: 'text',
    });
  }
  deleteUser(id: string) {
    return this.http.delete(`${this.baseURL}Delete/` + id, {
      responseType: 'text',
    });
  }

  signIn(userObj: User) {
    return this.http.post<any>(`${this.baseURL}authenticate`, userObj);
  }
  tokenExpires() {
    return this.http.get<any>(`${this.baseURL}token`);
  }
  signOut() {
    localStorage.clear();
    this.router.navigate(['login']);
  }
  storeToken(tokenValue: string) {
    localStorage.setItem('token', tokenValue);
  }

  getToken() {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  decodedToken() {
    const jwtHelper = new JwtHelperService();
    const token = this.getToken()!;
    return jwtHelper.decodeToken(token);
  }
  getIdFromToken() {
    if (this.userPayload) {
      return this.userPayload.nameid;
    }
  }
  getFullNameFromToken() {
    if (this.userPayload) {
      return this.userPayload.name;
    }
  }
  getRoleFromToken() {
    if (this.userPayload) {
      return this.userPayload.role;
    }
  }
  getServiceIdFromToken() {
    if (this.userPayload) {
      return this.userPayload.groupsid;
    }
  }
}
