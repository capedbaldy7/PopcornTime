export type MovieRes = {
    count: number;
    next: string | null;
    previous: string | null;
    results: MovieTypes[];
  };
  
  export type MovieTypes = {
    description: string;
    genres: string;
    title: string;
    uuid: string;
  };