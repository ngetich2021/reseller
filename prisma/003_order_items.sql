-- RedefineTable: drop Order.productId (replaced by OrderItem)
PRAGMA foreign_keys=OFF;

CREATE TABLE "new_Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "customer" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "deliveryMessage" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "paid" INTEGER NOT NULL DEFAULT 0,
    "tel" TEXT NOT NULL,
    "commMeans" TEXT NOT NULL DEFAULT 'SMS',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

INSERT INTO "new_Order" ("id", "customer", "location", "deliveryMessage", "status", "paid", "tel", "commMeans", "createdAt", "updatedAt")
SELECT "id", "customer", "location", "deliveryMessage", "status", "paid", "tel", "commMeans", "createdAt", "updatedAt" FROM "Order";

DROP TABLE "Order";
ALTER TABLE "new_Order" RENAME TO "Order";

PRAGMA foreign_keys=ON;

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "productId" TEXT,
    "name" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
