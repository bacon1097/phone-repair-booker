export const validateBooking = (data: any): boolean => {
  if (
    !(
      data?.phone &&
      data.date &&
      typeof data.date.toDate === "function" &&
      data.deliveryType &&
      data.repairType
    )
  ) {
    return false;
  }

  if (data.deliveryType === "pick-up") {
    if (
      !(
        data.pickUpLocation?.address &&
        data.pickUpLocation.postcode &&
        data.pickUpLocation.city
      )
    ) {
      return false;
    }
  }

  return true;
};
