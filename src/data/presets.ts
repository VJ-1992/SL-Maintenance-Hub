import { Vehicle, VehicleManufacturer, Tyre, TyreStatus, ServiceLog, ServiceType, TyreMaster, TyreMasterStatus, TyreHistory, TyreMovement, TyreInspection, TyreExpense, RetreadRecord, ServiceSchedule, CentralNotification, TripHistoryRecord } from '../types';

// Helper to generate a default tyre list for a given vehicle template
export function generateDefaultTyres(
  manufacturer: VehicleManufacturer,
  totalTyres: number = 14,
  hasLiftAxle: boolean = false
): Tyre[] {
  const tyres: Tyre[] = [];
  const brandList = ["MRF Supermiler", "Apollo EnduMax", "JK Tyre JetSteel", "CEAT Mile XL"];

  if (totalTyres === 14) {
    // 14 Tyres layout
    // Axle 1: Steer (2 tyres)
    tyres.push(createTyre("Axle1_L", "Steer Left (A1)", `${manufacturer === VehicleManufacturer.TATA ? 'A1' : 'AL1'}-L-724`, brandList[0], 115, 13));
    tyres.push(createTyre("Axle1_R", "Steer Right (A1)", `${manufacturer === VehicleManufacturer.TATA ? 'A1' : 'AL1'}-R-812`, brandList[0], 118, 14));

    // Axle 2: Lift/Mid Axle (4 dually tyres)
    const axle2Label = hasLiftAxle ? "Lift Axle" : "Mid Axle";
    tyres.push(createTyre("Axle2_LO", `${axle2Label} Left Outer (A2)`, `${manufacturer === VehicleManufacturer.TATA ? 'A2' : 'AL2'}-LO-009`, brandList[1], 112, 11));
    tyres.push(createTyre("Axle2_LI", `${axle2Label} Left Inner (A2)`, `${manufacturer === VehicleManufacturer.TATA ? 'A2' : 'AL2'}-LI-010`, brandList[1], 112, 12));
    tyres.push(createTyre("Axle2_RI", `${axle2Label} Right Inner (A2)`, `${manufacturer === VehicleManufacturer.TATA ? 'A2' : 'AL2'}-RI-011`, brandList[1], 110, 11));
    tyres.push(createTyre("Axle2_RO", `${axle2Label} Right Outer (A2)`, `${manufacturer === VehicleManufacturer.TATA ? 'A2' : 'AL2'}-RO-012`, brandList[1], 114, 12));

    // Axle 3: Drive Axle 1 (4 dually tyres)
    tyres.push(createTyre("Axle3_LO", "Drive 1 Left Outer (A3)", `${manufacturer === VehicleManufacturer.TATA ? 'A3' : 'AL3'}-LO-561`, brandList[2], 115, 9));
    tyres.push(createTyre("Axle3_LI", "Drive 1 Left Inner (A3)", `${manufacturer === VehicleManufacturer.TATA ? 'A3' : 'AL3'}-LI-562`, brandList[2], 116, 8));
    tyres.push(createTyre("Axle3_RI", "Drive 1 Right Inner (A3)", `${manufacturer === VehicleManufacturer.TATA ? 'A3' : 'AL3'}-RI-563`, brandList[2], 98, 9)); // Low pressure warning!
    tyres.push(createTyre("Axle3_RO", "Drive 1 Right Outer (A3)", `${manufacturer === VehicleManufacturer.TATA ? 'A3' : 'AL3'}-RO-564`, brandList[2], 115, 10));

    // Axle 4: Drive Axle 2 (4 dually tyres)
    tyres.push(createTyre("Axle4_LO", "Drive 2 Left Outer (A4)", `${manufacturer === VehicleManufacturer.TATA ? 'A4' : 'AL4'}-LO-901`, brandList[3], 113, 4));  // Alert: Worn-out
    tyres.push(createTyre("Axle4_LI", "Drive 2 Left Inner (A4)", `${manufacturer === VehicleManufacturer.TATA ? 'A4' : 'AL4'}-LI-902`, brandList[3], 112, 5));
    tyres.push(createTyre("Axle4_RI", "Drive 2 Right Inner (A4)", `${manufacturer === VehicleManufacturer.TATA ? 'A4' : 'AL4'}-RI-903`, brandList[3], 114, 5));
    tyres.push(createTyre("Axle4_RO", "Drive 2 Right Outer (A4)", `${manufacturer === VehicleManufacturer.TATA ? 'A4' : 'AL4'}-RO-904`, brandList[3], 114, 3.5)); // Alert: Worn-out
  } else if (totalTyres === 12) {
    // 12 Tyres layout
    // Axle 1: Steer (2 tyres)
    tyres.push(createTyre("Axle1_L", "Steer Left (A1)", `${manufacturer === VehicleManufacturer.TATA ? 'T' : 'AL'}-A1L-11`, brandList[1], 116, 12));
    tyres.push(createTyre("Axle1_R", "Steer Right (A1)", `${manufacturer === VehicleManufacturer.TATA ? 'T' : 'AL'}-A1R-12`, brandList[1], 115, 11));

    // Axle 2: Drive Axle 1 (4 dually tyres)
    tyres.push(createTyre("Axle2_LO", "Drive 1 Left Outer (A2)", `${manufacturer === VehicleManufacturer.TATA ? 'T' : 'AL'}-A2LO-31`, brandList[0], 110, 10));
    tyres.push(createTyre("Axle2_LI", "Drive 1 Left Inner (A2)", `${manufacturer === VehicleManufacturer.TATA ? 'T' : 'AL'}-A2LI-32`, brandList[0], 111, 10));
    tyres.push(createTyre("Axle2_RI", "Drive 1 Right Inner (A2)", `${manufacturer === VehicleManufacturer.TATA ? 'T' : 'AL'}-A2RI-33`, brandList[0], 110, 9));
    tyres.push(createTyre("Axle2_RO", "Drive 1 Right Outer (A2)", `${manufacturer === VehicleManufacturer.TATA ? 'T' : 'AL'}-A2RO-34`, brandList[0], 112, 9));

    // Axle 3: Drive Axle 2 (4 dually tyres)
    tyres.push(createTyre("Axle3_LO", "Drive 2 Left Outer (A3)", `${manufacturer === VehicleManufacturer.TATA ? 'T' : 'AL'}-A3LO-41`, brandList[2], 114, 8));
    tyres.push(createTyre("Axle3_LI", "Drive 2 Left Inner (A3)", `${manufacturer === VehicleManufacturer.TATA ? 'T' : 'AL'}-A3LI-42`, brandList[2], 115, 7));
    tyres.push(createTyre("Axle3_RI", "Drive 2 Right Inner (A3)", `${manufacturer === VehicleManufacturer.TATA ? 'T' : 'AL'}-A3RI-43`, brandList[2], 85, 8));  // Alert: Low pressure
    tyres.push(createTyre("Axle3_RO", "Drive 2 Right Outer (A3)", `${manufacturer === VehicleManufacturer.TATA ? 'T' : 'AL'}-A3RO-44`, brandList[2], 114, 7));

    // Axle 4: Rear Tag Axle (2 single tyres on outer sides)
    tyres.push(createTyre("Axle4_L", "Rear Left (A4)", `${manufacturer === VehicleManufacturer.TATA ? 'T' : 'AL'}-A4L-99`, brandList[3], 116, 13));
    tyres.push(createTyre("Axle4_R", "Rear Right (A4)", `${manufacturer === VehicleManufacturer.TATA ? 'T' : 'AL'}-A4R-100`, brandList[3], 115, 12));
  } else {
    // 10 Tyres layout
    // Axle 1: Steer (2 tyres)
    tyres.push(createTyre("Axle1_L", "Steer Left (A1)", `${manufacturer === VehicleManufacturer.TATA ? 'T' : 'AL'}-A1L-11`, brandList[1], 116, 12));
    tyres.push(createTyre("Axle1_R", "Steer Right (A1)", `${manufacturer === VehicleManufacturer.TATA ? 'T' : 'AL'}-A1R-12`, brandList[1], 115, 11));

    // Axle 2: Drive Axle 1 (4 dually tyres)
    tyres.push(createTyre("Axle2_LO", "Drive 1 Left Outer (A2)", `${manufacturer === VehicleManufacturer.TATA ? 'T' : 'AL'}-A2LO-31`, brandList[0], 110, 10));
    tyres.push(createTyre("Axle2_LI", "Drive 1 Left Inner (A2)", `${manufacturer === VehicleManufacturer.TATA ? 'T' : 'AL'}-A2LI-32`, brandList[0], 111, 10));
    tyres.push(createTyre("Axle2_RI", "Drive 1 Right Inner (A2)", `${manufacturer === VehicleManufacturer.TATA ? 'T' : 'AL'}-A2RI-33`, brandList[0], 110, 9));
    tyres.push(createTyre("Axle2_RO", "Drive 1 Right Outer (A2)", `${manufacturer === VehicleManufacturer.TATA ? 'T' : 'AL'}-A2RO-34`, brandList[0], 112, 9));

    // Axle 3: Drive Axle 2 (4 dually tyres)
    tyres.push(createTyre("Axle3_LO", "Drive 2 Left Outer (A3)", `${manufacturer === VehicleManufacturer.TATA ? 'T' : 'AL'}-A3LO-41`, brandList[2], 114, 8));
    tyres.push(createTyre("Axle3_LI", "Drive 2 Left Inner (A3)", `${manufacturer === VehicleManufacturer.TATA ? 'T' : 'AL'}-A3LI-42`, brandList[2], 115, 7));
    tyres.push(createTyre("Axle3_RI", "Drive 2 Right Inner (A3)", `${manufacturer === VehicleManufacturer.TATA ? 'T' : 'AL'}-A3RI-43`, brandList[2], 85, 8));
    tyres.push(createTyre("Axle3_RO", "Drive 2 Right Outer (A3)", `${manufacturer === VehicleManufacturer.TATA ? 'T' : 'AL'}-A3RO-44`, brandList[2], 114, 7));
  }

  return tyres;
}

