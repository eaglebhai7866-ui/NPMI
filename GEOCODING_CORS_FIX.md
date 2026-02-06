ent backend rate limiting
3. **Alternative Services:** Add fallback to other geocoding APIs
4. **Local Geocoding:** Extract place names from Pakistan PBF file for offline search

## Testing

1. Start backend: `cd backend && npm run dev`
2. Start frontend: `npm run dev`
3. Open browser: `http://localhost:8081`
4. Search for "Shifa International" - should work without CORS errors
5. Check backend logs for geocoding requests

## Files Modified

- ✅ `backend/src/routes/geocoding.ts` - New geocoding proxy route
- ✅ `backend/src/index.ts` - Added geocoding routes
- ✅ `src/components/map/SearchBar.tsx` - Updated to use backend proxy
- ✅ `src/components/map/MobileSearchBar.tsx` - Updated to use backend proxy

## Notes

- Nominatim has usage limits (1 request/second for free tier)
- Always include a User-Agent header (handled by backend)
- Consider self-hosting Nominatim for production use
- Backend proxy adds ~10-50ms latency (negligible)
