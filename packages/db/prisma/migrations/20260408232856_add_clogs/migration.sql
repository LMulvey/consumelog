/*
  Warnings:

  - You are about to drop the `Item` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "ClogMediaType" AS ENUM ('movie', 'video_game', 'book', 'tv_show');

-- DropTable
DROP TABLE "Item";

-- CreateTable
CREATE TABLE "Clog" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "media_type" "ClogMediaType" NOT NULL,
    "foreign_id" TEXT,
    "blurb" TEXT NOT NULL,
    "thoughts" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Clog_pkey" PRIMARY KEY ("id")
);