function createTyre(posId: string, name: string, serial: string, brand: string, psi: number, depth: number): Tyre {
  let status = TyreStatus.OK;
  if (psi < 50) status = TyreStatus.FLAT;
  else if (psi < 100) status = TyreStatus.LOW_PRESSURE;
  else if (depth < 4.5) status = TyreStatus.WORN_OUT;

  return {
    positionId: posId,
    positionName: name,
    serialNumber: serial,
    brand: brand,
    psi: psi,
    treadDepthMm: depth,
    wearPercentage: Math.round(((16 - depth) / 16) * 100),
    status: status,
    installedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 180).toISOString().split('T')[0] // 6 months ago
  };
}

export const PRESET_VEHICLES: Vehicle[] = [
  {
    truckNumber: "RJ14GR0952",
    manufacturer: VehicleManufacturer.TATA,
    tyresCount: 14,
    hasLiftAxle: true,
    supervisorName: "Mustak",
    foremanName: "Ramesh",
    driverName: "Rakesh Yadav",
    mobileNumber: "+91 98290 12345",
    currentLocation: "Jaipur, RJ",
    lastUpdated: new Date().toISOString(),
    tyres: generateDefaultTyres(VehicleManufacturer.TATA),
    insuranceExpiry: "2026-07-05", // Due in 12 days
    fitnessExpiry: "2026-08-15",   // Due in future
    permitExpiry: "2026-06-10",     // Overdue by 13 days
    eWayBillExpiry: "2026-07-15",
    pucExpiry: "2026-06-18",        // Expired recently
    currentTripFrom: "Panipat",
    currentTripTo: "Chennai",
    tripStartDate: "2026-06-24",
    tripStatus: "In Transit",
    partyName: "Balaji Logistics",
    vehicleStatus: "Running"
  },
  {
    truckNumber: "RJ14GP0981",
    manufacturer: VehicleManufacturer.ASHOK_LEYLAND,
    tyresCount: 12,
    hasLiftAxle: false,
    supervisorName: "Sachin",
    foremanName: "Suresh",
    driverName: "Karan Johar",
    mobileNumber: "+91 94140 54321",
    currentLocation: "Delhi NCR",
    lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4h ago
    tyres: generateDefaultTyres(VehicleManufacturer.ASHOK_LEYLAND),
    insuranceExpiry: "2026-06-15", // Overdue by 8 days
    fitnessExpiry: "2026-06-28",   // Due soon (within 5 days)
    permitExpiry: "2026-10-30",     // Far in future
    eWayBillExpiry: "2026-06-20",   // Expired
    pucExpiry: "2026-08-25",        // Future expiry
    currentTripFrom: "Jaipur",
    currentTripTo: "Mumbai",
    tripStartDate: "2026-06-25",
    tripStatus: "Planned",
    partyName: "Raj Express",
    vehicleStatus: "Available"
  }
];

