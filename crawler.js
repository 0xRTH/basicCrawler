const { JSDOM } = require('jsdom')

function normalizeURL(url) {

  const parsedURL = new URL(url)
  const searchParams = []
  for ([key, value] of parsedURL.searchParams) {
    searchParams.push(`${key}=${value}`)
  }
  searchParams.sort()
  let searchQuery = ""
  if (searchParams.length > 0) {
    searchQuery = "?"
    for (param of searchParams) {
      searchQuery += param + "&"
    }
  }
  const normalizedURL = parsedURL.protocol + "//" + parsedURL.host + parsedURL.pathname + searchQuery.slice(0, -1)
  return decodeURI(normalizedURL).toLowerCase()
};

function getUrlsFromHtml(htmlData, baseURL) {
  const dom = new JSDOM(htmlData)
  const anchorTags = dom.window.document.querySelectorAll('a')
  const urls = []
  for (const link of anchorTags) {
    if (link.toString().startsWith('html')) {
      try {
        urls.push(new URL(link.toString()).href)
      } catch (err) {
        console.log(err + ': ' + link.toString())
      }
    } else if (link.toString().startsWith('/')) {
      try {
        urls.push(baseURL + link.toString())
      } catch (err) {
        console.log(err + ': ' + link.toString())
      }
    }
  }
  return urls
}

async function crawlPage(baseURL, currentURL, pages) {
  currentURL = normalizeURL(currentURL)

  if (!currentURL.startsWith(baseURL)) {
    return pages
  }
  if (currentURL in pages) {
    pages[currentURL] += 1
    return pages
  } else {
    pages[currentURL] = 1
  }

  const res = await fetch(currentURL)
  if (400 <= res.status.slice) {
    return pages
  } else if (!res.headers.get('Content-Type').startsWith('text/html')) {
    return pages
  }

  const html = await res.text()
  const urls = getUrlsFromHtml(html, baseURL)
  for (const url of urls) {
    pages = await crawlPage(baseURL, url, pages)
  }
  return pages
}

function printReport(pages) {
  for (const url in pages) {
    console.log(`Found ${pages[url]} links to ${url}`)
  }
}

module.exports = {
  normalizeURL,
  getUrlsFromHtml,
  crawlPage,
  printReport
}
