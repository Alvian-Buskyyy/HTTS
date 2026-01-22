/**
 * Validate transaction flow according to business rules
 * @param {string} penjualType - Seller entity type
 * @param {string} pembeliType - Buyer entity type
 * @param {string} itemType - Type of item being sold (sapi/daging)
 * @throws {Error} If transaction flow is invalid
 */
function validateTransactionFlow(penjualType, pembeliType, itemType) {
  const validFlows = {
    sapi: [
      { from: "PETERNAK", to: ["PETERNAK", "PASAR_HEWAN", "JAGAL"] },
      { from: "PASAR_HEWAN", to: ["JAGAL"] },
      { from: "JAGAL", to: ["JAGAL"] },
    ],
    daging: [
      { from: "JAGAL", to: ["DISTRIBUTOR", "HOREKA", "END_CUSTOMER"] },
      { from: "DISTRIBUTOR", to: ["DISTRIBUTOR", "HOREKA", "END_CUSTOMER"] },
      { from: "HOREKA", to: ["END_CUSTOMER"] },
    ],
  };

  const flowRules = validFlows[itemType];
  if (!flowRules) {
    throw new Error(`Tipe item ${itemType} tidak valid`);
  }

  const rule = flowRules.find((r) => r.from === penjualType);
  if (!rule) {
    throw new Error(`${penjualType} tidak bisa menjual ${itemType}`);
  }

  if (!rule.to.includes(pembeliType)) {
    throw new Error(`${penjualType} tidak bisa menjual ${itemType} ke ${pembeliType}`);
  }

  return true;
}

module.exports = {
  validateTransactionFlow,
};
