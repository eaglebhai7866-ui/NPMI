# Measurement Point Deletion Fix

## Problem
The measurement tool had critical bugs when deleting points:
- Sometimes deleted the wrong point
- Points remained in results after deletion
- Distance labels showed with no points
- Stale indices caused by closure issues in event listeners

## Root Cause
The original implementation tried to re-attach event listeners by cloning DOM nodes, which created stale closures. When a point was deleted, the event listeners still referenced old indices.

## Solution
Implemented a **ref-based event delegation pattern**:

### Key Changes

1. **Global Event Delegation**
   - Added a single document-level click listener that handles all delete button clicks
   - Uses `event.target.closest()` to find delete buttons
   - Avoids creating multiple event listeners that can become stale

2. **Ref-Based Function Reference**
   - Created `removePointRef` to store the latest `removePoint` function
   - Global handler always calls the current version via the ref
   - Eliminates closure issues

3. **Simplified Marker Updates**
   - When a point is deleted, only update data attributes (no event listener re-attachment)
   - Marker numbers update correctly
   - Delete button indices stay in sync

### Code Structure

```typescript
// Ref to store current removePoint function
const removePointRef = useRef<((index: number) => void) | null>(null);

// Global click handler using event delegation
useEffect(() => {
  const handleDeleteClick = (e: MouseEvent) => {
    const deleteBtn = target.closest('button[data-point-index]');
    if (deleteBtn && removePointRef.current) {
      const index = parseInt(deleteBtn.getAttribute('data-point-index'));
      removePointRef.current(index);
    }
  };
  document.addEventListener('click', handleDeleteClick, true);
}, []);

// Update ref when removePoint changes
useEffect(() => {
  removePointRef.current = removePoint;
}, [removePoint]);
```

## Benefits
- ✅ Correct point deletion every time
- ✅ No stale closures or indices
- ✅ Proper cleanup of markers, labels, and visualizations
- ✅ Works for both distance lines and area polygons
- ✅ Works on both desktop and mobile views

## Testing
Test these scenarios:
1. Add 4-5 points, delete the first point
2. Add 4-5 points, delete the last point
3. Add 4-5 points, delete a middle point
4. Delete points from both map markers and segment list
5. Delete all points one by one
6. Verify segment labels disappear correctly
7. Test on both distance and area modes
