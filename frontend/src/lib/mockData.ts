// ── Data Sources ──────────────────────────────────────────────
export const dataSources = [
  { id: "DS-1024", name: "Global Logistics Real-time API", updatedAt: "Oct 24, 2023 · 14:32 PM" },
  { id: "DS-1025", name: "Marketing Campaign Attribution SQL", updatedAt: "Oct 24, 2023 · 12:15 PM" },
  { id: "DS-1026", name: "Cloud Infrastructure Billing Logs", updatedAt: "Oct 24, 2023 · 09:45 AM" },
  { id: "DS-1027", name: "User Behavioral Analytics (Web)", updatedAt: "Oct 23, 2023 · 23:59 PM" },
  { id: "DS-1028", name: "CRM Lead Management Integration", updatedAt: "Oct 23, 2023 · 18:20 PM" },
  { id: "DS-1029", name: "Supply Chain IoT Sensor Network", updatedAt: "Oct 23, 2023 · 14:10 PM" },
  { id: "DS-1030", name: "Customer Support ZenDesk Feed", updatedAt: "Oct 22, 2023 · 11:05 AM" },
];

export const dataSourceStats = {
  totalSources: 124,
  activeUptime: "99.9%",
  syncErrors: 2,
  dataThroughput: "1.2 TB",
};

// ── Uploaded Files ─────────────────────────────────────────────
export const uploadedFiles = [
  { name: "Q3_Sales_Forecast.xlsx", uploadedAt: "Oct 24, 2023", size: "2.4 MB" },
  { name: "Customer_Retention_v2.csv", uploadedAt: "Oct 22, 2023", size: "14.8 MB" },
  { name: "Historical_Territory_Data.xlsx", uploadedAt: "Oct 19, 2023", size: "856 KB" },
  { name: "Product_Inventory_Master.json", uploadedAt: "Oct 15, 2023", size: "4.1 MB" },
];

// ── Data Source Preview ────────────────────────────────────────
export const dataSourcePreviewFields = [
  { id: 1, primary: "customer_id", description: "Unique identifier for each customer account globally." },
  { id: 2, primary: "full_name", description: "Combined first and last name as recorded in registry." },
  { id: 3, primary: "email_address", description: "Primary contact email used for transaction notifications." },
  { id: 4, primary: "purchase_total", description: "Aggregate value of all completed orders in USD." },
  { id: 5, primary: "last_login", description: "Timestamp of the most recent user authentication event." },
  { id: 6, primary: "region_code", description: "ISO standardized code for geographical jurisdiction." },
  { id: 7, primary: "account_tier", description: "Customer tier classification based on purchase history." },
  { id: 8, primary: "phone_number", description: "Primary contact number with country code prefix." },
  { id: 9, primary: "created_date", description: "Account creation timestamp in UTC format." },
  { id: 10, primary: "is_active", description: "Boolean flag indicating if the account is active." },
  { id: 11, primary: "address_line1", description: "Primary street address for shipping and billing." },
  { id: 12, primary: "postal_code", description: "Postal/ZIP code for the primary shipping address." },
];

// ── Mapping Sources / Targets ──────────────────────────────────
export const mappingSources = [
  "customer_export_v2.csv",
  "inventory_master_list.xlsx",
  "user_logs_may_2024.json",
  "Q3_Sales_Forecast.xlsx",
  "Customer_Retention_v2.csv",
];

export const mappingTargets = [
  "Global_Customer_Standard.schema",
  "Salesforce_Contact_Sync.json",
  "AWS_Redshift_Final.yml",
  "Master_Schema_Global.schema",
  "ERP_Target_v3.yml",
];

// ── Mapping Results ────────────────────────────────────────────
export type MappingStatus = "verified" | "unverified" | "unresolved";
export type MappingType = "Auto" | "Manual";

export interface MappingResult {
  id: number;
  sourceField: string;
  sourceDescription: string;
  targetField: string;
  targetDescription: string;
  mappingType: MappingType;
  status: MappingStatus;
}

export const mappingResults: MappingResult[] = [
  {
    id: 1,
    sourceField: "USR_9921_X",
    sourceDescription: "Global User Identity / Head Office",
    targetField: "USER_ID_PROD",
    targetDescription: "Unique identifier for end users",
    mappingType: "Auto",
    status: "verified",
  },
  {
    id: 2,
    sourceField: "TRX_REF_002",
    sourceDescription: "Vendor Payment Transaction Reference",
    targetField: "TRANSACTION_UUID",
    targetDescription: "Universal transaction record key",
    mappingType: "Auto",
    status: "verified",
  },
  {
    id: 3,
    sourceField: "LOC_EUR_DE",
    sourceDescription: "Location Metadata: Germany Hub",
    targetField: "GEO_REGION_CODE",
    targetDescription: "Geographical cluster identification",
    mappingType: "Manual",
    status: "unverified",
  },
  {
    id: 4,
    sourceField: "SKU_VLT_99",
    sourceDescription: "Vault Stock Unit - High Value",
    targetField: "INV_STOCK_VAL",
    targetDescription: "Inventory stock valuation metrics",
    mappingType: "Auto",
    status: "verified",
  },
  {
    id: 5,
    sourceField: "TAX_RT_2024",
    sourceDescription: "Applicable Tax Rate - Fiscal Year",
    targetField: "UNRESOLVED",
    targetDescription: "No matching schema node found.",
    mappingType: "Auto",
    status: "unresolved",
  },
  {
    id: 6,
    sourceField: "CUST_SEG_01",
    sourceDescription: "Customer Segmentation Tier Alpha",
    targetField: "SEGMENT_CLASS",
    targetDescription: "Customer segment classification code",
    mappingType: "Auto",
    status: "verified",
  },
  {
    id: 7,
    sourceField: "ORD_DATE_TS",
    sourceDescription: "Order Timestamp - UTC Normalized",
    targetField: "ORDER_CREATED_AT",
    targetDescription: "UTC order creation timestamp",
    mappingType: "Auto",
    status: "verified",
  },
  {
    id: 8,
    sourceField: "PROD_CAT_GRP",
    sourceDescription: "Product Category Group Code",
    targetField: "CATEGORY_ID",
    targetDescription: "Product category reference identifier",
    mappingType: "Manual",
    status: "unverified",
  },
];

// ── Target Fields for Edit Modal ───────────────────────────────
export const targetFields = [
  { id: "TGT-001", fieldName: "UserIdentification", description: "Primary unique key for global users." },
  { id: "TGT-042", fieldName: "GivenName", description: "Legal first name as per government records." },
  { id: "TGT-109", fieldName: "EmailAddress", description: "Validated corporate email contact." },
  { id: "TGT-215", fieldName: "TimestampModified", description: "UTC format of the last entry update." },
  { id: "TGT-318", fieldName: "AccountStatus", description: "Active/inactive state of the user account." },
  { id: "TGT-422", fieldName: "RegionCode", description: "ISO 3166 geographic region identifier." },
  { id: "TGT-501", fieldName: "TransactionRef", description: "Unique reference for each transaction." },
];
