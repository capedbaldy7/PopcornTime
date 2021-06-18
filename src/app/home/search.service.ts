import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { map, tap } from "rxjs/operators";
import { SearchResult } from "./search-result";

@Injectable()
export class SearchService {
  constructor() {}

  search(searchString: string): Observable<SearchResult[]> {
    return of([
      {
        name: "James",
        age: 25
      },
      {
        name: "Mark",
        age: 26
      },
      {
        name: "Damien",
        age: 28
      },
      {
        name: "Lucian",
        age: 30
      },
      {
        name: "Jamie",
        age: 30
      }
    ]).pipe(
      map(results =>
        results.filter(({ name }) =>
          name.toLowerCase().includes(searchString.toLowerCase())
        )
      ),
      tap(results => console.log("Mock API was called!", results))
    );
  }
}
