import { useEffect, useState } from "react";

import Modal from "../ui/Modal";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Select from "../ui/Select";

const UserModal = ({
  user = null,
  onSubmit,
  onClose,
  submitting = false,
}) => {
  const isEditing = !!user;

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "sales",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        password: "",
        role: user.role || "sales",
      });
    } else {
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        role: "sales",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const submitData = {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.trim(),
      role: formData.role,
    };

    if (!isEditing) {
      submitData.password = formData.password;
    }

    onSubmit(submitData);
  };

  return (
    <Modal
      isOpen={true}
      onClose={submitting ? undefined : onClose}
      title={isEditing ? "Edit User" : "Add User"}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="First Name"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            placeholder="Enter first name"
            required
            disabled={submitting}
          />

          <Input
            label="Last Name"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            placeholder="Enter last name"
            required
            disabled={submitting}
          />
        </div>

        <Input
          label="Email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Enter email address"
          required
          disabled={submitting}
        />

        {!isEditing && (
          <Input
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter temporary password"
            required
            disabled={submitting}
          />
        )}

        <Select
          label="Role"
          name="role"
          value={formData.role}
          onChange={handleChange}
          disabled={submitting}
          options={[
            { value: "owner", label: "Owner" },
            { value: "admin", label: "Admin" },
            { value: "sales", label: "Sales" },
            {
              value: "purchasing",
              label: "Purchasing",
            },
            {
              value: "accounting",
              label: "Accounting",
            },
          ]}
        />

        <div className="flex justify-end gap-3 border-t border-slate-200 pt-5 dark:border-slate-800">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            loading={submitting}
          >
            {isEditing
              ? "Update User"
              : "Create User"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default UserModal;