export const INITIAL_SERVICE_LOGS: ServiceLog[] = [
  {
    id: "LOG_001",
    truckNumber: "RJ14GR0952",
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString().split('T')[0], // 15 days ago
    type: ServiceType.PUNCTURE,
    positionId: "Axle3_RI",
    tyreSerialBefore: "A3-RI-563",
    tyreSerialAfter: "A3-RI-563",
    description: "Repaired micro nail-puncture. Sidewall inspected and found healthy. Air reinflated to 110 PSI.",
    cost: 450,
    odometerReading: 124500,
    supervisorName: "Mustak"
  },
  {
    id: "LOG_002",
    truckNumber: "RJ14GP0981",
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString().split('T')[0], // 30 days ago
    type: ServiceType.ALIGNMENT,
    positionId: "All",
    description: "Axle alignment calibration & steering wheel balancing. Enhanced fuel efficiency.",
    cost: 2200,
    odometerReading: 89620,
    supervisorName: "Sachin"
  },
  {
    id: "LOG_003",
    truckNumber: "RJ14GR0952",
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString().split('T')[0], // 4 days ago
    type: ServiceType.TYRE_REPLACEMENT,
    positionId: "Axle1_L",
    tyreSerialBefore: "PREV-724",
    tyreSerialAfter: "A1-L-724",
    description: "Replaced worn steering tyre with new premium MRF Supermiler tyre on Left Front Steer.",
    cost: 18500,
    odometerReading: 129400,
    supervisorName: "Irshad"
  }
];

