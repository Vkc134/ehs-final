# Implementation Plan - Hybrid ICD-11 Caching

The goal is to cache ICD-11 codes locally when they are selected by the user. This improves performance and builds an offline-capable dictionary over time.

## Legal Note
**Caching is Safe:** Storing data locally for the purpose of improving application performance (caching) is a standard software practice and violates no terms, provided:
1.  You do not modify the code definitions (keep WHO's Code and Title).
2.  You do not sell the dumped database as a separate product.
3.  You attribute WHO where appropriate (already done by using their API).

## Proposed Changes

### Backend

#### [MODIFY] [ICD11Controller.cs](file:///Users/vajjalakalyan/Downloads/careconnect-hub-main/backend/CareConnect.API/Controllers/ICD11Controller.cs)
- **Modify `GET`**:
    - Search local `ICD11Codes` table first.
    - If results found, return them (or combine with API results).
    - If not found (or few results), call WHO API.
- **Add `POST`**:
    - Endpoint: `POST /api/icd11`
    - Body: `{ code, description }`
    - Action: Check if exists in `ICD11Codes`. If not, save it.

### Frontend

#### [MODIFY] [DiagnosisInput.jsx](file:///Users/vajjalakalyan/Downloads/careconnect-hub-main/src/pages/dashboard/DiagnosisInput.jsx)
- **On Select**:
    - When `handleSelect` is called:
    - Fire-and-forget request to `POST /api/icd11` with the selected code and description.
    - This silently "learns" the code for next time.

## Verification Plan
1.  **Search**: Search for "Dengue". (Comes from WHO).
2.  **Select**: Click "Dengue". (Triggers Save).
3.  **Verify DB**: Check `ICD11Codes` table. "Dengue" should be there.
4.  **Offline Test**: Disconnect internet (simulated). Search "Dengue". It should still appear (from Local DB).
