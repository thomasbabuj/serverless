'use strict';

const BbPromise = require('bluebird');
const validate = require('./lib/validate');
const initializeResources = require('./lib/initializeResources');
const createStack = require('./lib/createStack');
const uploadDeploymentPackage = require('./lib/uploadDeploymentPackage');
const deployFunctions = require('./lib/deployFunctions');
const updateStack = require('./lib/updateStack');

class AwsDeploy {
  constructor(serverless, options) {
    this.serverless = serverless;
    this.options = options;
    this.provider = 'aws';
    this.aws = this.serverless.getProvider('aws');

    Object.assign(
      this,
      validate,
      initializeResources,
      createStack,
      uploadDeploymentPackage,
      deployFunctions,
      updateStack
    );

    this.hooks = {
      'before:deploy:initializeResources': () => BbPromise.bind(this)
          .then(this.validate),

      'deploy:initializeResources': () => BbPromise.bind(this).then(this.initializeResources),

      'deploy:createProviderStacks': () => BbPromise.bind(this).then(this.createStack),

      'deploy:deploy': () => BbPromise.bind(this)
        .then(this.uploadDeploymentPackage)
        .then(this.deployFunctions)
        .then(this.updateStack)
        .then(() => this.serverless.cli.log('Deployment successful!')),
    };
  }
}

module.exports = AwsDeploy;