export const INITIAL_TYRES: TyreMaster[] = [
  // TATA Active Tyres
  {
    serialNumber: "A1-L-724",
    brand: "MRF",
    model: "Supermiler",
    size: "295/80 R22.5",
    purchaseDate: "2026-02-15",
    purchaseCost: 18500,
    vendorName: "Sri Balaji Tyres",
    warrantyPeriodMonths: 36,
    manufacturingDate: "2025-11-10",
    expectedLifeKm: 120000,
    currentRunningKm: 18450,
    status: TyreMasterStatus.ACTIVE,
    retreadCount: 0,
    purchaseInvoiceDoc: "INV-2026-7811.pdf",
    warrantyCardDoc: "WAR-MRF-9022.pdf"
  },
  {
    serialNumber: "A1-R-812",
    brand: "MRF",
    model: "Supermiler",
    size: "295/80 R22.5",
    purchaseDate: "2025-08-20",
    purchaseCost: 18500,
    vendorName: "Sri Balaji Tyres",
    warrantyPeriodMonths: 36,
    manufacturingDate: "2025-05-15",
    expectedLifeKm: 120000,
    currentRunningKm: 65400,
    status: TyreMasterStatus.ACTIVE,
    retreadCount: 0,
    purchaseInvoiceDoc: "INV-2025-4491.pdf"
  },
  {
    serialNumber: "A2-LO-009",
    brand: "Apollo",
    model: "EnduMax",
    size: "10.00 R20",
    purchaseDate: "2025-12-05",
    purchaseCost: 16800,
    vendorName: "Jaipur Radial House",
    warrantyPeriodMonths: 24,
    manufacturingDate: "2025-09-01",
    expectedLifeKm: 100000,
    currentRunningKm: 32100,
    status: TyreMasterStatus.ACTIVE,
    retreadCount: 1,
    purchaseInvoiceDoc: "INV-JPR-992.pdf",
    retreadInvoiceDoc: "RET-JPR-211.pdf"
  },
  {
    serialNumber: "A2-LI-010",
    brand: "Apollo",
    model: "EnduMax",
    size: "10.00 R20",
    purchaseDate: "2025-12-05",
    purchaseCost: 16800,
    vendorName: "Jaipur Radial House",
    warrantyPeriodMonths: 24,
    manufacturingDate: "2025-09-01",
    expectedLifeKm: 100000,
    currentRunningKm: 32100,
    status: TyreMasterStatus.ACTIVE,
    retreadCount: 0
  },
  {
    serialNumber: "A2-RI-011",
    brand: "Apollo",
    model: "EnduMax",
    size: "10.00 R20",
    purchaseDate: "2025-12-05",
    purchaseCost: 16800,
    vendorName: "Jaipur Radial House",
    warrantyPeriodMonths: 24,
    manufacturingDate: "2025-08-20",
    expectedLifeKm: 100000,
    currentRunningKm: 32100,
    status: TyreMasterStatus.ACTIVE,
    retreadCount: 0
  },
  {
    serialNumber: "A2-RO-012",
    brand: "Apollo",
    model: "EnduMax",
    size: "10.00 R20",
    purchaseDate: "2025-12-05",
    purchaseCost: 16800,
    vendorName: "Jaipur Radial House",
    warrantyPeriodMonths: 24,
    manufacturingDate: "2025-08-20",
    expectedLifeKm: 100000,
    currentRunningKm: 32100,
    status: TyreMasterStatus.ACTIVE,
    retreadCount: 0
  },
  {
    serialNumber: "A3-LO-561",
    brand: "JK Tyre",
    model: "JetSteel",
    size: "10.00 R20",
    purchaseDate: "2025-06-10",
    purchaseCost: 15500,
    vendorName: "Marwar Tyre Dealers",
    warrantyPeriodMonths: 24,
    manufacturingDate: "2025-03-05",
    expectedLifeKm: 90000,
    currentRunningKm: 74200,
    status: TyreMasterStatus.ACTIVE,
    retreadCount: 0
  },
  {
    serialNumber: "A3-LI-562",
    brand: "JK Tyre",
    model: "JetSteel",
    size: "10.00 R20",
    purchaseDate: "2025-06-10",
    purchaseCost: 15500,
    vendorName: "Marwar Tyre Dealers",
    warrantyPeriodMonths: 24,
    manufacturingDate: "2025-03-05",
    expectedLifeKm: 90000,
    currentRunningKm: 74200,
    status: TyreMasterStatus.ACTIVE,
    retreadCount: 0
  },
  {
    serialNumber: "A3-RI-563",
    brand: "JK Tyre",
    model: "JetSteel",
    size: "10.00 R20",
    purchaseDate: "2025-06-10",
    purchaseCost: 15500,
    vendorName: "Marwar Tyre Dealers",
    warrantyPeriodMonths: 24,
    manufacturingDate: "2025-03-01",
    expectedLifeKm: 90000,
    currentRunningKm: 74200,
    status: TyreMasterStatus.ACTIVE,
    retreadCount: 0
  },
  {
    serialNumber: "A3-RO-564",
    brand: "JK Tyre",
    model: "JetSteel",
    size: "10.00 R20",
    purchaseDate: "2025-06-10",
    purchaseCost: 15500,
    vendorName: "Marwar Tyre Dealers",
    warrantyPeriodMonths: 24,
    manufacturingDate: "2025-03-01",
    expectedLifeKm: 90000,
    currentRunningKm: 74200,
    status: TyreMasterStatus.ACTIVE,
    retreadCount: 0
  },
  {
    serialNumber: "A4-LO-901",
    brand: "CEAT",
    model: "Mile XL",
    size: "10.00 R20",
    purchaseDate: "2024-11-02",
    purchaseCost: 16200,
    vendorName: "Sri Balaji Tyres",
    warrantyPeriodMonths: 18,
    manufacturingDate: "2024-08-15",
    expectedLifeKm: 85000,
    currentRunningKm: 82400,
    status: TyreMasterStatus.ACTIVE,
    retreadCount: 2
  },
  {
    serialNumber: "A4-LI-902",
    brand: "CEAT",
    model: "Mile XL",
    size: "10.00 R20",
    purchaseDate: "2024-11-02",
    purchaseCost: 16200,
    vendorName: "Sri Balaji Tyres",
    warrantyPeriodMonths: 18,
    manufacturingDate: "2024-08-15",
    expectedLifeKm: 85000,
    currentRunningKm: 82400,
    status: TyreMasterStatus.ACTIVE,
    retreadCount: 1
  },
  {
    serialNumber: "A4-RI-903",
    brand: "CEAT",
    model: "Mile XL",
    size: "10.00 R20",
    purchaseDate: "2024-11-02",
    purchaseCost: 16200,
    vendorName: "Sri Balaji Tyres",
    warrantyPeriodMonths: 18,
    manufacturingDate: "2024-08-15",
    expectedLifeKm: 85000,
    currentRunningKm: 82400,
    status: TyreMasterStatus.ACTIVE,
    retreadCount: 1
  },
  {
    serialNumber: "A4-RO-904",
    brand: "CEAT",
    model: "Mile XL",
    size: "10.00 R20",
    purchaseDate: "2024-11-02",
    purchaseCost: 16200,
    vendorName: "Sri Balaji Tyres",
    warrantyPeriodMonths: 18,
    manufacturingDate: "2024-08-10",
    expectedLifeKm: 85000,
    currentRunningKm: 84100,
    status: TyreMasterStatus.ACTIVE,
    retreadCount: 2
  },

  // ASHOK LEYLAND Active Tyres
  {
    serialNumber: "AL-A1L-11",
    brand: "Apollo",
    model: "EnduMax",
    size: "295/80 R22.5",
    purchaseDate: "2025-04-12",
    purchaseCost: 17200,
    vendorName: "Jaipur Radial House",
    warrantyPeriodMonths: 24,
    manufacturingDate: "2025-01-10",
    expectedLifeKm: 110000,
    currentRunningKm: 42100,
    status: TyreMasterStatus.ACTIVE,
    retreadCount: 0
  },
  {
    serialNumber: "AL-A1R-12",
    brand: "Apollo",
    model: "EnduMax",
    size: "295/80 R22.5",
    purchaseDate: "2025-04-12",
    purchaseCost: 17200,
    vendorName: "Jaipur Radial House",
    warrantyPeriodMonths: 24,
    manufacturingDate: "2025-01-10",
    expectedLifeKm: 110000,
    currentRunningKm: 42100,
    status: TyreMasterStatus.ACTIVE,
    retreadCount: 0
  },
  {
    serialNumber: "AL-A2LO-31",
    brand: "MRF",
    model: "Supermiler",
    size: "10.00 R20",
    purchaseDate: "2025-05-18",
    purchaseCost: 18100,
    vendorName: "Sri Balaji Tyres",
    warrantyPeriodMonths: 36,
    manufacturingDate: "2025-02-15",
    expectedLifeKm: 120000,
    currentRunningKm: 51200,
    status: TyreMasterStatus.ACTIVE,
    retreadCount: 0
  },
  {
    serialNumber: "AL-A2LI-32",
    brand: "MRF",
    model: "Supermiler",
    size: "10.00 R20",
    purchaseDate: "2025-05-18",
    purchaseCost: 18100,
    vendorName: "Sri Balaji Tyres",
    warrantyPeriodMonths: 36,
    manufacturingDate: "2025-02-15",
    expectedLifeKm: 120000,
    currentRunningKm: 51200,
    status: TyreMasterStatus.ACTIVE,
    retreadCount: 0
  },
  {
    serialNumber: "AL-A2RI-33",
    brand: "MRF",
    model: "Supermiler",
    size: "10.00 R20",
    purchaseDate: "2025-05-18",
    purchaseCost: 18100,
    vendorName: "Sri Balaji Tyres",
    warrantyPeriodMonths: 36,
    manufacturingDate: "2025-02-15",
    expectedLifeKm: 120000,
    currentRunningKm: 51200,
    status: TyreMasterStatus.ACTIVE,
    retreadCount: 0
  },
  {
    serialNumber: "AL-A2RO-34",
    brand: "MRF",
    model: "Supermiler",
    size: "10.00 R20",
    purchaseDate: "2025-05-18",
    purchaseCost: 18100,
    vendorName: "Sri Balaji Tyres",
    warrantyPeriodMonths: 36,
    manufacturingDate: "2025-02-15",
    expectedLifeKm: 120000,
    currentRunningKm: 51200,
    status: TyreMasterStatus.ACTIVE,
    retreadCount: 0
  },
  {
    serialNumber: "AL-A3LO-41",
    brand: "JK Tyre",
    model: "JetSteel",
    size: "10.00 R20",
    purchaseDate: "2025-01-20",
    purchaseCost: 15200,
    vendorName: "Marwar Tyre Dealers",
    warrantyPeriodMonths: 24,
    manufacturingDate: "2024-10-15",
    expectedLifeKm: 90000,
    currentRunningKm: 68120,
    status: TyreMasterStatus.ACTIVE,
    retreadCount: 1
  },
  {
    serialNumber: "AL-A3LI-42",
    brand: "JK Tyre",
    model: "JetSteel",
    size: "10.00 R20",
    purchaseDate: "2025-01-20",
    purchaseCost: 15200,
    vendorName: "Marwar Tyre Dealers",
    warrantyPeriodMonths: 24,
    manufacturingDate: "2024-10-15",
    expectedLifeKm: 90000,
    currentRunningKm: 68120,
    status: TyreMasterStatus.ACTIVE,
    retreadCount: 1
  },
  {
    serialNumber: "AL-A3RI-43",
    brand: "JK Tyre",
    model: "JetSteel",
    size: "10.00 R20",
    purchaseDate: "2025-01-20",
    purchaseCost: 15200,
    vendorName: "Marwar Tyre Dealers",
    warrantyPeriodMonths: 24,
    manufacturingDate: "2024-10-15",
    expectedLifeKm: 90000,
    currentRunningKm: 68120,
    status: TyreMasterStatus.ACTIVE,
    retreadCount: 1
  },
  {
    serialNumber: "AL-A3RO-44",
    brand: "JK Tyre",
    model: "JetSteel",
    size: "10.00 R20",
    purchaseDate: "2025-01-20",
    purchaseCost: 15200,
    vendorName: "Marwar Tyre Dealers",
    warrantyPeriodMonths: 24,
    manufacturingDate: "2024-10-15",
    expectedLifeKm: 90000,
    currentRunningKm: 68120,
    status: TyreMasterStatus.ACTIVE,
    retreadCount: 1
  },
  {
    serialNumber: "AL-A4L-99",
    brand: "CEAT",
    model: "Mile XL",
    size: "10.00 R20",
    purchaseDate: "2025-09-02",
    purchaseCost: 15900,
    vendorName: "Jaipur Radial House",
    warrantyPeriodMonths: 18,
    manufacturingDate: "2025-06-01",
    expectedLifeKm: 85000,
    currentRunningKm: 28400,
    status: TyreMasterStatus.ACTIVE,
    retreadCount: 0
  },
  {
    serialNumber: "AL-A4R-100",
    brand: "CEAT",
    model: "Mile XL",
    size: "10.00 R20",
    purchaseDate: "2025-09-02",
    purchaseCost: 15900,
    vendorName: "Jaipur Radial House",
    warrantyPeriodMonths: 18,
    manufacturingDate: "2025-06-01",
    expectedLifeKm: 85000,
    currentRunningKm: 28400,
    status: TyreMasterStatus.ACTIVE,
    retreadCount: 0
  },

  // SPARES & REMOVEDS / RETREADS / SCRAPS
  {
    serialNumber: "SP-9011",
    brand: "MRF",
    model: "Supermiler",
    size: "10.00 R20",
    purchaseDate: "2026-01-10",
    purchaseCost: 18200,
    vendorName: "Sri Balaji Tyres",
    warrantyPeriodMonths: 36,
    manufacturingDate: "2025-10-01",
    expectedLifeKm: 120000,
    currentRunningKm: 0,
    status: TyreMasterStatus.SPARE,
    retreadCount: 0
  },
  {
    serialNumber: "SP-9012",
    brand: "Apollo",
    model: "EnduMax",
    size: "10.00 R20",
    purchaseDate: "2025-11-20",
    purchaseCost: 16800,
    vendorName: "Jaipur Radial House",
    warrantyPeriodMonths: 24,
    manufacturingDate: "2025-08-01",
    expectedLifeKm: 100000,
    currentRunningKm: 12000,
    status: TyreMasterStatus.SPARE,
    retreadCount: 1
  },
  {
    serialNumber: "PREV-724",
    brand: "Apollo",
    model: "EnduMax",
    size: "295/80 R22.5",
    purchaseDate: "2023-01-10",
    purchaseCost: 16500,
    vendorName: "Jaipur Radial House",
    warrantyPeriodMonths: 24,
    manufacturingDate: "2022-10-01",
    expectedLifeKm: 100000,
    currentRunningKm: 104500,
    status: TyreMasterStatus.RETREAD,
    retreadCount: 1
  },
  {
    serialNumber: "SCRAP-08",
    brand: "CEAT",
    model: "Mile XL",
    size: "10.00 R20",
    purchaseDate: "2022-05-14",
    purchaseCost: 14500,
    vendorName: "Sri Balaji Tyres",
    warrantyPeriodMonths: 18,
    manufacturingDate: "2022-02-01",
    expectedLifeKm: 85000,
    currentRunningKm: 118000,
    status: TyreMasterStatus.SCRAP,
    retreadCount: 3
  }
];

