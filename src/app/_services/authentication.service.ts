import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
  private currentUserSubject: BehaviorSubject<any>;
  public currentUser: Observable<any>;

  constructor(private http: HttpClient) {
    this.currentUserSubject = new BehaviorSubject<any>(
      JSON.parse(localStorage.getItem('token'))
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue() {
    return this.currentUserSubject.value;
  }

  login(username, password) {
    return this.http
      .post<any>(`https://demo.credy.in/api/v1/usermodule/login/`, {
        username,
        password,
      })
      .pipe(
        map((user) => {
          // store user details and jwt token in local storage to keep user logged in between page refreshes
          localStorage.setItem('token', JSON.stringify(user.data.token));
          this.currentUserSubject.next(user);
          return user;
        })
      );
  }

  getMovies(token: string) {
    // headers?: HttpHeaders | { [header: string]: string | string[]; };
    return this.http.get(`https://demo.credy.in/api/v1/maya/movies/`, {
      headers: { Authorization: `Token ${token}` },
    });
  }

  getNextOrPrevMovies(token: string, pageNo?: number) {
    // headers?: HttpHeaders | { [header: string]: string | string[]; };
    return this.http.get(
      pageNo
        ? `https://demo.credy.in/api/v1/maya/movies/?page=${pageNo}`
        : `https://demo.credy.in/api/v1/maya/movies/`,
      {
        headers: { Authorization: `Token ${token}` },
      }
    );
  }

  logout() {
    // remove user from local storage and set current user to null
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
  }
}
