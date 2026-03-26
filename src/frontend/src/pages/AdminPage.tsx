import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Edit2,
  Loader2,
  Plus,
  ShieldAlert,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { OrderStatus, Product } from "../backend.d";
import { OrderStatus as OS } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAddProduct,
  useClaimFirstAdmin,
  useDeleteProduct,
  useGetAllOrders,
  useGetAllProducts,
  useIsAdminAssigned,
  useIsCallerAdmin,
  useResetAdminAccess,
  useUpdateOrderStatus,
  useUpdateProduct,
} from "../hooks/useQueries";

const EMPTY_PRODUCT: Omit<Product, "id"> = {
  name: "",
  description: "",
  price: BigInt(0),
  imageUrl: "",
  category: "",
  stock: BigInt(0),
  featured: false,
};

type ProductFormState = {
  name: string;
  description: string;
  price: string;
  imageUrl: string;
  category: string;
  stock: string;
  featured: boolean;
};

const TABLE_SKELETON_KEYS = ["ts1", "ts2", "ts3", "ts4", "ts5"];

const toFormState = (p: Omit<Product, "id">): ProductFormState => ({
  name: p.name,
  description: p.description,
  price: Number(p.price).toString(),
  imageUrl: p.imageUrl,
  category: p.category,
  stock: Number(p.stock).toString(),
  featured: p.featured,
});