export const INITIAL_TYRE_HISTORY: TyreHistory[] = [
  {
    historyId: "TH_001",
    vehicleNo: "RJ14GR0952",
    serialNumber: "A1-L-724",
    movementType: "Tyre Installed",
    movementDate: "2026-06-19",
    odometer: 129400,
    supervisorName: "Irshad",
    remarks: "Fitted as steer left tyre",
    newStatus: "Active",
    // Backwards compatibility
    id: "TH_001",
    truckNumber: "RJ14GR0952",
    positionId: "Axle1_L",
    positionName: "Steer Left (A1)",
    installedDate: "2026-06-19",
    kmAtInstallation: 129400
  },
  {
    historyId: "TH_002",
    vehicleNo: "RJ14GR0952",
    serialNumber: "PREV-724",
    movementType: "Tyre Removed",
    movementDate: "2026-06-19",
    odometer: 104500,
    supervisorName: "Irshad",
    remarks: "Tread fully worn out. Replaced with serial A1-L-724.",
    oldStatus: "Active",
    newStatus: "Scrap",
    // Backwards compatibility
    id: "TH_002",
    truckNumber: "RJ14GR0952",
    positionId: "Axle1_L",
    positionName: "Steer Left (A1)",
    installedDate: "2023-01-15",
    removedDate: "2026-06-19",
    kmAtInstallation: 0,
    kmAtRemoval: 104500,
    totalKmRun: 104500,
    removalReason: "Tread fully worn out. Replaced with serial A1-L-724."
  }
];

