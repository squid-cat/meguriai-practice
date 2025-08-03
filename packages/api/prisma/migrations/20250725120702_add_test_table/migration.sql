-- CreateTable
CREATE TABLE "Test" (
    "id" TEXT NOT NULL DEFAULT uuid_generate_v4(),
    "text" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "Test_pkey" PRIMARY KEY ("id")
);
