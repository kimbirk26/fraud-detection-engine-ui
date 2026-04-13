export type Severity = 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH'

export type AlertStatus = 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'FALSE_POSITIVE'

export type TransactionCategory =
  | 'GROCERIES'
  | 'FUEL'
  | 'TRANSFER'
  | 'ENTERTAINMENT'
  | 'UTILITIES'
  | 'TRAVEL'
  | 'ONLINE_PURCHASE'
  | 'ATM_WITHDRAWAL'
  | 'UNKNOWN'

export interface RuleResult {
  ruleName: string
  severity: Severity
  reason: string
}

export interface FraudAlert {
  id: string
  transactionId: string
  customerId: string
  triggeredRules: RuleResult[]
  highestSeverity: Severity
  status: AlertStatus
  createdAt: string
}

export interface AuthTokenResponse {
  token: string
  tokenType: string
  expiresAt: string
}

export interface JwtClaims {
  sub: string
  roles?: string[]
  customerId?: string
  exp?: number
  iat?: number
}

export interface TransactionPayload {
  customerId: string
  amount: number
  merchantId: string
  merchantName: string
  category: TransactionCategory
  currency: string
  countryCode: string
  transactionId?: string
}
