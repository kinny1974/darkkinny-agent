const app = require('./app');
const port = process.env.PORT || 3001;

app.listen(port, () => {
  console.log(`Node.js backend listening on http://localhost:${port}`);
});