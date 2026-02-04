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
    canTrackStock: ["pos"].includes(type), // POS & Hotels track stock levels
    canSearchInventory: ["pos", "restaurants"].includes(type), // POS & Restaurants & Hotels
    canViewShoppingList: ["pos", "admin"].includes(type),
    
    // Core Features
    canPrintReceipts: ["pos", "restaurants", "hotel"].includes(type),
    canManageInventory: ["pos", "restaurants", "admin", "hotel"].includes(type), // Add/Edit items
    
    // User Roles
    isPosUser: type === "pos",
    isRestaurantUser: type === "restaurants",
    isHotelUser: type === "hotel",
    isDualModeUser: type === "hotel", // Hotels have Room vs Restaurant toggle
    isBasicUser: type === "other", // Only Invoice Builder
    isAdmin: type === "admin",
  };
};

export default usePermissions;
