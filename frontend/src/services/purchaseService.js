
import purchaseApi from "../api/purchaseApi";

const purchaseService = {
  getPurchases: async () => {
    const data = await purchaseApi.getPurchases();

    return data;
  },

  getPurchaseById: async (id) => {
    const data = await purchaseApi.getPurchaseById(id);

    return data;
  },

  createPurchase: async (purchaseData) => {
    const data = await purchaseApi.createPurchase(purchaseData);

    return data;
  },

  updatePurchase: async (id, purchaseData) => {
    const data = await purchaseApi.updatePurchase(id, purchaseData);

    return data;
  },

  deletePurchase: async (id) => {
    const data = await purchaseApi.deletePurchase(id);

    return data;
    },

  receivePurchase: async (id) => {
  const data = await purchaseApi.receivePurchase(id);

  return data;
},

};

export default purchaseService;

