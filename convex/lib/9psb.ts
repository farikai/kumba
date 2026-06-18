import { z } from "zod"

// ─── Configuration ───────────────────────────────────────────────
const NINE_PSB_BASE_URL =
  process.env.NINE_PSB_BASE_URL ?? "https://api.9psb.com.ng/v1"
const NINE_PSB_API_KEY = process.env.NINE_PSB_API_KEY ?? ""
const NINE_PSB_MODE = (process.env.NINE_PSB_MODE ?? "sandbox") as "sandbox" | "live"

// ─── Shared Types ────────────────────────────────────────────────
export interface NinePsbConfig {
  baseUrl: string
  apiKey: string
  mode: "sandbox" | "live"
}

export interface NinePsbError {
  code: string
  message: string
  status: number
}

export interface NinePsbResponse<T> {
  success: boolean
  data?: T
  error?: NinePsbError
  reference: string
}

// ─── Payout API Types ────────────────────────────────────────────
export interface Bank {
  code: string
  name: string
  shortName?: string
}

export interface AccountLookup {
  accountNumber: string
  bankCode: string
  accountName: string
  bvn?: string
}

export interface TransferRequest {
  amount: number
  currency: "NGN"
  accountNumber: string
  bankCode: string
  accountName: string
  narration: string
  reference: string
}

export interface TransferResponse {
  status: "pending" | "completed" | "failed"
  amount: number
  fee: number
  reference: string
  providerReference?: string
  createdAt: string
  completedAt?: string
}

export interface BalanceResponse {
  currency: string
  availableBalance: number
  ledgerBalance: number
}

// ─── WaaS (Wallet-as-a-Service) Types ────────────────────────────
export interface CreateWalletRequest {
  customerName: string
  phoneNumber: string
  email?: string
  bvn?: string
  nin?: string
}

export interface WalletResponse {
  walletId: string
  accountNumber: string
  accountName: string
  bankName: string
  currency: string
  status: "active" | "frozen" | "closed"
  createdAt: string
}

export interface WalletTransaction {
  id: string
  type: "credit" | "debit"
  amount: number
  currency: string
  narration: string
  reference: string
  status: "pending" | "completed" | "failed"
  createdAt: string
}

// ─── VAS (Value Added Services) Types ────────────────────────────
export type NetworkProvider = "mtn" | "airtel" | "glo" | "9mobile"

export interface AirtimeRequest {
  network: NetworkProvider
  phoneNumber: string
  amount: number
  reference: string
}

export interface DataPlan {
  id: string
  network: NetworkProvider
  name: string
  size: string
  validity: string
  price: number
}

export interface DataRequest {
  network: NetworkProvider
  phoneNumber: string
  planId: string
  reference: string
}

export interface ElectricityProvider {
  code: string
  name: string
  minAmount: number
}

export interface ElectricityRequest {
  providerCode: string
  meterNumber: string
  amount: number
  meterType: "prepaid" | "postpaid"
  phoneNumber: string
  reference: string
}

export interface MeterValidation {
  meterNumber: string
  providerCode: string
  customerName: string
  address: string
}

export interface TvProvider {
  code: string
  name: string
  packages: TvPackage[]
}

export interface TvPackage {
  id: string
  name: string
  price: number
}

export interface TvRequest {
  providerCode: string
  smartCardNumber: string
  packageId: string
  phoneNumber: string
  reference: string
}

export interface VasResponse {
  status: "pending" | "completed" | "failed"
  reference: string
  providerReference?: string
  amount: number
  fee: number
  createdAt: string
}

// ─── Virtual Account Types ────────────────────────────────────────
export interface VirtualAccountRequest {
  customerName: string
  phoneNumber: string
  email?: string
  bvn?: string
  metadata?: Record<string, string>
}

export interface VirtualAccountResponse {
  accountNumber: string
  accountName: string
  bankName: string
  bankCode: string
  status: "active" | "frozen"
  createdAt: string
}

// ─── Validation Schemas ──────────────────────────────────────────
export const accountLookupSchema = z.object({
  accountNumber: z.string().length(10),
  bankCode: z.string().min(1),
})

export const transferSchema = z.object({
  amount: z.number().positive().max(100_000_000),
  accountNumber: z.string().length(10),
  bankCode: z.string().min(1),
  accountName: z.string().min(1).max(100),
  narration: z.string().max(100).optional().default(""),
})