export default function AdminPage() {
  const { identity, login, isLoggingIn } = useInternetIdentity();
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();
  const { data: adminAssigned, isLoading: adminAssignedLoading } =
    useIsAdminAssigned();
  const claimFirstAdmin = useClaimFirstAdmin();
  const resetAdminAccess = useResetAdminAccess();

  const { data: products, isLoading: productsLoading } = useGetAllProducts();
  const { data: orders, isLoading: ordersLoading } = useGetAllOrders();

  const addProduct = useAddProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const updateStatus = useUpdateOrderStatus();

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<bigint | null>(null);
  const [productForm, setProductForm] = useState<ProductFormState>(
    toFormState(EMPTY_PRODUCT),
  );

  const openAddDialog = () => {
    setProductForm(toFormState(EMPTY_PRODUCT));
    setEditingProduct(null);
    setShowAddDialog(true);
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setProductForm(toFormState(product));
    setShowAddDialog(true);
  };

  const handleFormChange = (
    field: keyof ProductFormState,
    value: string | boolean,
  ) => {
    setProductForm((prev) => ({ ...prev, [field]: value }));
  };

  const buildProduct = (id: bigint): Product => ({
    id,
    name: productForm.name,
    description: productForm.description,
    price: BigInt(Math.round(Number.parseFloat(productForm.price) || 0)),
    imageUrl: productForm.imageUrl,
    category: productForm.category,
    stock: BigInt(Number.parseInt(productForm.stock) || 0),
    featured: productForm.featured,
  });

  const handleSaveProduct = () => {
    if (!productForm.name.trim() || !productForm.price) {
      toast.error("Name and price are required");
      return;
    }
    if (editingProduct) {
      const updated = buildProduct(editingProduct.id);
      updateProduct.mutate(
        { productId: editingProduct.id, product: updated },
        {
          onSuccess: () => {
            toast.success("Product updated");
            setShowAddDialog(false);
          },
          onError: () => toast.error("Failed to update product"),
        },
      );
    } else {
      const newProduct = buildProduct(BigInt(0));
      addProduct.mutate(newProduct, {
        onSuccess: () => {
          toast.success("Product added");
          setShowAddDialog(false);
        },
        onError: () => toast.error("Failed to add product"),
      });
    }
  };

  const handleDeleteProduct = (id: bigint) => {
    deleteProduct.mutate(id, {
      onSuccess: () => {
        toast.success("Product deleted");
        setDeleteConfirm(null);
      },
      onError: () => toast.error("Failed to delete product"),
    });
  };

  const handleStatusChange = (orderId: bigint, status: OrderStatus) => {
    updateStatus.mutate(
      { orderId, status },
      {
        onSuccess: () => toast.success("Order status updated"),
        onError: () => toast.error("Failed to update status"),
      },
    );
  };

  const handleClaimAdmin = () => {
    claimFirstAdmin.mutate(undefined, {
      onSuccess: () => toast.success("You are now the admin!"),
      onError: () => toast.error("Failed to claim admin access"),
    });
  };

  const handleResetAndClaim = () => {
    resetAdminAccess.mutate(undefined, {
      onSuccess: () => {
        claimFirstAdmin.mutate(undefined, {
          onSuccess: () => toast.success("Admin access granted!"),
          onError: () => toast.error("Failed to claim admin after reset"),
        });
      },
      onError: () => toast.error("Failed to reset admin access"),
    });
  };

  const isResettingAndClaiming =
    resetAdminAccess.isPending || claimFirstAdmin.isPending;

  if (!identity) {
    return (
      <main className="container mx-auto px-4 py-20 text-center">
        <ShieldAlert className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h1 className="font-display text-2xl font-bold mb-2">Login Required</h1>
        <p className="text-muted-foreground mb-6">
          You must be logged in to access the admin panel.
        </p>
        <Button
          onClick={login}
          disabled={isLoggingIn}
          className="bg-orange hover:bg-orange-dark text-white border-0"
          data-ocid="admin.primary_button"
        >
          {isLoggingIn ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in...
            </>
          ) : (
            "Login"
          )}
        </Button>
      </main>
    );
  }

  if (adminLoading || adminAssignedLoading) {
    return (
      <main
        className="container mx-auto px-4 py-12"
        data-ocid="admin.loading_state"
      >
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-64 w-full" />
      </main>
    );
  }

  if (!isAdmin) {
    if (adminAssigned === false) {
      return (
        <main
          className="container mx-auto px-4 py-20 text-center"
          data-ocid="admin.panel"
        >
          <ShieldCheck className="w-16 h-16 text-orange mx-auto mb-4" />
          <h1 className="font-display text-2xl font-bold mb-2">
            Become the Admin
          </h1>
          <p className="text-muted-foreground mb-6">
            No admin has been set up yet. As the first user, you can claim admin
            access.
          </p>
          <Button
            onClick={handleClaimAdmin}
            disabled={claimFirstAdmin.isPending}
            className="bg-orange hover:bg-orange-dark text-white border-0"
            data-ocid="admin.primary_button"
          >
            {claimFirstAdmin.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Claiming...
              </>
            ) : (
              "Claim Admin Access"
            )}
          </Button>
        </main>
      );
    }

    return (
      <main
        className="container mx-auto px-4 py-20 text-center"
        data-ocid="admin.error_state"
      >
        <ShieldAlert className="w-16 h-16 text-destructive mx-auto mb-4" />
        <h1 className="font-display text-2xl font-bold mb-2">Access Denied</h1>
        <p className="text-muted-foreground mb-6">
          Your current account doesn't have admin access.
        </p>

        <div className="mt-8 max-w-sm mx-auto bg-card border border-border rounded-xl p-6 text-left shadow-sm">
          <h2 className="font-semibold text-base mb-1">
            Are you the store owner?
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            If you created this store, you can reset and reclaim admin access
            with the button below.
          </p>
          <Button
            onClick={handleResetAndClaim}
            disabled={isResettingAndClaiming}
            className="w-full bg-orange hover:bg-orange-dark text-white border-0"
            data-ocid="admin.primary_button"
          >
            {isResettingAndClaiming ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Reset & Claim Admin"
            )}
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">
            Admin Panel
          </h1>
          <p className="text-muted-foreground mt-1">Manage your store</p>
        </div>
      </div>

      <Tabs defaultValue="products" data-ocid="admin.tab">
        <TabsList className="mb-6">
          <TabsTrigger value="products" data-ocid="admin.tab">
            Products
          </TabsTrigger>
          <TabsTrigger value="orders" data-ocid="admin.tab">
            Orders
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products">
          <div className="flex justify-end mb-4">
            <Button
              onClick={openAddDialog}
              className="bg-orange hover:bg-orange-dark text-white border-0"
              data-ocid="admin.open_modal_button"
            >
              <Plus className="mr-2 w-4 h-4" /> Add Product
            </Button>
          </div>

          {productsLoading ? (
            <div className="space-y-2" data-ocid="admin.loading_state">
              {TABLE_SKELETON_KEYS.map((key) => (
                <Skeleton key={key} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <div className="bg-card rounded-lg shadow-card overflow-hidden">
              <Table data-ocid="admin.table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Featured</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products && products.length > 0 ? (
                    products.map((product, i) => (
                      <TableRow
                        key={product.id.toString()}
                        data-ocid={`admin.item.${i + 1}`}
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <img
                              src={
                                product.imageUrl ||
                                `https://picsum.photos/seed/${product.id}/60/45`
                              }
                              alt={product.name}
                              className="w-12 h-9 object-cover rounded bg-secondary"
                            />
                            <span className="font-medium truncate max-w-[200px]">
                              {product.name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{product.category}</Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          ${Number(product.price).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              Number(product.stock) > 0
                                ? "default"
                                : "destructive"
                            }
                            className={
                              Number(product.stock) > 0
                                ? "bg-green-100 text-green-700 border-0"
                                : ""
                            }
                          >
                            {Number(product.stock) > 0
                              ? `${Number(product.stock)} in stock`
                              : "Out of stock"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {product.featured ? (
                            <Badge className="bg-orange/10 text-orange border-0">
                              Featured
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">
                              —
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditDialog(product)}
                              className="h-8 w-8"
                              data-ocid={`admin.edit_button.${i + 1}`}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteConfirm(product.id)}
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              data-ocid={`admin.delete_button.${i + 1}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-8 text-muted-foreground"
                        data-ocid="admin.empty_state"
                      >
                        No products yet. Add your first product!
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="orders">
          {ordersLoading ? (
            <div className="space-y-2" data-ocid="admin.loading_state">
              {TABLE_SKELETON_KEYS.map((key) => (
                <Skeleton key={key} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <div className="bg-card rounded-lg shadow-card overflow-hidden">
              <Table data-ocid="admin.table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders && orders.length > 0 ? (
                    orders.map((order, i) => (
                      <TableRow
                        key={order.orderId.toString()}
                        data-ocid={`admin.item.${i + 1}`}
                      >
                        <TableCell className="font-mono text-sm">
                          #{order.orderId.toString()}
                        </TableCell>
                        <TableCell>{order.items.length} item(s)</TableCell>
                        <TableCell className="font-medium">
                          ${Number(order.total).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-sm">
                              {order.buyerInfo.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {order.buyerInfo.email}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              {
                                [OS.pending]:
                                  "bg-yellow-100 text-yellow-700 border-0",
                                [OS.processing]:
                                  "bg-blue-100 text-blue-700 border-0",
                                [OS.shipped]:
                                  "bg-purple-100 text-purple-700 border-0",
                                [OS.delivered]:
                                  "bg-green-100 text-green-700 border-0",
                              }[order.status] ?? ""
                            }
                          >
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={order.status}
                            onValueChange={(v) =>
                              handleStatusChange(
                                order.orderId,
                                v as OrderStatus,
                              )
                            }
                          >
                            <SelectTrigger
                              className="w-32 h-8"
                              data-ocid="admin.select"
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={OS.pending}>
                                Pending
                              </SelectItem>
                              <SelectItem value={OS.processing}>
                                Processing
                              </SelectItem>
                              <SelectItem value={OS.shipped}>
                                Shipped
                              </SelectItem>
                              <SelectItem value={OS.delivered}>
                                Delivered
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-8 text-muted-foreground"
                        data-ocid="admin.empty_state"
                      >
                        No orders yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-lg" data-ocid="admin.dialog">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? "Edit Product" : "Add New Product"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1.5">
                <Label>Name</Label>
                <Input
                  value={productForm.name}
                  onChange={(e) => handleFormChange("name", e.target.value)}
                  placeholder="Product name"
                  data-ocid="admin.input"
                />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label>Description</Label>
                <Textarea
                  value={productForm.description}
                  onChange={(e) =>
                    handleFormChange("description", e.target.value)
                  }
                  placeholder="Product description"
                  rows={3}
                  data-ocid="admin.textarea"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Price ($)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={productForm.price}
                  onChange={(e) => handleFormChange("price", e.target.value)}
                  placeholder="29.99"
                  data-ocid="admin.input"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Stock</Label>
                <Input
                  type="number"
                  min="0"
                  value={productForm.stock}
                  onChange={(e) => handleFormChange("stock", e.target.value)}
                  placeholder="100"
                  data-ocid="admin.input"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Input
                  value={productForm.category}
                  onChange={(e) => handleFormChange("category", e.target.value)}
                  placeholder="Electronics"
                  data-ocid="admin.input"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Image URL</Label>
                <Input
                  value={productForm.imageUrl}
                  onChange={(e) => handleFormChange("imageUrl", e.target.value)}
                  placeholder="https://..."
                  data-ocid="admin.input"
                />
              </div>
              <div className="col-span-2 flex items-center gap-3">
                <Switch
                  checked={productForm.featured}
                  onCheckedChange={(checked) =>
                    handleFormChange("featured", checked)
                  }
                  data-ocid="admin.switch"
                />
                <Label>Featured product</Label>
              </div>
            </div>
          </div>
          <Separator />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAddDialog(false)}
              data-ocid="admin.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveProduct}
              disabled={addProduct.isPending || updateProduct.isPending}
              className="bg-orange hover:bg-orange-dark text-white border-0"
              data-ocid="admin.save_button"
            >
              {addProduct.isPending || updateProduct.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                </>
              ) : editingProduct ? (
                "Update Product"
              ) : (
                "Add Product"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={deleteConfirm !== null}
        onOpenChange={(open) => !open && setDeleteConfirm(null)}
      >
        <DialogContent data-ocid="admin.dialog">
          <DialogHeader>
            <DialogTitle>Delete Product?</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">This action cannot be undone.</p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteConfirm(null)}
              data-ocid="admin.cancel_button"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                deleteConfirm !== null && handleDeleteProduct(deleteConfirm)
              }
              disabled={deleteProduct.isPending}
              data-ocid="admin.confirm_button"
            >
              {deleteProduct.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
