import React, { useState, useEffect, useRef } from 'react';
import { Vehicle, Tyre, TyreStatus, ServiceLog, ServiceType, VehicleManufacturer, TyreMaster, TyreMasterStatus, TyreHistory, TyreMovement, TyreInspection, TyreExpense, RetreadRecord } from '../types';
import { 
  Disc, 
  Wrench, 
  Info,
  Sliders,
  Database,
  History,
  ClipboardCheck,
  Activity,
  Plus,
  Upload,
  ArrowLeftRight,
  ShieldAlert,
  Calendar,
  CheckCircle2,
  Trash2,
  CheckSquare,
  Sparkles,
  Search,
  FileText,
  X,
  TrendingUp,
  BarChart3,
  AlertTriangle,
  AlertCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface TyreManagementViewProps {
  vehicles: Vehicle[];
  setVehicles: React.Dispatch<React.SetStateAction<Vehicle[]>>;
  serviceLogs: ServiceLog[];
  setServiceLogs: React.Dispatch<React.SetStateAction<ServiceLog[]>>;
  initialSelectedTruckNum?: string;

  tyres: TyreMaster[];
  setTyres: React.Dispatch<React.SetStateAction<TyreMaster[]>>;
  tyreHistory: TyreHistory[];
  setTyreHistory: React.Dispatch<React.SetStateAction<TyreHistory[]>>;
  tyreMovements: TyreMovement[];
  setTyreMovements: React.Dispatch<React.SetStateAction<TyreMovement[]>>;
  tyreInspections: TyreInspection[];
  setTyreInspections: React.Dispatch<React.SetStateAction<TyreInspection[]>>;
  tyreExpenses: TyreExpense[];
  setTyreExpenses: React.Dispatch<React.SetStateAction<TyreExpense[]>>;
  retreadRecords: RetreadRecord[];
  setRetreadRecords: React.Dispatch<React.SetStateAction<RetreadRecord[]>>;
  onSubTabChange?: (subTab: 'chassis' | 'analytics' | 'master' | 'history' | 'inspection' | 'retread') => void;
}

export default function TyreManagementView({ 
  vehicles, 
  setVehicles, 
  serviceLogs, 
  setServiceLogs,
  initialSelectedTruckNum,
  tyres,
  setTyres,
  tyreHistory,
  setTyreHistory,
  tyreMovements,
  setTyreMovements,
  tyreInspections,
  setTyreInspections,
  tyreExpenses,
  setTyreExpenses,
  retreadRecords,
  setRetreadRecords,
  onSubTabChange
}: TyreManagementViewProps) {
  
  // Tabs management
  const [activeSubTab, setActiveSubTab] = useState<'chassis' | 'analytics' | 'master' | 'history' | 'inspection' | 'retread'>('chassis');

  useEffect(() => {
    if (onSubTabChange) {
      onSubTabChange(activeSubTab);
    }
  }, [activeSubTab, onSubTabChange]);
  const [historyViewMode, setHistoryViewMode] = useState<'movements' | 'journey'>('movements');

  // Select the local vehicle context
  const [selectedTruckNum, setSelectedTruckNum] = useState<string>(
    initialSelectedTruckNum || vehicles[0]?.truckNumber || ''
  );

  // Synchronize on external state transfers
  useEffect(() => {
    if (initialSelectedTruckNum) {
      setSelectedTruckNum(initialSelectedTruckNum);
      setActiveSubTab('chassis'); // automatically navigate to chassis workbench
    }
  }, [initialSelectedTruckNum]);

  const activeVehicle = vehicles.find(v => v.truckNumber === selectedTruckNum) || vehicles[0];

  // Currently selected tyre position for visual inspection/modification
  const [selectedTyrePosId, setSelectedTyrePosId] = useState<string>('');

  // Selected tyre object inside active vehicle
  const activeTyre = activeVehicle?.tyres.find(t => t.positionId === selectedTyrePosId) || activeVehicle?.tyres[0];

  const prevTruckNumRef = useRef<string>('');

  const addTyreHistoryRecord = (params: {
    vehicleNo: string;
    serialNumber: string;
    oldPosition?: string;
    newPosition?: string;
    movementType: 'Tyre Installed' | 'Tyre Removed' | 'Tyre Replaced' | 'Tyre Swapped' | 'Tyre Sent for Retread' | 'Tyre Returned from Retread' | 'Tyre Scrapped';
    odometer: number;
    supervisorName: string;
    remarks?: string;
    oldStatus?: string;
    newStatus?: string;
  }) => {
    const masterTyre = tyres.find(t => t.serialNumber === params.serialNumber);
    const tyreNo = masterTyre?.tyreNumber || masterTyre?.serialNumber || '';

    const newHist: TyreHistory = {
      historyId: `TH_${Date.now()}_${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
      vehicleNo: params.vehicleNo,
      tyreNumber: tyreNo,
      serialNumber: params.serialNumber,
      oldPosition: params.oldPosition || '',
      newPosition: params.newPosition || '',
      movementType: params.movementType,
      movementDate: new Date().toISOString().split('T')[0],
      odometer: params.odometer,
      supervisorName: params.supervisorName,
      remarks: params.remarks || '',
      oldStatus: params.oldStatus || '',
      newStatus: params.newStatus || '',

      // Backwards compatibility properties
      id: `TH_${Date.now()}_${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
      truckNumber: params.vehicleNo,
      positionId: params.newPosition || params.oldPosition || '',
      positionName: params.newPosition || params.oldPosition || '',
      installedDate: new Date().toISOString().split('T')[0],
      kmAtInstallation: params.odometer,
      removalReason: params.remarks || ''
    };

    setTyreHistory(prev => [newHist, ...prev]);
  };

  // Ensure there is always a default active tyre selected if plate changes
  useEffect(() => {
    if (prevTruckNumRef.current !== selectedTruckNum) {
      if (activeVehicle) {
        setSelectedTyrePosId(activeVehicle.tyres[0]?.positionId || '');
      }
      prevTruckNumRef.current = selectedTruckNum;
    }
  }, [selectedTruckNum, activeVehicle]);

  // Handle Edit Input fields for the selected tyre
  const [serialInput, setSerialInput] = useState('');
  const [brandInput, setBrandInput] = useState('');
  const [psiInput, setPsiInput] = useState(115);
  const [depthInput, setDepthInput] = useState(12);

  // Sync inputs when active tyre changes
  useEffect(() => {
    if (activeTyre) {
      setSerialInput(activeTyre.serialNumber);
      setBrandInput(activeTyre.brand);
      setPsiInput(activeTyre.psi);
      setDepthInput(activeTyre.treadDepthMm);
      console.log("Selected Tyre After Refresh:", activeTyre.serialNumber);
    }
  }, [activeTyre, selectedTyrePosId]);

  // Save updated tyre parameters directly to parent React state
  const handleUpdateTyreDetails = (
    serial: string, 
    brand: string, 
    psi: number, 
    depth: number
  ) => {
    if (!activeVehicle || !activeTyre) return;

    console.log("Selected Tyre Before Save:", activeTyre.serialNumber);

    // Recalculate Tyre status
    let newStatus = TyreStatus.OK;
    if (psi < 50) newStatus = TyreStatus.FLAT;
    else if (psi < 100) newStatus = TyreStatus.LOW_PRESSURE;
    else if (depth < 4.5) newStatus = TyreStatus.WORN_OUT;

    const newWear = Math.round(((16 - depth) / 16) * 100);

    // Update vehicle's tyres array
    setVehicles(prevVehicles => prevVehicles.map(v => {
      if (v.truckNumber === activeVehicle.truckNumber) {
        return {
          ...v,
          lastUpdated: new Date().toISOString(),
          tyres: v.tyres.map(t => {
            if (t.positionId === activeTyre.positionId) {
              return {
                ...t,
                serialNumber: serial,
                brand: brand,
                psi: psi,
                treadDepthMm: depth,
                wearPercentage: newWear,
                status: newStatus
              };
            }
            return t;
          })
        };
      }
      return v;
    }));

    // Synchronously update Tyre Master DB if tyre serial exists
    setTyres(prev => prev.map(t => {
      if (t.serialNumber === serial || t.serialNumber === activeTyre.serialNumber) {
        return {
          ...t,
          serialNumber: serial,
          brand: brand,
          currentRunningKm: t.currentRunningKm + 10, // slight run simulated
          status: newStatus === TyreStatus.WORN_OUT ? TyreMasterStatus.REMOVED : TyreMasterStatus.ACTIVE
        };
      }
      return t;
    }));

    console.log("Selected Tyre After Save:", serial);
  };

  // 1. Inflate Air Service
  const executeAirInflation = () => {
    const defaultNormalPsi = 118;
    setPsiInput(defaultNormalPsi);
    handleUpdateTyreDetails(serialInput, brandInput, defaultNormalPsi, depthInput);

    // Write maintenance log
    const inflationLog: ServiceLog = {
      id: `LOG_AIR_${Date.now()}`,
      truckNumber: activeVehicle.truckNumber,
      date: new Date().toISOString().split('T')[0],
      type: ServiceType.AIR_CHECK,
      positionId: activeTyre.positionId,
      description: `Pressure inflated from ${activeTyre.psi} PSI to ${defaultNormalPsi} PSI on position ${activeTyre.positionName}.`,
      cost: 50,
      supervisorName: activeVehicle.supervisorName,
      
      // Phase 2 compatibility keys
      vehicleNo: activeVehicle.truckNumber,
      serviceDate: new Date().toISOString().split('T')[0],
      serviceType: ServiceType.AIR_CHECK,
      serviceCost: 50
    };
    setServiceLogs(prev => [inflationLog, ...prev]);
  };

  // 2. Fix Puncture Service
  const executePunctureFix = () => {
    const inflatedPsi = 115;
    setPsiInput(inflatedPsi);
    handleUpdateTyreDetails(serialInput, brandInput, inflatedPsi, depthInput);

    // Write maintenance log
    const punctureLog: ServiceLog = {
      id: `LOG_PUNC_${Date.now()}`,
      truckNumber: activeVehicle.truckNumber,
      date: new Date().toISOString().split('T')[0],
      type: ServiceType.PUNCTURE,
      positionId: activeTyre.positionId,
      description: `Patched puncture on position ${activeTyre.positionName}. Restored to ${inflatedPsi} PSI. Sidewalls checked.`,
      cost: 450,
      supervisorName: activeVehicle.supervisorName,
      
      // Phase 2 compatibility keys
      vehicleNo: activeVehicle.truckNumber,
      serviceDate: new Date().toISOString().split('T')[0],
      serviceType: ServiceType.PUNCTURE,
      serviceCost: 450
    };
    setServiceLogs(prev => [punctureLog, ...prev]);
  };

  // Complete Premium Tyre Replacement / Swap form state
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [selectedSpareSerial, setSelectedSpareSerial] = useState('');
  const [removalReasonInput, setRemovalReasonInput] = useState('Low tread depth / worn out');
  const [swapSupervisor, setSwapSupervisor] = useState(activeVehicle?.supervisorName || 'Mustak');
  const [installKmInput, setInstallKmInput] = useState(120000);

  // Get unique supervisor names for auto-suggestion
  const supervisorSuggestions = Array.from(new Set([
    ...vehicles.map(v => v.supervisorName),
    ...serviceLogs.map(log => log.supervisorName),
    "Mustak", "Ajru", "Irshad", "Imtiyaz", "Sachin"
  ].filter(Boolean)));

  // Advanced fields for Swap & Replacement Modal
  const [modalOption, setModalOption] = useState<'swap' | 'replace'>('swap');
  const [destVehicleNum, setDestVehicleNum] = useState<string>('');
  const [destPositionId, setDestPositionId] = useState<string>('');
  const [replaceMode, setReplaceMode] = useState<'spare' | 'new'>('spare');
  const [newTyreNumber, setNewTyreNumber] = useState('');
  const [newTyreSerial, setNewTyreSerial] = useState('');
  const [newTyreBrand, setNewTyreBrand] = useState('MRF');
  const [newTyreSize, setNewTyreSize] = useState('10.00R20');
  const [newTyreModel, setNewTyreModel] = useState('All-Position Radial');
  const [newTyrePurchaseDate, setNewTyrePurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [newTyrePurchaseCost, setNewTyrePurchaseCost] = useState('18500');
  const [newTyreVendor, setNewTyreVendor] = useState('MRF Dealer');
  const [newTyreWarrantyPeriod, setNewTyreWarrantyPeriod] = useState('12');
  const [spareSearchQuery, setSpareSearchQuery] = useState('');
  const [newRegTyreNumber, setNewRegTyreNumber] = useState('');

  const executeTyreSwapOption = () => {
    if (!activeVehicle || !activeTyre) return;
    const destVehicleObj = vehicles.find(v => v.truckNumber === destVehicleNum);
    const destTyre = destVehicleObj?.tyres.find(t => t.positionId === destPositionId);
    if (!destVehicleObj || !destTyre) {
      alert("Invalid destination vehicle or position selected!");
      return;
    }

    const sourceTyre = activeTyre;
    console.log("Selected Tyre:", sourceTyre.serialNumber);
    console.log("Swap Source:", `${activeVehicle.truckNumber} - ${sourceTyre.positionName}`);
    console.log("Swap Destination:", `${destVehicleNum} - ${destTyre.positionName}`);

    // Update vehicles chassis map
    setVehicles(prev => prev.map(v => {
      if (v.truckNumber === activeVehicle.truckNumber && v.truckNumber === destVehicleNum) {
        // Swapping positions within the SAME vehicle
        return {
          ...v,
          lastUpdated: new Date().toISOString(),
          tyres: v.tyres.map(t => {
            if (t.positionId === selectedTyrePosId) {
              return {
                ...t,
                serialNumber: destTyre.serialNumber,
                brand: destTyre.brand,
                psi: destTyre.psi,
                treadDepthMm: destTyre.treadDepthMm,
                wearPercentage: destTyre.wearPercentage,
                status: destTyre.status,
                installedDate: destTyre.installedDate
              };
            }
            if (t.positionId === destPositionId) {
              return {
                ...t,
                serialNumber: sourceTyre.serialNumber,
                brand: sourceTyre.brand,
                psi: sourceTyre.psi,
                treadDepthMm: sourceTyre.treadDepthMm,
                wearPercentage: sourceTyre.wearPercentage,
                status: sourceTyre.status,
                installedDate: sourceTyre.installedDate
              };
            }
            return t;
          })
        };
      } else if (v.truckNumber === activeVehicle.truckNumber) {
        // Update source vehicle
        return {
          ...v,
          lastUpdated: new Date().toISOString(),
          tyres: v.tyres.map(t => {
            if (t.positionId === selectedTyrePosId) {
              return {
                ...t,
                serialNumber: destTyre.serialNumber,
                brand: destTyre.brand,
                psi: destTyre.psi,
                treadDepthMm: destTyre.treadDepthMm,
                wearPercentage: destTyre.wearPercentage,
                status: destTyre.status,
                installedDate: destTyre.installedDate
              };
            }
            return t;
          })
        };
      } else if (v.truckNumber === destVehicleNum) {
        // Update destination vehicle
        return {
          ...v,
          lastUpdated: new Date().toISOString(),
          tyres: v.tyres.map(t => {
            if (t.positionId === destPositionId) {
              return {
                ...t,
                serialNumber: sourceTyre.serialNumber,
                brand: sourceTyre.brand,
                psi: sourceTyre.psi,
                treadDepthMm: sourceTyre.treadDepthMm,
                wearPercentage: sourceTyre.wearPercentage,
                status: sourceTyre.status,
                installedDate: sourceTyre.installedDate
              };
            }
            return t;
          })
        };
      }
      return v;
    }));

    const todayStr = new Date().toISOString().split('T')[0];
    const timeStr = new Date().toTimeString().slice(0, 5);

    const masterSource = tyres.find(t => t.serialNumber === sourceTyre.serialNumber);
    const sourceTyreNo = masterSource?.tyreNumber || masterSource?.serialNumber || '';
    
    const masterDest = tyres.find(t => t.serialNumber === destTyre.serialNumber);
    const destTyreNo = masterDest?.tyreNumber || masterDest?.serialNumber || '';

    // Record movement history in tyreMovements
    const movementA: TyreMovement = {
      id: `MOVE_${Date.now()}_A`,
      serialNumber: sourceTyre.serialNumber,
      sourceVehicle: activeVehicle.truckNumber,
      destinationVehicle: destVehicleNum,
      sourcePosition: sourceTyre.positionName,
      destinationPosition: destTyre.positionName,
      date: `${todayStr} ${timeStr}`,
      supervisorName: swapSupervisor,

      movementId: `MOVE_${Date.now()}_A`,
      tyreNumber: sourceTyreNo,
      vehicleFrom: activeVehicle.truckNumber,
      vehicleTo: destVehicleNum,
      positionFrom: sourceTyre.positionName,
      positionTo: destTyre.positionName,
      movementDate: todayStr,
      odometer: installKmInput,
      reason: `Swapped with ${destTyre.serialNumber} on vehicle ${destVehicleNum}`
    };

    const movementB: TyreMovement = {
      id: `MOVE_${Date.now()}_B`,
      serialNumber: destTyre.serialNumber,
      sourceVehicle: destVehicleNum,
      destinationVehicle: activeVehicle.truckNumber,
      sourcePosition: destTyre.positionName,
      destinationPosition: sourceTyre.positionName,
      date: `${todayStr} ${timeStr}`,
      supervisorName: swapSupervisor,

      movementId: `MOVE_${Date.now()}_B`,
      tyreNumber: destTyreNo,
      vehicleFrom: destVehicleNum,
      vehicleTo: activeVehicle.truckNumber,
      positionFrom: destTyre.positionName,
      positionTo: sourceTyre.positionName,
      movementDate: todayStr,
      odometer: installKmInput,
      reason: `Swapped with ${sourceTyre.serialNumber} on vehicle ${activeVehicle.truckNumber}`
    };

    setTyreMovements(prev => [movementA, movementB, ...prev]);

    // Update TyreHistory Journeys
    setTyreHistory(prev => {
      // Close open records
      let updated = prev.map(h => {
        if (h.serialNumber === sourceTyre.serialNumber && !h.removedDate) {
          return {
            ...h,
            removedDate: todayStr,
            kmAtRemoval: installKmInput,
            totalKmRun: Math.max(0, installKmInput - (h.kmAtInstallation || 0)),
            removalReason: `Swapped to ${destVehicleNum} (${destTyre.positionName})`,
            supervisorName: swapSupervisor
          };
        }
        if (h.serialNumber === destTyre.serialNumber && !h.removedDate) {
          return {
            ...h,
            removedDate: todayStr,
            kmAtRemoval: installKmInput,
            totalKmRun: Math.max(0, installKmInput - (h.kmAtInstallation || 0)),
            removalReason: `Swapped to ${activeVehicle.truckNumber} (${sourceTyre.positionName})`,
            supervisorName: swapSupervisor
          };
        }
        return h;
      });

      // Construct Tyre Swapped records for both source and destination
      const masterSource = tyres.find(t => t.serialNumber === sourceTyre.serialNumber);
      const sourceTyreNo = masterSource?.tyreNumber || masterSource?.serialNumber || '';
      
      const masterDest = tyres.find(t => t.serialNumber === destTyre.serialNumber);
      const destTyreNo = masterDest?.tyreNumber || masterDest?.serialNumber || '';

      const newHistA: TyreHistory = {
        historyId: `TH_${Date.now()}_A`,
        vehicleNo: destVehicleNum,
        tyreNumber: sourceTyreNo,
        serialNumber: sourceTyre.serialNumber,
        oldPosition: sourceTyre.positionName,
        newPosition: destTyre.positionName,
        movementType: 'Tyre Swapped',
        movementDate: todayStr,
        odometer: installKmInput,
        supervisorName: swapSupervisor,
        remarks: `Swapped with ${destTyre.serialNumber} on vehicle ${destVehicleNum}`,
        oldStatus: 'Active',
        newStatus: 'Active',

        // Backwards compatibility properties
        id: `HIST_${Date.now()}_A`,
        truckNumber: destVehicleNum,
        positionId: destPositionId,
        positionName: destTyre.positionName,
        installedDate: todayStr,
        kmAtInstallation: installKmInput,
        removalReason: `Swapped with ${destTyre.serialNumber} on vehicle ${destVehicleNum}`
      };

      const newHistB: TyreHistory = {
        historyId: `TH_${Date.now()}_B`,
        vehicleNo: activeVehicle.truckNumber,
        tyreNumber: destTyreNo,
        serialNumber: destTyre.serialNumber,
        oldPosition: destTyre.positionName,
        newPosition: sourceTyre.positionName,
        movementType: 'Tyre Swapped',
        movementDate: todayStr,
        odometer: installKmInput,
        supervisorName: swapSupervisor,
        remarks: `Swapped with ${sourceTyre.serialNumber} on vehicle ${activeVehicle.truckNumber}`,
        oldStatus: 'Active',
        newStatus: 'Active',

        // Backwards compatibility properties
        id: `HIST_${Date.now()}_B`,
        truckNumber: activeVehicle.truckNumber,
        positionId: selectedTyrePosId,
        positionName: sourceTyre.positionName,
        installedDate: todayStr,
        kmAtInstallation: installKmInput,
        removalReason: `Swapped with ${sourceTyre.serialNumber} on vehicle ${activeVehicle.truckNumber}`
      };

      return [newHistA, newHistB, ...updated];
    });

    console.log("Tyre History Written");

    setShowSwapModal(false);
    alert(`Success: Swapped ${sourceTyre.serialNumber} on position ${sourceTyre.positionName} with ${destTyre.serialNumber} on position ${destTyre.positionName} of vehicle ${destVehicleNum}!`);
  };

  const handleRegisterModalSpare = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTyreNumber.trim()) {
      alert("Please provide a valid Tyre Number!");
      return;
    }
    if (!newTyreSerial.trim()) {
      alert("Please provide a unique Serial Number!");
      return;
    }

    if (tyres.some(t => t.serialNumber.trim().toLowerCase() === newTyreSerial.trim().toLowerCase())) {
      alert("Error: A tyre with this Serial Number already exists inside the database!");
      return;
    }

    const calculatedExpiry = (() => {
      try {
        const d = new Date(newTyrePurchaseDate);
        d.setMonth(d.getMonth() + parseInt(newTyreWarrantyPeriod || '12'));
        return d.toISOString().split('T')[0];
      } catch (err) {
        return '';
      }
    })();

    const newMaster: TyreMaster = {
      serialNumber: newTyreSerial.trim().toUpperCase(),
      tyreNumber: newTyreNumber.trim().toUpperCase(),
      brand: newTyreBrand.trim() || 'MRF',
      model: newTyreModel.trim() || 'All-Position Radial',
      size: newTyreSize || '10.00R20',
      purchaseDate: newTyrePurchaseDate || new Date().toISOString().split('T')[0],
      purchaseCost: parseFloat(newTyrePurchaseCost) || 18500,
      vendorName: newTyreVendor.trim() || 'Direct Workshop Purchase',
      vendor: newTyreVendor.trim() || 'Direct Workshop Purchase',
      warrantyPeriodMonths: parseInt(newTyreWarrantyPeriod || '12'),
      warrantyExpiry: calculatedExpiry,
      manufacturingDate: newTyrePurchaseDate || new Date().toISOString().split('T')[0],
      expectedLifeKm: 100000,
      currentRunningKm: 0,
      status: TyreMasterStatus.SPARE,
      retreadCount: 0,
      currentVehicle: '',
      currentPosition: ''
    };

    setTyres(prev => [newMaster, ...prev]);
    setSelectedSpareSerial(newMaster.serialNumber);
    setReplaceMode('spare');
    alert(`Success: Registered Tyre ${newMaster.tyreNumber} inside Tyre Master Database!`);

    // Reset fields
    setNewTyreNumber('');
    setNewTyreSerial('');
    setNewTyreBrand('MRF');
    setNewTyreModel('All-Position Radial');
    setNewTyreSize('10.00R20');
    setNewTyreVendor('MRF Dealer');
    setNewTyreWarrantyPeriod('12');
  };

  const executeTyreReplacementOption = () => {
    if (!activeVehicle || !activeTyre) return;

    if (replaceMode === 'new') {
      alert("Please register the new tyre to the Master Database first, then select it from the Available Inventory list to confirm installation.");
      return;
    }

    if (!selectedSpareSerial) {
      alert("Please select a tyre from the Tyre Master Database!");
      return;
    }

    const targetSpare = tyres.find(t => t.serialNumber === selectedSpareSerial);
    if (!targetSpare) {
      alert("Selected tyre not found in the database!");
      return;
    }

    // VALIDATION: Allow installation only when status is New, Spare, or Retread (Retreaded)
    const allowedStatuses = [TyreMasterStatus.NEW, TyreMasterStatus.SPARE, TyreMasterStatus.RETREAD];
    if (!allowedStatuses.includes(targetSpare.status)) {
      alert(`Error: Cannot install a tyre with status "${targetSpare.status}". Only New, Spare, or Retreaded tyres can be installed from inventory.`);
      return;
    }

    const oldSerial = activeTyre.serialNumber;
    const todayStr = new Date().toISOString().split('T')[0];
    const timeStr = new Date().toTimeString().slice(0, 5);

    console.log("Selected Tyre for Replacement:", oldSerial);

    // 1. Update Tyre Master Database: Old tyre status = Removed, New tyre status = Active, current vehicle and current position
    setTyres(prev => {
      return prev.map(t => {
        if (t.serialNumber === oldSerial) {
          const achievedScrap = t.retreadCount >= 3 || removalReasonInput.toLowerCase().includes('scrap');
          return {
            ...t,
            status: achievedScrap ? TyreMasterStatus.SCRAP : TyreMasterStatus.REMOVED,
            currentRunningKm: installKmInput,
            currentVehicle: '',
            currentPosition: ''
          };
        }
        if (t.serialNumber === selectedSpareSerial) {
          return {
            ...t,
            status: TyreMasterStatus.ACTIVE,
            currentRunningKm: installKmInput,
            currentVehicle: activeVehicle.truckNumber,
            currentPosition: activeTyre.positionId
          };
        }
        return t;
      });
    });

    // 2. Add old tyre removal journey and new tyre installation journey to Tyre History DB
    const masterOldTyre = tyres.find(t => t.serialNumber === oldSerial);
    const oldTyreNo = masterOldTyre?.tyreNumber || masterOldTyre?.serialNumber || '';
    const achievedScrap = (masterOldTyre?.retreadCount || 0) >= 3 || removalReasonInput.toLowerCase().includes('scrap');

    setTyreHistory(prev => {
      const closed = prev.map(h => {
        if (h.serialNumber === oldSerial && !h.removedDate) {
          const run = Math.max(0, installKmInput - h.kmAtInstallation);
          return {
            ...h,
            removedDate: todayStr,
            kmAtRemoval: installKmInput,
            totalKmRun: run,
            removalReason: removalReasonInput,
            supervisorName: swapSupervisor,
            oldStatus: 'Active',
            newStatus: achievedScrap ? 'Scrap' : 'Removed'
          };
        }
        return h;
      });

      // A. "Tyre Removed" or "Tyre Scrapped" record for the old tyre
      const oldHistRecord: TyreHistory = {
        historyId: `TH_${Date.now()}_REMOVE`,
        vehicleNo: activeVehicle.truckNumber,
        tyreNumber: oldTyreNo,
        serialNumber: oldSerial,
        oldPosition: activeTyre.positionName,
        newPosition: achievedScrap ? 'Scrap Heap' : 'Spare Racks',
        movementType: achievedScrap ? 'Tyre Scrapped' : 'Tyre Removed',
        movementDate: todayStr,
        odometer: installKmInput,
        supervisorName: swapSupervisor,
        remarks: achievedScrap ? `Scrapped: ${removalReasonInput}` : `Removed: ${removalReasonInput}`,
        oldStatus: 'Active',
        newStatus: achievedScrap ? 'Scrap' : 'Removed',

        // Backwards compatibility properties
        id: `HIST_RM_${Date.now()}`,
        truckNumber: activeVehicle.truckNumber,
        positionId: activeTyre.positionId,
        positionName: activeTyre.positionName,
        installedDate: todayStr,
        removedDate: todayStr,
        kmAtInstallation: installKmInput,
        kmAtRemoval: installKmInput,
        totalKmRun: 0,
        removalReason: removalReasonInput
      };

      // B. "Tyre Installed" record for the new tyre
      const newHistRecord: TyreHistory = {
        historyId: `TH_${Date.now()}_INSTALL`,
        vehicleNo: activeVehicle.truckNumber,
        tyreNumber: targetSpare.tyreNumber || targetSpare.serialNumber || '',
        serialNumber: targetSpare.serialNumber,
        oldPosition: 'Spare Racks',
        newPosition: activeTyre.positionName,
        movementType: 'Tyre Installed',
        movementDate: todayStr,
        odometer: installKmInput,
        supervisorName: swapSupervisor,
        remarks: `Installed as replacement for ${oldSerial}`,
        oldStatus: targetSpare.status,
        newStatus: 'Active',

        // Backwards compatibility properties
        id: `HIST_${Date.now()}`,
        truckNumber: activeVehicle.truckNumber,
        positionId: selectedTyrePosId,
        positionName: activeTyre.positionName,
        installedDate: todayStr,
        kmAtInstallation: installKmInput,
        removalReason: `Installed to replace ${oldSerial}`
      };

      // C. "Tyre Replaced" record representing the transition
      const repHistRecord: TyreHistory = {
        historyId: `TH_${Date.now()}_REPLACE`,
        vehicleNo: activeVehicle.truckNumber,
        tyreNumber: oldTyreNo,
        serialNumber: oldSerial,
        oldPosition: activeTyre.positionName,
        newPosition: `Replaced by ${targetSpare.serialNumber}`,
        movementType: 'Tyre Replaced',
        movementDate: todayStr,
        odometer: installKmInput,
        supervisorName: swapSupervisor,
        remarks: `Replaced with tyre ${targetSpare.serialNumber}. Reason: ${removalReasonInput}`,
        oldStatus: 'Active',
        newStatus: achievedScrap ? 'Scrap' : 'Removed',

        // Backwards compatibility properties
        id: `HIST_REP_${Date.now()}`,
        truckNumber: activeVehicle.truckNumber,
        positionId: activeTyre.positionId,
        positionName: activeTyre.positionName,
        installedDate: todayStr,
        removedDate: todayStr,
        kmAtInstallation: installKmInput,
        kmAtRemoval: installKmInput,
        totalKmRun: 0,
        removalReason: `Replaced by ${targetSpare.serialNumber}. Reason: ${removalReasonInput}`
      };

      return [repHistRecord, newHistRecord, oldHistRecord, ...closed];
    });

    console.log("Tyre History Written");

    // 3. Record movement trace
    const movementRemove: TyreMovement = {
      id: `MOVE_${Date.now()}_RM`,
      serialNumber: oldSerial,
      sourceVehicle: activeVehicle.truckNumber,
      destinationVehicle: achievedScrap ? 'Scrap Yard' : 'Spare Yard',
      sourcePosition: activeTyre.positionName,
      destinationPosition: achievedScrap ? 'Scrap Pile' : 'Spare Shelf',
      date: `${todayStr} ${timeStr}`,
      supervisorName: swapSupervisor,

      movementId: `MOVE_${Date.now()}_RM`,
      tyreNumber: oldTyreNo,
      vehicleFrom: activeVehicle.truckNumber,
      vehicleTo: achievedScrap ? 'Scrap Yard' : 'Spare Yard',
      positionFrom: activeTyre.positionName,
      positionTo: achievedScrap ? 'Scrap Pile' : 'Spare Shelf',
      movementDate: todayStr,
      odometer: installKmInput,
      reason: removalReasonInput
    };

    const movementInstall: TyreMovement = {
      id: `MOVE_${Date.now()}_INS`,
      serialNumber: targetSpare.serialNumber,
      sourceVehicle: 'Spare Yard',
      destinationVehicle: activeVehicle.truckNumber,
      sourcePosition: 'Spare Shelf',
      destinationPosition: activeTyre.positionName,
      date: `${todayStr} ${timeStr}`,
      supervisorName: swapSupervisor,

      movementId: `MOVE_${Date.now()}_INS`,
      tyreNumber: targetSpare.tyreNumber || targetSpare.serialNumber || '',
      vehicleFrom: 'Spare Yard',
      vehicleTo: activeVehicle.truckNumber,
      positionFrom: 'Spare Shelf',
      positionTo: activeTyre.positionName,
      movementDate: todayStr,
      odometer: installKmInput,
      reason: `Installed to replace ${oldSerial}`
    };

    setTyreMovements(prev => [movementInstall, movementRemove, ...prev]);

    // 4. Update vehicle chassis map
    setVehicles(prev => prev.map(v => {
      if (v.truckNumber === activeVehicle.truckNumber) {
        return {
          ...v,
          lastUpdated: new Date().toISOString(),
          tyres: v.tyres.map(t => {
            if (t.positionId === selectedTyrePosId) {
              return {
                ...t,
                serialNumber: targetSpare.serialNumber,
                brand: targetSpare.brand || 'MRF',
                psi: 115,
                treadDepthMm: 16,
                wearPercentage: 0,
                status: TyreStatus.OK,
                installedDate: todayStr
              };
            }
            return t;
          })
        };
      }
      return v;
    }));

    // 5. Write general Service Log entry
    const finalCost = 500; // Standard fitment cost
    const replacementLog: ServiceLog = {
      id: `LOG_REPL_${Date.now()}`,
      truckNumber: activeVehicle.truckNumber,
      date: todayStr,
      type: ServiceType.TYRE_REPLACEMENT,
      positionId: activeTyre.positionId,
      tyreSerialBefore: oldSerial,
      tyreSerialAfter: targetSpare.serialNumber,
      description: `Tyre replacement on ${activeTyre.positionName}. Removed old serial ${oldSerial} (Reason: ${removalReasonInput}). Mounted active serial ${targetSpare.serialNumber}.`,
      cost: finalCost,
      supervisorName: swapSupervisor,
      
      // Phase 2 compatibility keys
      vehicleNo: activeVehicle.truckNumber,
      serviceDate: todayStr,
      serviceType: ServiceType.TYRE_REPLACEMENT,
      serviceCost: finalCost
    };
    setServiceLogs(prev => [replacementLog, ...prev]);

    // 6. Write TyreExpense entry
    const newExpense: TyreExpense = {
      id: `EXP_${Date.now()}`,
      serialNumber: targetSpare.serialNumber,
      cost: finalCost,
      date: todayStr,
      expenseType: 'Replacement',
      invoiceNumber: `INV-SWAP-${Date.now().toString().slice(-4)}`,
      truckNumber: activeVehicle.truckNumber,
      vendor: 'Internal Inventory'
    };
    setTyreExpenses(prev => [newExpense, ...prev]);

    console.log("Replacement Completed:", targetSpare.serialNumber);

    setShowSwapModal(false);
    alert("Tyre successfully installed from inventory and lifecycle history updated.");
  };

  // Helper colors for wheel borders and statuses
  const getStatusClasses = (status: TyreStatus, isSelected: boolean) => {
    let classes = "";
    if (status === TyreStatus.OK) {
      if (isSelected) {
        classes = "bg-blue-600 border-blue-700 shadow-[0_0_8px_rgba(37,99,235,0.6)] text-white";
      } else {
        classes = "bg-slate-150 border-slate-400 text-slate-800";
      }
    } else if (status === TyreStatus.LOW_PRESSURE) {
      if (isSelected) {
        classes = "bg-amber-500 border-amber-600 shadow-[0_0_8px_rgba(245,158,11,0.6)] text-white";
      } else {
        classes = "bg-amber-400 border-amber-500 text-slate-900 animate-pulse";
      }
    } else if (status === TyreStatus.FLAT) {
      if (isSelected) {
        classes = "bg-red-400 border-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)] text-white animate-bounce";
      } else {
        classes = "bg-red-400 border-red-500 text-white animate-bounce";
      }
    } else if (status === TyreStatus.WORN_OUT) {
      if (isSelected) {
        classes = "bg-red-600 border-red-700 shadow-[0_0_8px_rgba(220,38,38,0.6)] text-white";
      } else {
        classes = "bg-red-500 border-red-600 text-white";
      }
    }

    if (isSelected) {
      classes += " ring-2 ring-offset-1 ring-slate-950 scale-110 z-10";
    }
    return classes;
  };

  // Layout helper to organize tyre grids of dually set
  const renderVisualWheel = (posId: string, label: string) => {
    const tyreObj = activeVehicle?.tyres.find(t => t.positionId === posId);
    if (!tyreObj) return null;

    const isSel = selectedTyrePosId === posId;
    return (
      <button
        type="button"
        onClick={() => setSelectedTyrePosId(posId)}
        className={`w-8 h-12 rounded border-2 flex flex-col items-center justify-center cursor-pointer transition shadow hover:scale-105 active:scale-95 ${getStatusClasses(
          tyreObj.status,
          isSel
        )}`}
        title={`${tyreObj.positionName}: ${tyreObj.brand} (${tyreObj.psi} PSI, ${tyreObj.treadDepthMm}mm)`}
      >
        <Disc size={11} className={`${isSel ? 'animate-spin-slow' : ''}`} />
        <span className="text-[7.5px] font-bold mt-0.5 font-mono">{label}</span>
      </button>
    );
  };

  // ----------------------------------------------------
  // ADD NEW TYRE MASTER FORM STATE
  // ----------------------------------------------------
  const [newSerial, setNewSerial] = useState('');
  const [newBrand, setNewBrand] = useState('MRF Supermiler');
  const [newModel, setNewModel] = useState('S3C4');
  const [newSize, setNewSize] = useState('10.00R20');
  const [newPurchaseDate, setNewPurchaseDate] = useState('2026-06-01');
  const [newPurchaseCost, setNewPurchaseCost] = useState(16500);
  const [newVendor, setNewVendor] = useState('MRF Authorized Dealer RJ');
  const [newWarranty, setNewWarranty] = useState(12);
  const [newMfgDate, setNewMfgDate] = useState('2026-03-01');
  const [newExpectedLife, setNewExpectedLife] = useState(100000);
  const [newStatus, setNewStatus] = useState<TyreMasterStatus>(TyreMasterStatus.INVENTORY);
  const [searchQuery, setSearchQuery] = useState('');

  // Upgraded Tyre Asset states
  const [selectedTyreForProfile, setSelectedTyreForProfile] = useState<TyreMaster | null>(null);
  const [newPattern, setNewPattern] = useState('Rib Pattern');
  const [newLoadIndex, setNewLoadIndex] = useState('146/143K');
  const [newTubeTubeless, setNewTubeTubeless] = useState('Tubeless');
  const [newRadialNylon, setNewRadialNylon] = useState('Radial');
  const [newMfgWeek, setNewMfgWeek] = useState(12);
  const [newMfgYear, setNewMfgYear] = useState(2026);
  
  const [newSupplierContact, setNewSupplierContact] = useState('');
  const [newInvoiceNumber, setNewInvoiceNumber] = useState('');
  const [newPurchaseOrderNumber, setNewPurchaseOrderNumber] = useState('');
  const [newGstNumber, setNewGstNumber] = useState('');
  
  const [newMfgWarranty, setNewMfgWarranty] = useState('Standard 3 Year');
  const [newDealerWarranty, setNewDealerWarranty] = useState('1 Year Road Hazard');
  const [newForeman, setNewForeman] = useState('Imtiyaz');

  // History search filter state
  const [historySearchQuery, setHistorySearchQuery] = useState('');

  // Accordion Sections Expand state
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
    basic: true,
    purchase: true,
    warranty: true,
    status: true,
    assignment: true,
    health: true,
    financial: true,
    documents: true,
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Simulating uploads with local state
  const [uploadedDocs, setUploadedDocs] = useState<{ [serial: string]: { name: string; size: string; date: string }[] }>({});
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent, serial: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      addUploadedFile(serial, file.name, `${(file.size / 1024).toFixed(1)} KB`);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>, serial: string) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      addUploadedFile(serial, file.name, `${(file.size / 1024).toFixed(1)} KB`);
    }
  };

  const addUploadedFile = (serial: string, name: string, size: string) => {
    const newDoc = {
      name,
      size,
      date: new Date().toISOString().split('T')[0]
    };
    setUploadedDocs(prev => ({
      ...prev,
      [serial]: [...(prev[serial] || []), newDoc]
    }));

    // Also populate categorization fallback as Purchase Invoice
    handleAddCategorizedFile(serial, 'purchaseInvoice', name, size);
  };

  // Upgraded Categorized Upload
  const handleAddCategorizedFile = (serial: string, category: string, fileName: string, fileSize: string) => {
    const newDoc = {
      name: fileName,
      size: fileSize,
      date: new Date().toISOString().split('T')[0]
    };

    setTyres(prev => prev.map(t => {
      if (t.serialNumber === serial) {
        const catDocs = t.categorizedDocs || {};
        const list = catDocs[category] || [];
        return {
          ...t,
          categorizedDocs: {
            ...catDocs,
            [category]: [...list, newDoc]
          }
        };
      }
      return t;
    }));

    if (selectedTyreForProfile && selectedTyreForProfile.serialNumber === serial) {
      setSelectedTyreForProfile(prev => {
        if (!prev) return null;
        const catDocs = prev.categorizedDocs || {};
        const list = catDocs[category] || [];
        return {
          ...prev,
          categorizedDocs: {
            ...catDocs,
            [category]: [...list, newDoc]
          }
        };
      });
    }
  };

  const handleRemoveCategorizedFile = (serial: string, category: string, index: number) => {
    setTyres(prev => prev.map(t => {
      if (t.serialNumber === serial) {
        const catDocs = t.categorizedDocs || {};
        const list = catDocs[category] || [];
        const updatedList = list.filter((_, idx) => idx !== index);
        return {
          ...t,
          categorizedDocs: {
            ...catDocs,
            [category]: updatedList
          }
        };
      }
      return t;
    }));

    if (selectedTyreForProfile && selectedTyreForProfile.serialNumber === serial) {
      setSelectedTyreForProfile(prev => {
        if (!prev) return null;
        const catDocs = prev.categorizedDocs || {};
        const list = catDocs[category] || [];
        const updatedList = list.filter((_, idx) => idx !== index);
        return {
          ...prev,
          categorizedDocs: {
            ...catDocs,
            [category]: updatedList
          }
        };
      });
    }
  };

  // Helper algorithms for Asset Management Calculations
  const generateNextTyreId = (existingTyres: TyreMaster[]) => {
    const ids = existingTyres
      .map(t => t.tyreId)
      .filter((id): id is string => typeof id === 'string' && id.startsWith('TY'));
    if (ids.length === 0) return 'TY000001';
    const numbers = ids.map(id => parseInt(id.replace('TY', ''), 10)).filter(n => !isNaN(n));
    const max = Math.max(0, ...numbers);
    return `TY${String(max + 1).padStart(6, '0')}`;
  };

  const calculateTyreAgeMonths = (tyre: TyreMaster) => {
    try {
      let mfgDate: Date;
      if (tyre.manufacturingDate) {
        mfgDate = new Date(tyre.manufacturingDate);
      } else if (tyre.mfgYear && tyre.mfgWeek) {
        mfgDate = new Date(tyre.mfgYear, 0, 1 + (tyre.mfgWeek - 1) * 7);
      } else {
        return 0;
      }
      const today = new Date();
      const diffYears = today.getFullYear() - mfgDate.getFullYear();
      const diffMonths = today.getMonth() - mfgDate.getMonth();
      return Math.max(0, diffYears * 12 + diffMonths);
    } catch {
      return 0;
    }
  };

  const calculateHealthScore = (treadDepth: number) => {
    const maxTread = 16;
    const minTread = 3;
    const current = Math.max(minTread, Math.min(maxTread, treadDepth));
    const score = Math.round(((current - minTread) / (maxTread - minTread)) * 100);
    return Math.max(0, Math.min(100, score));
  };

  const handleLoadTyreProfile = (t: TyreMaster) => {
    setSelectedTyreForProfile(t);
    setNewRegTyreNumber(t.tyreNumber || '');
    setNewSerial(t.serialNumber);
    setNewBrand(t.brand);
    setNewModel(t.model);
    setNewSize(t.size);
    setNewPurchaseDate(t.purchaseDate);
    setNewPurchaseCost(t.purchaseCost);
    setNewVendor(t.vendorName || t.vendor || '');
    setNewWarranty(t.warrantyPeriodMonths);
    setNewMfgDate(t.manufacturingDate);
    setNewExpectedLife(t.expectedLifeKm);
    setNewStatus(t.status);

    setNewPattern(t.pattern || 'Rib Pattern');
    setNewLoadIndex(t.loadIndex || '146/143K');
    setNewTubeTubeless(t.tubeTubeless || 'Tubeless');
    setNewRadialNylon(t.radialNylon || 'Radial');
    setNewMfgWeek(t.mfgWeek || 12);
    setNewMfgYear(t.mfgYear || 2026);
    setNewSupplierContact(t.supplierContact || '');
    setNewInvoiceNumber(t.invoiceNumber || '');
    setNewPurchaseOrderNumber(t.purchaseOrderNumber || '');
    setNewGstNumber(t.gstNumber || '');
    setNewMfgWarranty(t.manufacturerWarranty || 'Standard 3 Year');
    setNewDealerWarranty(t.dealerWarranty || '1 Year Road Hazard');
    setNewForeman(t.foreman || 'Imtiyaz');
  };

  const handleClearTyreProfile = () => {
    setSelectedTyreForProfile(null);
    setNewRegTyreNumber('');
    setNewSerial('');
    setNewBrand('MRF Supermiler');
    setNewModel('S3C4');
    setNewSize('10.00R20');
    setNewPurchaseDate('2026-06-01');
    setNewPurchaseCost(16500);
    setNewVendor('MRF Authorized Dealer RJ');
    setNewWarranty(12);
    setNewMfgDate('2026-03-01');
    setNewExpectedLife(100000);
    setNewStatus(TyreMasterStatus.INVENTORY);

    setNewPattern('Rib Pattern');
    setNewLoadIndex('146/143K');
    setNewTubeTubeless('Tubeless');
    setNewRadialNylon('Radial');
    setNewMfgWeek(12);
    setNewMfgYear(2026);
    setNewSupplierContact('');
    setNewInvoiceNumber('');
    setNewPurchaseOrderNumber('');
    setNewGstNumber('');
    setNewMfgWarranty('Standard 3 Year');
    setNewDealerWarranty('1 Year Road Hazard');
    setNewForeman('Imtiyaz');
  };

  const handleAddTyreToMaster = (e: React.FormEvent, installImmediately = false) => {
    if (e) e.preventDefault();

    if (!newSerial) {
      alert("Please provide a unique serial number!");
      return;
    }

    const isEdit = !!selectedTyreForProfile;

    if (!isEdit && tyres.some(t => t.serialNumber.toUpperCase() === newSerial.toUpperCase())) {
      alert("Error: A tyre with this Serial Number already exists inside the database!");
      return;
    }

    const calculatedExpiry = (() => {
      try {
        const d = new Date(newPurchaseDate);
        d.setMonth(d.getMonth() + newWarranty);
        return d.toISOString().split('T')[0];
      } catch (err) {
        return '';
      }
    })();

    // Generate permanent read-only Tyre ID
    const tyreId = isEdit ? (selectedTyreForProfile?.tyreId || `TY${String(tyres.length + 1).padStart(6, '0')}`) : generateNextTyreId(tyres);

    // Calculate health score dynamically
    const wearMm = typeof selectedTyreForProfile?.treadDepth === 'number' ? selectedTyreForProfile.treadDepth : 12;
    const computedHealth = calculateHealthScore(wearMm);

    const updatedTyre: TyreMaster = {
      ...(isEdit ? selectedTyreForProfile : {}),
      serialNumber: newSerial.trim().toUpperCase(),
      tyreNumber: newRegTyreNumber.trim().toUpperCase() || newSerial.trim().toUpperCase(),
      brand: newBrand,
      model: newModel,
      size: newSize,
      purchaseDate: newPurchaseDate,
      purchaseCost: newPurchaseCost,
      vendorName: newVendor,
      vendor: newVendor,
      warrantyPeriodMonths: newWarranty,
      warrantyExpiry: calculatedExpiry,
      manufacturingDate: newMfgDate,
      expectedLifeKm: newExpectedLife,
      status: newStatus,
      
      // Upgraded Fields
      tyreId,
      pattern: newPattern,
      loadIndex: newLoadIndex,
      tubeTubeless: newTubeTubeless,
      radialNylon: newRadialNylon,
      mfgWeek: newMfgWeek,
      mfgYear: newMfgYear,
      supplierContact: newSupplierContact,
      invoiceNumber: newInvoiceNumber,
      purchaseOrderNumber: newPurchaseOrderNumber,
      gstNumber: newGstNumber,
      manufacturerWarranty: newMfgWarranty,
      dealerWarranty: newDealerWarranty,
      foreman: newForeman,
      healthScore: computedHealth,
    };

    if (isEdit) {
      setTyres(prev => prev.map(t => t.serialNumber === selectedTyreForProfile?.serialNumber ? updatedTyre : t));
      alert(`Tyre asset ${updatedTyre.tyreNumber} successfully updated!`);
    } else {
      setTyres(prev => [updatedTyre, ...prev]);
      alert(`Tyre asset ${updatedTyre.tyreNumber} successfully registered in database rack!`);
    }

    if (installImmediately) {
      // Set replacement selection in state
      setSelectedSpareSerial(updatedTyre.serialNumber);
      setReplaceMode('spare');
      setModalOption('replace');
      setActiveSubTab('chassis');
      alert(`Tyre ${updatedTyre.tyreNumber} saved! Redirecting to Chassis Workbench. Select any vehicle wheel position to install this tyre.`);
    }

    handleClearTyreProfile();
  };

  // ----------------------------------------------------
  // INSPECTION MODULE FORM STATE
  // ----------------------------------------------------
  const [inspectTyreSerial, setInspectTyreSerial] = useState(activeTyre?.serialNumber || '');
  const [inspectPsi, setInspectPsi] = useState(115);
  const [inspectTread, setInspectTread] = useState(12);
  const [inspectSideWall, setInspectSideWall] = useState<'Good' | 'Minor Cut' | 'Deep Cut' | 'Bulge'>('Good');
  const [inspectCap, setInspectCap] = useState(true);
  const [inspectDefect, setInspectDefect] = useState<'None' | 'One-sided wear' | 'Patch failure' | 'Casing damage'>('None');
  const [inspectRecommend, setInspectRecommend] = useState<'Rotate' | 'Align' | 'Retread' | 'Scrap' | 'No action'>('No action');
  const [inspectSupervisor, setInspectSupervisor] = useState('Ajru');

  useEffect(() => {
    if (activeTyre) {
      setInspectTyreSerial(activeTyre.serialNumber);
      setInspectPsi(activeTyre.psi);
      setInspectTread(activeTyre.treadDepthMm);
    }
  }, [activeTyre]);

  const handleAddInspection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inspectTyreSerial) {
      alert("Please specify a tyre serial!");
      return;
    }

    const newReport: TyreInspection = {
      id: `INS_${Date.now()}`,
      serialNumber: inspectTyreSerial,
      truckNumber: activeVehicle.truckNumber,
      positionId: activeTyre?.positionId || 'Axle1_L',
      inspectionDate: new Date().toISOString().split('T')[0],
      supervisorName: inspectSupervisor,
      pressurePsi: inspectPsi,
      treadDepthMm: inspectTread,
      sidewallCondition: inspectSideWall,
      remarks: `Valve cap: ${inspectCap ? 'Yes' : 'No'} | Visual defect: ${inspectDefect} | Rec: ${inspectRecommend}`
    };

    setTyreInspections(prev => [newReport, ...prev]);

    // Also update the master tyre database with inspected PSI and tread depth
    setTyres(prev => prev.map(t => {
      if (t.serialNumber === inspectTyreSerial) {
        return {
          ...t,
          pressure: inspectPsi,
          psi: inspectPsi,
          treadDepth: inspectTread,
          treadDepthMm: inspectTread,
          condition: inspectSideWall,
          updatedAt: new Date().toISOString()
        };
      }
      return t;
    }));

    if (inspectRecommend === 'Scrap' || inspectRecommend === 'Retread') {
      alert(`Recommendation raised: Tyre ${inspectTyreSerial} flagged for ${inspectRecommend}. Please execute corresponding swap/retread in the respective sub-tabs.`);
    } else {
      alert(`Inspection report for ${inspectTyreSerial} logged successfully!`);
    }
  };

  // ----------------------------------------------------
  // RETREAD SERVICE WORKFLOW STATE
  // ----------------------------------------------------
  const [retreadSerial, setRetreadSerial] = useState('');
  const [retreadCost, setRetreadCost] = useState(3800);
  const [retreadVendor, setRetreadVendor] = useState('Anwar Retreading Services RJ');
  const [retreadInvoice, setRetreadInvoice] = useState('INV-RET-304');
  const [retreadTargetDepth, setRetreadTargetDepth] = useState(12);
  const [retreadAddedLife, setRetreadAddedLife] = useState(40000);

  const executeRetreadLaunch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!retreadSerial) {
      alert("Please select a tyre serial to retread!");
      return;
    }

    const tObj = tyres.find(t => t.serialNumber === retreadSerial);
    if (!tObj) return;

    if (tObj.retreadCount >= 3) {
      alert("Error: This tyre has already reached its critical limit of 3 retreads. It is legally forced to be scrapped when it wears out!");
      return;
    }

    const retreadDateStr = new Date().toISOString().split('T')[0];

    // 1. Add Retread Record
    const newRecord: RetreadRecord = {
      id: `RET_${Date.now()}`,
      serialNumber: retreadSerial,
      retreadDate: retreadDateStr,
      retreadCost: retreadCost,
      retreadVendor: retreadVendor,
      retreadCountBefore: tObj.retreadCount,
      retreadCountAfter: tObj.retreadCount + 1
    };

    setRetreadRecords(prev => [newRecord, ...prev]);

    // 2. Increment Retread Count & Update Master DB Status back to Spare
    setTyres(prev => prev.map(t => {
      if (t.serialNumber === retreadSerial) {
        return {
          ...t,
          status: TyreMasterStatus.SPARE,
          retreadCount: t.retreadCount + 1,
          expectedLifeKm: t.expectedLifeKm + retreadAddedLife
        };
      }
      return t;
    }));

    // 3. Log Expense
    const newExpense: TyreExpense = {
      id: `EXP_RET_${Date.now()}`,
      serialNumber: retreadSerial,
      cost: retreadCost,
      date: retreadDateStr,
      expenseType: 'Retread',
      vendor: retreadVendor,
      invoiceNumber: retreadInvoice
    };
    setTyreExpenses(prev => [newExpense, ...prev]);

    // 4. Log Tyre history for Retread lifecycle: "Sent for Retread" and "Returned from Retread"
    const tyreNo = tObj.tyreNumber || tObj.serialNumber || '';
    const sentHist: TyreHistory = {
      historyId: `TH_${Date.now()}_SENT_RETREAD`,
      vehicleNo: tObj.currentVehicle || 'Spare Rack',
      tyreNumber: tyreNo,
      serialNumber: retreadSerial,
      oldPosition: tObj.currentPosition || 'Spare',
      newPosition: 'Retread Workshop',
      movementType: 'Tyre Sent for Retread',
      movementDate: retreadDateStr,
      odometer: tObj.currentRunningKm,
      supervisorName: 'Workshop Supervisor',
      remarks: `Sent to ${retreadVendor} under invoice ${retreadInvoice}`,
      oldStatus: tObj.status,
      newStatus: 'Retread',

      // Backwards compatibility properties
      id: `HIST_S_RET_${Date.now()}`,
      truckNumber: tObj.currentVehicle || 'Spare Rack',
      positionId: tObj.currentPosition || 'Spare',
      positionName: tObj.currentPosition || 'Spare',
      installedDate: retreadDateStr,
      removedDate: retreadDateStr,
      kmAtInstallation: tObj.currentRunningKm,
      kmAtRemoval: tObj.currentRunningKm,
      totalKmRun: 0,
      removalReason: `Sent to retread workshop ${retreadVendor}`
    };

    const returnedHist: TyreHistory = {
      historyId: `TH_${Date.now()}_RETURN_RETREAD`,
      vehicleNo: 'Spare Rack',
      tyreNumber: tyreNo,
      serialNumber: retreadSerial,
      oldPosition: 'Retread Workshop',
      newPosition: 'Spare Racks',
      movementType: 'Tyre Returned from Retread',
      movementDate: retreadDateStr,
      odometer: tObj.currentRunningKm,
      supervisorName: 'Workshop Supervisor',
      remarks: `Returned from ${retreadVendor} (Retread Count: ${tObj.retreadCount + 1})`,
      oldStatus: 'Retread',
      newStatus: 'Spare',

      // Backwards compatibility properties
      id: `HIST_R_RET_${Date.now()}`,
      truckNumber: 'Spare Rack',
      positionId: 'Spare',
      positionName: 'Spare',
      installedDate: retreadDateStr,
      kmAtInstallation: tObj.currentRunningKm,
      removalReason: `Returned from retread workshop ${retreadVendor}`
    };

    setTyreHistory(prev => [returnedHist, sentHist, ...prev]);

    setRetreadSerial('');
    alert(`Success: Retread completed for ${retreadSerial}! It is restored to 12mm tread depth and returned to Spare racks.`);
  };

  return (
    <div className="space-y-6">
      
      {/* Upper sub-tabs layout navigation */}
      <div className="flex border-b border-slate-200 bg-white p-1 rounded gap-1 shadow-sm overflow-x-auto whitespace-nowrap scrollbar-hide">
        <button
          onClick={() => setActiveSubTab('chassis')}
          className={`flex items-center space-x-1.5 px-4 py-2.5 sm:py-2 rounded text-xs font-bold uppercase transition flex-shrink-0 ${
            activeSubTab === 'chassis' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Sliders size={14} />
          <span>Chassis Work Bench</span>
        </button>

        <button
          onClick={() => setActiveSubTab('analytics')}
          className={`flex items-center space-x-1.5 px-4 py-2.5 sm:py-2 rounded text-xs font-bold uppercase transition flex-shrink-0 ${
            activeSubTab === 'analytics' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <TrendingUp size={14} />
          <span>Analytics & Alerts Hub</span>
        </button>

        <button
          onClick={() => setActiveSubTab('master')}
          className={`flex items-center space-x-1.5 px-4 py-2.5 sm:py-2 rounded text-xs font-bold uppercase transition flex-shrink-0 ${
            activeSubTab === 'master' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Database size={14} />
          <span>Tyre Master Database</span>
        </button>

        <button
          onClick={() => setActiveSubTab('history')}
          className={`flex items-center space-x-1.5 px-4 py-2.5 sm:py-2 rounded text-xs font-bold uppercase transition flex-shrink-0 ${
            activeSubTab === 'history' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <History size={14} />
          <span>Tyre Journey History</span>
        </button>

        <button
          onClick={() => setActiveSubTab('inspection')}
          className={`flex items-center space-x-1.5 px-4 py-2.5 sm:py-2 rounded text-xs font-bold uppercase transition flex-shrink-0 ${
            activeSubTab === 'inspection' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <ClipboardCheck size={14} />
          <span>Inspections Registry</span>
        </button>

        <button
          onClick={() => setActiveSubTab('retread')}
          className={`flex items-center space-x-1.5 px-4 py-2.5 sm:py-2 rounded text-xs font-bold uppercase transition flex-shrink-0 ${
            activeSubTab === 'retread' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Activity size={14} />
          <span>Retread Hub</span>
        </button>
      </div>

      {/* ----------------------------------------------------
          TAB 1: CHASSIS WORK BENCH (PRESERVING VISUAL CHASSIS MAP)
          ---------------------------------------------------- */}
      {activeSubTab === 'chassis' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 uppercase font-sans">Chassis Allocation & Swapping</h2>
              <p className="text-[11px] text-slate-500 font-bold uppercase">Select active vehicle plates and calibrate wheel assemblies in real time.</p>
            </div>
            
            {/* Vehicle Selector */}
            <div className="flex items-center space-x-2 bg-white px-3 py-1.5 rounded border border-slate-200 shadow-sm">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Plate:</label>
              <select
                value={selectedTruckNum}
                onChange={(e) => setSelectedTruckNum(e.target.value)}
                className="text-xs font-bold bg-transparent text-slate-900 focus:outline-none cursor-pointer"
              >
                {vehicles.map(v => (
                  <option key={v.truckNumber} value={v.truckNumber}>
                    {v.truckNumber} ({v.manufacturer})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left: Interactive Chassis Map */}
            <div className="lg:col-span-5 bg-white p-4 sm:p-6 rounded border border-slate-200 shadow-sm flex flex-col items-center justify-center relative min-h-[500px] w-full overflow-hidden">
              
              <div className="w-full text-center space-y-1 border-b border-slate-100 pb-4 mb-4">
                <h4 className="font-bold text-slate-900 uppercase text-xs tracking-wider">
                  {activeVehicle.truckNumber} Chassis Map
                </h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase font-mono">
                  Template: {activeVehicle.vehicleTemplate || `${activeVehicle.manufacturer} (${activeVehicle.tyresCount}-Wheelers)`}
                </p>
                {!activeVehicle.hasLiftAxle && activeVehicle.manufacturer !== VehicleManufacturer.ASHOK_LEYLAND && (
                  <div className="text-[9px] bg-amber-50 px-2 py-0.5 rounded text-amber-700 inline-block mt-1 font-semibold border border-amber-100 font-sans">
                    🚫 Lift Axle Hidden (Template Rule)
                  </div>
                )}
              </div>

              {/* Truck Cab */}
              <div className="w-24 h-12 bg-slate-900 rounded-t-2xl border-x border-slate-700 flex items-center justify-center mb-6">
                <span className="text-[10px] font-bold text-slate-400 tracking-wider font-sans">CABIN</span>
              </div>

              <div className="relative w-56 flex flex-col space-y-6">
                <div className="absolute top-0 bottom-0 left-1/2 -ml-1 border-l-2 border-dashed border-slate-300"></div>

                {/* Axle 1 */}
                <div className="z-10 flex justify-between items-center px-4">
                  {renderVisualWheel("Axle1_L", "ST-L")}
                  <div className="bg-slate-100 h-2 flex-1 mx-2 border-y border-slate-200 mt-2 text-center text-[7px] text-slate-400 font-bold font-mono">AXLE 1</div>
                  {renderVisualWheel("Axle1_R", "ST-R")}
                </div>

                {/* Axle 2 (Only for 14-Wheelers) */}
                {activeVehicle.tyresCount === 14 ? (
                  <div className="z-10 flex justify-between items-center">
                    <div className="flex space-x-1">
                      {renderVisualWheel("Axle2_LO", (activeVehicle.hasLiftAxle && activeVehicle.manufacturer !== VehicleManufacturer.ASHOK_LEYLAND) ? "LA-LO" : "MD-LO")}
                      {renderVisualWheel("Axle2_LI", (activeVehicle.hasLiftAxle && activeVehicle.manufacturer !== VehicleManufacturer.ASHOK_LEYLAND) ? "LA-LI" : "MD-LI")}
                    </div>
                    {(activeVehicle.hasLiftAxle && activeVehicle.manufacturer !== VehicleManufacturer.ASHOK_LEYLAND) ? (
                      <div className="bg-purple-100 border border-purple-200 text-purple-700 h-6 flex-1 mx-2 flex items-center justify-center text-[7.5px] font-bold uppercase rounded tracking-wider font-sans">
                        LIFT
                      </div>
                    ) : (
                      <div className="bg-slate-100 border border-slate-200 text-slate-500 h-6 flex-1 mx-2 flex items-center justify-center text-[7.5px] font-bold uppercase rounded tracking-wider font-sans">
                        MID AXLE
                      </div>
                    )}
                    <div className="flex space-x-1">
                      {renderVisualWheel("Axle2_RI", (activeVehicle.hasLiftAxle && activeVehicle.manufacturer !== VehicleManufacturer.ASHOK_LEYLAND) ? "LA-RI" : "MD-RI")}
                      {renderVisualWheel("Axle2_RO", (activeVehicle.hasLiftAxle && activeVehicle.manufacturer !== VehicleManufacturer.ASHOK_LEYLAND) ? "LA-RO" : "MD-RO")}
                    </div>
                  </div>
                ) : null}

                {/* Axle 3 (Drive 1) */}
                <div className="z-10 flex justify-between items-center">
                  <div className="flex space-x-1">
                    {renderVisualWheel(activeVehicle.tyresCount === 14 ? "Axle3_LO" : "Axle2_LO", "D1-LO")}
                    {renderVisualWheel(activeVehicle.tyresCount === 14 ? "Axle3_LI" : "Axle2_LI", "D1-LI")}
                  </div>
                  <div className="bg-slate-100 h-4 flex-1 mx-2 flex items-center justify-center text-[7.5px] text-slate-400 font-bold font-mono">DRIVE 1</div>
                  <div className="flex space-x-1">
                    {renderVisualWheel(activeVehicle.tyresCount === 14 ? "Axle3_RI" : "Axle2_RI", "D1-RI")}
                    {renderVisualWheel(activeVehicle.tyresCount === 14 ? "Axle3_RO" : "Axle2_RO", "D1-RO")}
                  </div>
                </div>

                {/* Axle 4 (Drive 2) */}
                <div className="z-10 flex justify-between items-center">
                  <div className="flex space-x-1">
                    {renderVisualWheel(activeVehicle.tyresCount === 14 ? "Axle4_LO" : "Axle3_LO", "D2-LO")}
                    {renderVisualWheel(activeVehicle.tyresCount === 14 ? "Axle4_LI" : "Axle3_LI", "D2-LI")}
                  </div>
                  <div className="bg-slate-100 h-4 flex-1 mx-2 flex items-center justify-center text-[7.5px] text-slate-400 font-bold font-mono">DRIVE 2</div>
                  <div className="flex space-x-1">
                    {renderVisualWheel(activeVehicle.tyresCount === 14 ? "Axle4_RI" : "Axle3_RI", "D2-RI")}
                    {renderVisualWheel(activeVehicle.tyresCount === 14 ? "Axle4_RO" : "Axle3_RO", "D2-RO")}
                  </div>
                </div>

                {/* Axle 5 Tag (Only for 12-Wheelers) */}
                {activeVehicle.tyresCount === 12 ? (
                  <div className="z-10 flex justify-between items-center px-4">
                    {renderVisualWheel("Axle4_L", "R-L")}
                    <div className="bg-slate-100 h-2 flex-1 mx-2 border-y border-slate-200 mt-2 text-center text-[7px] text-slate-400 font-bold font-mono">TAG AXLE</div>
                    {renderVisualWheel("Axle4_R", "R-R")}
                  </div>
                ) : null}

              </div>

              {/* Legend */}
              <div className="mt-8 pt-4 border-t border-slate-100 w-full flex justify-center gap-2.5 text-[9px] font-bold text-slate-500 uppercase tracking-wide">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-slate-100 border border-slate-350 rounded-sm"></span> Normal</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-blue-500 rounded-sm"></span> Calibrated</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-amber-500 rounded-sm"></span> Low Air</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-red-400 rounded-sm"></span> Flat</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-red-600 rounded-sm"></span> Worn</span>
              </div>
            </div>

            {/* Right Column: Interactive Editor / Calibrator */}
            <div className="lg:col-span-7 space-y-6">
              {activeTyre ? (
                <div className="bg-white p-6 rounded border border-slate-200 shadow-sm space-y-5">
                  <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                    <div>
                      <span className="text-[10px] bg-slate-100 text-slate-500 font-bold uppercase px-2 py-0.5 rounded">
                        Position Code: {activeTyre.positionId}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 mt-1 uppercase font-sans">{activeTyre.positionName} Audit Workbench</h3>
                      <p className="text-xs text-slate-400 font-semibold mt-0.5">
                        Tyre Serial: <span className="font-mono text-slate-700 font-bold">{activeTyre.serialNumber}</span>
                      </p>
                    </div>

                    <div className={`px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wide ${
                      activeTyre.status === TyreStatus.OK 
                        ? 'bg-blue-50 text-blue-600' 
                        : 'bg-red-50 text-red-600'
                    }`}>
                      {activeTyre.status}
                    </div>
                  </div>

                  {/* Calibration Sliders */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-3.5 bg-slate-50 rounded border border-slate-150">
                      <label className="text-[10px] font-bold text-slate-400 uppercase block">Air Pressure (PSI)</label>
                      <input 
                        type="range" 
                        min="0" 
                        max="140" 
                        value={psiInput}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          setPsiInput(val);
                          handleUpdateTyreDetails(serialInput, brandInput, val, depthInput);
                        }}
                        className="w-full mt-2 cursor-pointer"
                      />
                      <div className="flex justify-between text-xs font-mono font-bold text-slate-700 mt-1">
                        <span>0 PSI</span>
                        <span className="text-blue-600">{psiInput} PSI</span>
                        <span>140 PSI</span>
                      </div>
                    </div>

                    <div className="p-3.5 bg-slate-50 rounded border border-slate-150">
                      <label className="text-[10px] font-bold text-slate-400 uppercase block">Tread Depth (mm)</label>
                      <input 
                        type="range" 
                        min="0" 
                        max="16" 
                        step="0.1"
                        value={depthInput}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          setDepthInput(val);
                          handleUpdateTyreDetails(serialInput, brandInput, psiInput, val);
                        }}
                        className="w-full mt-2 cursor-pointer"
                      />
                      <div className="flex justify-between text-xs font-mono font-bold text-slate-700 mt-1">
                        <span>0mm (Scrap)</span>
                        <span className="text-emerald-600">{depthInput} mm</span>
                        <span>16mm (New)</span>
                      </div>
                    </div>
                  </div>

                  {/* Interactive Forms */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded space-y-4">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">Calibration Input Form</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">Serial ID Code</label>
                        <input 
                          type="text" 
                          value={serialInput}
                          onChange={(e) => {
                            setSerialInput(e.target.value);
                            handleUpdateTyreDetails(e.target.value, brandInput, psiInput, depthInput);
                          }}
                          className="w-full bg-white border border-slate-200 p-2 rounded font-bold font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">Brand Model Label</label>
                        <input 
                          type="text" 
                          value={brandInput}
                          onChange={(e) => {
                            setBrandInput(e.target.value);
                            handleUpdateTyreDetails(serialInput, e.target.value, psiInput, depthInput);
                          }}
                          className="w-full bg-white border border-slate-200 p-2 rounded font-bold"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Rapid Service Console Actions */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">Immediate Service Actions Launcher</span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <button
                        onClick={executeAirInflation}
                        className="p-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded text-xs font-bold uppercase transition"
                      >
                        Inflate Air
                      </button>
                      <button
                        onClick={executePunctureFix}
                        className="p-2.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded text-xs font-bold uppercase transition"
                      >
                        Puncture Patch
                      </button>
                      <button
                        onClick={() => {
                          console.log("Selected Tyre", activeTyre?.serialNumber);
                          const spares = tyres.filter(t => t.status === TyreMasterStatus.SPARE);
                          setModalOption('swap');
                          const defaultDestVeh = vehicles.find(v => v.truckNumber !== activeVehicle.truckNumber) || vehicles[0];
                          setDestVehicleNum(defaultDestVeh?.truckNumber || '');
                          setDestPositionId(defaultDestVeh?.tyres[0]?.positionId || '');
                          if (spares.length > 0) {
                            setSelectedSpareSerial(spares[0].serialNumber);
                          } else {
                            setSelectedSpareSerial('');
                          }
                          setReplaceMode('spare');
                          setNewTyreNumber('');
                          setShowSwapModal(true);
                        }}
                        className="p-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-bold uppercase transition shadow"
                      >
                        Swap / Replace Wheel
                      </button>
                    </div>
                  </div>

                </div>
              ) : null}

              {/* Guidelines */}
              <div className="p-5 bg-white rounded border border-slate-200 shadow-sm space-y-2">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-widest flex items-center gap-1.5">
                  <Info size={14} className="text-blue-600" />
                  Fleet Guidelines & Limits
                </h4>
                <ul className="text-xs text-slate-500 space-y-1.5 list-disc pl-4 font-medium">
                  <li>Tread wear thresholds: Tread depth &lt; 4.5mm triggers a replacement reminder.</li>
                  <li>Calibrated pressure targets: Front steer axles run on 120 PSI, rear drive duals run on 115 PSI.</li>
                  <li>Any swap action safely updates BOTH the active wheel assembly and the central Tyre Master database, saving the removal log to Tyre Journeys automatically.</li>
                </ul>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ----------------------------------------------------
          TAB: TYRE FLEET ANALYTICS & ALERTS HUB
          ---------------------------------------------------- */}
      {activeSubTab === 'analytics' && (() => {
        const today = new Date();
        const alertList: { type: string; title: string; desc: string; severity: 'high' | 'medium' | 'low'; id: string; serial: string }[] = [];

        tyres.forEach(t => {
          const assocVehicle = vehicles.find(v => v.tyres.some(vt => vt.serialNumber === t.serialNumber));
          const vehName = assocVehicle ? assocVehicle.truckNumber : 'Spare / Yard';

          if (t.status === TyreMasterStatus.ACTIVE) {
            const vehTyre = assocVehicle?.tyres.find(vt => vt.serialNumber === t.serialNumber);
            
            // 1. Low Air Pressure Alert
            const psiVal = vehTyre ? vehTyre.psi : 110;
            if (psiVal < 100) {
              alertList.push({
                id: `low-psi-${t.serialNumber}`,
                serial: t.serialNumber,
                type: 'Low Pressure',
                title: `Low Pressure on ${t.serialNumber} (${vehName})`,
                desc: `Current pressure is ${psiVal} PSI. Optimal pressure is 110-125 PSI.`,
                severity: psiVal < 50 ? 'high' : 'medium'
              });
            }

            // 2. Low Tread Depth Alert
            const depthVal = vehTyre ? vehTyre.treadDepthMm : 12;
            if (depthVal < 4.5) {
              const canRetread = t.retreadCount < 3;
              alertList.push({
                id: `low-tread-${t.serialNumber}`,
                serial: t.serialNumber,
                type: canRetread ? 'Retread Due' : 'Replacement Due',
                title: `${canRetread ? 'Retread' : 'Replacement'} Due for ${t.serialNumber}`,
                desc: `Tread depth is critically low at ${depthVal}mm. (Retreads: ${t.retreadCount}/3)`,
                severity: 'high'
              });
            }

            // 3. Not Inspected in the last 7 days Alert
            const tyreInspectionsSorted = tyreInspections
              .filter(ins => ins.serialNumber === t.serialNumber)
              .sort((a, b) => new Date(b.inspectionDate).getTime() - new Date(a.inspectionDate).getTime());
              
            const lastInsDate = tyreInspectionsSorted[0] ? new Date(tyreInspectionsSorted[0].inspectionDate) : null;
            const daysSinceIns = lastInsDate ? Math.floor((today.getTime() - lastInsDate.getTime()) / (1000 * 60 * 60 * 24)) : 999;
            
            if (daysSinceIns > 7) {
              alertList.push({
                id: `no-inspect-${t.serialNumber}`,
                serial: t.serialNumber,
                type: 'Not Inspected',
                title: `Overdue Inspection on ${t.serialNumber} (${vehName})`,
                desc: lastInsDate ? `Last inspected ${daysSinceIns} days ago. Mandatory weekly check-up is overdue.` : `No structured inspection registered for this tyre yet.`,
                severity: 'low'
              });
            }
          }

          // 4. Warranty Expiry Alert
          const pDate = new Date(t.purchaseDate);
          const expDate = new Date(pDate.setMonth(pDate.getMonth() + t.warrantyPeriodMonths));
          if (today > expDate) {
            alertList.push({
              id: `warranty-exp-${t.serialNumber}`,
              serial: t.serialNumber,
              type: 'Warranty Expiry',
              title: `Warranty Expired: ${t.serialNumber}`,
              desc: `Warranty coverage expired on ${expDate.toISOString().split('T')[0]} (${t.warrantyPeriodMonths} months cover).`,
              severity: 'low'
            });
          }

          // 5. Tyre Age > 3 Years Alert
          const mDate = new Date(t.manufacturingDate);
          const ageYears = (today.getTime() - mDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
          if (ageYears > 3) {
            alertList.push({
              id: `tyre-age-${t.serialNumber}`,
              serial: t.serialNumber,
              type: 'Age Alert',
              title: `Aged Tyre Warning: ${t.serialNumber}`,
              desc: `Chassis tyre age is ${ageYears.toFixed(1)} years since production (${t.manufacturingDate}). Recommending rubber check.`,
              severity: 'medium'
            });
          }
        });

        // Calculate stats from master DB
        const totalTyres = tyres.length;
        const activeTyres = tyres.filter(t => t.status === TyreMasterStatus.ACTIVE).length;
        const spareTyres = tyres.filter(t => t.status === TyreMasterStatus.SPARE).length;
        const retreadTyres = tyres.filter(t => t.status === TyreMasterStatus.RETREAD).length;
        const scrapTyres = tyres.filter(t => t.status === TyreMasterStatus.SCRAP).length;
        const replacementDueCount = alertList.filter(a => a.type === 'Replacement Due').length;

        // Compute Brand Statistics
        const brandCounts: { [key: string]: number } = {};
        const brandKmAccum: { [key: string]: number } = {};
        const brandCostAccum: { [key: string]: number } = {};

        tyres.forEach(t => {
          brandCounts[t.brand] = (brandCounts[t.brand] || 0) + 1;
          brandKmAccum[t.brand] = (brandKmAccum[t.brand] || 0) + t.currentRunningKm;
          brandCostAccum[t.brand] = (brandCostAccum[t.brand] || 0) + t.purchaseCost;
        });

        const uniqueBrands = Object.keys(brandCounts);

        return (
          <div className="space-y-6">
            {/* Header / Title */}
            <div className="bg-white p-5 rounded border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-950 uppercase font-sans">Tyre Fleet Analytics & Alerts Hub</h2>
                <p className="text-xs text-slate-500 font-bold uppercase">Comprehensive insights, lifecycles, and predictive checks on your tyre inventory.</p>
              </div>
              <div className="text-xs bg-amber-50 border border-amber-200 text-amber-600 font-bold px-3 py-1.5 rounded flex items-center gap-2 shadow-sm font-mono">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                <span>TYRE COMPLIANCE LIVE</span>
              </div>
            </div>

            {/* Metrics cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="bg-white border border-slate-200 rounded p-4 shadow-sm flex flex-col justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Tyres</span>
                <div className="flex items-baseline space-x-1 mt-2">
                  <span className="text-2xl font-bold font-mono text-slate-900">{totalTyres}</span>
                  <span className="text-[10px] text-slate-400">pcs</span>
                </div>
                <div className="w-full bg-slate-100 h-1 rounded mt-2">
                  <div className="bg-blue-600 h-1 rounded" style={{ width: '100%' }}></div>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded p-4 shadow-sm flex flex-col justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider text-emerald-600">Active Tyres</span>
                <div className="flex items-baseline space-x-1 mt-2">
                  <span className="text-2xl font-bold font-mono text-emerald-600">{activeTyres}</span>
                  <span className="text-[10px] text-slate-400">fitted</span>
                </div>
                <div className="w-full bg-slate-100 h-1 rounded mt-2">
                  <div className="bg-emerald-500 h-1 rounded" style={{ width: `${totalTyres > 0 ? (activeTyres / totalTyres) * 100 : 0}%` }}></div>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded p-4 shadow-sm flex flex-col justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider text-blue-600">Spare Tyres</span>
                <div className="flex items-baseline space-x-1 mt-2">
                  <span className="text-2xl font-bold font-mono text-blue-600">{spareTyres}</span>
                  <span className="text-[10px] text-slate-400">racks</span>
                </div>
                <div className="w-full bg-slate-100 h-1 rounded mt-2">
                  <div className="bg-blue-500 h-1 rounded" style={{ width: `${totalTyres > 0 ? (spareTyres / totalTyres) * 100 : 0}%` }}></div>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded p-4 shadow-sm flex flex-col justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider text-amber-600">In Retread</span>
                <div className="flex items-baseline space-x-1 mt-2">
                  <span className="text-2xl font-bold font-mono text-amber-600">{retreadTyres}</span>
                  <span className="text-[10px] text-slate-400">units</span>
                </div>
                <div className="w-full bg-slate-100 h-1 rounded mt-2">
                  <div className="bg-amber-500 h-1 rounded" style={{ width: `${totalTyres > 0 ? (retreadTyres / totalTyres) * 100 : 0}%` }}></div>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded p-4 shadow-sm flex flex-col justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider text-red-500">Scrap Tyres</span>
                <div className="flex items-baseline space-x-1 mt-2">
                  <span className="text-2xl font-bold font-mono text-red-500">{scrapTyres}</span>
                  <span className="text-[10px] text-slate-400">discard</span>
                </div>
                <div className="w-full bg-slate-100 h-1 rounded mt-2">
                  <div className="bg-red-500 h-1 rounded" style={{ width: `${totalTyres > 0 ? (scrapTyres / totalTyres) * 100 : 0}%` }}></div>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded p-4 shadow-sm flex flex-col justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider text-red-650 animate-pulse">Replace Due</span>
                <div className="flex items-baseline space-x-1 mt-2">
                  <span className="text-2xl font-bold font-mono text-red-650">{replacementDueCount}</span>
                  <span className="text-[10px] text-slate-400">due</span>
                </div>
                <div className="w-full bg-slate-100 h-1 rounded mt-2">
                  <div className="bg-red-600 h-1 rounded" style={{ width: `${totalTyres > 0 ? (replacementDueCount / totalTyres) * 100 : 0}%` }}></div>
                </div>
              </div>
            </div>

            {/* Alerts Center */}
            <div className="bg-amber-50 border border-amber-200 rounded p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <AlertTriangle size={18} className="text-amber-600" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-amber-900">
                    Tyre Lifecycle & Inspection Alert Hub ({alertList.length} triggers)
                  </h3>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full">
                  Action Required
                </span>
              </div>
              {alertList.length === 0 ? (
                <div className="text-center py-6 text-slate-500 font-bold bg-white rounded border border-amber-100">
                  <CheckCircle2 size={32} className="mx-auto mb-2 text-emerald-600" />
                  No tyre warnings or alerts triggered!
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {alertList.map((alert, index) => (
                    <div 
                      key={index}
                      className={`p-3 rounded-lg border text-xs flex gap-2.5 items-start transition bg-white shadow-sm ${
                        alert.severity === 'high' 
                          ? 'border-red-200 text-red-950' 
                          : alert.severity === 'medium'
                            ? 'border-amber-200 text-amber-950'
                            : 'border-slate-200 text-slate-700'
                      }`}
                    >
                      <AlertCircle size={15} className={`shrink-0 mt-0.5 ${
                        alert.severity === 'high' ? 'text-red-600' : alert.severity === 'medium' ? 'text-amber-600' : 'text-slate-500'
                      }`} />
                      <div>
                        <div className="font-bold flex items-center gap-1.5 mb-0.5">
                          <span className={`px-1.5 py-0.5 rounded text-[9px] uppercase font-extrabold ${
                            alert.severity === 'high' ? 'bg-red-100 text-red-850' : alert.severity === 'medium' ? 'bg-amber-100 text-amber-850' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {alert.type}
                          </span>
                          <span className="font-mono text-slate-900">{alert.serial}</span>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-normal">{alert.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Brand charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Brand Performance */}
              <div className="bg-white border border-slate-200 p-6 rounded shadow-sm">
                <div className="flex items-center space-x-2 mb-4 border-b border-slate-100 pb-3">
                  <BarChart3 className="text-blue-600" size={16} />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Brand Performance (Average KM Run)
                  </h3>
                </div>
                <div className="space-y-4">
                  {uniqueBrands.map(brand => {
                    const count = brandCounts[brand];
                    const totalKm = brandKmAccum[brand];
                    const avgKm = count > 0 ? Math.round(totalKm / count) : 0;
                    const maxKmBenchmark = 120000;
                    const ratio = Math.min(100, (avgKm / maxKmBenchmark) * 100);
                    
                    return (
                      <div key={brand} className="space-y-1.5">
                        <div className="flex justify-between text-xs font-mono">
                          <span className="font-bold text-slate-700">{brand}</span>
                          <span className="text-blue-600 font-bold">{avgKm.toLocaleString()} KM average</span>
                        </div>
                        <div className="w-full bg-slate-100 h-3 rounded overflow-hidden relative flex items-center">
                          <div className="bg-blue-600 h-full rounded transition-all duration-500" style={{ width: `${ratio}%` }}></div>
                          <span className="absolute right-2 text-[9px] font-bold text-slate-500">{ratio.toFixed(0)}% design life</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Operating Cost Benchmarks */}
              <div className="bg-white border border-slate-200 p-6 rounded shadow-sm">
                <div className="flex items-center space-x-2 mb-4 border-b border-slate-100 pb-3">
                  <TrendingUp className="text-red-600" size={16} />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Operating Cost Benchmarks (Cost Per KM)
                  </h3>
                </div>
                <div className="space-y-4">
                  {uniqueBrands.map(brand => {
                    const count = brandCounts[brand];
                    const totalKm = brandKmAccum[brand] || 1000;
                    const totalCost = brandCostAccum[brand] || 15000;
                    const costPerKm = (totalCost / Math.max(1, totalKm));
                    const barRatio = Math.min(100, (costPerKm / 1.5) * 100);

                    return (
                      <div key={brand} className="space-y-1.5">
                        <div className="flex justify-between text-xs font-mono">
                          <span className="font-bold text-slate-700">{brand}</span>
                          <span className="text-red-600 font-bold">₹{costPerKm.toFixed(2)} / KM</span>
                        </div>
                        <div className="w-full bg-slate-100 h-3 rounded overflow-hidden relative flex items-center">
                          <div className="bg-red-500 h-full rounded transition-all duration-500" style={{ width: `${barRatio}%` }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ----------------------------------------------------
          TAB 2: TYRE MASTER DATABASE (WITH REQUISITE FORM FIELDS)
          ---------------------------------------------------- */}
      {activeSubTab === 'master' && (
        <div className="space-y-6">
          {/* Header Action bar with dynamic state indicator */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded border border-slate-200 shadow-sm">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-950 uppercase font-sans">
                  {selectedTyreForProfile ? 'Tyre Asset Profile & Edit' : 'Tyre Master Database Registry'}
                </h2>
                {selectedTyreForProfile && (
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-800 font-mono text-[10px] font-bold uppercase rounded">
                    Selected: {selectedTyreForProfile.tyreId}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 font-bold uppercase">
                {selectedTyreForProfile 
                  ? 'Examine detailed lifecycle metrics, document uploads, and update asset fields.' 
                  : 'Register, categorize, and track physical tyre assets, costs, and lifecycles.'}
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              {selectedTyreForProfile && (
                <button
                  type="button"
                  onClick={handleClearTyreProfile}
                  className="px-3 py-1.5 border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold rounded text-xs uppercase flex items-center gap-1.5 transition"
                >
                  <Plus size={13} />
                  <span>Register New Tyre</span>
                </button>
              )}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2 text-slate-400" size={14} />
                <input 
                  type="text" 
                  placeholder="Search ID, Serial, Brand, Truck..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs font-bold border border-slate-200 pl-8 pr-3 py-1.5 rounded focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Col: Dynamic Register / Profile Panel */}
            <div className="lg:col-span-1 bg-white p-5 rounded border border-slate-200 shadow-sm space-y-4 h-fit">
              <div className="flex items-center justify-between border-b border-slate-150 pb-3">
                <div className="flex items-center space-x-1.5">
                  <Sliders className="text-blue-600" size={16} />
                  <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                    {selectedTyreForProfile ? 'Tyre Asset Profile Manager' : 'Register New Tyre Asset'}
                  </h3>
                </div>
                {selectedTyreForProfile && (
                  <button 
                    type="button" 
                    onClick={handleClearTyreProfile}
                    className="text-slate-400 hover:text-slate-650"
                    title="Close Profile"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>

              <form onSubmit={(e) => handleAddTyreToMaster(e, false)} className="space-y-4 text-xs">
                
                {/* A. BASIC INFORMATION ACCORDION */}
                <div className="border border-slate-200 rounded overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleSection('basic')}
                    className="w-full flex justify-between items-center bg-slate-50 px-3 py-2.5 text-left font-bold text-slate-700 hover:bg-slate-100 transition border-b border-slate-200"
                  >
                    <span className="flex items-center gap-1.5">
                      <Info size={14} className="text-blue-500" />
                      <span>A. Basic Information</span>
                    </span>
                    {expandedSections.basic ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                  {expandedSections.basic && (
                    <div className="p-3 bg-white space-y-3 animate-fadeIn">
                      <div>
                        <label className="block font-bold text-slate-500 mb-0.5 uppercase text-[9px]">Auto Generated Tyre ID</label>
                        <input 
                          type="text" 
                          value={selectedTyreForProfile ? selectedTyreForProfile.tyreId : 'TYXXXXXX (Auto Assigned)'}
                          disabled
                          className="w-full p-2 bg-slate-100 border border-slate-200 rounded font-mono font-bold text-slate-600 cursor-not-allowed"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="block font-bold text-slate-500 mb-0.5 uppercase text-[9px]">Tyre Number (Required)</label>
                          <input 
                            type="text" 
                            placeholder="e.g., TR-101"
                            value={newRegTyreNumber}
                            onChange={(e) => setNewRegTyreNumber(e.target.value)}
                            className="w-full p-2 border border-slate-200 rounded font-bold uppercase focus:ring-1 focus:ring-blue-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-500 mb-0.5 uppercase text-[9px]">Unique Serial Code (Required)</label>
                          <input 
                            type="text" 
                            placeholder="e.g., TY-803-JK"
                            value={newSerial}
                            onChange={(e) => setNewSerial(e.target.value)}
                            disabled={!!selectedTyreForProfile}
                            className={`w-full p-2 border border-slate-200 rounded font-mono font-bold uppercase focus:ring-1 focus:ring-blue-500 ${
                              selectedTyreForProfile ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : ''
                            }`}
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="block font-bold text-slate-500 mb-0.5 uppercase text-[9px]">Brand Manufacturer</label>
                          <select 
                            value={newBrand}
                            onChange={(e) => setNewBrand(e.target.value)}
                            className="w-full p-2 border border-slate-200 rounded font-bold text-slate-800"
                          >
                            <option value="MRF">MRF Supermiler</option>
                            <option value="Apollo">Apollo EnduMax</option>
                            <option value="JK Tyre">JK Tyre JetSteel</option>
                            <option value="CEAT">CEAT Mile XL</option>
                            <option value="Goodyear">Goodyear ArmorMax</option>
                            <option value="Michelin">Michelin X Multi</option>
                            <option value="Bridgestone">Bridgestone G611</option>
                          </select>
                        </div>
                        <div>
                          <label className="block font-bold text-slate-500 mb-0.5 uppercase text-[9px]">Model Spec</label>
                          <input 
                            type="text" 
                            value={newModel}
                            onChange={(e) => setNewModel(e.target.value)}
                            className="w-full p-2 border border-slate-200 rounded font-bold focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="block font-bold text-slate-500 mb-0.5 uppercase text-[9px]">Pattern Profile</label>
                          <select
                            value={newPattern}
                            onChange={(e) => setNewPattern(e.target.value)}
                            className="w-full p-2 border border-slate-200 rounded font-bold focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="Rib Pattern">Rib Pattern (Steer/Highway)</option>
                            <option value="Lug Pattern">Lug Pattern (Drive/Traction)</option>
                            <option value="Semi-Lug Pattern">Semi-Lug (All-Wheel)</option>
                            <option value="Radial Block">Radial Block (Off-Road)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block font-bold text-slate-500 mb-0.5 uppercase text-[9px]">Tyre Size Spec</label>
                          <input 
                            type="text" 
                            value={newSize}
                            onChange={(e) => setNewSize(e.target.value)}
                            className="w-full p-2 border border-slate-200 rounded font-bold focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="block font-bold text-slate-500 mb-0.5 uppercase text-[9px]">Load / Speed Index</label>
                          <input 
                            type="text" 
                            value={newLoadIndex}
                            onChange={(e) => setNewLoadIndex(e.target.value)}
                            className="w-full p-2 border border-slate-200 rounded font-bold focus:ring-1 focus:ring-blue-500"
                            placeholder="e.g. 146/143K"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-500 mb-0.5 uppercase text-[9px]">Tube / Tubeless</label>
                          <select
                            value={newTubeTubeless}
                            onChange={(e) => setNewTubeTubeless(e.target.value)}
                            className="w-full p-2 border border-slate-200 rounded font-bold focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="Tubeless">Tubeless</option>
                            <option value="Tube Type">Tube Type</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="block font-bold text-slate-500 mb-0.5 uppercase text-[9px]">Radial / Nylon</label>
                          <select
                            value={newRadialNylon}
                            onChange={(e) => setNewRadialNylon(e.target.value)}
                            className="w-full p-2 border border-slate-200 rounded font-bold focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="Radial">Radial (Steel Belted)</option>
                            <option value="Nylon">Nylon (Bias Ply)</option>
                          </select>
                        </div>
                        <div className="grid grid-cols-2 gap-1">
                          <div>
                            <label className="block font-bold text-slate-500 mb-0.5 uppercase text-[9px]">Mfg Week</label>
                            <input 
                              type="number" 
                              min="1"
                              max="53"
                              value={newMfgWeek}
                              onChange={(e) => setNewMfgWeek(parseInt(e.target.value) || 12)}
                              className="w-full p-2 border border-slate-200 rounded font-bold focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block font-bold text-slate-500 mb-0.5 uppercase text-[9px]">Mfg Year</label>
                            <input 
                              type="number" 
                              value={newMfgYear}
                              onChange={(e) => setNewMfgYear(parseInt(e.target.value) || 2026)}
                              className="w-full p-2 border border-slate-200 rounded font-bold focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* B. PURCHASE DETAILS ACCORDION */}
                <div className="border border-slate-200 rounded overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleSection('purchase')}
                    className="w-full flex justify-between items-center bg-slate-50 px-3 py-2.5 text-left font-bold text-slate-700 hover:bg-slate-100 transition border-b border-slate-200"
                  >
                    <span className="flex items-center gap-1.5">
                      <TrendingUp size={14} className="text-indigo-500" />
                      <span>B. Purchase Details</span>
                    </span>
                    {expandedSections.purchase ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                  {expandedSections.purchase && (
                    <div className="p-3 bg-white space-y-3 animate-fadeIn">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="block font-bold text-slate-500 mb-0.5 uppercase text-[9px]">Purchase Date</label>
                          <input 
                            type="date" 
                            value={newPurchaseDate}
                            onChange={(e) => setNewPurchaseDate(e.target.value)}
                            className="w-full p-2 border border-slate-200 rounded font-bold"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-500 mb-0.5 uppercase text-[9px]">Purchase Cost (₹)</label>
                          <input 
                            type="number" 
                            value={newPurchaseCost}
                            onChange={(e) => setNewPurchaseCost(parseInt(e.target.value) || 0)}
                            className="w-full p-2 border border-slate-200 rounded font-bold"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="block font-bold text-slate-500 mb-0.5 uppercase text-[9px]">Supplier / Vendor Name</label>
                          <input 
                            type="text" 
                            value={newVendor}
                            onChange={(e) => setNewVendor(e.target.value)}
                            className="w-full p-2 border border-slate-200 rounded font-semibold"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-500 mb-0.5 uppercase text-[9px]">Supplier Contact No.</label>
                          <input 
                            type="text" 
                            placeholder="e.g. +91 98290 12345"
                            value={newSupplierContact}
                            onChange={(e) => setNewSupplierContact(e.target.value)}
                            className="w-full p-2 border border-slate-200 rounded font-semibold"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="block font-bold text-slate-500 mb-0.5 uppercase text-[9px]">Invoice Number</label>
                          <input 
                            type="text" 
                            placeholder="e.g. INV/26-27/0411"
                            value={newInvoiceNumber}
                            onChange={(e) => setNewInvoiceNumber(e.target.value)}
                            className="w-full p-2 border border-slate-200 rounded font-mono font-bold"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-500 mb-0.5 uppercase text-[9px]">Purchase Order (PO)</label>
                          <input 
                            type="text" 
                            placeholder="e.g. PO-8902"
                            value={newPurchaseOrderNumber}
                            onChange={(e) => setNewPurchaseOrderNumber(e.target.value)}
                            className="w-full p-2 border border-slate-200 rounded font-mono font-bold"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-500 mb-0.5 uppercase text-[9px]">Vendor GSTIN Number</label>
                        <input 
                          type="text" 
                          placeholder="e.g. 08AAAAA1111A1Z1"
                          value={newGstNumber}
                          onChange={(e) => setNewGstNumber(e.target.value)}
                          className="w-full p-2 border border-slate-200 rounded font-mono font-bold uppercase"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* C. WARRANTY DETAILS ACCORDION */}
                <div className="border border-slate-200 rounded overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleSection('warranty')}
                    className="w-full flex justify-between items-center bg-slate-50 px-3 py-2.5 text-left font-bold text-slate-700 hover:bg-slate-100 transition border-b border-slate-200"
                  >
                    <span className="flex items-center gap-1.5">
                      <Calendar size={14} className="text-emerald-500" />
                      <span>C. Warranty details</span>
                    </span>
                    {expandedSections.warranty ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                  {expandedSections.warranty && (
                    <div className="p-3 bg-white space-y-3 animate-fadeIn">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="block font-bold text-slate-500 mb-0.5 uppercase text-[9px]">Warranty Period (Months)</label>
                          <input 
                            type="number" 
                            value={newWarranty}
                            onChange={(e) => setNewWarranty(parseInt(e.target.value) || 0)}
                            className="w-full p-2 border border-slate-200 rounded font-bold"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-500 mb-0.5 uppercase text-[9px]">Calculated Expiry Date</label>
                          <div className="w-full p-2 bg-slate-50 border border-slate-200 rounded font-mono font-bold text-emerald-700">
                            {(() => {
                              try {
                                const d = new Date(newPurchaseDate);
                                d.setMonth(d.getMonth() + newWarranty);
                                return d.toISOString().split('T')[0];
                              } catch {
                                return 'N/A';
                              }
                            })()}
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-500 mb-0.5 uppercase text-[9px]">Manufacturer Warranty Spec</label>
                        <input 
                          type="text" 
                          value={newMfgWarranty}
                          onChange={(e) => setNewMfgWarranty(e.target.value)}
                          className="w-full p-2 border border-slate-200 rounded font-semibold"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-500 mb-0.5 uppercase text-[9px]">Dealer / Supplier Warranty Extension</label>
                        <input 
                          type="text" 
                          value={newDealerWarranty}
                          onChange={(e) => setNewDealerWarranty(e.target.value)}
                          className="w-full p-2 border border-slate-200 rounded font-semibold"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* D. CURRENT STATUS ACCORDION */}
                <div className="border border-slate-200 rounded overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleSection('status')}
                    className="w-full flex justify-between items-center bg-slate-50 px-3 py-2.5 text-left font-bold text-slate-700 hover:bg-slate-100 transition border-b border-slate-200"
                  >
                    <span className="flex items-center gap-1.5">
                      <Activity size={14} className="text-amber-500" />
                      <span>D. Current Status</span>
                    </span>
                    {expandedSections.status ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                  {expandedSections.status && (
                    <div className="p-3 bg-white space-y-3 animate-fadeIn">
                      <div>
                        <label className="block font-bold text-slate-500 mb-0.5 uppercase text-[9px]">Tyre Operational Status Class</label>
                        <select 
                          value={newStatus}
                          onChange={(e) => setNewStatus(e.target.value as TyreMasterStatus)}
                          className="w-full p-2.5 border border-slate-200 rounded font-bold uppercase text-slate-800 bg-slate-50"
                        >
                          <option value={TyreMasterStatus.INVENTORY}>Inventory (Available/Spare)</option>
                          <option value={TyreMasterStatus.INSTALLED}>Installed (Active Fitted)</option>
                          <option value={TyreMasterStatus.REPAIR}>Repair (Workshop/Patching)</option>
                          <option value={TyreMasterStatus.RETREAD}>Retread (Processing/Recap)</option>
                          <option value={TyreMasterStatus.SCRAP}>Scrap (Retired/Discarded)</option>
                          <option value={TyreMasterStatus.RESERVED}>Reserved (Booked/Standby)</option>
                          <option value={TyreMasterStatus.LOST}>Lost (Missing/Claimed)</option>
                        </select>
                        <p className="text-[10px] text-slate-400 mt-1 italic">
                          *Installed tyres are locked to their vehicle axle position.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* E. CURRENT ASSIGNMENT ACCORDION */}
                <div className="border border-slate-200 rounded overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleSection('assignment')}
                    className="w-full flex justify-between items-center bg-slate-50 px-3 py-2.5 text-left font-bold text-slate-700 hover:bg-slate-100 transition border-b border-slate-200"
                  >
                    <span className="flex items-center gap-1.5">
                      <ArrowLeftRight size={14} className="text-cyan-500" />
                      <span>E. Current Assignment</span>
                    </span>
                    {expandedSections.assignment ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                  {expandedSections.assignment && (
                    <div className="p-3 bg-white space-y-2 animate-fadeIn text-[11px]">
                      {selectedTyreForProfile && selectedTyreForProfile.status === TyreMasterStatus.INSTALLED ? (
                        <div className="bg-slate-50 border border-slate-200 rounded p-2.5 space-y-1.5 font-sans">
                          <div className="flex justify-between">
                            <span className="text-slate-450 font-bold uppercase text-[9px]">Active Vehicle:</span>
                            <span className="font-mono font-bold text-blue-600">{selectedTyreForProfile.currentVehicle || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-450 font-bold uppercase text-[9px]">Axle Assignment:</span>
                            <span className="font-semibold text-slate-800">{selectedTyreForProfile.currentAxle || 'Front Axle'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-450 font-bold uppercase text-[9px]">Wheel Position:</span>
                            <span className="font-mono font-bold text-slate-700">{selectedTyreForProfile.currentPosition || 'Left Outer'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-450 font-bold uppercase text-[9px]">Installed Date:</span>
                            <span className="font-mono text-slate-800">{selectedTyreForProfile.installedDate || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-450 font-bold uppercase text-[9px]">Supervisor:</span>
                            <span className="font-bold text-slate-850">{selectedTyreForProfile.supervisor || swapSupervisor || 'Logistics Admin'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-450 font-bold uppercase text-[9px]">Foreman:</span>
                            <span className="font-bold text-slate-850">{newForeman}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="p-3 text-center border border-dashed border-slate-200 rounded text-slate-450 bg-slate-50 italic">
                          No active vehicle assignment. Tyre is available as spare stock in Inventory.
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* F. TYRE HEALTH ACCORDION */}
                <div className="border border-slate-200 rounded overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleSection('health')}
                    className="w-full flex justify-between items-center bg-slate-50 px-3 py-2.5 text-left font-bold text-slate-700 hover:bg-slate-100 transition border-b border-slate-200"
                  >
                    <span className="flex items-center gap-1.5">
                      <ClipboardCheck size={14} className="text-purple-500" />
                      <span>F. Tyre Health Summary</span>
                    </span>
                    {expandedSections.health ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                  {expandedSections.health && (
                    <div className="p-3 bg-white space-y-2.5 animate-fadeIn">
                      {(() => {
                        const runKm = selectedTyreForProfile?.currentRunningKm || 0;
                        const ageMonths = selectedTyreForProfile ? calculateTyreAgeMonths(selectedTyreForProfile) : 0;
                        const originalTread = 16;
                        const currentTread = selectedTyreForProfile?.treadDepth || selectedTyreForProfile?.treadDepthMm || 12;
                        const health = calculateHealthScore(currentTread);
                        const psi = selectedTyreForProfile?.psi || 115;
                        const repairs = selectedTyreForProfile?.repairCount || 0;
                        const retreads = selectedTyreForProfile?.retreadCount || 0;

                        return (
                          <div className="space-y-3 font-sans">
                            <div className="grid grid-cols-2 gap-2 text-center text-[11px]">
                              <div className="bg-slate-50 border border-slate-100 rounded p-1.5">
                                <span className="block font-bold text-slate-400 uppercase text-[8px]">Running Odometer</span>
                                <span className="font-mono font-bold text-slate-900">{runKm.toLocaleString()} KM</span>
                              </div>
                              <div className="bg-slate-50 border border-slate-100 rounded p-1.5">
                                <span className="block font-bold text-slate-400 uppercase text-[8px]">Inflation Pressure</span>
                                <span className="font-mono font-bold text-blue-600">{psi} PSI</span>
                              </div>
                              <div className="bg-slate-50 border border-slate-100 rounded p-1.5">
                                <span className="block font-bold text-slate-400 uppercase text-[8px]">Tread Depth</span>
                                <span className="font-mono font-bold text-purple-600">{currentTread} mm ({originalTread}mm new)</span>
                              </div>
                              <div className="bg-slate-50 border border-slate-100 rounded p-1.5">
                                <span className="block font-bold text-slate-400 uppercase text-[8px]">Asset Age</span>
                                <span className="font-mono font-bold text-slate-800">{ageMonths} Months</span>
                              </div>
                            </div>

                            <div className="bg-slate-50 border border-slate-150 p-2 rounded">
                              <div className="flex justify-between items-center text-xs mb-1">
                                <span className="font-bold text-slate-700">Health Index Score</span>
                                <span className={`font-mono font-extrabold ${
                                  health > 75 ? 'text-emerald-600' : health > 50 ? 'text-orange-500' : 'text-red-500'
                                }`}>{health}%</span>
                              </div>
                              <div className="w-full bg-slate-200 h-2 rounded overflow-hidden">
                                <div 
                                  className={`h-full rounded transition-all duration-500 ${
                                    health > 75 ? 'bg-emerald-500' : health > 50 ? 'bg-orange-500' : 'bg-red-500'
                                  }`}
                                  style={{ width: `${health}%` }}
                                ></div>
                              </div>
                            </div>

                            <div className="flex justify-between text-[11px] px-1 font-semibold text-slate-650">
                              <span>Repairs: <strong className="text-slate-900 font-mono">{repairs}</strong></span>
                              <span>Retreads: <strong className="text-purple-600 font-mono">{retreads} / 3 Max</strong></span>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>

                {/* G. FINANCIAL SUMMARY ACCORDION */}
                <div className="border border-slate-200 rounded overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleSection('financial')}
                    className="w-full flex justify-between items-center bg-slate-50 px-3 py-2.5 text-left font-bold text-slate-700 hover:bg-slate-100 transition border-b border-slate-200"
                  >
                    <span className="flex items-center gap-1.5">
                      <TrendingUp size={14} className="text-emerald-500" />
                      <span>G. Financial Summary</span>
                    </span>
                    {expandedSections.financial ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                  {expandedSections.financial && (
                    <div className="p-3 bg-white space-y-2 animate-fadeIn text-[11px]">
                      {(() => {
                        const cost = selectedTyreForProfile?.purchaseCost || newPurchaseCost || 0;
                        const repairsCount = selectedTyreForProfile?.repairCount || 0;
                        const retreadsCount = selectedTyreForProfile?.retreadCount || 0;
                        const repairsCost = selectedTyreForProfile?.totalRepairCost || (repairsCount * 1200);
                        const retreadsCost = selectedTyreForProfile?.totalRetreadCost || (retreadsCount * 3500);
                        const totalInv = cost + repairsCost + retreadsCost;
                        const runKm = selectedTyreForProfile?.currentRunningKm || 0;
                        const cpkm = runKm > 0 ? (totalInv / runKm).toFixed(2) : 'N/A';

                        return (
                          <div className="space-y-1.5 font-sans">
                            <div className="flex justify-between border-b border-slate-100 pb-1">
                              <span className="text-slate-500">Base Purchase Cost:</span>
                              <span className="font-mono font-bold text-slate-800">₹{cost.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-100 pb-1">
                              <span className="text-slate-500">Total Repair Expense:</span>
                              <span className="font-mono font-bold text-slate-800">₹{repairsCost.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-100 pb-1">
                              <span className="text-slate-500">Total Retread Expense:</span>
                              <span className="font-mono font-bold text-slate-800">₹{retreadsCost.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between bg-slate-50 p-1.5 rounded font-bold border border-slate-150">
                              <span className="text-slate-700">Total Life Investment:</span>
                              <span className="font-mono text-indigo-700">₹{totalInv.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center bg-blue-50/50 p-1.5 rounded font-bold border border-blue-100 mt-2">
                              <span className="text-blue-800">Operating Cost Per KM:</span>
                              <span className="font-mono text-emerald-700 text-xs">{cpkm !== 'N/A' ? `₹${cpkm} / KM` : 'N/A'}</span>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>

                {/* H. DOCUMENT MANAGEMENT ACCORDION */}
                <div className="border border-slate-200 rounded overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleSection('documents')}
                    className="w-full flex justify-between items-center bg-slate-50 px-3 py-2.5 text-left font-bold text-slate-700 hover:bg-slate-100 transition border-b border-slate-200"
                  >
                    <span className="flex items-center gap-1.5">
                      <FileText size={14} className="text-blue-500" />
                      <span>H. Document Management</span>
                    </span>
                    {expandedSections.documents ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                  {expandedSections.documents && (
                    <div className="p-3 bg-white space-y-3.5 animate-fadeIn">
                      {selectedTyreForProfile ? (
                        <div className="space-y-3">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Categorized Folders</span>
                          
                          {[
                            { id: 'purchaseInvoice', label: 'Purchase Invoice', color: 'border-blue-150 bg-blue-50/20' },
                            { id: 'warrantyCard', label: 'Warranty Card', color: 'border-emerald-150 bg-emerald-50/20' },
                            { id: 'inspectionPhotos', label: 'Inspection Photos', color: 'border-purple-150 bg-purple-50/20' },
                            { id: 'damagePhotos', label: 'Damage Photos', color: 'border-red-150 bg-red-50/20' },
                            { id: 'repairBills', label: 'Repair Bills', color: 'border-amber-150 bg-amber-50/20' },
                            { id: 'retreadBills', label: 'Retread Bills', color: 'border-indigo-150 bg-indigo-50/20' }
                          ].map((cat) => {
                            const catDocs = selectedTyreForProfile.categorizedDocs || {};
                            const docsList = catDocs[cat.id] || [];

                            return (
                              <div key={cat.id} className={`p-2.5 border rounded-lg ${cat.color} space-y-2`}>
                                <div className="flex justify-between items-center">
                                  <span className="font-bold text-slate-800 text-[10px] uppercase">{cat.label}</span>
                                  <span className="font-mono text-[9px] px-1.5 py-0.2 bg-white rounded border border-slate-200 font-bold text-slate-500">
                                    {docsList.length} Files
                                  </span>
                                </div>

                                {docsList.length > 0 && (
                                  <div className="space-y-1 max-h-24 overflow-y-auto">
                                    {docsList.map((doc, idx) => (
                                      <div key={idx} className="flex items-center justify-between bg-white px-2 py-1 rounded border border-slate-100 text-[9px] font-mono">
                                        <span className="truncate text-slate-700 font-bold" title={doc.name}>{doc.name}</span>
                                        <div className="flex items-center gap-1 shrink-0">
                                          <span className="text-slate-400">({doc.size})</span>
                                          <button
                                            type="button"
                                            onClick={() => handleRemoveCategorizedFile(selectedTyreForProfile.serialNumber, cat.id, idx)}
                                            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-0.5 rounded"
                                            title="Remove File"
                                          >
                                            <Trash2 size={10} />
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {/* Small Upload zone for category */}
                                <div className="flex items-center gap-1.5">
                                  <input 
                                    type="file"
                                    id={`file-${cat.id}`}
                                    className="hidden"
                                    onChange={(e) => {
                                      if (e.target.files && e.target.files[0]) {
                                        const file = e.target.files[0];
                                        handleAddCategorizedFile(selectedTyreForProfile.serialNumber, cat.id, file.name, `${(file.size / 1024).toFixed(1)} KB`);
                                      }
                                    }}
                                  />
                                  <label 
                                    htmlFor={`file-${cat.id}`}
                                    className="w-full text-center py-1 bg-white border border-slate-200 hover:border-slate-350 hover:bg-slate-50 font-bold text-[9px] uppercase tracking-wider text-slate-600 rounded cursor-pointer transition flex items-center justify-center gap-1"
                                  >
                                    <Upload size={10} />
                                    <span>Attach document</span>
                                  </label>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="p-4 text-center border border-dashed border-slate-200 bg-slate-50 text-slate-400 rounded text-[11px] italic">
                          Please save the tyre asset or load an existing tyre profile first to attach categorized documents.
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Form Action buttons */}
                <div className="flex flex-col gap-2 pt-2">
                  <button
                    type="submit"
                    className="w-full p-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded uppercase shadow text-xs transition"
                  >
                    {selectedTyreForProfile ? 'Save Profile Changes' : 'Save Asset to Master DB'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddTyreToMaster(null as any, true)}
                    className="w-full p-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded uppercase shadow text-xs transition flex items-center justify-center gap-1.5"
                  >
                    <CheckSquare size={13} />
                    <span>{selectedTyreForProfile ? 'Save & Install' : 'Register & Install'}</span>
                  </button>
                  {selectedTyreForProfile && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setHistorySearchQuery(selectedTyreForProfile.serialNumber);
                          setHistoryViewMode('journey');
                          setActiveSubTab('history');
                        }}
                        className="p-2 border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold rounded uppercase text-[10px] text-center transition flex items-center justify-center gap-1"
                      >
                        <History size={12} />
                        <span>View Journey</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleClearTyreProfile}
                        className="p-2 border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded uppercase text-[10px] text-center transition flex items-center justify-center gap-1"
                      >
                        <X size={12} />
                        <span>Close Profile</span>
                      </button>
                    </div>
                  )}
                </div>
              </form>
            </div>

            {/* Right: Master Database List */}
            <div className="lg:col-span-2 bg-white p-5 rounded border border-slate-200 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                  Asset Rack Database Table
                </span>
                <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-bold font-mono rounded text-[10px]">
                  {tyres.length} Total Tyres
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs min-w-[750px]">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[9px] font-mono">
                      <th className="pb-2">Tyre ID</th>
                      <th className="pb-2">Tyre / Serial</th>
                      <th className="pb-2">Brand & Pattern</th>
                      <th className="pb-2">Purchase & Vendor</th>
                      <th className="pb-2">Current Location</th>
                      <th className="pb-2">Stats & Health</th>
                      <th className="pb-2 text-center">Status</th>
                      <th className="pb-2 text-right pr-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {tyres
                      .filter(t => {
                        const query = searchQuery.toLowerCase();
                        if (!query) return true;
                        const tyreNum = (t.tyreNumber || t.serialNumber || '').toLowerCase();
                        const idStr = (t.tyreId || '').toLowerCase();
                        const vehicleNo = (t.currentVehicle || t.vehicleNo || '').toLowerCase();
                        return (
                          t.serialNumber.toLowerCase().includes(query) || 
                          t.brand.toLowerCase().includes(query) ||
                          t.model.toLowerCase().includes(query) ||
                          tyreNum.includes(query) ||
                          idStr.includes(query) ||
                          vehicleNo.includes(query)
                        );
                      })
                      .map((t) => {
                        const tyreNum = t.tyreNumber || t.serialNumber;
                        const vendor = t.vendor || t.vendorName || 'N/A';
                        const currentTread = t.treadDepth || (t as any).treadDepthMm || 12;
                        const health = calculateHealthScore(currentTread);
                        
                        // Dynamically find location in active fleet if not explicitly set
                        const location = (() => {
                          if (t.currentVehicle && t.currentPosition) {
                            return { vehicle: t.currentVehicle, position: t.currentPosition };
                          }
                          for (const v of vehicles) {
                            const found = v.tyres.find(ty => ty.serialNumber === t.serialNumber);
                            if (found) {
                              return { vehicle: v.truckNumber, position: found.positionName || found.positionId };
                            }
                          }
                          return { vehicle: 'N/A', position: 'N/A' };
                        })();

                        // Backwards compatible status display mapper
                        const displayStatus = t.status || TyreMasterStatus.INVENTORY;

                        return (
                          <tr key={t.serialNumber} className={`hover:bg-slate-50 text-xs transition ${
                            selectedTyreForProfile?.serialNumber === t.serialNumber ? 'bg-blue-50/50 border-l-2 border-l-blue-600' : ''
                          }`}>
                            <td className="py-3 font-mono font-bold text-slate-500">
                              <span className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px]">
                                {t.tyreId || 'N/A'}
                              </span>
                            </td>
                            <td className="py-3 font-sans">
                              <div className="font-bold text-slate-950 font-mono text-xs">{tyreNum}</div>
                              <div className="text-[10px] text-slate-400 font-mono">Serial: {t.serialNumber}</div>
                            </td>
                            <td className="py-3 font-sans">
                              <div className="font-semibold text-slate-800">{t.brand} {t.model}</div>
                              <div className="text-[10px] text-slate-400 font-bold uppercase">{t.pattern || 'Rib Pattern'} • {t.size}</div>
                            </td>
                            <td className="py-3 font-sans">
                              <div className="font-mono text-slate-700 font-bold">₹{t.purchaseCost.toLocaleString()}</div>
                              <div className="text-[10px] text-slate-500 font-mono">{t.purchaseDate} • {vendor}</div>
                            </td>
                            <td className="py-3 font-sans">
                              {displayStatus === TyreMasterStatus.INSTALLED ? (
                                <div>
                                  <span className="font-bold text-blue-600 block">{location.vehicle}</span>
                                  <span className="text-slate-500 text-[9px] block">Pos: {location.position}</span>
                                </div>
                              ) : (
                                <span className="text-slate-400 font-semibold uppercase text-[9px] bg-slate-50 px-1 py-0.5 rounded border border-slate-150">
                                  {displayStatus === TyreMasterStatus.REPAIR ? 'Workshop' : 'Spare Rack'}
                                </span>
                              )}
                            </td>
                            <td className="py-3 font-sans">
                              <div className="font-mono text-slate-700 font-bold">{(t.currentRunningKm || 0).toLocaleString()} KM</div>
                              <div className="flex items-center gap-1 mt-0.5">
                                <span className={`text-[9px] font-extrabold uppercase px-1 rounded ${
                                  health > 75 ? 'bg-emerald-100 text-emerald-800' : health > 50 ? 'bg-orange-100 text-orange-800' : 'bg-red-100 text-red-800'
                                }`}>
                                  Health: {health}%
                                </span>
                                <span className="text-[9px] text-slate-400 font-bold">Retreads: {t.retreadCount || 0}</span>
                              </div>
                            </td>
                            <td className="py-3 text-center">
                              <span className={`inline-block px-2 py-0.5 rounded text-[9.5px] font-extrabold uppercase tracking-wide text-white shadow-sm ${
                                displayStatus === TyreMasterStatus.INSTALLED 
                                  ? 'bg-emerald-600' 
                                  : displayStatus === TyreMasterStatus.INVENTORY
                                    ? 'bg-blue-600'
                                    : displayStatus === TyreMasterStatus.REPAIR
                                      ? 'bg-amber-500'
                                      : displayStatus === TyreMasterStatus.RETREAD 
                                        ? 'bg-purple-600'
                                        : displayStatus === TyreMasterStatus.SCRAP
                                          ? 'bg-red-650'
                                          : displayStatus === TyreMasterStatus.RESERVED
                                            ? 'bg-cyan-600'
                                            : 'bg-zinc-700'
                              }`}>
                                {displayStatus}
                              </span>
                            </td>
                            <td className="py-3 text-right pr-2">
                              <div className="flex justify-end gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleLoadTyreProfile(t)}
                                  className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition"
                                  title="Open Tyre Asset Profile & Documents"
                                >
                                  <Sliders size={13} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setHistorySearchQuery(t.serialNumber);
                                    setHistoryViewMode('journey');
                                    setActiveSubTab('history');
                                  }}
                                  className="p-1.5 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded transition"
                                  title="View Full Journey Timeline"
                                >
                                  <History size={13} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (confirm(`Are you sure you want to delete tyre asset ${tyreNum} (Serial: ${t.serialNumber})?`)) {
                                      setTyres(prev => prev.filter(item => item.serialNumber !== t.serialNumber));
                                    }
                                  }}
                                  className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition"
                                  title="Delete Tyre Asset"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    {tyres.length === 0 && (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-slate-400">
                          No tyre assets registered. Click Register New Tyre Asset on the left.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ----------------------------------------------------
          TAB 3: TYRE JOURNEY HISTORY
          ---------------------------------------------------- */}
      {activeSubTab === 'history' && (
        <div className="bg-white p-6 rounded border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 uppercase font-sans">Tyre History & Movements</h2>
              <p className="text-xs text-slate-400 font-semibold uppercase">Review registered movements and journey timelines synced with Firestore.</p>
            </div>
            <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setHistoryViewMode('movements')}
                className={`px-3 py-1.5 text-xs font-bold font-sans rounded-md transition ${
                  historyViewMode === 'movements'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-950'
                }`}
              >
                Firestore Movements
              </button>
              <button
                type="button"
                onClick={() => setHistoryViewMode('journey')}
                className={`px-3 py-1.5 text-xs font-bold font-sans rounded-md transition ${
                  historyViewMode === 'journey'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-950'
                }`}
              >
                Detailed Journeys
              </button>
            </div>
          </div>

          {historyViewMode === 'movements' ? (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-blue-50 p-3 rounded border border-blue-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-blue-800">
                <span>
                  Showing active realtime-synced <strong>tyreMovements</strong> collection from Firestore. Updates save automatically on rotation or replacement.
                </span>
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 font-bold font-mono rounded text-[10px] self-start sm:self-auto">
                  {tyreMovements.length} Records
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs min-w-[1000px]">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[9px] font-mono">
                      <th className="pb-2">Movement ID</th>
                      <th className="pb-2">Tyre Number</th>
                      <th className="pb-2">From Vehicle</th>
                      <th className="pb-2">To Vehicle</th>
                      <th className="pb-2">From Position</th>
                      <th className="pb-2">To Position</th>
                      <th className="pb-2">Movement Date</th>
                      <th className="pb-2">Odometer</th>
                      <th className="pb-2">Authorized By</th>
                      <th className="pb-2 text-right">Reason</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-slate-700">
                    {tyreMovements
                      .slice()
                      .sort((a, b) => {
                        const dateA = a.movementDate || a.date || '';
                        const dateB = b.movementDate || b.date || '';
                        return dateB.localeCompare(dateA);
                      })
                      .map((m) => (
                        <tr key={m.movementId || m.id} className="hover:bg-slate-50">
                          <td className="py-2.5 font-bold text-slate-500">{(m.movementId || m.id || '').slice(0, 15)}</td>
                          <td className="py-2.5 font-bold text-slate-900">{m.tyreNumber || m.serialNumber}</td>
                          <td className="py-2.5 font-bold text-slate-600">{m.vehicleFrom || m.sourceVehicle || 'Spare Yard'}</td>
                          <td className="py-2.5 font-bold text-blue-600">{m.vehicleTo || m.destinationVehicle || 'Spare Yard'}</td>
                          <td className="py-2.5 font-sans text-slate-500">{m.positionFrom || m.sourcePosition || 'Spare'}</td>
                          <td className="py-2.5 font-sans text-slate-700 font-semibold">{m.positionTo || m.destinationPosition || 'Spare'}</td>
                          <td className="py-2.5 text-slate-600">{m.movementDate || (m.date ? m.date.split(' ')[0] : 'N/A')}</td>
                          <td className="py-2.5 font-bold text-slate-600">{(m.odometer || 0).toLocaleString()} KM</td>
                          <td className="py-2.5 font-sans font-bold text-slate-900">{m.supervisorName}</td>
                          <td className="py-2.5 font-sans text-slate-500 italic text-right">{m.reason || 'Routine replacement / rotation'}</td>
                        </tr>
                      ))}
                    {tyreMovements.length === 0 && (
                      <tr>
                        <td colSpan={10} className="py-8 text-center text-slate-400 font-sans">
                          No tyre movements logged yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto animate-fadeIn">
              <table className="w-full text-left border-collapse text-xs min-w-[1000px]">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[9px] font-mono">
                    <th className="pb-2">History ID</th>
                    <th className="pb-2">Tyre Serial (No)</th>
                    <th className="pb-2">Vehicle</th>
                    <th className="pb-2">Movement Type</th>
                    <th className="pb-2">Date</th>
                    <th className="pb-2">Odometer</th>
                    <th className="pb-2">Positions (Old → New)</th>
                    <th className="pb-2">Statuses (Old → New)</th>
                    <th className="pb-2 font-sans">Supervisor</th>
                    <th className="pb-2 text-right">Remarks / Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-slate-700">
                  {tyreHistory.map((h) => {
                    const mType = h.movementType || (h.removedDate ? 'Tyre Removed' : 'Tyre Installed');
                    const tNoDisplay = h.tyreNumber ? `${h.serialNumber} (${h.tyreNumber})` : h.serialNumber;
                    const vNoDisplay = h.vehicleNo || h.truckNumber || 'Spare Racks';
                    const mDateDisplay = h.movementDate || h.installedDate || 'N/A';
                    const odomDisplay = typeof h.odometer === 'number' ? h.odometer : (h.kmAtInstallation || 0);

                    const mTypeColor = (() => {
                      switch (mType) {
                        case 'Tyre Installed': return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
                        case 'Tyre Removed': return 'bg-amber-50 text-amber-700 border border-amber-200';
                        case 'Tyre Replaced': return 'bg-blue-50 text-blue-700 border border-blue-200';
                        case 'Tyre Swapped': return 'bg-indigo-50 text-indigo-700 border border-indigo-200';
                        case 'Tyre Sent for Retread': return 'bg-purple-50 text-purple-700 border border-purple-200';
                        case 'Tyre Returned from Retread': return 'bg-pink-50 text-pink-700 border border-pink-200';
                        case 'Tyre Scrapped': return 'bg-red-50 text-red-700 border border-red-200';
                        default: return 'bg-slate-50 text-slate-700 border border-slate-200';
                      }
                    })();

                    const oldPos = h.oldPosition || '';
                    const newPos = h.newPosition || h.positionName || '';
                    const posDisplay = oldPos && newPos ? `${oldPos} → ${newPos}` : (newPos || oldPos || 'N/A');

                    const oldStat = h.oldStatus || '';
                    const newStat = h.newStatus || (h.removedDate ? 'Removed' : 'Active');
                    const statDisplay = oldStat && newStat ? `${oldStat} → ${newStat}` : (newStat || oldStat || 'N/A');

                    const remarkDisplay = h.remarks || h.removalReason || 'Fitted / Active';

                    return (
                      <tr key={h.historyId || h.id} className="hover:bg-slate-50">
                        <td className="py-2.5 font-bold text-slate-500">{(h.historyId || h.id || '').slice(0, 15)}</td>
                        <td className="py-2.5 font-bold text-slate-900">{tNoDisplay}</td>
                        <td className="py-2.5 font-bold text-blue-600">{vNoDisplay}</td>
                        <td className="py-2.5">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${mTypeColor}`}>
                            {mType}
                          </span>
                        </td>
                        <td className="py-2.5">{mDateDisplay}</td>
                        <td className="py-2.5 font-bold text-slate-600">{odomDisplay.toLocaleString()} KM</td>
                        <td className="py-2.5 font-sans">{posDisplay}</td>
                        <td className="py-2.5 font-sans">
                          <span className="px-1 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-bold">
                            {statDisplay}
                          </span>
                        </td>
                        <td className="py-2.5 font-sans font-bold text-slate-900">{h.supervisorName}</td>
                        <td className="py-2.5 font-sans text-slate-500 italic text-right">{remarkDisplay}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ----------------------------------------------------
          TAB 4: INSPECTIONS REGISTRY
          ---------------------------------------------------- */}
      {activeSubTab === 'inspection' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Add Inspection Report Form */}
          <div className="bg-white p-6 rounded border border-slate-200 shadow-sm space-y-4 h-fit">
            <div className="flex items-center space-x-1.5 border-b border-slate-100 pb-3">
              <ClipboardCheck className="text-blue-600" size={16} />
              <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Log Weekly Inspection</h3>
            </div>

            <form onSubmit={handleAddInspection} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-600 mb-1">Target Tyre Serial</label>
                <select 
                  value={inspectTyreSerial}
                  onChange={(e) => setInspectTyreSerial(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded font-bold font-mono"
                  required
                >
                  <option value="">-- Select Tyre from Fleet --</option>
                  {tyres.map(t => (
                    <option key={t.serialNumber} value={t.serialNumber}>
                      {t.serialNumber} ({t.brand} - {t.status})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Measured PSI</label>
                  <input 
                    type="number" 
                    value={inspectPsi}
                    onChange={(e) => setInspectPsi(parseInt(e.target.value) || 0)}
                    className="w-full p-2 border border-slate-200 rounded font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Tread Depth (mm)</label>
                  <input 
                    type="number" 
                    value={inspectTread}
                    onChange={(e) => setInspectTread(parseFloat(e.target.value) || 0)}
                    className="w-full p-2 border border-slate-200 rounded font-bold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-600 mb-1">Side Wall Condition</label>
                <select 
                  value={inspectSideWall}
                  onChange={(e) => setInspectSideWall(e.target.value as any)}
                  className="w-full p-2 border border-slate-200 rounded font-bold"
                >
                  <option value="Good">Good Condition (Clean)</option>
                  <option value="Minor Cut">Minor Cut (Surface only)</option>
                  <option value="Deep Cut">Deep Cut (Sidewall compromised)</option>
                  <option value="Bulge">Bulge (Casing integrity compromised)</option>
                </select>
              </div>

              <div className="flex items-center space-x-2 py-1">
                <input 
                  type="checkbox" 
                  checked={inspectCap} 
                  onChange={(e) => setInspectCap(e.target.checked)}
                  className="w-4 h-4 cursor-pointer"
                  id="chk-cap"
                />
                <label htmlFor="chk-cap" className="font-bold text-slate-600 cursor-pointer">Inflation Valve Cap Present</label>
              </div>

              <div>
                <label className="block font-bold text-slate-600 mb-1">Visual Defects Detected</label>
                <select 
                  value={inspectDefect}
                  onChange={(e) => setInspectDefect(e.target.value as any)}
                  className="w-full p-2 border border-slate-200 rounded font-bold"
                >
                  <option value="None">None (Perfect Condition)</option>
                  <option value="One-sided wear">One-sided wear (Alignment issue)</option>
                  <option value="Patch failure">Patch failure (Air leakage)</option>
                  <option value="Casing damage">Casing damage (Ply separation)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-600 mb-1">Action Recommendation</label>
                <select 
                  value={inspectRecommend}
                  onChange={(e) => setInspectRecommend(e.target.value as any)}
                  className="w-full p-2 border border-slate-200 rounded font-bold text-blue-600 uppercase"
                >
                  <option value="No action">No Action (Excellent)</option>
                  <option value="Rotate">Rotate Tyre to different position</option>
                  <option value="Align">Force Wheel Alignment immediately</option>
                  <option value="Retread">Send for Retreading</option>
                  <option value="Scrap">Retire / Scrapped</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-600 mb-1">Supervisor Name</label>
                <input 
                  type="text" 
                  required
                  value={inspectSupervisor}
                  onChange={(e) => setInspectSupervisor(e.target.value)}
                  placeholder="Enter Supervisor Name"
                  list="inspect-supervisors-list"
                  className="w-full p-2 border border-slate-200 rounded font-bold focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
                <datalist id="inspect-supervisors-list">
                  {supervisorSuggestions.map(opt => (
                    <option key={opt} value={opt} />
                  ))}
                </datalist>
              </div>

              <button
                type="submit"
                className="w-full p-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded uppercase shadow text-xs transition"
              >
                Save Inspection Record
              </button>
            </form>
          </div>

          {/* Inspection Records List */}
          <div className="lg:col-span-2 bg-white p-6 rounded border border-slate-200 shadow-sm space-y-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Inspection Audit History Trail</span>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs min-w-[500px]">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[9px] font-mono">
                    <th className="pb-2">Date</th>
                    <th className="pb-2">Serial</th>
                    <th className="pb-2">PSI</th>
                    <th className="pb-2">Depth</th>
                    <th className="pb-2">Sidewall</th>
                    <th className="pb-2">Remarks</th>
                    <th className="pb-2 text-right">Supervisor Name</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium font-mono text-[11px]">
                  {tyreInspections.map((ins) => (
                    <tr key={ins.id} className="hover:bg-slate-50">
                      <td className="py-2.5 font-bold text-slate-500">{ins.inspectionDate}</td>
                      <td className="py-2.5 font-bold text-slate-900">{ins.serialNumber}</td>
                      <td className="py-2.5">{ins.pressurePsi} PSI</td>
                      <td className="py-2.5">{ins.treadDepthMm} mm</td>
                      <td className="py-2.5 font-sans">{ins.sidewallCondition}</td>
                      <td className="py-2.5 font-sans text-slate-500">{ins.remarks}</td>
                      <td className="py-2.5 font-sans font-bold text-slate-900 text-right">{ins.supervisorName}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ----------------------------------------------------
          TAB 5: RETREAD HUB
          ---------------------------------------------------- */}
      {activeSubTab === 'retread' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Retreading Submission Form */}
          <div className="bg-white p-6 rounded border border-slate-200 shadow-sm space-y-4 h-fit">
            <div className="flex items-center space-x-1.5 border-b border-slate-100 pb-3">
              <Activity className="text-purple-600" size={16} />
              <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Execute Retread fitment</h3>
            </div>

            <form onSubmit={executeRetreadLaunch} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-600 mb-1">Select Tyre Serial (Removed status only)</label>
                <select 
                  value={retreadSerial}
                  onChange={(e) => setInspectTyreSerial(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded font-bold font-mono"
                  onInput={(e) => setRetreadSerial((e.target as HTMLSelectElement).value)}
                  required
                >
                  <option value="">-- Select Tyre to Retread --</option>
                  {tyres
                    .filter(t => t.status === TyreMasterStatus.INVENTORY || (t.status as string) === 'Removed' || (t.status as string) === 'Spare')
                    .map(t => (
                      <option key={t.serialNumber} value={t.serialNumber}>
                        {t.serialNumber} (Completed Retreads: {t.retreadCount}/3)
                      </option>
                    ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Retread Cost (₹)</label>
                  <input 
                    type="number" 
                    value={retreadCost}
                    onChange={(e) => setRetreadCost(parseInt(e.target.value) || 0)}
                    className="w-full p-2 border border-slate-200 rounded font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Target Depth (mm)</label>
                  <input 
                    type="number" 
                    value={retreadTargetDepth}
                    onChange={(e) => setRetreadTargetDepth(parseInt(e.target.value) || 12)}
                    className="w-full p-2 border border-slate-200 rounded font-bold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-600 mb-1">Retread Vendor</label>
                <input 
                  type="text" 
                  value={retreadVendor}
                  onChange={(e) => setRetreadVendor(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded font-semibold"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Invoice Number</label>
                  <input 
                    type="text" 
                    value={retreadInvoice}
                    onChange={(e) => setRetreadInvoice(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded font-bold font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Expected Extra Life (KM)</label>
                  <input 
                    type="number" 
                    value={retreadAddedLife}
                    onChange={(e) => setRetreadAddedLife(parseInt(e.target.value) || 30000)}
                    className="w-full p-2 border border-slate-200 rounded font-bold"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full p-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded uppercase shadow text-xs transition"
              >
                Mount & Restore Retread
              </button>
            </form>
          </div>

          {/* Historical Retread logs */}
          <div className="lg:col-span-2 bg-white p-6 rounded border border-slate-200 shadow-sm space-y-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Retreading Hub History Trail</span>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs min-w-[500px]">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[9px] font-mono">
                    <th className="pb-2">Date</th>
                    <th className="pb-2">Serial ID</th>
                    <th className="pb-2 font-sans">Retread Vendor</th>
                    <th className="pb-2">Retread Count Before</th>
                    <th className="pb-2">Retread Count After</th>
                    <th className="pb-2 text-right font-mono">Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {retreadRecords.map((rec) => (
                    <tr key={rec.id} className="hover:bg-slate-50 font-mono">
                      <td className="py-2.5 text-slate-500">{rec.retreadDate}</td>
                      <td className="py-2.5 font-bold text-slate-900">{rec.serialNumber}</td>
                      <td className="py-2.5 font-sans">{rec.retreadVendor}</td>
                      <td className="py-2.5">{rec.retreadCountBefore} retreads</td>
                      <td className="py-2.5">{rec.retreadCountAfter} retreads</td>
                      <td className="py-2.5 font-bold text-blue-600 text-right">₹{rec.retreadCost.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ----------------------------------------------------
          SWAP / FITTING DIALOG MODAL (PREMIUM WORKFLOW)
          ---------------------------------------------------- */}
      {showSwapModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded p-6 shadow-2xl w-[95vw] max-w-[480px] max-h-[90vh] overflow-y-auto space-y-5 text-xs">
            
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h4 className="text-sm font-bold text-slate-900 uppercase font-sans flex items-center gap-1.5">
                <ArrowLeftRight size={16} className="text-blue-600" />
                Tyre Movement / Replacement
              </h4>
              <button 
                onClick={() => setShowSwapModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            {/* Tabs for choosing between Swap Existing Tyre and Replace Tyre */}
            <div className="flex border-b border-slate-150">
              <button
                type="button"
                onClick={() => setModalOption('swap')}
                className={`flex-1 pb-2.5 text-center font-bold border-b-2 text-[11px] uppercase tracking-wider transition-all duration-150 ${
                  modalOption === 'swap' 
                    ? 'border-blue-600 text-blue-600 font-extrabold' 
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                1. Swap Existing Tyre
              </button>
              <button
                type="button"
                onClick={() => setModalOption('replace')}
                className={`flex-1 pb-2.5 text-center font-bold border-b-2 text-[11px] uppercase tracking-wider transition-all duration-150 ${
                  modalOption === 'replace' 
                    ? 'border-blue-600 text-blue-600 font-extrabold' 
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                2. Replace Tyre
              </button>
            </div>

            {modalOption === 'swap' ? (
              /* ================= OPTION 1: SWAP EXISTING TYRE ================= */
              <div className="space-y-4">
                <div className="p-3 bg-blue-50 text-blue-900 border border-blue-150 rounded">
                  <span className="font-bold block uppercase text-[10px] text-blue-700">Source Wheel / Position</span>
                  You are swapping tyre serial <span className="font-mono font-bold">{activeTyre?.serialNumber || 'N/A'}</span> from <span className="font-bold">{activeVehicle?.truckNumber} ({activeTyre?.positionName})</span>.
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block font-bold text-slate-500 mb-1">Destination Vehicle</label>
                    <select
                      value={destVehicleNum}
                      onChange={(e) => {
                        const nextVehNum = e.target.value;
                        setDestVehicleNum(nextVehNum);
                        const targetVeh = vehicles.find(v => v.truckNumber === nextVehNum);
                        if (targetVeh && targetVeh.tyres.length > 0) {
                          setDestPositionId(targetVeh.tyres[0].positionId);
                        }
                      }}
                      className="w-full bg-white border border-slate-200 p-2.5 rounded font-bold text-slate-900"
                    >
                      {vehicles.map(v => (
                        <option key={v.truckNumber} value={v.truckNumber}>
                          {v.truckNumber} {v.driverName ? `(${v.driverName})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-500 mb-1">Destination Position</label>
                    <select
                      value={destPositionId}
                      onChange={(e) => setDestPositionId(e.target.value)}
                      className="w-full bg-white border border-slate-200 p-2.5 rounded font-bold text-slate-900"
                    >
                      {(() => {
                        const targetVeh = vehicles.find(v => v.truckNumber === destVehicleNum);
                        if (!targetVeh) return <option value="">Select vehicle first</option>;
                        return targetVeh.tyres.map(t => (
                          <option key={t.positionId} value={t.positionId}>
                            {t.positionName} (Serial: {t.serialNumber || 'None'})
                          </option>
                        ));
                      })()}
                    </select>
                  </div>
                </div>
              </div>
            ) : (
              /* ================= OPTION 2: REPLACE TYRE ================= */
              <div className="space-y-4">
                <div className="p-3 bg-amber-50 text-amber-900 border border-amber-150 rounded">
                  <span className="font-bold block uppercase text-[10px] text-amber-700">Old Tyre Replacement</span>
                  You are removing tyre serial <span className="font-mono font-bold">{activeTyre?.serialNumber || 'N/A'}</span> on position <span className="font-bold">{activeTyre?.positionName}</span>.
                </div>

                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setReplaceMode('spare')}
                    className={`py-2 px-2 rounded-md font-bold text-[10px] uppercase text-center transition-all ${
                      replaceMode === 'spare' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Select from Inventory
                  </button>
                  <button
                    type="button"
                    onClick={() => setReplaceMode('new')}
                    className={`py-2 px-2 rounded-md font-bold text-[10px] uppercase text-center transition-all ${
                      replaceMode === 'new' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Create New Tyre
                  </button>
                </div>

                {replaceMode === 'spare' ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-1">Search Tyre Inventory</label>
                      <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 text-slate-400" size={14} />
                        <input 
                          type="text"
                          placeholder="Search tyre number, serial number, brand or size..."
                          value={spareSearchQuery}
                          onChange={(e) => setSpareSearchQuery(e.target.value)}
                          className="w-full pl-8 p-2 border border-slate-200 bg-white rounded font-bold text-slate-900 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-[11px] font-extrabold text-slate-600 uppercase tracking-wider">Select Tyre From Inventory</label>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                          Inventory Available: {tyres.filter(t => [TyreMasterStatus.NEW, TyreMasterStatus.SPARE, TyreMasterStatus.RETREAD].includes(t.status)).length} Tyres
                        </span>
                      </div>
                      {(() => {
                        const allowedStatuses = [TyreMasterStatus.NEW, TyreMasterStatus.SPARE, TyreMasterStatus.RETREAD];
                        const filteredInventory = tyres.filter(t => {
                          if (!allowedStatuses.includes(t.status)) return false;
                          const query = spareSearchQuery.toLowerCase();
                          const tyreNum = (t.tyreNumber || t.serialNumber).toLowerCase();
                          const brand = t.brand.toLowerCase();
                          const serial = t.serialNumber.toLowerCase();
                          const size = (t.size || "").toLowerCase();
                          return tyreNum.includes(query) || brand.includes(query) || serial.includes(query) || size.includes(query);
                        });

                        return (
                          <select 
                            value={selectedSpareSerial}
                            onChange={(e) => setSelectedSpareSerial(e.target.value)}
                            className="w-full bg-white border border-slate-200 p-2.5 rounded font-mono font-bold text-slate-900 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                          >
                            {filteredInventory.length === 0 ? (
                              <option value="">-- No Matching Tyres in Inventory --</option>
                            ) : (
                              filteredInventory.map(t => {
                                const tyreNum = t.tyreNumber || t.serialNumber;
                                const displayStatus = t.status === TyreMasterStatus.RETREAD ? "Retreaded" : t.status;
                                return (
                                  <option key={t.serialNumber} value={t.serialNumber}>
                                    {tyreNum} | {t.brand} | {t.size} | {displayStatus}
                                  </option>
                                );
                              })
                            )}
                          </select>
                        );
                      })()}
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleRegisterModalSpare} className="space-y-2.5 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                    <span className="text-[10px] font-extrabold text-amber-800 uppercase tracking-wider block border-b border-slate-200 pb-1.5 mb-1.5">
                      Register New Tyre to Master Inventory
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="block font-bold text-slate-500 text-[10px] mb-0.5">Tyre Number (Required)</label>
                        <input
                          type="text"
                          placeholder="e.g. TR-105"
                          value={newTyreNumber}
                          onChange={(e) => setNewTyreNumber(e.target.value.toUpperCase())}
                          className="w-full p-2 border border-slate-200 bg-white rounded font-bold text-slate-900 text-xs"
                          required
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-500 text-[10px] mb-0.5">Serial Number (Required)</label>
                        <input
                          type="text"
                          placeholder="e.g. AP-023-SN"
                          value={newTyreSerial}
                          onChange={(e) => setNewTyreSerial(e.target.value.toUpperCase())}
                          className="w-full p-2 border border-slate-200 bg-white rounded font-mono font-bold text-slate-900 text-xs"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div>
                        <label className="block font-bold text-slate-500 text-[10px] mb-0.5">Brand</label>
                        <input
                          type="text"
                          value={newTyreBrand}
                          onChange={(e) => setNewTyreBrand(e.target.value)}
                          className="w-full p-2 border border-slate-200 bg-white rounded font-bold text-slate-900 text-xs"
                          required
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-500 text-[10px] mb-0.5">Model</label>
                        <input
                          type="text"
                          value={newTyreModel}
                          onChange={(e) => setNewTyreModel(e.target.value)}
                          className="w-full p-2 border border-slate-200 bg-white rounded font-bold text-slate-900 text-xs"
                          required
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-500 text-[10px] mb-0.5">Size</label>
                        <input
                          type="text"
                          value={newTyreSize}
                          onChange={(e) => setNewTyreSize(e.target.value)}
                          className="w-full p-2 border border-slate-200 bg-white rounded font-bold text-slate-900 text-xs"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="block font-bold text-slate-500 text-[10px] mb-0.5">Purchase Date</label>
                        <input
                          type="date"
                          value={newTyrePurchaseDate}
                          onChange={(e) => setNewTyrePurchaseDate(e.target.value)}
                          className="w-full p-2 border border-slate-200 bg-white rounded font-mono font-bold text-slate-900 text-xs"
                          required
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-500 text-[10px] mb-0.5">Purchase Cost (₹)</label>
                        <input
                          type="number"
                          value={newTyrePurchaseCost}
                          onChange={(e) => setNewTyrePurchaseCost(e.target.value)}
                          className="w-full p-2 border border-slate-200 bg-white rounded font-bold text-slate-900 text-xs"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="block font-bold text-slate-500 text-[10px] mb-0.5">Vendor Name</label>
                        <input
                          type="text"
                          value={newTyreVendor}
                          onChange={(e) => setNewTyreVendor(e.target.value)}
                          className="w-full p-2 border border-slate-200 bg-white rounded font-bold text-slate-900 text-xs"
                          required
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-500 text-[10px] mb-0.5">Warranty (Months)</label>
                        <input
                          type="number"
                          value={newTyreWarrantyPeriod}
                          onChange={(e) => setNewTyreWarrantyPeriod(e.target.value)}
                          className="w-full p-2 border border-slate-200 bg-white rounded font-bold text-slate-900 text-xs"
                          required
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold uppercase tracking-wider rounded text-[10px] shadow transition-all duration-150 mt-1"
                    >
                      Register & Save to Master Inventory
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* Shared Fields */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-500 mb-1">Old Tyre Removal Reason</label>
                  <input 
                    type="text" 
                    value={removalReasonInput}
                    onChange={(e) => setRemovalReasonInput(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-500 mb-1">Installation Odometer (KM)</label>
                  <input 
                    type="number" 
                    value={installKmInput}
                    onChange={(e) => setInstallKmInput(parseInt(e.target.value) || 120000)}
                    className="w-full p-2 border border-slate-200 rounded font-bold text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-500 mb-1">Supervisor Name</label>
                <input 
                  type="text"
                  required
                  value={swapSupervisor}
                  onChange={(e) => setSwapSupervisor(e.target.value)}
                  placeholder="Enter Supervisor Name"
                  list="swap-supervisors-list"
                  className="w-full p-2 border border-slate-200 rounded font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
                <datalist id="swap-supervisors-list">
                  {supervisorSuggestions.map(opt => (
                    <option key={opt} value={opt} />
                  ))}
                </datalist>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
              <button 
                type="button"
                onClick={() => setShowSwapModal(false)}
                className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold uppercase tracking-wider rounded text-[10px]"
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={modalOption === 'swap' ? executeTyreSwapOption : executeTyreReplacementOption}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase tracking-wider rounded text-[10px] shadow transition-all duration-150"
              >
                {modalOption === 'swap' ? 'Confirm Wheel Swap' : 'Confirm Replacement'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
