const exec       = require('child_process').exec;
const workingDir = '/var/www/metalsmith-blog/';

/**
 * Run hook
 * @param payload
 */
exports.run = ( payload ) => {
  console.log('Executing : metalsmith-blog : Build');

  return new Promise(( resolve, reject ) => {
    exec(`cd ${workingDir} && git pull && npm run build`, err => {
      if ( err ) return reject(err);
      return resolve()
    })
  })
    .catch(err => console.log('ERROR : metalsmith-blog : Build'))
};