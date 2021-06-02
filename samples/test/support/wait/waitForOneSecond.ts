export default async () => 
  await browser.waitUntil(() => new Promise(resolve => setTimeout(resolve.bind(this, true), 1000)));
