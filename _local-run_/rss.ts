// import https from 'https';
// import * as fs from 'fs';

// // Replace 'your_rss_feed_url' with your actual RSS feed URL
// const rssFeedUrl = new URL('https://feeds.buzzsprout.com/2130021.rss');

// https.get(rssFeedUrl, (response) => {
//   let data = '';

//   // A chunk of data has been received.
//   response.on('data', (chunk) => {
//     data += chunk;
//   });

//   // The whole response has been received. Print out the result.
//   response.on('end', () => {
//     fs.writeFileSync('rss_feed.xml', data, 'utf8');
//     console.log('RSS feed downloaded successfully.');
//   });
// }).on("error", (err) => {
//   console.error("Error downloading RSS feed: " + err.message);
// });
