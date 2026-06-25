import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import FleetVehiclesView from './components/FleetVehiclesView';
import TyreManagementView from './components/TyreManagementView';
import ServiceLogsView from './components/ServiceLogsView';
import ReportsView from './components/ReportsView';
import NotificationCenterView from './components/NotificationCenterView';
import { Vehicle, ServiceLog, TyreMaster, TyreHistory, TyreMovement, TyreInspection, TyreExpense, RetreadRecord, ServiceSchedule, CentralNotification, TyreMasterStatus, TyreStatus } from './types';
import { PRESET_VEHICLES, INITIAL_SERVICE_LOGS, INITIAL_TYRES, INITIAL_TYRE_HISTORY, INITIAL_TYRE_MOVEMENTS, INITIAL_TYRE_INSPECTIONS, INITIAL_TYRE_EXPENSES, INITIAL_RETREAD_RECORDS, INITIAL_SERVICE_SCHEDULES, INITIAL_NOTIFICATIONS } from './data/presets';
import { ensureSignedIn, fetchCollection, writeDocument, removeDocument } from './services/firebase';

function sanitizeTyre(t: any): TyreMaster {
  const serialNumber = (t.serialNumber || '').trim().toUpperCase();
  const tyreNumber = (t.tyreNumber || t.serialNumber || '').trim().toUpperCase();
  const currentVehicle = t.currentVehicle || t.vehicleNo || '';
  const currentPosition = t.currentPosition || t.position || '';
  const brand = t.brand || t.manufacturer || 'MRF';
  const manufacturer = t.manufacturer || t.brand || 'MRF';
  const model = t.model || 'All-Position Radial';
  const size = t.size || '10.00R20';
  const purchaseDate = t.purchaseDate || new Date().toISOString().split('T')[0];
  const purchaseCost = typeof t.purchaseCost === 'number' ? t.purchaseCost : 18500;
  const status = t.status || TyreMasterStatus.SPARE;
  const retreadCount = typeof t.retreadCount === 'number' ? t.retreadCount : 0;
  
  // Extra fields requested
  const vehicleNo = currentVehicle;
  const position = currentPosition;
  const installationDate = t.installationDate || t.installedDate || '';
  const installationOdometer = typeof t.installationOdometer === 'number' ? t.installationOdometer : 0;
  const currentOdometer = typeof t.currentOdometer === 'number' ? t.currentOdometer : (typeof t.currentRunningKm === 'number' ? t.currentRunningKm : 0);
  const currentRunningKm = currentOdometer;
  const condition = t.condition || '';
  const pressure = typeof t.pressure === 'number' ? t.pressure : (typeof t.psi === 'number' ? t.psi : 115);
  const psi = pressure;
  const treadDepth = typeof t.treadDepth === 'number' ? t.treadDepth : (typeof t.treadDepthMm === 'number' ? t.treadDepthMm : 12);
  const treadDepthMm = treadDepth;
  const warrantyExpiry = t.warrantyExpiry || '';
  const supervisorName = t.supervisorName || '';
  const remarks = t.remarks || '';
  const createdAt = t.createdAt || new Date().toISOString();
  const updatedAt = t.updatedAt || new Date().toISOString();

  return {
    ...t,
    serialNumber,
    tyreNumber,
    brand,
    model,
    size,
    purchaseDate,
    purchaseCost,
    status,
    retreadCount,
    currentVehicle,
    currentPosition,
    
    // Firestore schema fields
    vehicleNo,
    position,
    manufacturer,
    installationDate,
    installationOdometer,
    currentOdometer,
    currentRunningKm,
    condition,
    pressure,
    psi,
    treadDepth,
    treadDepthMm,
    warrantyExpiry,
    supervisorName,
    remarks,
    createdAt,
    updatedAt
  };
}

function sanitizeServiceLog(log: any): ServiceLog {
  const vehicleNo = log.vehicleNo || log.truckNumber || '';
  const serviceDate = log.serviceDate || log.date || '';
  const odometer = typeof log.odometer === 'number' ? log.odometer : (typeof log.odometerReading === 'number' ? log.odometerReading : 0);
  const serviceType = log.serviceType || log.type || '';
  const serviceCost = typeof log.serviceCost === 'number' ? log.serviceCost : (typeof log.cost === 'number' ? log.cost : 0);
  const nextServiceDate = log.nextServiceDate || log.nextServiceDueDate || '';
  const nextServiceKM = typeof log.nextServiceKM === 'number' ? log.nextServiceKM : (typeof log.nextServiceDueKm === 'number' ? log.nextServiceDueKm : 0);

  return {
    ...log,
    vehicleNo,
    serviceDate,
    odometer,
    serviceType,
    serviceCost,
    nextServiceDate,
    nextServiceKM,
    truckNumber: vehicleNo,
    date: serviceDate,
    odometerReading: odometer,
    type: log.type || serviceType,
    cost: serviceCost,
    nextServiceDueDate: nextServiceDate,
    nextServiceDueKm: nextServiceKM,
  };
}

