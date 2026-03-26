import Map "mo:core/Map";
import Array "mo:core/Array";
import List "mo:core/List";
import Iter "mo:core/Iter";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Runtime "mo:core/Runtime";
import Order "mo:core/Order";
import Set "mo:core/Set";
import Principal "mo:core/Principal";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  // Types
  public type Product = {
    id : Nat;
    name : Text;
    description : Text;
    price : Nat;
    imageUrl : Text;
    category : Text;
    stock : Nat;
    featured : Bool;
  };

  public type CartItem = {
    productId : Nat;
    quantity : Nat;
  };

  public type Cart = [CartItem];

  public type OrderStatus = {
    #pending;
    #processing;
    #shipped;
    #delivered;
  };

  public type Order = {
    orderId : Nat;
    buyer : Principal;
    buyerInfo : {
      name : Text;
      email : Text;
      phone : Text;
      address : Text;
    };
    items : [CartItem];
    total : Nat;
    status : OrderStatus;
    timestamp : Int;
  };

  public type UserProfile = {
    name : Text;
  };

  module Product {
    public func compare(p1 : Product, p2 : Product) : Order.Order {
      Nat.compare(p1.id, p2.id);
    };
  };

  // State
  let products = Map.empty<Nat, Product>();
  let carts = Map.empty<Principal, Cart>();
  let orders = Map.empty<Nat, Order>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  var nextProductId = 1;
  var nextOrderId = 1;

  // Access Control
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Allow any authenticated user to claim admin if no admin is assigned yet.
  public shared ({ caller }) func claimFirstAdmin() : async () {
    if (caller.isAnonymous()) {
      Runtime.trap("Anonymous users cannot claim admin");
    };
    if (accessControlState.adminAssigned) {
      Runtime.trap("Admin already assigned. Use Reset & Claim Admin to take over.");
    };
    accessControlState.userRoles.add(caller, #admin);
    accessControlState.adminAssigned := true;
  };

  // Force reset admin — clears the current admin so the next caller of claimFirstAdmin can become admin.
  // Intentionally open so the store owner can recover access if locked out.
  public shared ({ caller }) func resetAdminAccess() : async () {
    if (caller.isAnonymous()) {
      Runtime.trap("Anonymous users cannot reset admin");
    };
    // Collect admin principals first to avoid mutating while iterating
    let admins = accessControlState.userRoles.entries()
      .filter(func((_, role)) { role == #admin })
      .map(func((p, _)) { p })
      .toArray();
    for (p in admins.values()) {
      accessControlState.userRoles.remove(p);
    };
    accessControlState.adminAssigned := false;
  };

  // Check if any admin has been assigned
  public query func isAdminAssigned() : async Bool {
    accessControlState.adminAssigned;
  };

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    userProfiles.get(caller);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    userProfiles.add(caller, profile);
  };

  // Product Management (Admin Only)
  public shared ({ caller }) func addProduct(product : Product) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add products");
    };

    let productId = nextProductId;
    nextProductId += 1;

    let newProduct : Product = {
      product with
      id = productId;
    };
    products.add(productId, newProduct);
    productId;
  };

  public query func getAllProducts() : async [Product] {
    products.values().toArray();
  };

  public query func getProduct(productId : Nat) : async ?Product {
    products.get(productId);
  };

  public shared ({ caller }) func updateProduct(productId : Nat, product : Product) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update products");
    };

    if (not products.containsKey(productId)) {
      Runtime.trap("Product not found");
    };
    let newProduct : Product = {
      product with
      id = productId;
    };
    products.add(productId, newProduct);
  };

  public shared ({ caller }) func deleteProduct(productId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete products");
    };

    products.remove(productId);
  };

  // Cart Management
  public shared ({ caller }) func addToCart(productId : Nat, quantity : Nat) : async () {
    if (caller.isAnonymous()) {
      Runtime.trap("Please log in to manage your cart");
    };

    if (quantity == 0) {
      Runtime.trap("Quantity must be greater than 0");
    };

    let currentCart = switch (carts.get(caller)) {
      case (null) { [] };
      case (?items) { items };
    };

    let product = switch (products.get(productId)) {
      case (null) { Runtime.trap("Product not found") };
      case (?p) { p };
    };

    if (quantity > product.stock) {
      Runtime.trap("Not enough stock available");
    };

    let existingItem = currentCart.find(func(item) { item.productId == productId });

    let newCart = switch (existingItem) {
      case (null) {
        currentCart.concat([{
          productId;
          quantity;
        }]);
      };
      case (?_item) {
        currentCart.map(
          func(item) {
            if (item.productId == productId) {
              {
                productId = item.productId;
                quantity = item.quantity + quantity;
              };
            } else { item };
          }
        );
      };
    };
    carts.add(caller, newCart);
  };

  public shared ({ caller }) func removeFromCart(productId : Nat) : async () {
    if (caller.isAnonymous()) {
      Runtime.trap("Please log in to manage your cart");
    };

    let currentCart = switch (carts.get(caller)) {
      case (null) { [] };
      case (?items) { items };
    };

    let newCart = currentCart.filter(func(item) { item.productId != productId });
    carts.add(caller, newCart);
  };

  public shared ({ caller }) func updateCartItem(productId : Nat, quantity : Nat) : async () {
    if (caller.isAnonymous()) {
      Runtime.trap("Please log in to manage your cart");
    };

    if (quantity == 0) {
      Runtime.trap("Quantity must be greater than 0");
    };

    let currentCart = switch (carts.get(caller)) {
      case (null) { [] };
      case (?items) { items };
    };

    let newCart = currentCart.map(func(item) { if (item.productId == productId) { { productId = item.productId; quantity } } else { item } });
    carts.add(caller, newCart);
  };

  public query ({ caller }) func getCart() : async Cart {
    if (caller.isAnonymous()) {
      return [];
    };

    switch (carts.get(caller)) {
      case (null) { [] };
      case (?items) { items };
    };
  };

  public shared ({ caller }) func clearCart() : async () {
    if (caller.isAnonymous()) {
      Runtime.trap("Please log in to manage your cart");
    };

    carts.remove(caller);
  };

  // Order Management

  func validateAndCalculateTotal(cart : Cart) : Nat {
    var total = 0;
    for (item in cart.values()) {
      let product = switch (products.get(item.productId)) {
        case (null) { Runtime.trap("Product not found") };
        case (?p) { p };
      };

      if (item.quantity > product.stock) {
        Runtime.trap("Not enough stock available for product: " # product.name);
      };

      total += product.price * item.quantity;
    };
    total;
  };

  func updateStock(cart : Cart) {
    for (item in cart.values()) {
      let product = switch (products.get(item.productId)) {
        case (null) { Runtime.trap("Product not found") };
        case (?p) { p };
      };

      let newProduct : Product = {
        product with
        stock = product.stock - item.quantity
      };
      products.add(item.productId, newProduct);
    };
  };

  public shared ({ caller }) func placeOrder(buyerInfo : {
    name : Text;
    email : Text;
    phone : Text;
    address : Text;
  }) : async Nat {
    if (caller.isAnonymous()) {
      Runtime.trap("Please log in to place an order");
    };

    let cart = switch (carts.get(caller)) {
      case (null) { Runtime.trap("Cart is empty") };
      case (?items) { items };
    };

    let total = validateAndCalculateTotal(cart);
    updateStock(cart);

    let orderId = nextOrderId;
    nextOrderId += 1;

    let newOrder : Order = {
      orderId;
      buyer = caller;
      buyerInfo;
      items = cart;
      total;
      status = #pending;
      timestamp = Time.now();
    };

    orders.add(orderId, newOrder);
    carts.remove(caller);

    orderId;
  };

  public query ({ caller }) func getOrder(orderId : Nat) : async ?Order {
    if (caller.isAnonymous()) {
      return null;
    };

    switch (orders.get(orderId)) {
      case (null) { null };
      case (?o) {
        if (o.buyer == caller or AccessControl.isAdmin(accessControlState, caller)) {
          ?o;
        } else {
          null;
        };
      };
    };
  };

  public query ({ caller }) func getMyOrders() : async [Order] {
    if (caller.isAnonymous()) {
      return [];
    };
    orders.values().toArray().filter(func(order) { order.buyer == caller });
  };

  public shared ({ caller }) func updateOrderStatus(orderId : Nat, status : OrderStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update order status");
    };

    let order = switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?o) { o };
    };

    let updatedOrder : Order = {
      order with
      status;
    };
    orders.add(orderId, updatedOrder);
  };

  public query ({ caller }) func getAllOrders() : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all orders");
    };
    orders.values().toArray();
  };

  // Categories (Public)
  public query func getCategories() : async [Text] {
    let categories = Set.empty<Text>();
    for (p in products.values()) {
      categories.add(p.category);
    };
    categories.toArray();
  };

  public query func getProductsByCategory(category : Text) : async [Product] {
    products.values().toArray().filter(func(p) { p.category == category });
  };

  public query func getFeaturedProducts() : async [Product] {
    products.values().toArray().filter(func(p) { p.featured });
  };

  // Initialization - Seed Sample Products
  public shared ({ caller }) func initializeStore() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can initialize the store");
    };

    if (products.size() > 0) {
      Runtime.trap("Store already initialized");
    };

    let sampleProducts : [Product] = [
      {
        id = 1;
        name = "Smartphone";
        description = "Latest model with amazing features";
        price = 79900;
        imageUrl = "https://picsum.photos/seed/smartphone/400/300";
        category = "Electronics";
        stock = 50;
        featured = true;
      },
      {
        id = 2;
        name = "Jeans";
        description = "Comfortable and stylish jeans";
        price = 4900;
        imageUrl = "https://picsum.photos/seed/jeans/400/300";
        category = "Clothing";
        stock = 100;
        featured = false;
      },
      {
        id = 3;
        name = "Coffee Maker";
        description = "Brew delicious coffee at home";
        price = 12900;
        imageUrl = "https://picsum.photos/seed/coffeemaker/400/300";
        category = "Home & Garden";
        stock = 30;
        featured = true;
      },
      {
        id = 4;
        name = "Running Shoes";
        description = "Lightweight and durable running shoes";
        price = 9900;
        imageUrl = "https://picsum.photos/seed/shoes/400/300";
        category = "Sports";
        stock = 75;
        featured = false;
      },
      {
        id = 5;
        name = "Laptop";
        description = "High-performance laptop for work and play";
        price = 129900;
        imageUrl = "https://picsum.photos/seed/laptop/400/300";
        category = "Electronics";
        stock = 25;
        featured = true;
      },
    ];

    for (product in sampleProducts.values()) {
      products.add(product.id, product);
    };

    nextProductId := 6;
  };
};