export const airtimeSchema = z.object({
  network: z.enum(["mtn", "airtel", "glo", "9mobile"]),
  phoneNumber: z.string().regex(/^0\d{10}$|^\+\d{11,14}$/),
  amount: z.number().int().positive().max(50000),
})

export const electricitySchema = z.object({
  providerCode: z.string().min(1),
  meterNumber: z.string().min(6).max(20),
  amount: z.number().positive(),
  meterType: z.enum(["prepaid", "postpaid"]),
  phoneNumber: z.string().regex(/^0\d{10}$|^\+\d{11,14}$/),
})

export const tvSchema = z.object({
  providerCode: z.string().min(1),
  smartCardNumber: z.string().min(1).max(20),
  packageId: z.string().min(1),
  phoneNumber: z.string().regex(/^0\d{10}$|^\+\d{11,14}$/),
})

export const createWalletSchema = z.object({
  customerName: z.string().min(1).max(100),
  phoneNumber: z.string().regex(/^0\d{10}$|^\+\d{11,14}$/),
  email: z.string().email().optional(),
  bvn: z.string().length(11).optional(),
  nin: z.string().length(11).optional(),
})

// ─── 9PSB Client ─────────────────────────────────────────────────
export class NinePsbClient {
  private config: NinePsbConfig
  private requestCounter = 0

  constructor(config?: Partial<NinePsbConfig>) {
    this.config = {
      baseUrl: config?.baseUrl ?? NINE_PSB_BASE_URL,
      apiKey: config?.apiKey ?? NINE_PSB_API_KEY,
      mode: config?.mode ?? NINE_PSB_MODE,
    }
  }

  get isLive(): boolean {
    return this.config.mode === "live"
  }

  private genRef(): string {
    this.requestCounter++
    return `KPY${Date.now()}${this.requestCounter}`
  }

  private genTs(): string {
    return new Date().toISOString()
  }

  private async request<T>(
    endpoint: string,
    body: Record<string, unknown>,
  ): Promise<NinePsbResponse<T>> {
    if (!this.isLive) {
      return this.mockResponse<T>(endpoint, body)
    }

    const ref = (body.reference as string) ?? this.genRef()
    try {
      const res = await fetch(`${this.config.baseUrl}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.config.apiKey}`,
          "X-Reference": ref,
        },
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (!res.ok) {
        return {
          success: false,
          error: { code: json.code ?? "UNKNOWN", message: json.message ?? "Request failed", status: res.status },
          reference: ref,
        }
      }
      return { success: true, data: json as T, reference: ref }
    } catch (err) {
      return {
        success: false,
        error: { code: "NETWORK_ERROR", message: err instanceof Error ? err.message : "Network error", status: 0 },
        reference: ref,
      }
    }
  }

