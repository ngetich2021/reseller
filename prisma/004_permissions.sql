-- AddColumn
ALTER TABLE "User" ADD COLUMN "permissions" TEXT NOT NULL DEFAULT '';
ALTER TABLE "AdminInvite" ADD COLUMN "permissions" TEXT NOT NULL DEFAULT '';
