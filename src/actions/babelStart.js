const path = require('path');
const babelRegister = require('babel-register');
const bunyan = require('bunyan');

babelRegister({
  presets: [
    [
      require.resolve('babel-preset-env'), {
        targets: {
          node: 8
        }
      }
    ]
  ],
  plugins: ['babel-plugin-transform-runtime', 'babel-plugin-transform-decorators-legacy', 'babel-plugin-transform-object-rest-spread'].map(require.resolve)
});

module.exports = (entryFileName, command) => {
  const cluster = require('cluster');
  const numCPUs = require('os')
    .cpus()
    .length;
  const Logger = bunyan.createLogger({ name: `babel-start: ${entryFileName}` });
  if (command.cluster && cluster.isMaster) {
    for (let i = 0; i < numCPUs; i++) {
      cluster.fork();
    }
    cluster.on('listening', worker => {
      Logger.info(`worker [PID:${worker.process.pid}] listening`);
    });
    cluster.on('exit', worker => {
      console.log(`worker [PID:${worker.process.pid}] died`);
    });
  } else {
    require(entryFileName[0] === '/'
      ? entryFileName
      : path.resolve(process.cwd(), entryFileName));
  }
};
