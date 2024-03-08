const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { https } = require('follow-redirects');
const crypto = require('crypto');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

const REGISTRY = 'https://registry.yarnpkg.com';
const ROOT = path.resolve(__dirname, '..');
const ARTIFACTS = path.join(ROOT, 'artifacts');
const UNPACK_DIR = path.join(ARTIFACTS, 'unpack');
const ALG = 'sha384';

function downloadArtifact(version) {
  const fileName = `okta-auth-js-${version}.tgz`;
  const url = `${REGISTRY}/@okta/okta-auth-js/-/${fileName}`;
  const dest = path.join(ARTIFACTS, fileName);
  if (!fs.existsSync(ARTIFACTS)) {
    fs.mkdirSync(ARTIFACTS, { recursive: true });
  }
  const file = fs.createWriteStream(dest);
  const request = https.get(url, function(response) {
    response.pipe(file);
  });

  return new Promise((resolve, reject) => {
    // close() is async, call cb after close completes
    file.on('finish', () => file.close(resolve));
    // check for request error too
    request.on('error', (err) => {
      console.error('ERROR', err);
      fs.unlink(dest);
      reject(err);
    });
    file.on('error', (err) => { // Handle errors
      fs.unlink(dest); // Delete the file async. (But we don't check the result)
      reject(err);
    });
  });
}

function mkdir(dir) {
  fs.mkdirSync(dir, { recursive: true});
}

function unpackArchive(srcFile, destFolder) {
  return new Promise((resolve, reject) => {
    mkdir(destFolder);
    const child = spawn('tar', ['-xf', srcFile, '--strip-components=1'], {
      stdio: 'inherit',
      cwd: destFolder
    });
    child.on('exit', function (code, signal) {
      code == 0 ? resolve() : reject(new Error(`child process exited with code ${code} and signal ${signal}`));
    });
  });
}

async function generateSris(version) {
  // remove unpack folder before start
  try {
    fs.unlinkSync(UNPACK_DIR);
  } catch {
    // do nothing
  }

  const artifact = fs.readdirSync(ARTIFACTS).find(filename => filename.endsWith(`${version}.tgz`));
  if (!artifact) {
    throw new Error('No matched version found');
  }

  if (!fs.existsSync(UNPACK_DIR)) {
    fs.mkdirSync(UNPACK_DIR, { recursive: true });
  }

  const artifactPath = path.join(ARTIFACTS, artifact);
  await unpackArchive(artifactPath, UNPACK_DIR);
  const distDir = path.join(UNPACK_DIR, 'dist');
  const filenames = fs.readdirSync(distDir).filter(file => file.endsWith('.js'));
  for (const filename of filenames) {
    const filePath = path.join(distDir, filename);
    const content = fs.readFileSync(filePath, { encoding: 'utf8' });
    const sri = generateSri(content);
    console.info('calculated sri for file:', filename, sri);
  } 
}

function generateSri(content) {
  const hash = crypto.createHash(ALG).update(content, 'utf8');
  const hashBase64 = hash.digest('base64');
  const sri = `${ALG}-${hashBase64}`;
  return sri;
}

async function main() {
  const argv = yargs(hideBin(process.argv)).argv;
  const version = argv['authjs-version'];
  if (!version) {
    throw new Error('--authjs-version is required');
  }
  await downloadArtifact(version);
  await generateSris(version);
  console.info('sris generated for version', version);
}

main();
