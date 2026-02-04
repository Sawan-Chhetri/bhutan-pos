/**
 * usePermissions Hook
 * Centralizes all permission logic based on user roles/types.
 * 
 * Usage:
 * const { canTrackStock, canManageInventory } = usePermissions(user);
 */

export const usePermissions = (user) => {
  if (!user) {
    return {
      canTrackStock: false,
      canPrintReceipts: false,
      isBasicUser: false,
      canSearchInventory: false,
      canViewShoppingList: false,
      canManageInventory: false,
      isPosUser: false,
      isRestaurantUser: false,
    };
  }

  const type = user.type;

  return {
    // Inventory & Stock
    canTrackStock: ["pos"].includes(type), // POS & Restaurants track stock levels
    canSearchInventory: ["pos",].includes(type), // POS & Restaurants search inventory in Purchase Ledger
    canViewShoppingList: type === "pos" || type === "admin",
    
    // Core Features
    canPrintReceipts: ["pos", "restaurants"].includes(type),
    canManageInventory: ["pos", "restaurants", "admin"].includes(type), // Add/Edit items
    
    // User Roles
    isPosUser: type === "pos",
    isRestaurantUser: type === "restaurants",
    isBasicUser: type === "other", // Only Invoice Builder
    isAdmin: type === "admin",
  };
};

export default usePermissions;
