import { PaymentSuccess } from "@/components/payment-success";

export const metadata = { title: "Payment confirmed" };

export default function PaymentSuccessPage() {
  return <main className="shell"><PaymentSuccess /></main>;
}
