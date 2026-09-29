import { assertSupabaseConfigured, supabase } from "@/lib/supabase";

export async function submitRegistrationPayment(input: { amount: number; senderPhone: string; transactionReference: string }) {
  assertSupabaseConfigured();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!userData.user) throw new Error("Your account session is not ready. Please sign in and try again.");

  const { error } = await supabase.from("payments").insert({
    user_id: userData.user.id,
    type: "REGISTRATION",
    amount: input.amount,
    transaction_reference: input.transactionReference,
    sender_phone: input.senderPhone,
    status: "PENDING",
  });
  if (error) throw error;
}
