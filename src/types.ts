export enum VehicleManufacturer {
  TATA = "Tata",
  ASHOK_LEYLAND = "Ashok Leyland"
}

export interface Tyre {
  positionId: string;       // e.g. "Axle1_L" (Steer Left), "Axle2_LO", etc.
  positionName: string;     // e.g. "Steer Left", "Lift Axle Left Outer"
  serialNumber: string;     // Unique serial
  brand: string;            // Apollo, MRF, JK Tyre, etc.
  psi: number;              // Tyre pressure in PSI (normal is 110-120 psi)
  treadDepthMm: number;     // Remaining tread depth in mm (e.g., 0 to 16 mm, 3mm is warning limit)
  wearPercentage: number;   // Calculated: Math.round(((16 - treadDepthMm) / 16) * 100)
  status: TyreStatus;       // Ok, Low Pressure, Flat, Worn-out
  installedDate: string;    // ISO Date
}

export enum TyreStatus {
  OK = "Ok",
  LOW_PRESSURE = "Low Pressure",
  FLAT = "Flat",
  WORN_OUT = "Worn-out"
}

export enum TyreMasterStatus {
  INVENTORY = "Inventory",
  INSTALLED = "Installed",
  REPAIR = "Repair",
  RETREAD = "Retread",
  SCRAP = "Scrap",
  RESERVED = "Reserved",
  LOST = "Lost",

  // Backward compatibility aliases
  NEW = "Inventory",
  ACTIVE = "Installed",
  SPARE = "Inventory",
  REMOVED = "Inventory"
}

export interface TyreMaster {
  serialNumber: string;
  tyreNumber?: string;
  brand: string;
  model: string;
  size: string;
  purchaseDate: string;
  purchaseCost: number;
  vendorName: string;
  vendor?: string;
  warrantyPeriodMonths: number;
  warrantyExpiry?: string;
  manufacturingDate: string;
  expectedLifeKm: number;
  currentRunningKm: number;
  status: TyreMasterStatus;
  retreadCount: number;
  currentVehicle?: string;
  currentPosition?: string;
  
  // Upgraded Tyre Asset Management Fields
  tyreId?: string; // Permanent Auto Generated Tyre ID
  pattern?: string;
  loadIndex?: string;
  tubeTubeless?: string; // "Tube" | "Tubeless"
  radialNylon?: string;  // "Radial" | "Nylon"
  mfgWeek?: number;
  mfgYear?: number;
  
  supplierContact?: string;
  invoiceNumber?: string;
  purchaseOrderNumber?: string;
  gstNumber?: string;
  
  manufacturerWarranty?: string;
  dealerWarranty?: string;
  
  // Current Assignment Details (Auto Filled)
  currentAxle?: string;
  installedDate?: string;
  supervisor?: string;
  foreman?: string;

  // Tyre Health & Financial Summaries
  repairCount?: number;
  healthScore?: number;
  totalRepairCost?: number;
  totalRetreadCost?: number;
  totalInvestment?: number;
  costPerKm?: number;

  // Categorized documents
  categorizedDocs?: { [category: string]: { name: string; size: string; date: string }[] };

  // Documents attachments list (simulated names/URLs for backwards compatibility)
  purchaseInvoiceDoc?: string;
  warrantyCardDoc?: string;
  retreadInvoiceDoc?: string;

  // Phase 3 requested fields
  vehicleNo?: string;
  position?: string;
  manufacturer?: string;
  installationDate?: string;
  installationOdometer?: number;
  currentOdometer?: number;
  condition?: string;
  pressure?: number;
  treadDepth?: number;
  supervisorName?: string;
  remarks?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TyreHistory {
  historyId: string;
  vehicleNo: string;
  tyreNumber?: string;
  serialNumber: string;
  oldPosition?: string;
  newPosition?: string;
  movementType: 'Tyre Installed' | 'Tyre Removed' | 'Tyre Replaced' | 'Tyre Swapped' | 'Tyre Sent for Retread' | 'Tyre Returned from Retread' | 'Tyre Scrapped';
  movementDate: string;
  odometer: number;
  supervisorName: string;
  remarks?: string;
  oldStatus?: string;
  newStatus?: string;

  // Compatibility fields for presets and existing components
  id?: string;
  truckNumber?: string;
  positionId?: string;
  positionName?: string;
  installedDate?: string;
  removedDate?: string;
  kmAtInstallation?: number;
  kmAtRemoval?: number;
  totalKmRun?: number;
  removalReason?: string;
}

export interface TyreMovement {
  id: string;
  serialNumber: string;
  sourceVehicle: string;
  destinationVehicle: string;
  sourcePosition: string;
  destinationPosition: string;
  date: string;
  supervisorName: string;

