import React, { useCallback, useState } from "react";
import Button from "../Button";
import Input from "../Input";
import styles from "./index.module.scss";

export interface Address {
  address: string;
  postcode: string;
  city: string;
}

export interface AddressFormProps {
  onSave?: (address: Address) => void;
}

const AddressForm = ({ onSave = () => {} }: AddressFormProps): JSX.Element => {
  const [address, setAddress] = useState<Address>({
    address: "",
    postcode: "",
    city: "",
  });
  const [error, setError] = useState("");

  const validate = useCallback(() => {
    if (!(address.address && address.postcode && address.city)) {
      setError("Please fill all fields");
      return false;
    }

    return true;
  }, [address]);

  const clearError = useCallback(() => {
    setError("");
  }, []);

  return (
    <div className={styles.AddressForm}>
      <Input
        placeholder="Address"
        onChange={(e) => {
          clearError();
          setAddress((cur) => ({
            ...cur,
            address: e.target.value || "",
          }));
        }}
      />
      <Input
        placeholder="Postcode"
        onChange={(e) => {
          clearError();
          setAddress((cur) => ({
            ...cur,
            postcode: e.target.value || "",
          }));
        }}
      />
      <Input
        placeholder="City"
        onChange={(e) => {
          clearError();
          setAddress((cur) => ({
            ...cur,
            city: e.target.value || "",
          }));
        }}
      />
      {error && <span className={styles.error}>{error}</span>}
      <Button
        onClick={() => {
          if (validate()) {
            onSave(address);
          }
        }}
      >
        Save
      </Button>
    </div>
  );
};

export default AddressForm;
