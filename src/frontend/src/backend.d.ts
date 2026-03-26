import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Cart = Array<CartItem>;
export interface CartItem {
    productId: bigint;
    quantity: bigint;
}
export interface Order {
    status: OrderStatus;
    total: bigint;
    orderId: bigint;
    timestamp: bigint;
    buyer: Principal;
    items: Array<CartItem>;
    buyerInfo: {
        name: string;
        email: string;
        address: string;
        phone: string;
    };
}
export interface UserProfile {
    name: string;
}
export interface Product {
    id: bigint;
    featured: boolean;
    name: string;
    description: string;
    stock: bigint;
    imageUrl: string;
    category: string;
    price: bigint;
}
export enum OrderStatus {
    shipped = "shipped",
    pending = "pending",
    delivered = "delivered",
    processing = "processing"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addProduct(product: Product): Promise<bigint>;
    addToCart(productId: bigint, quantity: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    claimFirstAdmin(): Promise<void>;
    clearCart(): Promise<void>;
    deleteProduct(productId: bigint): Promise<void>;
    getAllOrders(): Promise<Array<Order>>;
    getAllProducts(): Promise<Array<Product>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCart(): Promise<Cart>;
    getCategories(): Promise<Array<string>>;
    getFeaturedProducts(): Promise<Array<Product>>;
    getMyOrders(): Promise<Array<Order>>;
    getOrder(orderId: bigint): Promise<Order | null>;
    getProduct(productId: bigint): Promise<Product | null>;
    getProductsByCategory(category: string): Promise<Array<Product>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    initializeStore(): Promise<void>;
    isAdminAssigned(): Promise<boolean>;
    isCallerAdmin(): Promise<boolean>;
    placeOrder(buyerInfo: {
        name: string;
        email: string;
        address: string;
        phone: string;
    }): Promise<bigint>;
    removeFromCart(productId: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateCartItem(productId: bigint, quantity: bigint): Promise<void>;
    updateOrderStatus(orderId: bigint, status: OrderStatus): Promise<void>;
    updateProduct(productId: bigint, product: Product): Promise<void>;
}
