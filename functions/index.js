const path = require('path');
const { onRequest } = require('firebase-functions/v2/https');
const next = require('next');

// Change to project root so Next.js can find its build
process.chdir(path.resolve(__dirname, '..'));

const nextApp = next({ dev: false });
const handle = nextApp.getRequestHandler();

exports.nextApp = onRequest(
  {
    cpu: 2,
    memory: '1GiB',
    timeoutSeconds: 120,
    minInstances: 0,
    maxInstances: 10,
  },
  async (req, res) => {
    await nextApp.prepare();
    return handle(req, res);
  }
);
