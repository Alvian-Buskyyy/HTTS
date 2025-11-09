const HalalTraceability = artifacts.require("HalalTraceability");

module.exports = function (deployer) {
  deployer.deploy(HalalTraceability);
};
