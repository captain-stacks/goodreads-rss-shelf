export default async function handler(req, res) {
  const url = 'https://goodreads.com/review/list_rss/' + req.query.url
  const text = await fetch(url).then(res => res.text())
  res.send(text)
}