export const INITIAL_TYRE_MOVEMENTS: TyreMovement[] = [
  {
    id: "TM_001",
    serialNumber: "SP-9012",
    sourceVehicle: "Spare Yard",
    destinationVehicle: "RJ14GR0952",
    sourcePosition: "Spare Rack B",
    destinationPosition: "Axle2_LO",
    date: "2026-05-10",
    supervisorName: "Mustak",

    movementId: "TM_001",
    tyreNumber: "SP-9012",
    vehicleFrom: "Spare Yard",
    vehicleTo: "RJ14GR0952",
    positionFrom: "Spare Rack B",
    positionTo: "Axle2_LO",
    movementDate: "2026-05-10",
    odometer: 0,
    reason: "Routine replacement / spare rotation"
  }
];

export const INITIAL_TYRE_INSPECTIONS: TyreInspection[] = [
  {
    id: "TI_001",
    serialNumber: "A1-L-724",
    truckNumber: "RJ14GR0952",
    positionId: "Axle1_L",
    inspectionDate: "2026-06-20",
    supervisorName: "Mustak",
    pressurePsi: 115,
    treadDepthMm: 13,
    sidewallCondition: "Good",
    remarks: "Perfect condition. Brand new tire inspection."
  },
  {
    id: "TI_002",
    serialNumber: "A4-RO-904",
    truckNumber: "RJ14GR0952",
    positionId: "Axle4_RO",
    inspectionDate: "2026-06-18",
    supervisorName: "Irshad",
    pressurePsi: 114,
    treadDepthMm: 3.5,
    sidewallCondition: "Minor Cut",
    remarks: "Tread depth critically low. Recommending replacement very soon."
  }
];

