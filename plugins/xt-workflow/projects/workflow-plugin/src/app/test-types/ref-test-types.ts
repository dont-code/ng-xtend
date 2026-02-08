export type BookGenreTestType = {
  name:string;
};

export type BookTestType = {
  name:string,
  authorRef: AuthorTestType,
  genreRef: BookGenreTestType
}

export type AuthorTestType = {
  fullName:string,
  born:Date,
  city:string
}
