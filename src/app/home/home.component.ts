import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormControl } from "@angular/forms";
import { AuthenticationService } from '../_services';
import { MovieRes, MovieTypes } from './types/MovieTypes';
import { ModalService } from '../_modal';
import { defer, merge, Observable, of } from "rxjs";
import {
  debounceTime,
  distinctUntilChanged,
  map,
  share,
  switchMap
} from "rxjs/operators";
import { SearchResult } from "./search-result";
import { SearchService } from "./search.service";

@Component({ templateUrl: 'home.component.html' })


export class HomeComponent implements OnInit {
  movies: any;
  allMovies: MovieTypes[];
  pageNumber: number = 1;
  selectedMovie: MovieTypes;
  //search
  public searchControl: FormControl;
  public searchResults$: Observable<SearchResult[]>;
  public areMinimumCharactersTyped$: Observable<boolean>;
  public areNoResultsFound$: Observable<boolean>;

  constructor(
    private authenticationService: AuthenticationService,
    private router: Router,
    private modalService: ModalService,
    //search
    private searchService: SearchService,
    private formBuilder: FormBuilder
  ) {
    // redirect to home if already logged in
    if (this.authenticationService.currentUserValue) {
      this.router.navigate(['/']);
    }
  }

  ngOnInit() {
    //search
    this.searchControl = this.formBuilder.control("");

    this.areMinimumCharactersTyped$ = this.searchControl.valueChanges.pipe(
      map(searchString => searchString.length >= 3)
    );

    const searchString$ = merge(
      defer(() => of(this.searchControl.value)),
      this.searchControl.valueChanges
    ).pipe(
      debounceTime(1000),
      distinctUntilChanged()
    );

    this.searchResults$ = searchString$.pipe(
      switchMap((searchString: string) =>
        this.searchService.search(searchString)
      ),
      share()
    );

    this.areNoResultsFound$ = this.searchResults$.pipe(
      map(results => results.length === 0)
    );
    //end search

    const token = JSON.parse(localStorage.getItem('token'));

    const movies = this.authenticationService
      .getMovies(token)
      .subscribe((res) => {
        this.movies = res;
        this.allMovies = this.movies.results;
        console.log('Fetched');
      });
  }

  public onFetchMoviesHandle() {
    const token = JSON.parse(localStorage.getItem('token'));

    this.authenticationService.getMovies(token).subscribe((res) => {
      this.movies = res;
      this.allMovies = this.movies.results;
    });

  }

  //Modal
  openModal(id: string, movieUUID: string) {
    this.modalService.open(id);
    const filteredMovie = this.allMovies.find(
      (movie) => movie.uuid === movieUUID
    );
    this.selectedMovie = filteredMovie;
  }

  closeModal(id: string) {
    this.modalService.close(id);
  }

  public onFetchNextMovies() {
    const token = JSON.parse(localStorage.getItem('token'));

    const pageNumber = this.movies.next.split('?')[1].split('=')[1];

    try {
      this.authenticationService
        .getNextOrPrevMovies(token, pageNumber)
        .subscribe((res) => {
          this.movies = res;
          this.allMovies = this.movies.results;
          this.pageNumber = this.pageNumber + 1;
        });
    } catch (error) {}
  }

  public onFetchPrevMovies() {
    const url = 'https://demo.credy.in/api/v1/maya/movies/';
    const token = JSON.parse(localStorage.getItem('token'));
    let pageNumber;

    if (this.movies.previous === url) {
      try {
        this.authenticationService
          .getNextOrPrevMovies(token)
          .subscribe((res) => {
            this.movies = res;
            this.allMovies = this.movies.results;
            this.pageNumber = this.pageNumber - 1;
          });
      } catch (error) {}
    } else {
      pageNumber = this.movies.previous.split('?')[1].split('=')[1];
      try {
        this.authenticationService
          .getNextOrPrevMovies(token, pageNumber)
          .subscribe((res) => {
            this.movies = res;
            this.allMovies = this.movies.results;
            this.pageNumber = this.pageNumber - 1;
          });
      } catch (error) {}
    }
  }

  public prevBtnDisabled() {
    if (this.movies.previous === null) {
      return true;
    }
  }

  public nextBtnDisabled() {
    if (this.movies.next === null) {
      return true;
    }
  }
}