export const INITIAL_TYRE_EXPENSES: TyreExpense[] = [
  {
    id: "TE_001",
    serialNumber: "A1-L-724",
    truckNumber: "RJ14GR0952",
    expenseType: "Purchase",
    cost: 18500,
    date: "2026-02-15",
    vendor: "Sri Balaji Tyres",
    invoiceNumber: "INV-2026-7811",
    remarks: "New steer tyre purchased"
  },
  {
    id: "TE_002",
    serialNumber: "PREV-724",
    truckNumber: "RJ14GR0952",
    expenseType: "Retread",
    cost: 4200,
    date: "2026-06-22",
    vendor: "Classic Retreaders",
    invoiceNumber: "RET-2026-9011",
    remarks: "First-time retreading process completed"
  }
];

export const INITIAL_RETREAD_RECORDS: RetreadRecord[] = [
  {
    id: "RR_001",
    serialNumber: "PREV-724",
    retreadVendor: "Classic Retreaders",
    retreadCost: 4200,
    retreadDate: "2026-06-22",
    retreadCountBefore: 0,
    retreadCountAfter: 1
  }
];

export const INITIAL_SERVICE_SCHEDULES: ServiceSchedule[] = [
  {
    id: "SCH_001",
    truckNumber: "RJ14GR0952",
    serviceType: ServiceType.ENGINE_OIL,
    dueDate: "2026-06-28", // 5 days from June 23, 2026
    dueKm: 450000,
    status: 'Upcoming',
    createdDate: "2026-06-01",
    workshop: "SL Jaipur Central Workshop"
  },
  {
    id: "SCH_002",
    truckNumber: "RJ14GP0981",
    serviceType: ServiceType.BRAKE_SERVICE,
    dueDate: "2026-06-11", // Overdue by 12 days
    dueKm: 95000,
    status: 'Upcoming',
    createdDate: "2026-05-10",
    workshop: "Ajru Workshop Delhi"
  },
  {
    id: "SCH_003",
    truckNumber: "RJ14GR0952",
    serviceType: ServiceType.GREASING,
    dueDate: "2026-07-20",
    dueKm: 470000,
    status: 'Upcoming',
    createdDate: "2026-06-15",
    workshop: "SL Jaipur Central Workshop"
  }
];

export const INITIAL_NOTIFICATIONS: CentralNotification[] = [
  {
    id: "NOT_001",
    truckNumber: "RJ14GR0952",
    type: "Service Due",
    title: "Engine Oil Change Due Soon",
    message: "Engine Oil Change is due on 2026-06-28 (in 5 days) or at 450,000 KM. Recommended workshop: SL Jaipur Central Workshop.",
    date: "2026-06-23",
    isRead: false,
    severity: "medium"
  },
  {
    id: "NOT_002",
    truckNumber: "RJ14GP0981",
    type: "Service Overdue",
    title: "Brake Service CRITICALLY OVERDUE",
    message: "Brake Service was scheduled for 2026-06-11 and is overdue by 12 days! Brake pad thickness check required immediately.",
    date: "2026-06-12",
    isRead: false,
    severity: "high"
  },
  {
    id: "NOT_003",
    truckNumber: "RJ14GR0952",
    type: "Permit Expiry",
    title: "National Permit Expired",
    message: "National Permit expired on 2026-06-10 (13 days overdue)! Renew national permit to avoid RTO penalties.",
    date: "2026-06-10",
    isRead: false,
    severity: "high"
  },
  {
    id: "NOT_004",
    truckNumber: "RJ14GP0981",
    type: "Insurance Expiry",
    title: "Insurance Expired",
    message: "Third Party & Comprehensive Insurance expired on 2026-06-15 (8 days overdue)! Premium payment of ₹32,400 pending.",
    date: "2026-06-15",
    isRead: false,
    severity: "high"
  },
  {
    id: "NOT_005",
    truckNumber: "RJ14GP0981",
    type: "Fitness Expiry",
    title: "Vehicle Fitness Certificate Due Soon",
    message: "RTO Fitness Certificate renewal is due on 2026-06-28 (in 5 days). Book fitness inspection slot at Delhi RTO.",
    date: "2026-06-23",
    isRead: false,
    severity: "medium"
  },
  {
    id: "NOT_006",
    truckNumber: "RJ14GR0952",
    type: "Tyre Replacement Due",
    title: "Drive Tyre A4-LO-901 Worn Out",
    message: "Tyre serial A4-LO-901 (Drive 2 Left Outer) has critically low tread depth (4.0 mm). Schedule tyre replacement.",
    date: "2026-06-21",
    isRead: false,
    severity: "high"
  },
  {
    id: "NOT_007",
    truckNumber: "RJ14GR0952",
    type: "Retread Due",
    title: "Tyre A4-RO-904 Due for Retreading",
    message: "Tyre serial A4-RO-904 (Drive 2 Right Outer) tread is at 3.5 mm. Retreading can extend casing life. Recommended retreader: Classic Retreaders.",
    date: "2026-06-22",
    isRead: false,
    severity: "medium"
  },
  {
    id: "NOT_008",
    truckNumber: "RJ14GR0952",
    type: "Warranty Expiry",
    title: "Steer Tyre A1-L-724 Warranty Coverage Expired",
    message: "Warranty for tyre serial A1-L-724 (purchased on 2026-02-15) expired.",
    date: "2026-06-15",
    isRead: true,
    severity: "low"
  }
];