  // ── Mock responses for sandbox mode ──────────────────────────
  private mockResponse<T>(endpoint: string, body: Record<string, unknown>): NinePsbResponse<T> {
    const ref = (body.reference as string) ?? this.genRef()

    // Simulate network delay
    const delay = Math.random() * 800 + 200

    if (endpoint.includes("/payout/transfer")) {
      return {
        success: true,
        data: {
          status: "completed",
          amount: body.amount,
          fee: Number(body.amount) > 5000 ? 25 : 10,
          reference: ref,
          providerReference: `9PSB-${Date.now()}`,
          createdAt: this.genTs(),
          completedAt: this.genTs(),
        } as T,
        reference: ref,
      }
    }

    if (endpoint.includes("/payout/balance")) {
      return {
        success: true,
        data: { currency: "NGN", availableBalance: 5_000_000, ledgerBalance: 5_250_000 } as T,
        reference: ref,
      }
    }

    if (endpoint.includes("/payout/account-lookup")) {
      const mockNames = ["OKAFOR JOY CHINWE", "ADEBAYO OLUWASEUN JAMES", "MUSA ABDULLAHI", "NWACHUKWU EMMANUEL"]
      return {
        success: true,
        data: {
          accountNumber: body.accountNumber,
          bankCode: body.bankCode,
          accountName: mockNames[Math.floor(Math.random() * mockNames.length)],
        } as T,
        reference: ref,
      }
    }

    if (endpoint.includes("/vas/airtime")) {
      return {
        success: true,
        data: {
          status: "completed",
          reference: ref,
          providerReference: `VTU-${Date.now()}`,
          amount: body.amount,
          fee: 0,
          createdAt: this.genTs(),
        } as T,
        reference: ref,
      }
    }

    if (endpoint.includes("/vas/data")) {
      return {
        success: true,
        data: {
          status: "completed",
          reference: ref,
          providerReference: `DAT-${Date.now()}`,
          amount: body.amount ?? 1000,
          fee: 0,
          createdAt: this.genTs(),
        } as T,
        reference: ref,
      }
    }

    if (endpoint.includes("/vas/electricity")) {
      return {
        success: true,
        data: {
          status: "completed",
          reference: ref,
          providerReference: `ELE-${Date.now()}`,
          amount: body.amount,
          fee: 100,
          createdAt: this.genTs(),
        } as T,
        reference: ref,
      }
    }

    if (endpoint.includes("/vas/tv")) {
      return {
        success: true,
        data: {
          status: "completed",
          reference: ref,
          providerReference: `TV-${Date.now()}`,
          amount: body.amount ?? 5000,
          fee: 100,
          createdAt: this.genTs(),
        } as T,
        reference: ref,
      }
    }

    if (endpoint.includes("/vas/meter-lookup")) {
      return {
        success: true,
        data: {
          meterNumber: body.meterNumber,
          providerCode: body.providerCode,
          customerName: "CHUKWUDI OKONKWO",
          address: "15, Adeola Odeku Street, Victoria Island, Lagos",
        } as T,
        reference: ref,
      }
    }

    if (endpoint.includes("/waas/wallet")) {
      return {
        success: true,
        data: {
          walletId: `WAL-${Date.now()}`,
          accountNumber: `9${String(Date.now()).slice(-9)}`,
          accountName: body.customerName,
          bankName: "9 Payment Service Bank",
          currency: "NGN",
          status: "active",
          createdAt: this.genTs(),
        } as T,
        reference: ref,
      }
    }

    if (endpoint.includes("/virtual-account")) {
      return {
        success: true,
        data: {
          accountNumber: `9${String(Date.now()).slice(-9)}`,
          accountName: body.customerName,
          bankName: "9 Payment Service Bank",
          bankCode: "100001",
          status: "active",
          createdAt: this.genTs(),
        } as T,
        reference: ref,
      }
    }

    return { success: false, error: { code: "NOT_FOUND", message: `Unknown endpoint: ${endpoint}`, status: 404 }, reference: ref }
  }

  // ── Public API Methods ──────────────────────────────────────

  /** Look up a bank account name (NIP name enquiry) */
  async lookupAccount(accountNumber: string, bankCode: string): Promise<NinePsbResponse<AccountLookup>> {
    return this.request<AccountLookup>("/payout/account-lookup", {
      accountNumber,
      bankCode,
      reference: this.genRef(),
    })
  }

  /** Send money to any Nigerian bank account */
  async transfer(req: TransferRequest): Promise<NinePsbResponse<TransferResponse>> {
    return this.request<TransferResponse>("/payout/transfer", req as unknown as Record<string, unknown>)
  }

  /** Check payout wallet balance */
  async balance(): Promise<NinePsbResponse<BalanceResponse>> {
    return this.request<BalanceResponse>("/payout/balance", { reference: this.genRef() })
  }

  /** Buy airtime */
  async buyAirtime(req: AirtimeRequest): Promise<NinePsbResponse<VasResponse>> {
    return this.request<VasResponse>("/vas/airtime", req as unknown as Record<string, unknown>)
  }

