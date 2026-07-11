import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import HomeDashboardView from './components/HomeDashboardView';
import FleetVehiclesView from './components/FleetVehiclesView';
import TyreManagementView from './components/TyreManagementView';
import ServiceLogsView from './components/ServiceLogsView';
import ReportsView from './components/ReportsView';
import NotificationCenterView from './components/NotificationCenterView';
import PartyDirectoryView from './components/PartyDirectoryView';
import LiveTrackingView from './components/LiveTrackingView';
import SettingsView from './components/SettingsView';
import { Vehicle, ServiceLog, TyreMaster, TyreHistory, TyreMovement, TyreInspection, TyreExpense, RetreadRecord, ServiceSchedule, CentralNotification, TyreMasterStatus, TyreStatus, TripHistoryRecord } from './types';
import { PRESET_VEHICLES, INITIAL_SERVICE_LOGS, INITIAL_TYRES, INITIAL_TYRE_HISTORY, INITIAL_TYRE_MOVEMENTS, INITIAL_TYRE_INSPECTIONS, INITIAL_TYRE_EXPENSES, INITIAL_RETREAD_RECORDS, INITIAL_SERVICE_SCHEDULES, INITIAL_NOTIFICATIONS, INITIAL_TRIPS } from './data/presets';
import { fetchAllTrips } from './services/trips';
import { ensureSignedIn, fetchCollection, writeDocument, removeDocument } from './services/firebase';
import { Menu, Search, Bell, Settings as SettingsIcon, Home, Truck, Compass } from 'lucide-react';

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

  // Upgraded Tyre Asset Management Fields
  const tyreId = t.tyreId || '';
  const pattern = t.pattern || 'Rib Pattern';
  const loadIndex = t.loadIndex || '146/143K';
  const tubeTubeless = t.tubeTubeless || 'Tubeless';
  const radialNylon = t.radialNylon || 'Radial';
  const mfgWeek = typeof t.mfgWeek === 'number' ? t.mfgWeek : 12;
  const mfgYear = typeof t.mfgYear === 'number' ? t.mfgYear : 2026;
  
  const supplierContact = t.supplierContact || '';
  const invoiceNumber = t.invoiceNumber || '';
  const purchaseOrderNumber = t.purchaseOrderNumber || '';
  const gstNumber = t.gstNumber || '';
  
  const manufacturerWarranty = t.manufacturerWarranty || 'Standard 3 Year';
  const dealerWarranty = t.dealerWarranty || '1 Year Road Hazard';
  
  const currentAxle = t.currentAxle || '';
  const installedDate = t.installedDate || installationDate || '';
  const supervisor = t.supervisor || supervisorName || '';
  const foreman = t.foreman || '';

  const repairCount = typeof t.repairCount === 'number' ? t.repairCount : 0;
  const healthScore = typeof t.healthScore === 'number' ? t.healthScore : 100;
  const totalRepairCost = typeof t.totalRepairCost === 'number' ? t.totalRepairCost : 0;
  const totalRetreadCost = typeof t.totalRetreadCost === 'number' ? t.totalRetreadCost : 0;
  const totalInvestment = typeof t.totalInvestment === 'number' ? t.totalInvestment : purchaseCost;
  const costPerKm = typeof t.costPerKm === 'number' ? t.costPerKm : 0;

  const categorizedDocs = t.categorizedDocs || {};

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
    
    // Upgraded Fields
    tyreId,
    pattern,
    loadIndex,
    tubeTubeless,
    radialNylon,
    mfgWeek,
    mfgYear,
    supplierContact,
    invoiceNumber,
    purchaseOrderNumber,
    gstNumber,
    manufacturerWarranty,
    dealerWarranty,
    currentAxle,
    installedDate,
    supervisor,
    foreman,
    repairCount,
    healthScore,
    totalRepairCost,
    totalRetreadCost,
    totalInvestment,
    costPerKm,
    categorizedDocs,

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
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Parse path to tab
  const tab = useMemo(() => {
    const path = location.pathname.substring(1) || 'home';
    const validTabs = ['home', 'dashboard', 'fleet', 'service', 'tyres', 'notifications', 'reports', 'parties', 'tracking', 'settings'];
    return validTabs.includes(path) ? path : 'home';
  }, [location.pathname]);

  const setTab = useCallback((newTab: string) => {
    navigate({
      pathname: `/${newTab}`,
      search: location.search
    });
  }, [navigate, location.search]);

  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [scrolled, setScrolled] = useState<boolean>(false);
  const [headerTitle, setHeaderTitle] = useState<{ title: string; subtitle?: string }>({ title: 'Home Dashboard', subtitle: 'Select Fleet Management Module' });

  const [isSeeding, setIsSeeding] = useState<boolean>(false);

  // Scrolled state is updated dynamically via the main content area's onScroll event

  useEffect(() => {
    localStorage.setItem('sl_maintenance_active_tab', tab);
    switch (tab) {
      case 'home':
        setHeaderTitle({ title: 'Home Dashboard', subtitle: 'Select Fleet Management Module' });
        break;
      case 'dashboard':
        setHeaderTitle({ title: 'Dashboard', subtitle: 'Fleet Operations Overview' });
        break;
      case 'fleet':
        setHeaderTitle({ title: 'Fleet Vehicles', subtitle: 'Manage Registered Trucks' });
        break;
      case 'service':
        setHeaderTitle({ title: 'Service Logs', subtitle: 'Maintenance History' });
        break;
      case 'tyres':
        setHeaderTitle({ title: 'Tyre Management', subtitle: 'Tyre Lifecycle Monitoring' });
        break;
      case 'notifications':
        setHeaderTitle({ title: 'Notification Center', subtitle: 'Recent alerts & events' });
        break;
      case 'reports':
        setHeaderTitle({ title: 'Reports', subtitle: 'Analytics & Expenses' });
        break;
      case 'parties':
        setHeaderTitle({ title: 'Party Directory', subtitle: 'Transporters & Logistics Partners' });
        break;
      case 'tracking':
        setHeaderTitle({ title: 'Live Tracking', subtitle: 'Real-time GPS Trip Monitoring' });
        break;
      case 'settings':
        setHeaderTitle({ title: 'Settings', subtitle: 'Application Configuration' });
        break;
      default:
        setHeaderTitle({ title: 'Home Dashboard', subtitle: 'Select Fleet Management Module' });
    }
  }, [tab]);

  // Database Seed Action
  const handleSeedDatabase = async () => {
    try {
      setIsSeeding(true);
      await ensureSignedIn();
      console.log("Forced reseed started");

      // Seed Vehicles
      for (const vehicle of PRESET_VEHICLES) {
        await writeDocument('vehicles', vehicle.truckNumber, vehicle);
      }
      setVehicles(PRESET_VEHICLES);

      // Seed Tyres
      const sanitizedTyres = INITIAL_TYRES.map((t, idx) => {
        const st = sanitizeTyre(t);
        if (!st.tyreId) {
          st.tyreId = `TY${String(idx + 1).padStart(6, '0')}`;
        }
        return st;
      });
      for (const tyre of sanitizedTyres) {
        let docId = tyre.tyreNumber ? tyre.tyreNumber.trim().toUpperCase() : tyre.serialNumber;
        await writeDocument('tyres', docId, tyre);
      }
      setTyres(sanitizedTyres);

      // Seed Service Logs
      const sanitizedLogs = INITIAL_SERVICE_LOGS.map(log => sanitizeServiceLog(log));
      for (const log of sanitizedLogs) {
        await writeDocument('serviceLogs', log.id, log);
      }
      setServiceLogs(sanitizedLogs);

      // Seed Notifications
      for (const notif of INITIAL_NOTIFICATIONS) {
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
      setNotifications(INITIAL_NOTIFICATIONS);

      alert("All preset records loaded & synchronized with Cloud Firestore successfully!");
    } catch (err) {
      console.error("Failed to seed database:", err);
      alert("Seeding failed. Please check your network and try again.");
    } finally {
      setIsSeeding(false);
    }
  };

  // Cross-view state synchronization: which vehicle is selected when jumping to the Tyre Management tab!
  const selectedTruckNumForTyres = searchParams.get('vehicle') || '';
  const setSelectedTruckNumForTyres = useCallback((num: string) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (num) {
        next.set('vehicle', num);
      } else {
        next.delete('vehicle');
      }
      return next;
    }, { replace: true });
  }, [setSearchParams]);

  const handleSubTabChange = useCallback((subTab: string) => {
    if (subTab === 'master') {
      setHeaderTitle({ title: 'Tyre Master Database', subtitle: 'Tyre Master Database Registry' });
    } else if (subTab === 'history') {
      setHeaderTitle({ title: 'Tyre Journey History', subtitle: 'Tyre Lifecycle Monitoring' });
    } else if (subTab === 'inspection') {
      setHeaderTitle({ title: 'Inspections Registry', subtitle: 'Tyre Inspections & Readings' });
    } else if (subTab === 'retread') {
      setHeaderTitle({ title: 'Retread Hub', subtitle: 'Tyre Retreading Lifecycle' });
    } else if (subTab === 'analytics') {
      setHeaderTitle({ title: 'Tyre Analytics', subtitle: 'Analytics & Performance' });
    } else {
      setHeaderTitle({ title: 'Tyre Management', subtitle: 'Tyre Lifecycle Monitoring' });
    }
  }, []);

  // 1. Initial State: Load from Firestore on mount
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isVehiclesLoaded, setIsVehiclesLoaded] = useState<boolean>(false);

  const [serviceLogs, setServiceLogs] = useState<ServiceLog[]>([]);
  const [isServiceLogsLoaded, setIsServiceLogsLoaded] = useState<boolean>(false);

  const [tyres, setTyres] = useState<TyreMaster[]>([]);
  const [isTyresLoaded, setIsTyresLoaded] = useState<boolean>(false);

  const [tyreHistory, setTyreHistory] = useState<TyreHistory[]>([]);
  const [isTyreHistoryLoaded, setIsTyreHistoryLoaded] = useState<boolean>(false);

  const [tyreMovements, setTyreMovements] = useState<TyreMovement[]>([]);
  const [isTyreMovementsLoaded, setIsTyreMovementsLoaded] = useState<boolean>(false);

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

  const [tripHistory, setTripHistory] = useState<TripHistoryRecord[]>([]);
  const [isTripHistoryLoaded, setIsTripHistoryLoaded] = useState<boolean>(false);

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
          const sanitized = firestoreTyres.map((t, idx) => {
            const st = sanitizeTyre(t);
            if (!st.tyreId) {
              st.tyreId = `TY${String(idx + 1).padStart(6, '0')}`;
            }
            return st;
          });
          const unique = Array.from(new Map(sanitized.map(item => [item.serialNumber, item])).values());
          setTyres(unique);
          console.log("Tyres Loaded from Firestore:", unique.length);
        } else {
          // Import INITIAL_TYRES to Firestore since collection is empty
          console.log("Seeding INITIAL_TYRES to Firestore...");
          const seeded: TyreMaster[] = [];
          const usedTyreNumbers = new Set<string>();
          let idx = 0;
          for (const tyre of INITIAL_TYRES) {
            const sanitized = sanitizeTyre(tyre);
            if (!sanitized.tyreId) {
              sanitized.tyreId = `TY${String(idx + 1).padStart(6, '0')}`;
            }
            let docId = sanitized.tyreNumber ? sanitized.tyreNumber.trim().toUpperCase() : '';
            if (!docId || usedTyreNumbers.has(docId)) {
              docId = sanitized.serialNumber ? sanitized.serialNumber.trim().toUpperCase() : `TYRE_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
            }
            usedTyreNumbers.add(docId);
            await writeDocument('tyres', docId, sanitized);
            seeded.push(sanitized);
            idx++;
          }
          setTyres(seeded);
          console.log("Tyres Seeded & Loaded");
        }
      } catch (error) {
        console.error("Error loading tyres from Firestore:", error);
        // Fallback to presets offline if necessary
        const sanitized = INITIAL_TYRES.map((t, idx) => {
          const st = sanitizeTyre(t);
          if (!st.tyreId) {
            st.tyreId = `TY${String(idx + 1).padStart(6, '0')}`;
          }
          return st;
        });
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

  // Load tyre history from Firestore on mount
  useEffect(() => {
    const loadInitialTyreHistory = async () => {
      try {
        await ensureSignedIn();
        console.log("Firestore Connected - Tyre History");

        const firestoreHist = await fetchCollection<any>('tyreHistory');

        if (firestoreHist && firestoreHist.length > 0) {
          const parsed: TyreHistory[] = firestoreHist.map(h => ({
            historyId: h.historyId || h.id || '',
            vehicleNo: h.vehicleNo || h.truckNumber || '',
            tyreNumber: h.tyreNumber || '',
            serialNumber: h.serialNumber || '',
            oldPosition: h.oldPosition || '',
            newPosition: h.newPosition || h.positionName || '',
            movementType: h.movementType || (h.removedDate ? 'Tyre Removed' : 'Tyre Installed'),
            movementDate: h.movementDate || h.installedDate || '',
            odometer: typeof h.odometer === 'number' ? h.odometer : (h.kmAtInstallation || 0),
            supervisorName: h.supervisorName || '',
            remarks: h.remarks || h.removalReason || '',
            oldStatus: h.oldStatus || '',
            newStatus: h.newStatus || '',
            // Backwards compatibility properties
            id: h.historyId || h.id || '',
            truckNumber: h.vehicleNo || h.truckNumber || '',
            positionId: h.positionId || '',
            positionName: h.newPosition || h.positionName || '',
            installedDate: h.movementDate || h.installedDate || '',
            removedDate: h.removedDate || '',
            kmAtInstallation: typeof h.kmAtInstallation === 'number' ? h.kmAtInstallation : (typeof h.odometer === 'number' ? h.odometer : 0),
            kmAtRemoval: h.kmAtRemoval || 0,
            totalKmRun: h.totalKmRun || 0,
            removalReason: h.remarks || h.removalReason || ''
          }));
          const unique = Array.from(new Map(parsed.map((item: TyreHistory) => [item.historyId, item])).values());
          setTyreHistory(unique);
          console.log("Tyre History Loaded from Firestore:", unique.length);
        } else {
          // Import INITIAL_TYRE_HISTORY since collection is empty
          console.log("Seeding INITIAL_TYRE_HISTORY to Firestore...");
          const seeded: TyreHistory[] = [];
          for (const item of INITIAL_TYRE_HISTORY) {
            const mapped = {
              historyId: item.historyId || item.id || '',
              vehicleNo: item.vehicleNo || item.truckNumber || '',
              tyreNumber: item.tyreNumber || '',
              serialNumber: item.serialNumber || '',
              oldPosition: item.oldPosition || '',
              newPosition: item.newPosition || item.positionName || '',
              movementType: item.movementType || 'Tyre Installed',
              movementDate: item.movementDate || item.installedDate || '',
              odometer: item.odometer || item.kmAtInstallation || 0,
              supervisorName: item.supervisorName || '',
              remarks: item.remarks || item.removalReason || '',
              oldStatus: item.oldStatus || '',
              newStatus: item.newStatus || ''
            };
            await writeDocument('tyreHistory', mapped.historyId, mapped);
            seeded.push(item);
          }
          setTyreHistory(seeded);
          console.log("Tyre History Seeded & Loaded");
        }
      } catch (error) {
        console.error("Error loading tyre history from Firestore:", error);
        setTyreHistory(INITIAL_TYRE_HISTORY);
      } finally {
        setIsTyreHistoryLoaded(true);
      }
    };

    loadInitialTyreHistory();
  }, []);

  // Sync tyreHistory state modifications to Firestore
  useEffect(() => {
    if (!isTyreHistoryLoaded) return;

    const syncTyreHistoryToFirestore = async () => {
      try {
        const dbHist = await fetchCollection<any>('tyreHistory');
        const dbIds = new Set(dbHist ? dbHist.map(h => h.historyId) : []);
        const currentIds = new Set(tyreHistory.map(h => h.historyId));

        for (const item of tyreHistory) {
          const mapped = {
            historyId: item.historyId || item.id || '',
            vehicleNo: item.vehicleNo || item.truckNumber || '',
            tyreNumber: item.tyreNumber || '',
            serialNumber: item.serialNumber || '',
            oldPosition: item.oldPosition || '',
            newPosition: item.newPosition || item.positionName || '',
            movementType: item.movementType || 'Tyre Installed',
            movementDate: item.movementDate || item.installedDate || '',
            odometer: item.odometer || item.kmAtInstallation || 0,
            supervisorName: item.supervisorName || '',
            remarks: item.remarks || item.removalReason || '',
            oldStatus: item.oldStatus || '',
            newStatus: item.newStatus || ''
          };
          await writeDocument('tyreHistory', mapped.historyId, mapped);
        }

        for (const id of dbIds) {
          if (id && !currentIds.has(id)) {
            await removeDocument('tyreHistory', id);
          }
        }
      } catch (error) {
        console.error("Error syncing tyre history to Firestore:", error);
      }
    };

    syncTyreHistoryToFirestore();

    try {
      localStorage.setItem('sl_tyre_history', JSON.stringify(tyreHistory));
    } catch (e) {
      console.warn("Storage limits or disabled storage.", e);
    }
  }, [tyreHistory, isTyreHistoryLoaded]);

  // Load tyre movements from Firestore on mount
  useEffect(() => {
    const loadInitialTyreMovements = async () => {
      try {
        await ensureSignedIn();
        console.log("Firestore Connected - Tyre Movements");

        const firestoreMove = await fetchCollection<any>('tyreMovements');

        if (firestoreMove && firestoreMove.length > 0) {
          const parsed: TyreMovement[] = firestoreMove.map(m => ({
            movementId: m.movementId || m.id || '',
            tyreNumber: m.tyreNumber || m.serialNumber || '',
            vehicleFrom: m.vehicleFrom || m.sourceVehicle || '',
            vehicleTo: m.vehicleTo || m.destinationVehicle || '',
            positionFrom: m.positionFrom || m.sourcePosition || '',
            positionTo: m.positionTo || m.destinationPosition || '',
            movementDate: m.movementDate || (m.date ? m.date.split(' ')[0] : ''),
            odometer: typeof m.odometer === 'number' ? m.odometer : 0,
            supervisorName: m.supervisorName || '',
            reason: m.reason || '',

            // Backwards compatibility properties
            id: m.movementId || m.id || '',
            serialNumber: m.tyreNumber || m.serialNumber || '',
            sourceVehicle: m.vehicleFrom || m.sourceVehicle || '',
            destinationVehicle: m.vehicleTo || m.destinationVehicle || '',
            sourcePosition: m.positionFrom || m.sourcePosition || '',
            destinationPosition: m.positionTo || m.destinationPosition || '',
            date: m.date || `${m.movementDate || ''} 00:00`
          }));
          const unique = Array.from(new Map(parsed.map((item: TyreMovement) => [item.movementId, item])).values());
          setTyreMovements(unique);
          console.log("Tyre Movements Loaded from Firestore:", unique.length);
        } else {
          // Import INITIAL_TYRE_MOVEMENTS since collection is empty
          console.log("Seeding INITIAL_TYRE_MOVEMENTS to Firestore...");
          const seeded: TyreMovement[] = [];
          for (const item of INITIAL_TYRE_MOVEMENTS) {
            const mapped = {
              movementId: item.movementId || item.id || '',
              tyreNumber: item.tyreNumber || item.serialNumber || '',
              vehicleFrom: item.vehicleFrom || item.sourceVehicle || '',
              vehicleTo: item.vehicleTo || item.destinationVehicle || '',
              positionFrom: item.positionFrom || item.sourcePosition || '',
              positionTo: item.positionTo || item.destinationPosition || '',
              movementDate: item.movementDate || (item.date ? item.date.split(' ')[0] : ''),
              odometer: typeof item.odometer === 'number' ? item.odometer : 0,
              supervisorName: item.supervisorName || '',
              reason: item.reason || 'Routine replacement / rotation'
            };
            await writeDocument('tyreMovements', mapped.movementId, mapped);
            
            seeded.push({
              ...item,
              ...mapped,
              id: mapped.movementId,
              serialNumber: mapped.tyreNumber,
              sourceVehicle: mapped.vehicleFrom,
              destinationVehicle: mapped.vehicleTo,
              sourcePosition: mapped.positionFrom,
              destinationPosition: mapped.positionTo,
              date: item.date || `${mapped.movementDate} 00:00`
            });
          }
          setTyreMovements(seeded);
          console.log("Tyre Movements Seeded & Loaded");
        }
      } catch (error) {
        console.error("Error loading tyre movements from Firestore:", error);
        setTyreMovements(INITIAL_TYRE_MOVEMENTS);
      } finally {
        setIsTyreMovementsLoaded(true);
      }
    };

    loadInitialTyreMovements();
  }, []);

  // Sync tyreMovements state modifications to Firestore
  useEffect(() => {
    if (!isTyreMovementsLoaded) return;

    const syncTyreMovementsToFirestore = async () => {
      try {
        const dbMove = await fetchCollection<any>('tyreMovements');
        const dbIds = new Set(dbMove ? dbMove.map(m => m.movementId) : []);
        const currentIds = new Set(tyreMovements.map(m => m.movementId));

        for (const item of tyreMovements) {
          const mapped = {
            movementId: item.movementId || item.id || '',
            tyreNumber: item.tyreNumber || item.serialNumber || '',
            vehicleFrom: item.vehicleFrom || item.sourceVehicle || '',
            vehicleTo: item.vehicleTo || item.destinationVehicle || '',
            positionFrom: item.positionFrom || item.sourcePosition || '',
            positionTo: item.positionTo || item.destinationPosition || '',
            movementDate: item.movementDate || (item.date ? item.date.split(' ')[0] : ''),
            odometer: typeof item.odometer === 'number' ? item.odometer : 0,
            supervisorName: item.supervisorName || '',
            reason: item.reason || 'Routine replacement / rotation'
          };
          await writeDocument('tyreMovements', mapped.movementId, mapped);
        }

        for (const id of dbIds) {
          if (id && !currentIds.has(id)) {
            await removeDocument('tyreMovements', id);
          }
        }
      } catch (error) {
        console.error("Error syncing tyre movements to Firestore:", error);
      }
    };

    syncTyreMovementsToFirestore();

    try {
      localStorage.setItem('sl_tyre_movements', JSON.stringify(tyreMovements));
    } catch (e) {
      console.warn("Storage limits or disabled storage.", e);
    }
  }, [tyreMovements, isTyreMovementsLoaded]);

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

      if (vehicle.eWayBillExpiry) {
        if (vehicle.eWayBillExpiry < todayStr) {
          autoNotifs.push({
            id: `AUTO_EWAY_EXPIRY_${vehicle.truckNumber}_${vehicle.eWayBillExpiry}`,
            truckNumber: vehicle.truckNumber,
            type: 'E-Way Bill Expiry',
            title: `E-Way Bill Expired - ${vehicle.truckNumber}`,
            message: `Vehicle E-Way Bill expired on ${vehicle.eWayBillExpiry}! Action is required immediately.`,
            date: todayStr,
            isRead: false,
            severity: 'high'
          });
        } else {
          const expTime = new Date(vehicle.eWayBillExpiry).getTime();
          const diffDays = Math.ceil((expTime - today.getTime()) / (1000 * 60 * 60 * 24));
          if (diffDays <= 15) {
            autoNotifs.push({
              id: `AUTO_EWAY_EXPIRY_${vehicle.truckNumber}_${vehicle.eWayBillExpiry}`,
              truckNumber: vehicle.truckNumber,
              type: 'E-Way Bill Expiry',
              title: `E-Way Bill Expiring Soon - ${vehicle.truckNumber}`,
              message: `Vehicle E-Way Bill will expire on ${vehicle.eWayBillExpiry} (in ${diffDays} days).`,
              date: todayStr,
              isRead: false,
              severity: 'medium'
            });
          }
        }
      }

      if (vehicle.pucExpiry) {
        if (vehicle.pucExpiry < todayStr) {
          autoNotifs.push({
            id: `AUTO_PUC_EXPIRY_${vehicle.truckNumber}_${vehicle.pucExpiry}`,
            truckNumber: vehicle.truckNumber,
            type: 'PUC Expiry',
            title: `PUC Certificate Expired - ${vehicle.truckNumber}`,
            message: `Vehicle PUC certificate expired on ${vehicle.pucExpiry}! Pollution check is required immediately.`,
            date: todayStr,
            isRead: false,
            severity: 'high'
          });
        } else {
          const expTime = new Date(vehicle.pucExpiry).getTime();
          const diffDays = Math.ceil((expTime - today.getTime()) / (1000 * 60 * 60 * 24));
          if (diffDays <= 30) {
            autoNotifs.push({
              id: `AUTO_PUC_EXPIRY_${vehicle.truckNumber}_${vehicle.pucExpiry}_${diffDays}`,
              truckNumber: vehicle.truckNumber,
              type: 'PUC Expiry',
              title: `PUC Expiring Soon - ${vehicle.truckNumber}`,
              message: `Vehicle PUC certificate will expire on ${vehicle.pucExpiry} (in ${diffDays} days).`,
              date: todayStr,
              isRead: false,
              severity: diffDays <= 7 ? 'high' : 'medium'
            });
          }
        }
      }
    });

    // 3. Tyre Alerts: Tyre Replacement Due, Low Tread Depth, Low Air Pressure, Warranty Expiry
    tList.forEach(tyre => {
      const vehicleNo = tyre.currentVehicle || tyre.vendor || 'Spare';
      
      // Tyre Replacement Due
      if ((tyre.status === TyreMasterStatus.INSTALLED || (tyre.status as string) === 'Active') && tyre.currentRunningKm >= tyre.expectedLifeKm) {
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
      if ((tyre.status === TyreMasterStatus.INSTALLED || (tyre.status as string) === 'Active') && depth < 4.5) {
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
      if ((tyre.status === TyreMasterStatus.INSTALLED || (tyre.status as string) === 'Active') && psi < 100) {
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

  // Load trip history from Firestore on mount
  useEffect(() => {
    const loadInitialTripHistory = async () => {
      try {
        await ensureSignedIn();
        console.log("Firestore Connected - Trip History");

        const firestoreTrips = await fetchAllTrips();

        if (firestoreTrips && firestoreTrips.length > 0) {
          const unique = Array.from(new Map(firestoreTrips.map(item => [item.tripId, item])).values());
          unique.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setTripHistory(unique);
          console.log("Trip History Loaded from Firestore:", unique.length);
        } else {
          console.log("Seeding INITIAL_TRIPS to Firestore...");
          const seeded: TripHistoryRecord[] = [];
          for (const trip of INITIAL_TRIPS) {
            await writeDocument('tripHistory', trip.tripId, trip);
            seeded.push(trip);
          }
          setTripHistory(seeded);
          console.log("Trip History Seeded & Loaded");
        }
      } catch (error) {
        console.error("Error loading trip history from Firestore:", error);
        setTripHistory(INITIAL_TRIPS);
      } finally {
        setIsTripHistoryLoaded(true);
      }
    };

    loadInitialTripHistory();
  }, []);

  // Sync tripHistory state modifications to Firestore
  useEffect(() => {
    if (!isTripHistoryLoaded) return;

    const syncTripsToFirestore = async () => {
      try {
        for (const trip of tripHistory) {
          await writeDocument('tripHistory', trip.tripId, trip);
        }
      } catch (error) {
        console.error("Error syncing trip history to Firestore:", error);
      }
    };

    syncTripsToFirestore();
  }, [tripHistory, isTripHistoryLoaded]);

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
      case 'home':
        return (
          <HomeDashboardView 
            vehicles={vehiclesWithLiveTyres} 
            serviceLogs={serviceLogs} 
            serviceSchedules={serviceSchedules}
            notifications={notifications}
            setTab={setTab}
            tyres={tyres}
          />
        );
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
            tripHistory={tripHistory}
            setTripHistory={setTripHistory}
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
            onSubTabChange={handleSubTabChange}
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
      case 'parties':
        return (
          <PartyDirectoryView />
        );
      case 'tracking':
        return (
          <LiveTrackingView 
            vehicles={vehiclesWithLiveTyres} 
            setVehicles={setVehicles} 
          />
        );
      case 'settings':
        return (
          <SettingsView 
            vehicles={vehiclesWithLiveTyres} 
            onSeedDatabase={handleSeedDatabase}
            isSeeding={isSeeding}
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

  // Global search implementation
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    const results: Array<{
      id: string;
      category: 'Vehicle' | 'Service Log' | 'Tyre';
      title: string;
      subtitle: string;
      tab: string;
    }> = [];

    // Search vehicles
    vehiclesWithLiveTyres.forEach(v => {
      const routeStr = v.currentTripFrom && v.currentTripTo ? `${v.currentTripFrom} → ${v.currentTripTo}` : '';
      if (
        v.truckNumber.toLowerCase().includes(q) || 
        v.driverName.toLowerCase().includes(q) || 
        (v.supervisorName && v.supervisorName.toLowerCase().includes(q)) ||
        (routeStr && routeStr.toLowerCase().includes(q))
      ) {
        results.push({
          id: `vehicle-${v.truckNumber}`,
          category: 'Vehicle',
          title: v.truckNumber,
          subtitle: `Driver: ${v.driverName} | Route: ${routeStr || 'Local'}`,
          tab: 'fleet'
        });
      }
    });

    // Search service logs
    serviceLogs.forEach(l => {
      if (
        l.id.toLowerCase().includes(q) ||
        l.truckNumber.toLowerCase().includes(q) ||
        l.description.toLowerCase().includes(q) ||
        (l.workshop && l.workshop.toLowerCase().includes(q))
      ) {
        results.push({
          id: `service-${l.id}`,
          category: 'Service Log',
          title: `${l.truckNumber} - ${l.description}`,
          subtitle: `Cost: ₹${l.cost.toLocaleString()} | Date: ${l.date} | Workshop: ${l.workshop || 'Primary'}`,
          tab: 'service'
        });
      }
    });

    // Search tyres
    tyres.forEach(t => {
      if (
        t.serialNumber.toLowerCase().includes(q) ||
        (t.tyreNumber && t.tyreNumber.toLowerCase().includes(q)) ||
        t.brand.toLowerCase().includes(q)
      ) {
        results.push({
          id: `tyre-${t.serialNumber}`,
          category: 'Tyre',
          title: `Tyre: ${t.serialNumber} (${t.brand})`,
          subtitle: `Status: ${t.status} | Vehicle: ${t.currentVehicle || 'Spare'}`,
          tab: 'tyres'
        });
      }
    });

    return results.slice(0, 8);
  }, [searchQuery, vehiclesWithLiveTyres, serviceLogs, tyres]);

  return (
    <div className="flex bg-[#F8FAFC] h-screen overflow-hidden text-slate-800 font-sans selection:bg-blue-600 selection:text-white">
      
      {/* Sidebar Navigation panel */}
      <Sidebar 
        currentTab={tab} 
        setTab={setTab} 
        isOpen={sidebarOpen} 
        setIsOpen={setSidebarOpen} 
        unreadNotificationsCount={notifications.filter(n => !n.isRead).length}
      />

      {/* Main layout container */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        
        {/* Sticky/Fixed Top Navbar details */}
        <header 
          style={{
            height: 'calc(64px + env(safe-area-inset-top, 0px))',
            paddingTop: 'env(safe-area-inset-top, 0px)',
          }}
          className={`w-full flex-shrink-0 bg-white border-b border-slate-100 px-4 md:px-6 sticky top-0 z-30 flex items-center transition-all duration-200 ${
            scrolled ? 'shadow-[0_2px_12px_rgba(15,23,42,0.04)] border-b-slate-200/50' : ''
          }`}
        >
          <div className="flex items-center justify-between w-full h-full gap-4">
            
            {/* Left: Branding & Mobile Menu Control */}
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => setSidebarOpen(true)}
                className="md:hidden p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-colors focus:outline-none shrink-0"
                aria-label="Open sidebar"
              >
                <Menu size={20} className="stroke-[2.5]" />
              </button>

              {/* Title and navigation link */}
              <div className="flex items-center min-w-0 select-none">
                {tab === 'home' ? (
                  <div className="flex items-center gap-2">
                    <div className="bg-blue-600/10 p-1.5 rounded-xl text-blue-600 flex items-center justify-center shrink-0">
                      <Truck size={14} className="stroke-[2.5]" />
                    </div>
                    <h1 className="text-sm md:text-base font-semibold text-slate-900 leading-none tracking-tight truncate">
                      SL Maintenance Hub
                    </h1>
                  </div>
                ) : (
                  <button 
                    onClick={() => setTab('home')}
                    className="text-sm md:text-base font-semibold text-slate-900 hover:text-blue-600 transition-colors duration-150 focus:outline-none text-left tracking-tight cursor-pointer"
                  >
                    Dashboard
                  </button>
                )}
              </div>
            </div>

            {/* Middle: SaaS Header Search Bar with Results Popup */}
            <div className="hidden sm:block flex-1 max-w-md relative">
              <div className="relative">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Global Search (Trucks, Tyres, Service logs...)"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSearchResults(true);
                  }}
                  onFocus={() => setShowSearchResults(true)}
                  className="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-xs text-slate-800 placeholder-slate-400 font-medium pl-10 pr-4 py-2 rounded-xl border border-slate-200/60 focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all duration-150"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600 uppercase focus:outline-none"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Floating search dropdown popup */}
              {showSearchResults && searchQuery.trim() && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowSearchResults(false)} 
                  />
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200/80 rounded-2xl shadow-xl z-50 overflow-hidden max-h-96 overflow-y-auto">
                    <div className="p-3 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                        Search Results
                      </span>
                      <span className="text-[9px] font-bold text-slate-400 font-mono">
                        {searchResults.length} Match(es)
                      </span>
                    </div>

                    {searchResults.length > 0 ? (
                      <div className="py-1.5 divide-y divide-slate-50">
                        {searchResults.map((result) => (
                          <button
                            key={result.id}
                            onClick={() => {
                              setTab(result.tab);
                              setSearchQuery('');
                              setShowSearchResults(false);
                            }}
                            className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-start gap-3 transition duration-150 cursor-pointer"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-600 border border-blue-100/30 font-mono shrink-0">
                                  {result.category}
                                </span>
                                <h4 className="text-xs font-bold text-slate-800 truncate">
                                  {result.title}
                                </h4>
                              </div>
                              <p className="text-[10px] text-slate-400 truncate font-semibold">
                                {result.subtitle}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="p-6 text-center text-xs text-slate-400 font-medium">
                        No matches found for "{searchQuery}"
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Right: SaaS Toolbar Controls (Search icon for mobile, notifications count, profile avatar) */}
            <div className="flex items-center gap-1.5 sm:gap-2 text-slate-400 shrink-0">
              
              {/* Notifications Button */}
              <button 
                onClick={() => setTab('notifications')}
                className={`p-2 hover:bg-slate-50 rounded-xl transition-colors duration-150 relative cursor-pointer ${
                  tab === 'notifications' ? 'text-blue-600 bg-blue-50/50' : 'text-slate-500 hover:text-slate-900'
                }`} 
                aria-label="Notifications"
                title="Notifications"
              >
                <Bell size={18} className="stroke-[1.8]" />
                {notifications.filter(n => !n.isRead).length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse ring-2 ring-white" />
                )}
              </button>

              {/* Settings Button */}
              <button 
                onClick={() => setTab('settings')}
                className={`p-2 hover:bg-slate-50 rounded-xl transition-colors duration-150 cursor-pointer ${
                  tab === 'settings' ? 'text-blue-600 bg-blue-50/50' : 'text-slate-500 hover:text-slate-900'
                }`} 
                aria-label="Settings"
                title="Settings"
              >
                <SettingsIcon size={18} className="stroke-[1.8]" />
              </button>

              {/* Separation line */}
              <div className="h-6 w-px bg-slate-200/70 mx-1 hidden sm:block" />

              {/* User Profile Block */}
              <div className="flex items-center gap-2 select-none pl-1">
                <div className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center border border-slate-200/60 shadow-xs cursor-pointer transition-all">
                  AD
                </div>
                <div className="hidden lg:flex flex-col text-left leading-none">
                  <span className="text-xs font-bold text-slate-800">Admin</span>
                  <span className="text-[9px] text-slate-400 font-bold tracking-tight mt-0.5">Fleet Manager</span>
                </div>
              </div>

            </div>
          </div>
        </header>

        {/* Scrollable content container */}
        <div 
          onScroll={(e) => {
            setScrolled(e.currentTarget.scrollTop > 10);
          }}
          className="flex-1 overflow-y-auto flex flex-col min-h-0 pb-20 md:pb-0"
        >
          {/* Dynamic page container with spacious layout */}
          <main className="flex-1 p-4 sm:p-5 md:p-6 max-w-[96rem] w-full mx-auto space-y-6">
            {renderTabContent()}
          </main>

          {/* Humble and Clean footer layout */}
          <footer className="h-10 bg-slate-50 border-t border-slate-100 px-8 flex items-center justify-between text-[10px] text-slate-400 uppercase tracking-widest font-mono shrink-0">
            <div>Environment: Production v4.0.2</div>
            <div>Firestore: Connected • Sync: 12ms</div>
          </footer>
        </div>

      </div>

      {/* Bottom Mobile Navigation bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 z-50 shadow-[0_-4px_16px_rgba(15,23,42,0.04)] px-4 py-2 flex items-center justify-around pb-[calc(10px+env(safe-area-inset-bottom,0px))] select-none">
        {[
          { id: 'home', name: 'Hub', icon: Home },
          { id: 'fleet', name: 'Fleet', icon: Truck },
          { id: 'tracking', name: 'Tracking', icon: Compass },
          { id: 'notifications', name: 'Alerts', icon: Bell, badge: notifications.filter(n => !n.isRead).length },
          { id: 'settings', name: 'Settings', icon: SettingsIcon },
        ].map(item => {
          const Icon = item.icon;
          const isActive = tab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className="flex flex-col items-center justify-center p-1.5 focus:outline-none relative min-w-[56px] cursor-pointer animate-none"
            >
              <div className="relative">
                <Icon
                  size={20}
                  className={`transition-colors duration-200 ${
                    isActive ? 'text-blue-600' : 'text-slate-400'
                  }`}
                />
                {item.badge && item.badge > 0 ? (
                  <span className="absolute -top-1.5 -right-2.5 bg-red-500 text-white text-[8px] font-extrabold h-4 min-w-4 px-1 flex items-center justify-center rounded-full border border-white">
                    {item.badge}
                  </span>
                ) : null}
              </div>
              <span
                className={`text-[9px] font-extrabold uppercase tracking-wider mt-1 transition-colors duration-200 ${
                  isActive ? 'text-blue-600' : 'text-slate-400'
                }`}
              >
                {item.name}
              </span>
            </button>
          );
        })}
      </div>

    </div>
  );
}
