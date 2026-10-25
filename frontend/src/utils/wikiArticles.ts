export interface WikiArticle {
  slug: string;
  category: string;
  title: string;
  summary: string;
  body: string;
}

export function filterWikiArticles(
  articles: WikiArticle[],
  query: string,
  category = "",
) {
  const words = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  return articles.filter(
    (article) =>
      (!category || article.category === category) &&
      words.every((word) =>
        `${article.title} ${article.summary} ${article.body}`
          .toLocaleLowerCase()
          .includes(word),
      ),
  );
}
