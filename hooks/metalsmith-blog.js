const exec             = require('child_process').exec;
const workingDirNormal = '/var/www/metalsmith-blog/';
const workingDirTor    = '/var/www/tor/metalsmith-blog/';

const torEnv       = process.env;
torEnv.BLOG_DOMAIN = 'http://o7wdpwqkabsjqjby.onion/';

/**
 * Run hook
 * @param payload
 */
exports.run = ( payload ) => {
  console.log('Executing : metalsmith-blog : Build');

  Promise.all([
    // Normal
    new Promise(( resolve, reject ) => {
      exec(`cd ${workingDirNormal} && git pull && npm install && npm run build`, err => {
        if ( err ) return reject(err);
        return resolve()
      })
    }),
    // Tor
    new Promise(( resolve, reject ) => {
      exec(`cd ${workingDirTor} && git pull && npm install && npm run build`, { env : torEnv }, err => {
        if ( err ) return reject(err);
        return resolve()
      })
    })
  ])
  .catch(err => console.log('ERROR : metalsmith-blog : Build'))
};