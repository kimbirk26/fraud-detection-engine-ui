export type Uuid = string
export type IsoDateTimeString = string
export type CustomerId = string
export type MerchantId = string
export type CurrencyCode = string
export type CountryCode = string

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

export type UserRole = string

export type AlertCounts = Record<AlertStatus, number>

export type AsyncState<T, E = string> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: E }

export interface RuleResultDto {
  ruleName: string
  severity: Severity
  reason: string
}

export interface FraudAlertDto {
  id: Uuid
  transactionId: Uuid
  customerId: CustomerId
  triggeredRules: readonly RuleResultDto[]
  highestSeverity: Severity
  status: AlertStatus
  createdAt: IsoDateTimeString
}

export interface AuthTokenResponseDto {
  token: string
  tokenType: 'Bearer'
  expiresAt: IsoDateTimeString
}

export interface JwtClaims {
  sub: string
  roles?: readonly UserRole[]
  customerId?: CustomerId
  exp?: number
  iat?: number
}

export interface TransactionRequestDto {
  transactionId?: Uuid
  customerId: CustomerId
  amount: number
  merchantId: MerchantId
  merchantName: string
  category: TransactionCategory
  currency: CurrencyCode
  countryCode: CountryCode
}
