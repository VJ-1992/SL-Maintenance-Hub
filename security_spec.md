# Security Specification: Trip History System

This document outlines the attribute-based access control (ABAC) security policies and data validation rules for the `tripHistory` collection in the Fleet Maintenance Hub.

## 1. Data Invariants

- **Ownership and Access**: Only authenticated users are allowed to read and create/update trip history records.
- **Immutability of Key Fields**: Once created, a trip history record's `tripId`, `vehicleNumber`, and `createdAt` cannot be modified.
- **Status Bounds**: The `status` field must strictly be one of `"Scheduled"`, `"Running"`, `"Completed"`, or `"Cancelled"`.
- **Relational Integrity**: Every trip history record must reference an existing vehicle registered in the system (verified via `exists()` check during creation).
- **Deletion Lock**: Under no circumstances can a trip history record be deleted by client-side requests.
- **Odometer Bounds**: The `currentOdometer` and `endingOdometer` must be non-negative numbers.

---

## 2. The "Dirty Dozen" Malicious Payloads

The following payloads attempt to breach the security bounds of the system and must be rejected with `PERMISSION_DENIED`.

1. **Unauthenticated Write**: Creating a trip record without any authenticated context.
2. **Identity Spoofing**: Attempting to set or change `supervisor` to a user different from the requesting operator's identified profile.
3. **Ghost Fields Injection**: Sending a valid trip record payload containing a shadow/unregistered field (`isSystemAdmin: true`).
4. **Invalid Status Transition**: Setting a status like `"On Hold"` or `"Lost"` which is outside the defined status enum.
5. **Negative Odometer Values**: Setting `currentOdometer` or `endingOdometer` to `-500`.
6. **Immutable Field Tampering**: Overwriting an existing trip's `createdAt` timestamp during an update.
7. **Client Timestamp Forgery**: Sending a custom client-side string for `createdAt` instead of `request.time`.
8. **Malicious ID Poisoning**: Specifying a 2KB junk string as the document ID `tripId`.
9. **Blanket Query Exploitation**: Fetching all trip records without verifying relational alignment.
10. **Unauthorized Deletion**: Issuing a delete request on any existing trip history record.
11. **Orphaned Trip Creation**: Creating a trip history record referencing a non-existent `vehicleNumber` (`exists(/vehicles/TRUCK-999) == false`).
12. **Recursive Evaluator Attack**: Sending an array with size 1,000 in the `timeline` field to cause recursive parsing exhaustion.

---

## 3. Test Cases (Verification Logic)

All actions must be tested to ensure compliance:
- **CREATE**: Must verify that `isValidId(tripId)`, `isValidTripHistory(incoming())`, and `exists(/vehicles/incoming().vehicleNumber)` evaluate to true.
- **UPDATE**: Must verify that `isValidTripHistory(incoming())` and `incoming().diff(existing()).affectedKeys().hasOnly(['status', 'endDate', 'endingOdometer', 'timeline', 'remarks', 'updatedAt'])` are true, and that immutable fields like `tripId` are left unaltered.
- **DELETE**: Always fails.
- **LIST**: Restricts read access to verified authenticated users.
