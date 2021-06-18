import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormControl } from '@angular/forms';
import { AuthenticationService } from '../_services';
import { MovieTypes } from './types/MovieTypes';
import { ModalService } from '../_modal';
import { defer, merge, Observable, of } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  map,
  tap,
  share,
  switchMap,
} from 'rxjs/operators';

@Component({ templateUrl: 'home.component.html' })
export class HomeComponent implements OnInit {
  movies: any;
  loading: boolean = false;
  nextPageLoading: boolean = false;
  prevPageLoading: boolean = false;
  errorMessage;
  allMovies: MovieTypes[];
  pageNumber: number = 1;
  selectedMovie: MovieTypes;
  searchedMovie: MovieTypes[];

  //search
  public searchControl: FormControl;
  public searchResults$: Observable<MovieTypes[]>;
  public areMinimumCharactersTyped$: Observable<boolean>;
  public ifMinimumCharactersNotTyped$: Observable<boolean>;
  public areNoResultsFound$: Observable<any>;

  constructor(
    private authenticationService: AuthenticationService,
    private router: Router,
    private modalService: ModalService,
    //search
    private formBuilder: FormBuilder
  ) {
    // redirect to home if already logged in
    if (this.authenticationService.currentUserValue) {
      this.router.navigate(['/']);
    }
  }

  ngOnInit() {
    this.loading = true;
    this.errorMessage = '';

    //search
    this.searchControl = this.formBuilder.control('');

    this.areMinimumCharactersTyped$ = this.searchControl.valueChanges.pipe(
      map((searchString) => searchString.length >= 1)
    );

    //  this.ifMinimumCharactersNotTyped$ = this.searchControl.valueChanges.pipe(
    //   map((searchString) => searchString.length < 3)
    //  );

    const searchString$ = merge(
      defer(() => of(this.searchControl.value)),
      this.searchControl.valueChanges
    ).pipe(debounceTime(1000), distinctUntilChanged());

    this.searchResults$ = searchString$.pipe(
      switchMap((searchString: string) => this.search(searchString)),
      share()
    );

    this.areNoResultsFound$ = this.searchResults$.pipe(
      map((results) => results.length < 3)
    );
    //end search

    const token = JSON.parse(localStorage.getItem('token'));

    this.authenticationService.getMovies(token).subscribe(
      (res) => {
        this.movies = res;
        this.allMovies = this.movies.results;
        this.loading = false;
      },
      (error) => {
        console.error('Request failed with error...');
        this.errorMessage = error;
        this.loading = false;
      },
      () => {
        console.error('Request completed!');
        this.loading = false;
      }
    );
  }

  public onFetchMoviesHandle() {
    this.loading = true;
    this.errorMessage = '';
    const token = JSON.parse(localStorage.getItem('token'));

    this.authenticationService.getMovies(token).subscribe(
      (res) => {
        this.movies = res;
        this.allMovies = this.movies.results;
        this.pageNumber = 1;
        this.loading = false;
      },
      (error) => {
        console.error('Request failed with error');
        this.errorMessage = error;
        this.loading = false;
      }
    );
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
    this.nextPageLoading = true;
    this.errorMessage = '';
    const token = JSON.parse(localStorage.getItem('token'));

    const pageNumber = this.movies.next.split('?')[1].split('=')[1];

    this.authenticationService.getNextOrPrevMovies(token, pageNumber).subscribe(
      (res) => {
        this.movies = res;
        this.allMovies = this.movies.results;
        this.pageNumber = this.pageNumber + 1;
        this.nextPageLoading = false;
      },
      (error) => {
        console.error('Request failed with error');
        this.errorMessage = error;
        this.nextPageLoading = false;
      },
      () => {
        console.error('Request completed!');
        this.nextPageLoading = false;
      }
    );
  }

  public onFetchPrevMovies() {
    this.prevPageLoading = true;
    this.errorMessage = '';
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
            this.prevPageLoading = false;
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
            this.prevPageLoading = false;
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

  public search(searchString: string): Observable<MovieTypes[]> {
    if (searchString.length < 3) {
      console.log("true")
      this.onFetchMoviesHandle();
    } 
    return of(this.allMovies).pipe(
      map((movies) =>
        movies.filter(({ title }) =>
          title.toLowerCase().includes(searchString.toLowerCase())
        )
      ),
      tap((movie) => {
        this.allMovies = this.filterMovie(movie);
      })
    );
  }
  public filterMovie(movie: MovieTypes[]) {
    return this.allMovies.filter(
      (movieItem) => movieItem.title === movie[0].title
    );
  }
}