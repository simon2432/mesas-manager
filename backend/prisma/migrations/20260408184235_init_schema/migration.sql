/*
  Warnings:

  - You are about to drop the column `password` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `User` table. All the data in the column will be lost.
  - Added the required column `passwordHash` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[User] DROP COLUMN [password],
[role];
ALTER TABLE [dbo].[User] ADD [passwordHash] NVARCHAR(1000) NOT NULL,
[updatedAt] DATETIME2 NOT NULL;

-- CreateTable
CREATE TABLE [dbo].[Waiter] (
    [id] INT NOT NULL IDENTITY(1,1),
    [name] NVARCHAR(1000) NOT NULL,
    [isActive] BIT NOT NULL CONSTRAINT [Waiter_isActive_df] DEFAULT 1,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Waiter_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Waiter_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[RestaurantTable] (
    [id] INT NOT NULL IDENTITY(1,1),
    [number] INT NOT NULL,
    [capacity] INT NOT NULL,
    [status] NVARCHAR(1000) NOT NULL CONSTRAINT [RestaurantTable_status_df] DEFAULT 'FREE',
    [isActive] BIT NOT NULL CONSTRAINT [RestaurantTable_isActive_df] DEFAULT 1,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [RestaurantTable_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [RestaurantTable_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [RestaurantTable_number_key] UNIQUE NONCLUSTERED ([number])
);

-- CreateTable
CREATE TABLE [dbo].[Layout] (
    [id] INT NOT NULL IDENTITY(1,1),
    [name] NVARCHAR(1000) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Layout_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Layout_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Layout_name_key] UNIQUE NONCLUSTERED ([name])
);

-- CreateTable
CREATE TABLE [dbo].[LayoutTable] (
    [id] INT NOT NULL IDENTITY(1,1),
    [layoutId] INT NOT NULL,
    [tableId] INT NOT NULL,
    CONSTRAINT [LayoutTable_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [LayoutTable_layoutId_tableId_key] UNIQUE NONCLUSTERED ([layoutId],[tableId])
);

-- CreateTable
CREATE TABLE [dbo].[MenuItem] (
    [id] INT NOT NULL IDENTITY(1,1),
    [name] NVARCHAR(1000) NOT NULL,
    [description] NVARCHAR(1000),
    [price] DECIMAL(10,2) NOT NULL,
    [isActive] BIT NOT NULL CONSTRAINT [MenuItem_isActive_df] DEFAULT 1,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [MenuItem_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [MenuItem_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [MenuItem_name_key] UNIQUE NONCLUSTERED ([name])
);

-- CreateTable
CREATE TABLE [dbo].[TableSession] (
    [id] INT NOT NULL IDENTITY(1,1),
    [tableId] INT NOT NULL,
    [waiterId] INT NOT NULL,
    [guestCount] INT NOT NULL,
    [openedAt] DATETIME2 NOT NULL CONSTRAINT [TableSession_openedAt_df] DEFAULT CURRENT_TIMESTAMP,
    [closedAt] DATETIME2,
    [status] NVARCHAR(1000) NOT NULL CONSTRAINT [TableSession_status_df] DEFAULT 'OPEN',
    [total] DECIMAL(10,2) NOT NULL CONSTRAINT [TableSession_total_df] DEFAULT 0,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [TableSession_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [TableSession_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[SessionItem] (
    [id] INT NOT NULL IDENTITY(1,1),
    [tableSessionId] INT NOT NULL,
    [menuItemId] INT NOT NULL,
    [quantity] INT NOT NULL,
    [unitPrice] DECIMAL(10,2) NOT NULL,
    [productName] NVARCHAR(1000) NOT NULL,
    [note] NVARCHAR(1000),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [SessionItem_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [SessionItem_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [SessionItem_tableSessionId_idx] ON [dbo].[SessionItem]([tableSessionId]);

-- AddForeignKey
ALTER TABLE [dbo].[LayoutTable] ADD CONSTRAINT [LayoutTable_layoutId_fkey] FOREIGN KEY ([layoutId]) REFERENCES [dbo].[Layout]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[LayoutTable] ADD CONSTRAINT [LayoutTable_tableId_fkey] FOREIGN KEY ([tableId]) REFERENCES [dbo].[RestaurantTable]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[TableSession] ADD CONSTRAINT [TableSession_tableId_fkey] FOREIGN KEY ([tableId]) REFERENCES [dbo].[RestaurantTable]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[TableSession] ADD CONSTRAINT [TableSession_waiterId_fkey] FOREIGN KEY ([waiterId]) REFERENCES [dbo].[Waiter]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[SessionItem] ADD CONSTRAINT [SessionItem_tableSessionId_fkey] FOREIGN KEY ([tableSessionId]) REFERENCES [dbo].[TableSession]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[SessionItem] ADD CONSTRAINT [SessionItem_menuItemId_fkey] FOREIGN KEY ([menuItemId]) REFERENCES [dbo].[MenuItem]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