  // New fields requested by user
  movementId: string;
  tyreNumber: string;
  vehicleFrom: string;
  vehicleTo: string;
  positionFrom: string;
  positionTo: string;
  movementDate: string;
  odometer: number;
  reason: string;
}

export interface TyreInspection {
  id: string;
  serialNumber: string;
  truckNumber: string;
  positionId: string;
  inspectionDate: string;
  supervisorName: string;
  pressurePsi: number;
  treadDepthMm: number;
  sidewallCondition: string; // Good, Fair, Minor Cut, Critical
  remarks: string;
  photoUrl?: string; // simulation filename/url
}

export interface TyreExpense {
  id: string;
  serialNumber: string;
  truckNumber?: string;
  expenseType: 'Purchase' | 'Retread' | 'Replacement';
  cost: number;
  date: string;
  vendor: string;
  invoiceNumber: string;
  remarks?: string;
}

export interface RetreadRecord {
  id: string;
  serialNumber: string;
  retreadVendor: string;
  retreadCost: number;
  retreadDate: string;
  retreadCountBefore: number;
  retreadCountAfter: number;
}

export interface Vehicle {
  truckNumber: string;      // e.g., RJ14GR0952 (Unique primary key)
  manufacturer: VehicleManufacturer;
  tyresCount: number;       // 12 or 14
  hasLiftAxle: boolean;     // Yes (for Tata) or No (for Ashok Leyland)
  supervisorName: string;   // Supervisor Name
  foremanName?: string;     // Foreman Name
  driverName: string;       // Driver details
  mobileNumber: string;     
  currentLocation: string;  // e.g., Jaipur, RJ
  lastUpdated: string;      // ISO String
  tyres: Tyre[];            // Tyre positioning and details
  insuranceExpiry?: string;  // YYYY-MM-DD
  fitnessExpiry?: string;    // YYYY-MM-DD
  permitExpiry?: string;     // YYYY-MM-DD
  eWayBillExpiry?: string;   // YYYY-MM-DD
  pucExpiry?: string;        // YYYY-MM-DD
  currentTripFrom?: string;
  currentTripTo?: string;
  tripStartDate?: string;
  tripStatus?: 'Planned' | 'In Transit' | 'Reached Destination' | 'Completed';
  partyName?: string;
  
  // Phase 2 updated template mapping fields
  vehicleTemplate?: string;
  wheelConfiguration?: string;
  totalTyres?: number;
  status?: string;
  vehicleStatus?: string;
  wheelCount?: number;
  vehicleConfiguration?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ServiceLog {
  id: string;               // Unique log ID
  truckNumber: string;      // Associated truck
  date: string;             // ISO Date
  type: ServiceType;        // Type of service
  positionId?: string;      // Which tyre position (optional, e.g. "All" or specific "Axle1_L")
  tyreSerialBefore?: string;
  tyreSerialAfter?: string;
  description: string;      // Notes about this service
  cost: number;             // Maintenance cost
  odometerReading?: number; // km reading
  supervisorName: string;   // Supervisor Name
  workshop?: string;        // Workshop where service was performed
  remarks?: string;         // Supervisor remarks
  nextServiceDueDate?: string; // Calculated next due date
  nextServiceDueKm?: number;   // Calculated next due KM

  // Phase 2 Migration fields & aliases
  vehicleNo?: string;
  serviceDate?: string;
  odometer?: number;
  serviceType?: string;
  serviceCost?: number;
  nextServiceDate?: string;
  nextServiceKM?: number;
}

export enum ServiceType {
  ENGINE_OIL = "Engine Oil Change",
  OIL_FILTER = "Oil Filter Change",
  AIR_FILTER = "Air Filter Change",
  FUEL_FILTER = "Fuel Filter Change",
  GEAR_OIL = "Gear Oil Change",
  DIFF_OIL = "Differential Oil Change",
  GREASING = "Greasing",
  BRAKE_SERVICE = "Brake Service",
  CLUTCH_SERVICE = "Clutch Service",
  SUSPENSION_SERVICE = "Suspension Service",
  BATTERY_SERVICE = "Battery Service",
  AC_SERVICE = "AC Service",
  GENERAL = "General Service",
  TYRE_ROTATION = "Tyre Rotation",
  WHEEL_ALIGNMENT = "Wheel Alignment",
  OTHER = "Other",
  // Backward compatibility
  TYRE_REPLACEMENT = "Tyre Replacement",
  ROTATION = "Tyre Rotation (Old)",
  ALIGNMENT = "Wheel Alignment & Balancing",
  PUNCTURE = "Puncture Repair",
  AIR_CHECK = "Pressure inflation",
  GENERAL_OLD = "General Maintenance"
}

export interface ServiceSchedule {
  id: string;
  truckNumber: string;
  serviceType: ServiceType;
  dueDate?: string;
  dueKm?: number;
  status: 'Upcoming' | 'In Progress' | 'Completed';
  createdDate: string;
  workshop?: string;
}

export interface CentralNotification {
  id: string;
  truckNumber: string;
  type: 'Service Due' | 'Service Overdue' | 'Insurance Expiry' | 'Fitness Expiry' | 'Permit Expiry' | 'E-Way Bill Expiry' | 'PUC Expiry' | 'Tyre Replacement Due' | 'Retread Due' | 'Warranty Expiry' | 'Low Tread Depth' | 'Low Air Pressure';
  title: string;
  message: string;
  date: string;
  isRead: boolean;
  severity: 'low' | 'medium' | 'high';
}

export interface MaintenanceAnalytics {
  id: string;
  totalCost: number;
  avgCostPerKm: number;
  vehicleCosts: { [truckNum: string]: number };
  monthlyCosts: { [month: string]: number };
  yearlyCosts: { [year: string]: number };
}
