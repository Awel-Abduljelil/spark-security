export interface PaymentMethod {
  type: string;
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
  mobileMoneyNumber?: string;
}

export const paymentMethods: PaymentMethod[] = [
  {
    type: "Bank transfer",
    bankName: "Placeholder Bank",
    accountName: "Academy Account Name",
    accountNumber: "0000000000",
  },
  {
    type: "Mobile money",
    mobileMoneyNumber: "09XX XXX XXX",
  },
];

export const paymentReferenceInstruction =
  "Include your phone number in the transfer reference so we can match your payment.";
