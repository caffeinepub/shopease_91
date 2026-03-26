import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Cart, Order, OrderStatus, Product } from "../backend.d";
import { useActor } from "./useActor";

export function useInitializeStore() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["storeInitialized"],
    queryFn: async () => {
      if (!actor) return false;
      await actor.initializeStore();
      return true;
    },
    enabled: !!actor && !isFetching,
    staleTime: Number.POSITIVE_INFINITY,
    retry: 1,
  });
}

export function useGetAllProducts() {
  const { actor, isFetching } = useActor();
  return useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllProducts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetFeaturedProducts() {
  const { actor, isFetching } = useActor();
  return useQuery<Product[]>({
    queryKey: ["featuredProducts"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getFeaturedProducts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetProduct(productId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Product | null>({
    queryKey: ["product", productId?.toString()],
    queryFn: async () => {
      if (!actor || productId === null) return null;
      return actor.getProduct(productId);
    },
    enabled: !!actor && !isFetching && productId !== null,
  });
}

export function useGetCategories() {
  const { actor, isFetching } = useActor();
  return useQuery<string[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCategories();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetCart() {
  const { actor, isFetching } = useActor();
  return useQuery<Cart>({
    queryKey: ["cart"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCart();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddToCart() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      productId,
      quantity,
    }: { productId: bigint; quantity: bigint }) => {
      if (!actor) throw new Error("Not connected");
      await actor.addToCart(productId, quantity);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["cart"] });
    },
  });
}

export function useUpdateCartItem() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      productId,
      quantity,
    }: { productId: bigint; quantity: bigint }) => {
      if (!actor) throw new Error("Not connected");
      await actor.updateCartItem(productId, quantity);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["cart"] });
    },
  });
}

export function useRemoveFromCart() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (productId: bigint) => {
      if (!actor) throw new Error("Not connected");
      await actor.removeFromCart(productId);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["cart"] });
    },
  });
}

export function useClearCart() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      await actor.clearCart();
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["cart"] });
    },
  });
}

export function usePlaceOrder() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (buyerInfo: {
      name: string;
      email: string;
      address: string;
      phone: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.placeOrder(buyerInfo);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["cart"] });
      void qc.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

export function useGetMyOrders() {
  const { actor, isFetching } = useActor();
  return useQuery<Order[]>({
    queryKey: ["myOrders"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyOrders();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllOrders() {
  const { actor, isFetching } = useActor();
  return useQuery<Order[]>({
    queryKey: ["allOrders"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllOrders();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsAdminAssigned() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["adminAssigned"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isAdminAssigned();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useClaimFirstAdmin() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      await actor.claimFirstAdmin();
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["isAdmin"] });
      void qc.invalidateQueries({ queryKey: ["adminAssigned"] });
    },
  });
}

export function useResetAdminAccess() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      await (actor as any).resetAdminAccess();
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["isAdmin"] });
      void qc.invalidateQueries({ queryKey: ["adminAssigned"] });
    },
  });
}

export function useAddProduct() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (product: Product) => {
      if (!actor) throw new Error("Not connected");
      return actor.addProduct(product);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["products"] });
      void qc.invalidateQueries({ queryKey: ["featuredProducts"] });
      void qc.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

export function useUpdateProduct() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      productId,
      product,
    }: { productId: bigint; product: Product }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateProduct(productId, product);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["products"] });
      void qc.invalidateQueries({ queryKey: ["featuredProducts"] });
    },
  });
}

export function useDeleteProduct() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (productId: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteProduct(productId);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["products"] });
      void qc.invalidateQueries({ queryKey: ["featuredProducts"] });
    },
  });
}

export function useUpdateOrderStatus() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      orderId,
      status,
    }: { orderId: bigint; status: OrderStatus }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateOrderStatus(orderId, status);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["allOrders"] });
    },
  });
}
