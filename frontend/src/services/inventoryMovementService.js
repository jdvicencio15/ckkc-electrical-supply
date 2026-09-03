
import inventoryMovementApi from "../api/inventoryMovementApi";

const inventoryMovementService = {
  getInventoryMovements: async () => {
    const data =
      await inventoryMovementApi.getInventoryMovements();

    return data;
  },

  getInventoryMovementById: async (id) => {
    const data =
      await inventoryMovementApi.getInventoryMovementById(id);

    return data;
  },

  createInventoryMovement: async (movementData) => {
    const data =
      await inventoryMovementApi.createInventoryMovement(
        movementData
      );

    return data;
  },

  updateInventoryMovement: async (id, movementData) => {
    const data =
      await inventoryMovementApi.updateInventoryMovement(
        id,
        movementData
      );

    return data;
  },

  deleteInventoryMovement: async (id) => {
    const data =
      await inventoryMovementApi.deleteInventoryMovement(id);

    return data;
  },
};

export default inventoryMovementService;
