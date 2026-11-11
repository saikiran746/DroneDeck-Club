const app = require('./app');
require('./database/database');

const HOST = '0.0.0.0';
const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, HOST, () => {
  console.log(`Server is listening on http://${HOST}:${PORT}`);
});
