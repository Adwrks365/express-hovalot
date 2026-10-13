/** Public Insytix embed — safe in client HTML (dashboard-provided). */
export const INSYTIX_TRACKING_ID = "ins_q5dlwe9ooduy";
export const INSYTIX_ENDPOINT = "https://wogiywmqsluwqpacmeca.supabase.co/functions/v1/track";
export const INSYTIX_SCRIPT_URL = "https://insytix.co/tf.js";

export function isInsytixEnabled(): boolean {
  return process.env.NEXT_PUBLIC_INSYTIX_ENABLED !== "false";
}
