import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AuthenticationService } from '../_services';

@Component({ templateUrl: 'home.component.html' })
export class HomeComponent implements OnInit {
  movies: any;
  allMovies: any[];

  constructor(
    private authenticationService: AuthenticationService,
    private router: Router
  ) {
    // redirect to home if already logged in
    if (this.authenticationService.currentUserValue) {
      this.router.navigate(['/']);
    }
  }

  ngOnInit() {
    const token = JSON.parse(localStorage.getItem('token'));

    const movies = this.authenticationService
      .getMovies(token)
      .subscribe((res) => {
        this.movies = res;
        this.allMovies = this.movies.results;
        console.log(this.allMovies);
      });
  }

  public onClickHandle() {
    const token = JSON.parse(localStorage.getItem('token'));

    this.authenticationService.getMovies(token).subscribe((res) => {
      this.movies = res;
      this.allMovies = this.movies.results;
    });
  }
}