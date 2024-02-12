const { crawlPage, printReport } = require('./crawler.js')

async function main() {
  if (process.argv.length <= 2 || process.argv.length > 3) {
    console.log('One arg expected.')
    process.exit(1)
  }
  let url = process.argv[2]
  try {
    if (!url.startsWith('http')) {
      url = 'https://' + url
    }
    url = new URL(url).href
  } catch (err) {
    console.log(err)
    process.exit(1)
  }
  const baseURL = url.replace(/\/$/, '');
  const pages = await crawlPage(baseURL, url, {})
  printReport(pages)
}



main()
