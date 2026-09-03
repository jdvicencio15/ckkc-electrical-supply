
import API from "./axios";

const inventoryMovementApi = {
  getInventoryMovements: async () => {
    const response = await API.get("/inventory-movements");
    return response.data;
  },

  getInventoryMovementById: async (id) => {
    const response = await API.get(`/inventory-movements/${id}`);
    return response.data;
  },

  createInventoryMovement: async (movementData) => {
    const response = await API.post(
      "/inventory-movements",
      movementData
    );
    return response.data;
  },

  updateInventoryMovement: async (id, movementData) => {
    const response = await API.put(
      `/inventory-movements/${id}`,
      movementData
    );
    return response.data;
  },

  deleteInventoryMovement: async (id) => {
    const response = await API.delete(
      `/inventory-movements/${id}`
    );
    return response.data;
  },
};

export default inventoryMovementApi;