export default function App() {
  const [tab, setTab] = useState<string>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  // Cross-view state synchronization: which vehicle is selected when jumping to the Tyre Management tab!
  const [selectedTruckNumForTyres, setSelectedTruckNumForTyres] = useState<string>('');

  // 1. Initial State: Load from Firestore on mount
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isVehiclesLoaded, setIsVehiclesLoaded] = useState<boolean>(false);

  const [serviceLogs, setServiceLogs] = useState<ServiceLog[]>([]);
  const [isServiceLogsLoaded, setIsServiceLogsLoaded] = useState<boolean>(false);

  const [tyres, setTyres] = useState<TyreMaster[]>([]);
  const [isTyresLoaded, setIsTyresLoaded] = useState<boolean>(false);

  const [tyreHistory, setTyreHistory] = useState<TyreHistory[]>(() => {
    try {
      const stored = localStorage.getItem('sl_tyre_history');
      const parsed = stored ? JSON.parse(stored) : INITIAL_TYRE_HISTORY;
      const unique = Array.from(new Map(parsed.map((item: TyreHistory) => [item.id, item])).values());
      return unique;
    } catch {
      return INITIAL_TYRE_HISTORY;
    }
  });

  const [tyreMovements, setTyreMovements] = useState<TyreMovement[]>(() => {
    try {
      const stored = localStorage.getItem('sl_tyre_movements');
      const parsed = stored ? JSON.parse(stored) : INITIAL_TYRE_MOVEMENTS;
      const unique = Array.from(new Map(parsed.map((item: TyreMovement) => [item.id, item])).values());
      return unique;
    } catch {
      return INITIAL_TYRE_MOVEMENTS;
    }
  });

  const [tyreInspections, setTyreInspections] = useState<TyreInspection[]>(() => {
    try {
      const stored = localStorage.getItem('sl_tyre_inspections');
      const parsed = stored ? JSON.parse(stored) : INITIAL_TYRE_INSPECTIONS;
      const unique = Array.from(new Map(parsed.map((item: TyreInspection) => [item.id, item])).values());
      return unique;
    } catch {
      return INITIAL_TYRE_INSPECTIONS;
    }
  });

  const [tyreExpenses, setTyreExpenses] = useState<TyreExpense[]>(() => {
    try {
      const stored = localStorage.getItem('sl_tyre_expenses');
      const parsed = stored ? JSON.parse(stored) : INITIAL_TYRE_EXPENSES;
      const unique = Array.from(new Map(parsed.map((item: TyreExpense) => [item.id, item])).values());
      return unique;
    } catch {
      return INITIAL_TYRE_EXPENSES;
    }
  });

  const [retreadRecords, setRetreadRecords] = useState<RetreadRecord[]>(() => {
    try {
      const stored = localStorage.getItem('sl_retread_records');
      const parsed = stored ? JSON.parse(stored) : INITIAL_RETREAD_RECORDS;
      const unique = Array.from(new Map(parsed.map((item: RetreadRecord) => [item.id, item])).values());
      return unique;
    } catch {
      return INITIAL_RETREAD_RECORDS;
    }
  });

  const [serviceSchedules, setServiceSchedules] = useState<ServiceSchedule[]>(() => {
    try {
      const stored = localStorage.getItem('sl_service_schedules');
      const parsed = stored ? JSON.parse(stored) : INITIAL_SERVICE_SCHEDULES;
      const unique = Array.from(new Map(parsed.map((item: ServiceSchedule) => [item.id, item])).values());
      return unique;
    } catch {
      return INITIAL_SERVICE_SCHEDULES;
    }
  });

  const [notifications, setNotifications] = useState<CentralNotification[]>([]);
  const [isNotificationsLoaded, setIsNotificationsLoaded] = useState(false);

  const vehiclesWithLiveTyres = useMemo(() => {
    return vehicles.map(vehicle => {
      const liveTyres = tyres.filter(t => (t.currentVehicle === vehicle.truckNumber || t.vehicleNo === vehicle.truckNumber) && t.status === TyreMasterStatus.ACTIVE);
      const updatedTyres = vehicle.tyres.map(vt => {
        const match = liveTyres.find(lt => lt.currentPosition === vt.positionId || lt.position === vt.positionId);
        if (match) {
          // Determine status
          let tyreStatus = TyreStatus.OK;
          const psi = typeof match.pressure === 'number' ? match.pressure : (typeof match.psi === 'number' ? match.psi : 115);
          const depth = typeof match.treadDepth === 'number' ? match.treadDepth : (typeof match.treadDepthMm === 'number' ? match.treadDepthMm : 12);
          
          if (psi === 0) tyreStatus = TyreStatus.FLAT;
          else if (psi < 100) tyreStatus = TyreStatus.LOW_PRESSURE;
          else if (depth < 4.5) tyreStatus = TyreStatus.WORN_OUT;

          return {
            ...vt,
            serialNumber: match.serialNumber,
            brand: match.brand,
            psi,
            treadDepthMm: depth,
            wearPercentage: Math.round(((16 - depth) / 16) * 100),
            status: tyreStatus,
            installedDate: match.installationDate || match.installedDate || vt.installedDate
          };
        }
        return vt;
      });
      return {
        ...vehicle,
        tyres: updatedTyres
      };
    });
  }, [vehicles, tyres]);

  // 2. Firestore State Load: Load or import vehicles from Firestore on mount
  useEffect(() => {
    const loadInitialVehicles = async () => {
      try {
        await ensureSignedIn();
        console.log("Firestore Connected");

        const firestoreVehicles = await fetchCollection<Vehicle>('vehicles');

        if (firestoreVehicles && firestoreVehicles.length > 0) {
          const unique = Array.from(new Map(firestoreVehicles.map(v => [v.truckNumber, v])).values());
          setVehicles(unique);
          console.log("Vehicles Loaded");
        } else {
          // Import PRESET_VEHICLES to Firestore since collection is empty
          for (const vehicle of PRESET_VEHICLES) {
            await writeDocument('vehicles', vehicle.truckNumber, vehicle);
          }
          setVehicles(PRESET_VEHICLES);
          console.log("Vehicles Imported");
        }
      } catch (error) {
        console.error("Error loading vehicles from Firestore:", error);
        // Fallback to presets offline if necessary
        setVehicles(PRESET_VEHICLES);
        console.log("Vehicles Loaded (Offline Fallback)");
      } finally {
        setIsVehiclesLoaded(true);
      }
    };

    loadInitialVehicles();
  }, []);

  // 3. Firestore State Sync: Write any state modifications to Firestore
  useEffect(() => {
    if (!isVehiclesLoaded) return;

    const syncToFirestore = async () => {
      try {
        const dbVehicles = await fetchCollection<Vehicle>('vehicles');
        const dbTruckNumbers = new Set(dbVehicles ? dbVehicles.map(v => v.truckNumber) : []);
        const currentTruckNumbers = new Set(vehicles.map(v => v.truckNumber));

        // Write/Update current local state to Firestore
        for (const vehicle of vehicles) {
          await writeDocument('vehicles', vehicle.truckNumber, vehicle);
        }

        // Delete any vehicles no longer present in local state
        for (const truckNum of dbTruckNumbers) {
          if (!currentTruckNumbers.has(truckNum)) {
            await removeDocument('vehicles', truckNum);
          }
        }
      } catch (error) {
        console.error("Error syncing vehicles to Firestore:", error);
      }
    };

    syncToFirestore();
  }, [vehicles, isVehiclesLoaded]);

  // Load tyres from Firestore on mount
  useEffect(() => {
    const loadInitialTyres = async () => {
      try {
        await ensureSignedIn();
        console.log("Firestore Connected - Tyres");

        const firestoreTyres = await fetchCollection<TyreMaster>('tyres');

        if (firestoreTyres && firestoreTyres.length > 0) {
          const sanitized = firestoreTyres.map(t => sanitizeTyre(t));
          const unique = Array.from(new Map(sanitized.map(item => [item.serialNumber, item])).values());
          setTyres(unique);
          console.log("Tyres Loaded from Firestore:", unique.length);
        } else {
          // Import INITIAL_TYRES to Firestore since collection is empty
          console.log("Seeding INITIAL_TYRES to Firestore...");
          const seeded: TyreMaster[] = [];
          const usedTyreNumbers = new Set<string>();
          for (const tyre of INITIAL_TYRES) {
            const sanitized = sanitizeTyre(tyre);
            let docId = sanitized.tyreNumber ? sanitized.tyreNumber.trim().toUpperCase() : '';
            if (!docId || usedTyreNumbers.has(docId)) {
              docId = sanitized.serialNumber ? sanitized.serialNumber.trim().toUpperCase() : `TYRE_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
            }
            usedTyreNumbers.add(docId);
            await writeDocument('tyres', docId, sanitized);
            seeded.push(sanitized);
          }
          setTyres(seeded);
          console.log("Tyres Seeded & Loaded");
        }
      } catch (error) {
        console.error("Error loading tyres from Firestore:", error);
        // Fallback to presets offline if necessary
        const sanitized = INITIAL_TYRES.map(t => sanitizeTyre(t));
        setTyres(sanitized);
        console.log("Tyres Loaded (Offline Fallback)");
      } finally {
        setIsTyresLoaded(true);
      }
    };

    loadInitialTyres();
  }, []);

  // Sync tyres state modifications to Firestore
  useEffect(() => {
    if (!isTyresLoaded) return;

    const syncToFirestore = async () => {
      try {
        const dbTyres = await fetchCollection<TyreMaster>('tyres');
        const dbTyreSerials = new Set(dbTyres ? dbTyres.map(item => item.serialNumber) : []);
        const currentTyreSerials = new Set(tyres.map(item => item.serialNumber));

        // Create a list of existing doc IDs to avoid duplicate tyreNumbers
        const usedTyreNumbers = new Set<string>();

        // Write/Update current local state to Firestore
        for (const tyre of tyres) {
          const sanitized = sanitizeTyre(tyre);
          let docId = sanitized.tyreNumber ? sanitized.tyreNumber.trim().toUpperCase() : '';
          if (!docId || usedTyreNumbers.has(docId)) {
            docId = sanitized.serialNumber ? sanitized.serialNumber.trim().toUpperCase() : `TYRE_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
          }
          usedTyreNumbers.add(docId);
          await writeDocument('tyres', docId, sanitized);
        }

        // Delete any tyres no longer present in local state
        if (dbTyres) {
          for (const dbTyre of dbTyres) {
            if (!currentTyreSerials.has(dbTyre.serialNumber)) {
              let docId = dbTyre.tyreNumber ? dbTyre.tyreNumber.trim().toUpperCase() : '';
              if (!docId) {
                docId = dbTyre.serialNumber;
              }
              await removeDocument('tyres', docId);
            }
          }
        }
      } catch (error) {
        console.error("Error syncing tyres to Firestore:", error);
      }
    };

    syncToFirestore();

    // Cache locally as secondary backup
    try {
      localStorage.setItem('sl_tyres', JSON.stringify(tyres));
    } catch (e) {
      console.warn("Storage limits or disabled storage.", e);
    }
  }, [tyres, isTyresLoaded]);

  // Load service logs from Firestore on mount
  useEffect(() => {
    const loadInitialServiceLogs = async () => {
      try {
        await ensureSignedIn();
        console.log("Firestore Connected - Service Logs");

        const firestoreServiceLogs = await fetchCollection<ServiceLog>('serviceLogs');

        if (firestoreServiceLogs && firestoreServiceLogs.length > 0) {
          const sanitized = firestoreServiceLogs.map(log => sanitizeServiceLog(log));
          const unique = Array.from(new Map(sanitized.map(item => [item.id, item])).values());
          setServiceLogs(unique);
          console.log("Service Logs Loaded from Firestore:", unique.length);
        } else {
          // Import INITIAL_SERVICE_LOGS to Firestore since collection is empty
          console.log("Seeding INITIAL_SERVICE_LOGS to Firestore...");
          const seeded: ServiceLog[] = [];
          for (const log of INITIAL_SERVICE_LOGS) {
            const sanitized = sanitizeServiceLog(log);
            await writeDocument('serviceLogs', log.id, sanitized);
            seeded.push(sanitized);
          }
          setServiceLogs(seeded);
          console.log("Service Logs Seeded & Loaded");
        }
      } catch (error) {
        console.error("Error loading service logs from Firestore:", error);
        // Fallback to presets offline if necessary
        const sanitized = INITIAL_SERVICE_LOGS.map(log => sanitizeServiceLog(log));
        setServiceLogs(sanitized);
        console.log("Service Logs Loaded (Offline Fallback)");
      } finally {
        setIsServiceLogsLoaded(true);
      }
    };

    loadInitialServiceLogs();
  }, []);

  // Sync service logs state modifications to Firestore
  useEffect(() => {
    if (!isServiceLogsLoaded) return;

    const syncToFirestore = async () => {
      try {
        const dbServiceLogs = await fetchCollection<ServiceLog>('serviceLogs');
        const dbLogIds = new Set(dbServiceLogs ? dbServiceLogs.map(item => item.id) : []);
        const currentLogIds = new Set(serviceLogs.map(item => item.id));

        // Write/Update current local state to Firestore
        for (const log of serviceLogs) {
          const sanitized = sanitizeServiceLog(log);
          await writeDocument('serviceLogs', log.id, sanitized);
        }

        // Delete any logs no longer present in local state
        for (const logId of dbLogIds) {
          if (!currentLogIds.has(logId)) {
            await removeDocument('serviceLogs', logId);
          }
        }
      } catch (error) {
        console.error("Error syncing service logs to Firestore:", error);
      }
    };

    syncToFirestore();

    // Cache locally as secondary backup
    try {
      localStorage.setItem('sl_service_logs', JSON.stringify(serviceLogs));
    } catch (e) {
      console.warn("Storage limits or disabled storage.", e);
    }
  }, [serviceLogs, isServiceLogsLoaded]);

  useEffect(() => {
    try {
      localStorage.setItem('sl_tyre_history', JSON.stringify(tyreHistory));
    } catch (e) {
      console.warn("Storage limits or disabled storage.", e);
    }
  }, [tyreHistory]);

  useEffect(() => {
    try {
      localStorage.setItem('sl_tyre_movements', JSON.stringify(tyreMovements));
    } catch (e) {
      console.warn("Storage limits or disabled storage.", e);
    }
  }, [tyreMovements]);

  useEffect(() => {
    try {
      localStorage.setItem('sl_tyre_inspections', JSON.stringify(tyreInspections));
    } catch (e) {
      console.warn("Storage limits or disabled storage.", e);
    }
  }, [tyreInspections]);

  useEffect(() => {
    try {
      localStorage.setItem('sl_tyre_expenses', JSON.stringify(tyreExpenses));
    } catch (e) {
      console.warn("Storage limits or disabled storage.", e);
    }
  }, [tyreExpenses]);

  useEffect(() => {
    try {
      localStorage.setItem('sl_retread_records', JSON.stringify(retreadRecords));
    } catch (e) {
      console.warn("Storage limits or disabled storage.", e);
    }
  }, [retreadRecords]);

  useEffect(() => {
    try {
      localStorage.setItem('sl_service_schedules', JSON.stringify(serviceSchedules));
    } catch (e) {
      console.warn("Storage limits or disabled storage.", e);
    }
  }, [serviceSchedules]);

  // Helper to run automatic notification generation on vehicles, tyres, and schedules
  const generateAutoNotifications = (
    vList: Vehicle[],
    tList: TyreMaster[],
    sList: ServiceSchedule[],
    currentNotifs: CentralNotification[]
  ): CentralNotification[] => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const autoNotifs: CentralNotification[] = [];

    // 1. Service Due & Service Overdue
    sList.forEach(schedule => {
      if (schedule.status === 'Upcoming') {
        if (schedule.dueDate) {
          if (schedule.dueDate < todayStr) {
            autoNotifs.push({
              id: `AUTO_SERVICE_OVERDUE_${schedule.id}`,
              truckNumber: schedule.truckNumber,
              type: 'Service Overdue',
              title: `Service Overdue: ${schedule.serviceType}`,
              message: `Service of type '${schedule.serviceType}' scheduled for ${schedule.dueDate} is critically overdue!`,
              date: todayStr,
              isRead: false,
              severity: 'high'
            });
          } else {
            const dueTime = new Date(schedule.dueDate).getTime();
            const diffDays = Math.ceil((dueTime - today.getTime()) / (1000 * 60 * 60 * 24));
            if (diffDays <= 7) {
              autoNotifs.push({
                id: `AUTO_SERVICE_DUE_${schedule.id}`,
                truckNumber: schedule.truckNumber,
                type: 'Service Due',
                title: `Service Due: ${schedule.serviceType}`,
                message: `Service of type '${schedule.serviceType}' is due soon on ${schedule.dueDate} (in ${diffDays} days).`,
                date: todayStr,
                isRead: false,
                severity: 'medium'
              });
            }
          }
        }
      }
    });

    // 2. Insurance Expiry, Fitness Expiry, Permit Expiry
    vList.forEach(vehicle => {
      if (vehicle.insuranceExpiry) {
        if (vehicle.insuranceExpiry < todayStr) {
          autoNotifs.push({
            id: `AUTO_INSURANCE_EXPIRY_${vehicle.truckNumber}_${vehicle.insuranceExpiry}`,
            truckNumber: vehicle.truckNumber,
            type: 'Insurance Expiry',
            title: `Insurance Expired - ${vehicle.truckNumber}`,
            message: `Vehicle insurance expired on ${vehicle.insuranceExpiry}! Renewal is urgently required.`,
            date: todayStr,
            isRead: false,
            severity: 'high'
          });
        } else {
          const expTime = new Date(vehicle.insuranceExpiry).getTime();
          const diffDays = Math.ceil((expTime - today.getTime()) / (1000 * 60 * 60 * 24));
          if (diffDays <= 15) {
            autoNotifs.push({
              id: `AUTO_INSURANCE_EXPIRY_${vehicle.truckNumber}_${vehicle.insuranceExpiry}`,
              truckNumber: vehicle.truckNumber,
              type: 'Insurance Expiry',
              title: `Insurance Expiring Soon - ${vehicle.truckNumber}`,
              message: `Vehicle insurance will expire on ${vehicle.insuranceExpiry} (in ${diffDays} days).`,
              date: todayStr,
              isRead: false,
              severity: 'medium'
            });
          }
        }
      }

      if (vehicle.fitnessExpiry) {
        if (vehicle.fitnessExpiry < todayStr) {
          autoNotifs.push({
            id: `AUTO_FITNESS_EXPIRY_${vehicle.truckNumber}_${vehicle.fitnessExpiry}`,
            truckNumber: vehicle.truckNumber,
            type: 'Fitness Expiry',
            title: `Fitness Certificate Expired - ${vehicle.truckNumber}`,
            message: `Vehicle Fitness Certificate expired on ${vehicle.fitnessExpiry}! Immediate fitness assessment required.`,
            date: todayStr,
            isRead: false,
            severity: 'high'
          });
        } else {
          const expTime = new Date(vehicle.fitnessExpiry).getTime();
          const diffDays = Math.ceil((expTime - today.getTime()) / (1000 * 60 * 60 * 24));
          if (diffDays <= 15) {
            autoNotifs.push({
              id: `AUTO_FITNESS_EXPIRY_${vehicle.truckNumber}_${vehicle.fitnessExpiry}`,
              truckNumber: vehicle.truckNumber,
              type: 'Fitness Expiry',
              title: `Fitness Expiring Soon - ${vehicle.truckNumber}`,
              message: `Vehicle Fitness Certificate will expire on ${vehicle.fitnessExpiry} (in ${diffDays} days).`,
              date: todayStr,
              isRead: false,
              severity: 'medium'
            });
          }
        }
      }

      if (vehicle.permitExpiry) {
        if (vehicle.permitExpiry < todayStr) {
          autoNotifs.push({
            id: `AUTO_PERMIT_EXPIRY_${vehicle.truckNumber}_${vehicle.permitExpiry}`,
            truckNumber: vehicle.truckNumber,
            type: 'Permit Expiry',
            title: `National Permit Expired - ${vehicle.truckNumber}`,
            message: `Vehicle National Permit expired on ${vehicle.permitExpiry}! Route dispatches suspended until renewal.`,
            date: todayStr,
            isRead: false,
            severity: 'high'
          });
        } else {
          const expTime = new Date(vehicle.permitExpiry).getTime();
          const diffDays = Math.ceil((expTime - today.getTime()) / (1000 * 60 * 60 * 24));
          if (diffDays <= 15) {
            autoNotifs.push({
              id: `AUTO_PERMIT_EXPIRY_${vehicle.truckNumber}_${vehicle.permitExpiry}`,
              truckNumber: vehicle.truckNumber,
              type: 'Permit Expiry',
              title: `National Permit Expiring Soon - ${vehicle.truckNumber}`,
              message: `Vehicle National Permit will expire on ${vehicle.permitExpiry} (in ${diffDays} days).`,
              date: todayStr,
              isRead: false,
              severity: 'medium'
            });
          }
        }
      }
    });

    // 3. Tyre Alerts: Tyre Replacement Due, Low Tread Depth, Low Air Pressure, Warranty Expiry
    tList.forEach(tyre => {
      const vehicleNo = tyre.currentVehicle || tyre.vendor || 'Spare';
      
      // Tyre Replacement Due
      if (tyre.status === 'Active' && tyre.currentRunningKm >= tyre.expectedLifeKm) {
        autoNotifs.push({
          id: `AUTO_TYRE_REPLACE_${tyre.serialNumber}`,
          truckNumber: vehicleNo,
          type: 'Tyre Replacement Due',
          title: `Tyre Replacement Due - ${tyre.serialNumber}`,
          message: `Tyre ${tyre.serialNumber} on vehicle ${vehicleNo} has run ${tyre.currentRunningKm.toLocaleString()} KM, exceeding its expected life of ${tyre.expectedLifeKm.toLocaleString()} KM!`,
          date: todayStr,
          isRead: false,
          severity: 'high'
        });
      }

      // Low Tread Depth
      const depth = typeof tyre.treadDepth === 'number' ? tyre.treadDepth : 12;
      if (tyre.status === 'Active' && depth < 4.5) {
        autoNotifs.push({
          id: `AUTO_TYRE_TREAD_${tyre.serialNumber}`,
          truckNumber: vehicleNo,
          type: 'Low Tread Depth',
          title: `Low Tread Depth - ${tyre.serialNumber}`,
          message: `Tyre ${tyre.serialNumber} on vehicle ${vehicleNo} has critically low tread depth of ${depth} mm (warning threshold is 4.5 mm).`,
          date: todayStr,
          isRead: false,
          severity: 'high'
        });
      }

      // Low Air Pressure
      const psi = typeof tyre.pressure === 'number' ? tyre.pressure : 115;
      if (tyre.status === 'Active' && psi < 100) {
        autoNotifs.push({
          id: `AUTO_TYRE_PSI_${tyre.serialNumber}`,
          truckNumber: vehicleNo,
          type: 'Low Air Pressure',
          title: `Low Air Pressure - ${tyre.serialNumber}`,
          message: `Tyre ${tyre.serialNumber} on vehicle ${vehicleNo} has low air pressure reading of ${psi} PSI (normal is 110-120 PSI).`,
          date: todayStr,
          isRead: false,
          severity: 'medium'
        });
      }

      // Warranty Expiry
      if (tyre.warrantyExpiry) {
        if (tyre.warrantyExpiry < todayStr) {
          autoNotifs.push({
            id: `AUTO_WARRANTY_EXPIRY_${tyre.serialNumber}_${tyre.warrantyExpiry}`,
            truckNumber: vehicleNo,
            type: 'Warranty Expiry',
            title: `Warranty Expired - ${tyre.serialNumber}`,
            message: `Warranty for tyre ${tyre.serialNumber} expired on ${tyre.warrantyExpiry}.`,
            date: todayStr,
            isRead: false,
            severity: 'low'
          });
        } else {
          const expTime = new Date(tyre.warrantyExpiry).getTime();
          const diffDays = Math.ceil((expTime - today.getTime()) / (1000 * 60 * 60 * 24));
          if (diffDays <= 30) {
            autoNotifs.push({
              id: `AUTO_WARRANTY_EXPIRY_${tyre.serialNumber}_${tyre.warrantyExpiry}`,
              truckNumber: vehicleNo,
              type: 'Warranty Expiry',
              title: `Warranty Expiring Soon - ${tyre.serialNumber}`,
              message: `Warranty for tyre ${tyre.serialNumber} is expiring on ${tyre.warrantyExpiry} (in ${diffDays} days).`,
              date: todayStr,
              isRead: false,
              severity: 'low'
            });
          }
        }
      }
    });

    const finalNotifs = [...currentNotifs];
    autoNotifs.forEach(autoN => {
      const existingIdx = finalNotifs.findIndex(n => n.id === autoN.id);
      if (existingIdx >= 0) {
        finalNotifs[existingIdx] = {
          ...autoN,
          isRead: finalNotifs[existingIdx].isRead
        };
      } else {
        finalNotifs.push(autoN);
      }
    });

    return finalNotifs;
  };

  // Load initial notifications from Firestore
  useEffect(() => {
    const loadInitialNotifications = async () => {
      try {
        await ensureSignedIn();
        console.log("Firestore Connected - Notifications");

        const firestoreNotifs = await fetchCollection<any>('notifications');

        if (firestoreNotifs && firestoreNotifs.length > 0) {
          const parsed = firestoreNotifs.map(docData => ({
            id: docData.id || docData.notificationId || String(Math.random()),
            truckNumber: docData.vehicleNo || docData.truckNumber || '',
            type: docData.type || 'Service Due',
            title: docData.title || '',
            message: docData.message || '',
            date: docData.createdAt || docData.date || new Date().toISOString().split('T')[0],
            isRead: typeof docData.read === 'boolean' ? docData.read : (docData.status === 'read' || docData.isRead || false),
            severity: docData.priority || docData.severity || 'low'
          }));

          const unique = Array.from(new Map(parsed.map((item: CentralNotification) => [item.id, item])).values());
          setNotifications(unique);
        } else {
          console.log("Seeding INITIAL_NOTIFICATIONS to Firestore");
          const seeded: CentralNotification[] = [];
          for (const item of INITIAL_NOTIFICATIONS) {
            const mapped = {
              id: item.id,
              vehicleNo: item.truckNumber || '',
              type: item.type,
              title: item.title,
              message: item.message,
              priority: item.severity || 'low',
              status: item.isRead ? 'read' : 'unread',
              createdAt: item.date || new Date().toISOString().split('T')[0],
              read: item.isRead
            };
            await writeDocument('notifications', item.id, mapped);
            seeded.push(item);
          }
          setNotifications(seeded);
        }
      } catch (error) {
        console.error("Error loading notifications from Firestore:", error);
        setNotifications(INITIAL_NOTIFICATIONS);
      } finally {
        setIsNotificationsLoaded(true);
      }
    };

    loadInitialNotifications();
  }, []);

  // Run automatic notifications generation once everything is loaded
  useEffect(() => {
    if (!isVehiclesLoaded || !isTyresLoaded || !isNotificationsLoaded) return;

    const runAutoGenerator = async () => {
      try {
        const generated = generateAutoNotifications(vehicles, tyres, serviceSchedules, notifications);
        const isDifferent = JSON.stringify(generated) !== JSON.stringify(notifications);
        if (isDifferent) {
          setNotifications(generated);
        }
      } catch (err) {
        console.error("Failed to run automatic notification generator:", err);
      }
    };

    runAutoGenerator();
  }, [vehicles, tyres, serviceSchedules, isVehiclesLoaded, isTyresLoaded, isNotificationsLoaded]);

  // Firestore State Sync: Write notifications state modifications to Firestore
  useEffect(() => {
    if (!isNotificationsLoaded) return;

    const syncNotificationsToFirestore = async () => {
      try {
        const dbNotifs = await fetchCollection<any>('notifications');
        const dbIds = new Set(dbNotifs ? dbNotifs.map(n => n.id) : []);
        const currentIds = new Set(notifications.map(n => n.id));

        for (const notif of notifications) {
          const mapped = {
            id: notif.id,
            vehicleNo: notif.truckNumber || '',
            type: notif.type,
            title: notif.title,
            message: notif.message,
            priority: notif.severity || 'low',
            status: notif.isRead ? 'read' : 'unread',
            createdAt: notif.date || new Date().toISOString().split('T')[0],
            read: notif.isRead
          };
          await writeDocument('notifications', notif.id, mapped);
        }

        for (const notifId of dbIds) {
          if (notifId && !currentIds.has(notifId)) {
            await removeDocument('notifications', notifId);
          }
        }
      } catch (error) {
        console.error("Error syncing notifications to Firestore:", error);
      }
    };

    syncNotificationsToFirestore();
  }, [notifications, isNotificationsLoaded]);

  // Tab Dispatcher
  const renderTabContent = () => {
    switch (tab) {
      case 'dashboard':
        return (
          <DashboardView 
            vehicles={vehiclesWithLiveTyres} 
            serviceLogs={serviceLogs} 
            serviceSchedules={serviceSchedules}
            notifications={notifications}
            setNotifications={setNotifications}
            setTab={setTab}
            setSelectedTruckNumForTyres={(num) => {
              setSelectedTruckNumForTyres(num);
              setTab('tyres');
            }}
            tyres={tyres}
            tyreInspections={tyreInspections}
          />
        );
      case 'fleet':
        return (
          <FleetVehiclesView 
            vehicles={vehiclesWithLiveTyres} 
            setVehicles={setVehicles}
            serviceLogs={serviceLogs}
            serviceSchedules={serviceSchedules}
            setServiceSchedules={setServiceSchedules}
            setTab={setTab}
            setSelectedTruckNumForTyres={(num) => {
              setSelectedTruckNumForTyres(num);
              setTab('tyres');
            }}
          />
        );
      case 'service':
        return (
          <ServiceLogsView 
            serviceLogs={serviceLogs} 
            setServiceLogs={setServiceLogs} 
            vehicles={vehiclesWithLiveTyres}
            serviceSchedules={serviceSchedules}
            setServiceSchedules={setServiceSchedules}
            notifications={notifications}
            setNotifications={setNotifications}
          />
        );
      case 'tyres':
        return (
          <TyreManagementView 
            vehicles={vehiclesWithLiveTyres} 
            setVehicles={setVehicles}
            serviceLogs={serviceLogs} 
            setServiceLogs={setServiceLogs}
            initialSelectedTruckNum={selectedTruckNumForTyres}
            tyres={tyres}
            setTyres={setTyres}
            tyreHistory={tyreHistory}
            setTyreHistory={setTyreHistory}
            tyreMovements={tyreMovements}
            setTyreMovements={setTyreMovements}
            tyreInspections={tyreInspections}
            setTyreInspections={setTyreInspections}
            tyreExpenses={tyreExpenses}
            setTyreExpenses={setTyreExpenses}
            retreadRecords={retreadRecords}
            setRetreadRecords={setRetreadRecords}
          />
        );
      case 'notifications':
        return (
          <NotificationCenterView
            notifications={notifications}
            setNotifications={setNotifications}
            vehicles={vehiclesWithLiveTyres}
          />
        );
      case 'reports':
        return (
          <ReportsView 
            vehicles={vehiclesWithLiveTyres} 
            serviceLogs={serviceLogs}
            tyres={tyres}
            tyreExpenses={tyreExpenses}
            retreadRecords={retreadRecords}
          />
        );
      default:
        return (
          <DashboardView 
            vehicles={vehiclesWithLiveTyres} 
            serviceLogs={serviceLogs} 
            serviceSchedules={serviceSchedules}
            notifications={notifications}
            setNotifications={setNotifications}
            setTab={setTab}
            setSelectedTruckNumForTyres={setSelectedTruckNumForTyres}
            tyres={tyres}
            tyreInspections={tyreInspections}
          />
        );
    }
  };

  return (
    <div className="flex bg-[#f1f5f9] min-h-screen text-[#1e293b] font-sans selection:bg-blue-600 selection:text-white">
      
      {/* Sidebar Navigation panel */}
      <Sidebar 
        currentTab={tab} 
        setTab={setTab} 
        isOpen={sidebarOpen} 
        setIsOpen={setSidebarOpen} 
        unreadNotificationsCount={notifications.filter(n => !n.isRead).length}
      />

      {/* Main layout container */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Navbar details */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-8 flex justify-between items-center h-16">
          <div className="flex items-center space-x-2 text-sm text-slate-500">
            <span>Fleet Hub</span>
            <span className="opacity-40">/</span>
            <span className="text-slate-900 font-bold uppercase tracking-wide text-xs">
              {tab === 'dashboard' && 'Dashboard Hub'}
              {tab === 'fleet' && 'Fleet Vehicles Registry'}
              {tab === 'service' && 'Service Logs Archive'}
              {tab === 'tyres' && 'Tyre Management System'}
              {tab === 'notifications' && 'Notification Center'}
              {tab === 'reports' && 'Operational Reports & Audits'}
            </span>
          </div>

          <div className="flex items-center space-x-4">
            {/* Quick stats totals */}
            <div className="hidden sm:flex items-center space-x-2 text-[11px] text-slate-500 font-bold bg-slate-100 px-3 py-1.5 rounded border border-slate-200">
              <span className="uppercase tracking-wider">Managed Wheels:</span>
              <span className="text-blue-600 font-mono font-bold">
                {vehicles.reduce((sum, v) => sum + v.tyresCount, 0)}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded border border-blue-200">
                Hub Active
              </span>
            </div>
          </div>
        </header>

        {/* Dynamic page container */}
        <main className="flex-1 p-8 max-w-7xl w-full mx-auto space-y-6">
          {renderTabContent()}
        </main>

        {/* Humble and Clean footer layout */}
        <footer className="h-10 bg-slate-50 border-t px-8 flex items-center justify-between text-[10px] text-slate-400 uppercase tracking-widest font-mono">
          <div>Environment: Production v4.0.2</div>
          <div>Firestore: Connected • Sync: 12ms</div>
        </footer>

      </div>

    </div>
  );
}
