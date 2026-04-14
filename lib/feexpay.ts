const FEEXPAY_BASE_URL = 'https://api.feexpay.me/api'

export interface FeexPayInitOptions {
  amount: number
  currency: 'XOF' | 'XAF'
  description: string
  callback_url: string
  return_url: string
  customer_name: string
  customer_email: string
  customer_phone?: string
  reference: string
  payment_method?: 'mtn' | 'moov' | 'orange'
}

export interface FeexPayResponse {
  status: 'success' | 'error'
  transaction_id?: string
  payment_url?: string
  message?: string
}

export async function initiatePayment(options: FeexPayInitOptions): Promise<FeexPayResponse> {
  try {
    const response = await fetch(`${FEEXPAY_BASE_URL}/transactions/public/requestpayment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.FEEXPAY_API_KEY}`,
      },
      body: JSON.stringify({
        shop: process.env.FEEXPAY_SHOP_ID,
        amount: options.amount,
        currency: options.currency,
        description: options.description,
        callback_url: options.callback_url,
        return_url: options.return_url,
        customer_name: options.customer_name,
        customer_email: options.customer_email,
        customer_phone: options.customer_phone,
        reference: options.reference,
        payment_method: options.payment_method,
      }),
    })

    const data = await response.json()
    return data
  } catch (error) {
    console.error('FeexPay error:', error)
    throw error
  }
}

export async function verifyTransaction(transactionId: string): Promise<{
  status: 'pending' | 'success' | 'failed'
  amount?: number
  reference?: string
}> {
  try {
    const response = await fetch(`${FEEXPAY_BASE_URL}/transactions/${transactionId}`, {
      headers: {
        'Authorization': `Bearer ${process.env.FEEXPAY_API_KEY}`,
      },
    })
    return response.json()
  } catch (error) {
    console.error('FeexPay verify error:', error)
    throw error
  }
}

// Plans pricing in FCFA
export const PLAN_PRICES = {
  premium_monthly: {
    amount: 3500,
    currency: 'XOF' as const,
    label: 'Premium Mensuel',
    description: 'AfricaTransfer Premium — 1 mois',
  },
  premium_yearly: {
    amount: 35000,
    currency: 'XOF' as const,
    label: 'Premium Annuel',
    description: 'AfricaTransfer Premium — 1 an (économisez 17%)',
  },
}