export const INITIAL_TRIPS: TripHistoryRecord[] = [
  {
    tripId: "TRIP-260624-952A",
    vehicleNumber: "RJ14GR0952",
    driver: "Rakesh Yadav",
    supervisor: "Mustak",
    party: "Balaji Logistics",
    fromLocation: "Panipat",
    toLocation: "Chennai",
    startDate: "2026-06-24T08:00:00Z",
    status: "Running",
    currentOdometer: 129400,
    remarks: "Carrying textile load. Expected delivery in 3 days.",
    timeline: [
      {
        eventName: "Trip Planned",
        date: "2026-06-24",
        time: "08:00",
        user: "Mustak",
        remarks: "Scheduled route from Panipat to Chennai via NH48."
      },
      {
        eventName: "Loading Completed",
        date: "2026-06-24",
        time: "11:30",
        user: "Ramesh",
        remarks: "Texile consignment of 15 Tons loaded."
      },
      {
        eventName: "Trip Dispatched",
        date: "2026-06-24",
        time: "12:15",
        user: "Mustak",
        remarks: "In Transit. Current Location: Gurgaon Toll Plaza."
      },
      {
        eventName: "Odometer Logged",
        date: "2026-06-25",
        time: "09:00",
        user: "Rakesh Yadav",
        remarks: "Odometer reading at 129,400 KM. Smooth journey."
      }
    ],
    createdAt: "2026-06-24T08:00:00Z",
    updatedAt: "2026-06-25T09:00:00Z"
  },
  {
    tripId: "TRIP-250625-981B",
    vehicleNumber: "RJ14GP0981",
    driver: "Karan Johar",
    supervisor: "Sachin",
    party: "Raj Express",
    fromLocation: "Jaipur",
    toLocation: "Mumbai",
    startDate: "2026-06-25T10:00:00Z",
    status: "Scheduled",
    currentOdometer: 89620,
    remarks: "Upcoming steel coil dispatch.",
    timeline: [
      {
        eventName: "Trip Planned & Registered",
        date: "2026-06-25",
        time: "10:00",
        user: "Sachin",
        remarks: "Scheduled for steel coil transportation."
      }
    ],
    createdAt: "2026-06-25T10:00:00Z",
    updatedAt: "2026-06-25T10:00:00Z"
  },
  {
    tripId: "TRIP-220601-952X",
    vehicleNumber: "RJ14GR0952",
    driver: "Rakesh Yadav",
    supervisor: "Mustak",
    party: "JSW Steel",
    fromLocation: "Haldia",
    toLocation: "Jaipur",
    startDate: "2026-06-01T06:00:00Z",
    endDate: "2026-06-05T18:00:00Z",
    status: "Completed",
    distance: 1450,
    duration: "4 Days 12 Hours",
    currentOdometer: 127950,
    endingOdometer: 129400,
    remarks: "Delivered steel billets. Unloading took 4 hours.",
    timeline: [
      {
        eventName: "Trip Registered",
        date: "2026-06-01",
        time: "06:00",
        user: "Mustak",
        remarks: "Assigned to Rakesh Yadav."
      },
      {
        eventName: "Dispatched",
        date: "2026-06-01",
        time: "08:30",
        user: "Ramesh",
        remarks: "Odometer reading at 127,950 KM."
      },
      {
        eventName: "Reached Destination",
        date: "2026-06-05",
        time: "14:00",
        user: "Mustak",
        remarks: "Arrived at Jaipur Depot."
      },
      {
        eventName: "Trip Completed",
        date: "2026-06-05",
        time: "18:00",
        user: "Mustak",
        remarks: "Unloading completed. Ending Odometer: 129,400 KM."
      }
    ],
    createdAt: "2026-06-01T06:00:00Z",
    updatedAt: "2026-06-05T18:00:00Z"
  },
  {
    tripId: "TRIP-150610-981Y",
    vehicleNumber: "RJ14GP0981",
    driver: "Karan Johar",
    supervisor: "Sachin",
    party: "Tata Motors",
    fromLocation: "Pune",
    toLocation: "Delhi",
    startDate: "2026-06-10T07:00:00Z",
    endDate: "2026-06-14T15:30:00Z",
    status: "Completed",
    distance: 1320,
    duration: "4 Days 8 Hours",
    currentOdometer: 88300,
    endingOdometer: 89620,
    remarks: "Spare parts consignment. Smooth drive.",
    timeline: [
      {
        eventName: "Trip Registered",
        date: "2026-06-10",
        time: "07:00",
        user: "Sachin",
        remarks: "Planned Pune -> Delhi route."
      },
      {
        eventName: "Dispatched",
        date: "2026-06-10",
        time: "09:00",
        user: "Suresh",
        remarks: "Odometer starting at 88,300 KM."
      },
      {
        eventName: "Trip Completed",
        date: "2026-06-14",
        time: "15:30",
        user: "Sachin",
        remarks: "Delivered to Maruti-Suzuki stockyard. Final Odometer: 89,620 KM."
      }
    ],
    createdAt: "2026-06-10T07:00:00Z",
    updatedAt: "2026-06-14T15:30:00Z"
  },
  {
    tripId: "TRIP-120618-952C",
    vehicleNumber: "RJ14GR0952",
    driver: "Amit Sharma",
    supervisor: "Mustak",
    party: "Ultratech Cement",
    fromLocation: "Jaipur",
    toLocation: "Bikaner",
    startDate: "2026-06-18T09:00:00Z",
    status: "Cancelled",
    currentOdometer: 127950,
    remarks: "Order cancelled by party due to stock delay.",
    timeline: [
      {
        eventName: "Trip Registered",
        date: "2026-06-18",
        time: "09:00",
        user: "Mustak",
        remarks: "Scheduled cement load."
      },
      {
        eventName: "Trip Cancelled",
        date: "2026-06-18",
        time: "14:20",
        user: "Mustak",
        remarks: "Cancelled. Consignment revoked by Ultratech."
      }
    ],
    createdAt: "2026-06-18T09:00:00Z",
    updatedAt: "2026-06-18T14:20:00Z"
  }
];
