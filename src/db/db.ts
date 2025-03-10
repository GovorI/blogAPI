export type blogViewModel = {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
};

export type postViewModel = {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
};

type dbType = {
  blogs: Array<blogViewModel>;
  posts: Array<postViewModel>;
};

export type ReadonlyDBType = {
  blogs: Readonly<blogViewModel[]>;
  posts: Readonly<postViewModel[]>;
};

export const db: dbType = {
  blogs: [
    {
      id: "1",
      name: "name",
      description: "string",
      websiteUrl: "string",
    },
  ],
  posts: [
    {
      id: "1",
      title: "string",
      shortDescription: "string",
      content: "string",
      blogId: "string",
      blogName: "string",
    },
  ],
};

export const setDB = (dataset?: Partial<ReadonlyDBType>) => {
  if (!dataset) {
    // если в функцию ничего не передано - то очищаем базу данных
    db.blogs = [];
    db.posts = [];
    return;
  }

  // если что-то передано - то заменяем старые значения новыми,
  // не ссылки - а глубокое копирование, чтобы не изменять dataset
  db.blogs = dataset.blogs?.map((b) => ({ ...b })) || db.blogs;
  db.posts = dataset.posts?.map((p) => ({ ...p })) || db.posts;
};
