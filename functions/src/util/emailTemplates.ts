interface EmailTemplateBase {
  title: string;
  notes?: string;
  date: string;
  phone: string;
  repairType: string;
  phoneScreenColor?: string;
  price: number;
}

interface EmailTemplatePickup extends EmailTemplateBase {
  deliveryType: "pick-up";
  pickUpLocation: string;
}

interface EmailTemplateDropoff extends EmailTemplateBase {
  deliveryType: "drop-off";
}

export type EmailTemplate = EmailTemplatePickup | EmailTemplateDropoff;

export const createEmailTemplate = (options: EmailTemplate): string => {
  return (
    "<div>" +
    `<h1>${options.title}</h1>` +
    "<p>" +
    `Date: ${options.date}` +
    "<br />" +
    `Phone: ${options.phone}` +
    "<br />" +
    `Repair Type: ${options.repairType}` +
    "<br />" +
    (options.repairType === "screen"
      ? `Phone Screen Color: ${options.phoneScreenColor}<br />`
      : "") +
    `Delivery Type: ${options.deliveryType}` +
    "<br />" +
    (options.deliveryType === "pick-up"
      ? `Pick-up Location: ${options.pickUpLocation}<br />`
      : "") +
    `Price: £${options.price}` +
    "<br />" +
    (options.notes
      ? "<br /><i>" + "Notes: " + "<br />" + options.notes + "</i>"
      : "") +
    "</p>" +
    "</div>"
  );
};
