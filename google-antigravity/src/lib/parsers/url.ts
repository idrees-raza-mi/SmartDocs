import * as cheerio from 'cheerio';

export async function parseUrl(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch URL: ${response.statusText}`);
  }
  
  const html = await response.text();
  const $ = cheerio.load(html);
  
  $('script, style, noscript, nav, footer, header, iframe, svg').remove();
  
  const text = $('body').text();
  return text.replace(/\s+/g, ' ').trim();
}
