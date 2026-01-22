// Main service index - exports all transaction services
const entityValidation = require("./entityValidation.service");
const transactionFlowValidation = require("./transactionFlowValidation.service");
const itemOwnershipValidation = require("./itemOwnershipValidation.service");
const ownershipTransfer = require("./ownershipTransfer.service");
const transactionService = require("./transaction.service");
const verificationService = require("./verification.service");
const queryService = require("./query.service");

module.exports = {
  // Entity validation
  validateEntity: entityValidation.validateEntity,

  // Transaction flow validation
  validateTransactionFlow: transactionFlowValidation.validateTransactionFlow,

  // Item ownership validation
  validateSapiOwnership: itemOwnershipValidation.validateSapiOwnership,
  validateDagingFullOwnership: itemOwnershipValidation.validateDagingFullOwnership,
  validatePartialDagingSale: itemOwnershipValidation.validatePartialDagingSale,
  getTotalOwnedWeight: itemOwnershipValidation.getTotalOwnedWeight,
  getTotalSoldWeight: itemOwnershipValidation.getTotalSoldWeight,

  // Ownership transfer
  transferSapiOwnership: ownershipTransfer.transferSapiOwnership,
  transferDagingOwnership: ownershipTransfer.transferDagingOwnership,
  transferFullDagingOwnership: ownershipTransfer.transferFullDagingOwnership,
  recordPartialDagingSale: ownershipTransfer.recordPartialDagingSale,

  // Transaction CRUD
  createTransaction: transactionService.createTransaction,
  getTransactionById: transactionService.getTransactionById,
  updateTransaction: transactionService.updateTransaction,
  cancelTransaction: transactionService.cancelTransaction,

  // Verification
  verifyAndTransferOwnership: verificationService.verifyAndTransferOwnership,
  rejectVerification: verificationService.rejectVerification,

  // Query
  getIncomingTransactions: queryService.getIncomingTransactions,
  getOutgoingTransactions: queryService.getOutgoingTransactions,
  getAllEntityTransactions: queryService.getAllEntityTransactions,
};
