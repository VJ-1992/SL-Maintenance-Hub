import { 
  writeDocument, 
  fetchCollection, 
  ensureSignedIn
} from './firebase';
import { TripHistoryRecord, Vehicle } from '../types';

export function generateTripId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let rand = '';
  for (let i = 0; i < 5; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `TRIP-${Date.now().toString().slice(-6)}-${rand}`;
}

export async function saveTripHistoryRecord(trip: TripHistoryRecord): Promise<void> {
  await ensureSignedIn();
  await writeDocument('tripHistory', trip.tripId, trip);
}

export async function fetchAllTrips(): Promise<TripHistoryRecord[]> {
  await ensureSignedIn();
  return fetchCollection<TripHistoryRecord>('tripHistory');
}

/**
 * Automatically syncs the trip history record when a vehicle's operational state or trip properties change.
 * @returns The tripId of the created or updated trip.
 */
export async function autoSyncTripFromVehicleChange(
  oldVehicle: Vehicle | null,
  newVehicle: Vehicle,
  currentUser: string = 'Supervisor'
): Promise<string | null> {
  try {
    const hasNewTrip = newVehicle.currentTripFrom && newVehicle.currentTripTo;
    const hasOldTrip = oldVehicle?.currentTripFrom && oldVehicle?.currentTripTo;
    
    // Check what changed
    const statusChanged = oldVehicle?.tripStatus !== newVehicle.tripStatus;
    const routeChanged = oldVehicle?.currentTripFrom !== newVehicle.currentTripFrom || 
                         oldVehicle?.currentTripTo !== newVehicle.currentTripTo;
    const driverChanged = oldVehicle?.driverName !== newVehicle.driverName;
    const partyChanged = oldVehicle?.partyName !== newVehicle.partyName;

    const today = new Date().toISOString().split('T')[0];
    const time = new Date().toTimeString().split(' ')[0].substring(0, 5);

    // Case 1: No active trip currently set
    if (!hasNewTrip) {
      return null;
    }

    // Case 2: New trip registered (previously no trip, route changed, or we don't have a tripId)
    const needsNewTripRecord = !hasOldTrip || routeChanged || !(newVehicle as any).currentTripId;

    if (needsNewTripRecord) {
      const tripId = generateTripId();
      const status = newVehicle.tripStatus || 'Scheduled';
      
      const newTrip: TripHistoryRecord = {
        tripId,
        vehicleNumber: newVehicle.truckNumber,
        driver: newVehicle.driverName,
        driverName: newVehicle.driverName,
        driverMobile: newVehicle.mobileNumber,
        supervisor: newVehicle.supervisorName,
        supervisorName: newVehicle.supervisorName,
        foremanName: newVehicle.foremanName || '',
        party: newVehicle.partyName || '',
        fromLocation: newVehicle.currentTripFrom || '',
        toLocation: newVehicle.currentTripTo || '',
        startDate: newVehicle.tripStartDate ? newVehicle.tripStartDate + 'T12:00:00Z' : new Date().toISOString(),
        status: status as any,
        timeline: [
          {
            eventName: "Trip Planned & Registered",
            date: today,
            time,
            user: currentUser,
            remarks: `Trip route configured from ${newVehicle.currentTripFrom} to ${newVehicle.currentTripTo}.`
          }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (status === 'In Transit') {
        newTrip.timeline.push({
          eventName: "Trip Dispatched (In Transit)",
          date: today,
          time,
          user: currentUser,
          remarks: `Vehicle departed. Location: ${newVehicle.currentLocation || 'Origin'}`
        });
      }

      await saveTripHistoryRecord(newTrip);
      return tripId;
    }

    // Active trip synchronization for Scheduled or Running/In Transit trips for this vehicle
    const allTripsForVehicle = await fetchAllTrips();
    const activeTrips = allTripsForVehicle.filter(t => 
      t.vehicleNumber === newVehicle.truckNumber && 
      t.status !== 'Completed' && 
      t.status !== 'Cancelled'
    );

    for (const activeTrip of activeTrips) {
      let changed = false;
      const updatedTrip = { ...activeTrip };
      
      if (updatedTrip.driver !== newVehicle.driverName) {
        updatedTrip.driver = newVehicle.driverName;
        updatedTrip.driverName = newVehicle.driverName;
        changed = true;
      }
      if (updatedTrip.driverMobile !== newVehicle.mobileNumber) {
        updatedTrip.driverMobile = newVehicle.mobileNumber;
        changed = true;
      }
      if (updatedTrip.supervisor !== newVehicle.supervisorName || updatedTrip.supervisorName !== newVehicle.supervisorName) {
        updatedTrip.supervisor = newVehicle.supervisorName;
        updatedTrip.supervisorName = newVehicle.supervisorName;
        changed = true;
      }
      if (updatedTrip.foremanName !== newVehicle.foremanName) {
        updatedTrip.foremanName = newVehicle.foremanName;
        changed = true;
      }

      if (changed) {
        updatedTrip.timeline = [...(updatedTrip.timeline || []), {
          eventName: "Personnel Assignment Synced",
          date: today,
          time,
          user: currentUser,
          remarks: `Personnel assignments synchronized from updated Vehicle Profile.`
        }];
        updatedTrip.updatedAt = new Date().toISOString();
        await saveTripHistoryRecord(updatedTrip);
      }
    }

    // Case 3: Update existing trip record
    const tripId = (newVehicle as any).currentTripId || (oldVehicle as any)?.currentTripId;
    if (tripId) {
      // Fetch existing trip records
      const allTrips = await fetchAllTrips();
      const existingTrip = allTrips.find(t => t.tripId === tripId);
      
      if (existingTrip) {
        const updatedTrip = { ...existingTrip };
        updatedTrip.driver = newVehicle.driverName;
        updatedTrip.driverName = newVehicle.driverName;
        updatedTrip.driverMobile = newVehicle.mobileNumber;
        updatedTrip.supervisor = newVehicle.supervisorName;
        updatedTrip.supervisorName = newVehicle.supervisorName;
        updatedTrip.foremanName = newVehicle.foremanName;
        updatedTrip.party = newVehicle.partyName || '';
        updatedTrip.status = (newVehicle.tripStatus || 'Scheduled') as any;
        updatedTrip.updatedAt = new Date().toISOString();

        if (statusChanged) {
          let eventName = "Trip Updated";
          let remarks = `Trip status updated to ${newVehicle.tripStatus}.`;
          
          if (newVehicle.tripStatus === 'In Transit' || newVehicle.tripStatus === 'In Transit' as any) {
            eventName = "Trip Dispatched (In Transit)";
            remarks = `Vehicle in transit. Current Location: ${newVehicle.currentLocation}`;
          } else if (newVehicle.tripStatus === 'Reached Destination' || newVehicle.tripStatus === 'Reached Destination' as any) {
            eventName = "Reached Destination";
            remarks = `Arrived at destination: ${newVehicle.currentTripTo}.`;
          } else if (newVehicle.tripStatus === 'Completed') {
            eventName = "Trip Completed";
            remarks = `Trip finished successfully. Vehicle status released.`;
            updatedTrip.endDate = new Date().toISOString();
          }

          updatedTrip.timeline.push({
            eventName,
            date: today,
            time,
            user: currentUser,
            remarks
          });
        } else if (driverChanged || partyChanged) {
          updatedTrip.timeline.push({
            eventName: "Crew/Party Assignment Updated",
            date: today,
            time,
            user: currentUser,
            remarks: `Driver: ${newVehicle.driverName}, Party: ${newVehicle.partyName || 'N/A'}`
          });
        }

        await saveTripHistoryRecord(updatedTrip);
        return tripId;
      }
    }
  } catch (error) {
    console.error("Error auto syncing trip history:", error);
  }
  return null;
}
