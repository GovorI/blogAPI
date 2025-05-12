// export type blogViewModel = {
//   _id: string;
//   name: string;
//   description: string;
//   websiteUrl: string;
//   createdAt: string;
//   isMembership: boolean;
// };

// export type postViewModel = {
//   _id: string;
//   title: string;
//   shortDescription: string;
//   content: string;
//   blogId: string;
//   blogName: string;
//   createdAt: string;
// };

// type dbType = {
//   blogs: Array<blogViewModel>;
//   posts: Array<postViewModel>;
// };

// export type ReadonlyDBType = {
//   blogs: Readonly<blogViewModel[]>;
//   posts: Readonly<postViewModel[]>;
// };

// export const db: dbType = {
//   blogs: [
//     {
//       _id: "1",
//       name: "name",
//       description: "string",
//       websiteUrl: "string",
//       createdAt: "2025-03-15T20:34:50.997Z",
//       isMembership: false,
//     },
//   ],
//   posts: [
//     {
//       _id: "1",
//       title: "string",
//       shortDescription: "string",
//       content: "string",
//       blogId: "string",
//       blogName: "string",
//       createdAt: "2025-03-15T20:34:50.997Z",
//     },
//   ],
// };

// export const setDB = (dataset?: Partial<ReadonlyDBType>) => {
//   if (!dataset) {
//     // если в функцию ничего не передано - то очищаем базу данных
//     db.blogs = [];
//     db.posts = [];
//     return;
//   }

//   // если что-то передано - то заменяем старые значения новыми,
//   // не ссылки - а глубокое копирование, чтобы не изменять dataset
//   db.blogs = dataset.blogs?.map((b) => ({ ...b })) || db.blogs;
//   db.posts = dataset.posts?.map((p) => ({ ...p })) || db.posts;
// };
