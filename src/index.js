const app = require("./app");

// // SSL
// const https = require("https");
// const fs = require("fs");

// // Paths to your SSL certificate and key
// const options = {
//   key: fs.readFileSync("/path/to/your/private.key"),
//   cert: fs.readFileSync("/path/to/your/certificate.crt"),
// };

const port = process.env.PORT || 4000;
app.listen(port, () => {
  /* eslint-disable no-console */
  console.log(`Listening: http://localhost:${port}`);
  /* eslint-enable no-console */
});