  /** Fetch available data plans for a network */
  async getDataPlans(network: NetworkProvider): Promise<DataPlan[]> {
    const plans: Record<NetworkProvider, DataPlan[]> = {
      mtn: [
        { id: "mtn-1gb-1d", network: "mtn", name: "1GB 1 Day", size: "1GB", validity: "1 Day", price: 350 },
        { id: "mtn-2gb-3d", network: "mtn", name: "2GB 3 Days", size: "2GB", validity: "3 Days", price: 500 },
        { id: "mtn-5gb-7d", network: "mtn", name: "5GB 7 Days", size: "5GB", validity: "7 Days", price: 1000 },
        { id: "mtn-10gb-30d", network: "mtn", name: "10GB 30 Days", size: "10GB", validity: "30 Days", price: 2000 },
      ],
      airtel: [
        { id: "airtel-1gb-1d", network: "airtel", name: "1GB 1 Day", size: "1GB", validity: "1 Day", price: 300 },
        { id: "airtel-3gb-7d", network: "airtel", name: "3GB 7 Days", size: "3GB", validity: "7 Days", price: 750 },
        { id: "airtel-6gb-14d", network: "airtel", name: "6GB 14 Days", size: "6GB", validity: "14 Days", price: 1500 },
        { id: "airtel-15gb-30d", network: "airtel", name: "15GB 30 Days", size: "15GB", validity: "30 Days", price: 3000 },
      ],
      glo: [
        { id: "glo-1gb-1d", network: "glo", name: "1GB 1 Day", size: "1GB", validity: "1 Day", price: 300 },
        { id: "glo-2gb-3d", network: "glo", name: "2GB 3 Days", size: "2GB", validity: "3 Days", price: 500 },
        { id: "glo-5gb-7d", network: "glo", name: "5GB 7 Days", size: "5GB", validity: "7 Days", price: 1000 },
        { id: "glo-8gb-30d", network: "glo", name: "8GB 30 Days", size: "8GB", validity: "30 Days", price: 2000 },
      ],
      "9mobile": [
        { id: "9m-1gb-1d", network: "9mobile", name: "1GB 1 Day", size: "1GB", validity: "1 Day", price: 300 },
        { id: "9m-2gb-3d", network: "9mobile", name: "2GB 3 Days", size: "2GB", validity: "3 Days", price: 500 },
        { id: "9m-4gb-7d", network: "9mobile", name: "4GB 7 Days", size: "4GB", validity: "7 Days", price: 1000 },
        { id: "9m-10gb-30d", network: "9mobile", name: "10GB 30 Days", size: "10GB", validity: "30 Days", price: 2000 },
      ],
    }
    return plans[network] ?? []
  }

  /** Buy data bundle */
  async buyData(req: DataRequest): Promise<NinePsbResponse<VasResponse>> {
    return this.request<VasResponse>("/vas/data", req as unknown as Record<string, unknown>)
  }

  /** Validate electricity meter */
  async validateMeter(meterNumber: string, providerCode: string): Promise<NinePsbResponse<MeterValidation>> {
    return this.request<MeterValidation>("/vas/meter-lookup", { meterNumber, providerCode, reference: this.genRef() })
  }

  /** Pay electricity bill */
  async payElectricity(req: ElectricityRequest): Promise<NinePsbResponse<VasResponse>> {
    return this.request<VasResponse>("/vas/electricity", req as unknown as Record<string, unknown>)
  }

  /** Get TV providers with packages */
  async getTvProviders(): Promise<TvProvider[]> {
    return [
      {
        code: "dstv",
        name: "DSTV",
        packages: [
          { id: "dstv-premium", name: "Premium", price: 24500 },
          { id: "dstv-compact-plus", name: "Compact+", price: 15800 },
          { id: "dstv-compact", name: "Compact", price: 9300 },
          { id: "dstv-confam", name: "Confam", price: 4200 },
          { id: "dstv-yanga", name: "Yanga", price: 2500 },
        ],
      },
      {
        code: "gotv",
        name: "GOtv",
        packages: [
          { id: "gotv-suprema", name: "Suprema", price: 9900 },
          { id: "gotv-max", name: "Max", price: 6100 },
          { id: "gotv-jolli", name: "Jolli", price: 3650 },
          { id: "gotv-jinja", name: "Jinja", price: 1575 },
        ],
      },
      {
        code: "startimes",
        name: "StarTimes",
        packages: [
          { id: "st-basic", name: "Basic", price: 1200 },
          { id: "st-standard", name: "Standard", price: 2500 },
          { id: "st-premium", name: "Premium", price: 4500 },
        ],
      },
    ]
  }

  /** Pay TV subscription */
  async payTv(req: TvRequest): Promise<NinePsbResponse<VasResponse>> {
    return this.request<VasResponse>("/vas/tv", req as unknown as Record<string, unknown>)
  }

  /** Create a 9PSB wallet */
  async createWallet(req: CreateWalletRequest): Promise<NinePsbResponse<WalletResponse>> {
    return this.request<WalletResponse>("/waas/wallet", req as unknown as Record<string, unknown>)
  }

  /** Create a virtual account */
  async createVirtualAccount(req: VirtualAccountRequest): Promise<NinePsbResponse<VirtualAccountResponse>> {
    return this.request<VirtualAccountResponse>("/virtual-account", req as unknown as Record<string, unknown>)
  }
}

// ─── Singleton Export ────────────────────────────────────────────
export const ninePsb = new NinePsbClient()
