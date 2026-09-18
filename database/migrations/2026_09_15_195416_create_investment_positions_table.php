<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('investment_positions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('investment_import_id')->constrained()->cascadeOnDelete();
            $table->string('product');
            $table->string('institution')->nullable();
            $table->string('issuer')->nullable();
            $table->string('code')->nullable();
            $table->string('indexer')->nullable();
            $table->date('issued_at')->nullable();
            $table->date('maturity_date')->nullable();
            $table->decimal('curve_value', 15, 2);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('investment_positions');
    }
};
