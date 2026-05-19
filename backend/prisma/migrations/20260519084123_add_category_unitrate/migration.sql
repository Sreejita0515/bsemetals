-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Category" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "copperContentPct" REAL NOT NULL,
    "makingChargePerKg" REAL NOT NULL,
    "marginPct" REAL NOT NULL,
    "unitRate" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Category" ("copperContentPct", "createdAt", "id", "makingChargePerKg", "marginPct", "name", "updatedAt") SELECT "copperContentPct", "createdAt", "id", "makingChargePerKg", "marginPct", "name", "updatedAt" FROM "Category";
DROP TABLE "Category";
ALTER TABLE "new_Category" RENAME TO "Category";
CREATE TABLE "new_QuoteRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "customerUid" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "QuoteRequest_customerUid_fkey" FOREIGN KEY ("customerUid") REFERENCES "UserProfile" ("uid") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_QuoteRequest" ("company", "createdAt", "customerName", "customerUid", "email", "id", "phone", "status", "updatedAt") SELECT "company", "createdAt", "customerName", "customerUid", "email", "id", "phone", "status", "updatedAt" FROM "QuoteRequest";
DROP TABLE "QuoteRequest";
ALTER TABLE "new_QuoteRequest" RENAME TO "QuoteRequest";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
