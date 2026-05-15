# Security Specification - Zenith Grill

## 1. Data Invariants
- **Global Config**: Single document at `settings/config`. Publicly readable. Admin only write.
- **Menu Items**: Collection `menu`. Publicly readable. Admin only write/delete.
- **Orders**: Collection `orders`. Public creation. Admin only read/update/delete.
- **Reviews**: Collection `reviews`. Public creation. Public read ONLY if `approved == true`. Admin has full access.
- **Messages**: Collection `messages`. Public creation. Admin only read/delete.

## 2. Global Helpers
- `isSignedIn()`: Basic check for authentication.
- `isAdmin()`: Check if `request.auth.token.email` matches the admin email in `settings/config` and is verified.
- `isValidId(id)`: Regex and size check for IDs.

## 3. The "Dirty Dozen" Payloads (Deny List)
1. **Config Spoofing**: User tries to update `settings/config` without admin auth.
2. **Menu Injection**: User tries to add a `MenuItem` with a 1MB description.
3. **Price Manipulation**: User tries to update a `MenuItem` price to $0.
4. **Order Scraping**: Non-admin tries to list the `orders` collection.
5. **Review Poisoning**: User tries to create a Review with `approved: true` already set.
6. **Self-Approval**: User tries to update their own review to `approved: true`.
7. **Message Reading**: Non-admin tries to read `messages`.
8. **Admin Privilege Escalation**: User tries to update `settings/config` to set `adminEmail` to their own.
9. **Orphaned Order**: Creating an order with invalid format.
10. **ID Poisoning**: Using a 2KB string as a document ID.
11. **PII Leak**: Non-admin reading a user's private info (if we had users, but here just orders/messages).
12. **Status Shortcutting**: User updating an order status from `pending` to `delivered`.

## 4. Test Cases
- `onCreate_Order_Success_Public`
- `onUpdate_Order_Fail_Public`
- `onList_Orders_Fail_Public`
- `onUpdate_Config_Fail_Public`
- `onCreate_Review_Success_Public_Unapproved`
- `onList_Reviews_Success_Filtered`
