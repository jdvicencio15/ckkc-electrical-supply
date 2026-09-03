const Customer = require("../models/Customer");

const Sale = require("../models/Sale");

// GET ALL CUSTOMERS
const getCustomers = async (req, res, next) => {
  try {
    const customers = await Customer.find().sort({ name: 1 });

    const customerStats = await Sale.aggregate([
      {
        $match: {
          status: {
            $ne: "cancelled",
          },
        },
      },
      {
        $group: {
          _id: "$customerId",
          totalOrders: {
            $sum: 1,
          },
          totalPurchases: {
            $sum: "$totalAmount",
          },
        },
      },
    ]);

    const statsMap = new Map(
      customerStats.map((stat) => [
        stat._id.toString(),
        {
          totalOrders: stat.totalOrders,
          totalPurchases: stat.totalPurchases,
        },
      ])
    );

    const customersWithStats = customers.map((customer) => {
      const stats = statsMap.get(customer._id.toString());

      return {
        ...customer.toObject(),
        totalOrders: stats?.totalOrders || 0,
        totalPurchases: stats?.totalPurchases || 0,
      };
    });

    res.status(200).json({
      success: true,
      count: customersWithStats.length,
      customers: customersWithStats,
    });
  } catch (error) {
    next(error);
  }
};

// GET SINGLE CUSTOMER
const getCustomerById = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    res.status(200).json({
      success: true,
      customer,
    });
  } catch (error) {
    next(error);
  }
};

// CREATE CUSTOMER
const createCustomer = async (req, res, next) => {
  try {
    const {
      customerCode,
      name,
      contactPerson,
      email,
      phone,
      address,
      status,
    } = req.body;

    const customer = await Customer.create({
      customerCode,
      name,
      contactPerson,
      email,
      phone,
      address,
      status,
    });

    res.status(201).json({
      success: true,
      customer,
    });
  } catch (error) {
    next(error);
  }
};

// UPDATE CUSTOMER
const updateCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    const {
      customerCode,
      name,
      contactPerson,
      email,
      phone,
      address,
      status,
    } = req.body;

    if (customerCode !== undefined) {
      customer.customerCode = customerCode;
    }

    if (name !== undefined) {
      customer.name = name;
    }

    if (contactPerson !== undefined) {
      customer.contactPerson = contactPerson;
    }

    if (email !== undefined) {
      customer.email = email;
    }

    if (phone !== undefined) {
      customer.phone = phone;
    }

    if (address !== undefined) {
      customer.address = address;
    }

    if (status !== undefined) {
      customer.status = status;
    }

    await customer.save();

    res.status(200).json({
      success: true,
      customer,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE CUSTOMER
const deleteCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Customer deleted",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
};