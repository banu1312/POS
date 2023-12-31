<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('product_restock', function (Blueprint $table) {
            $table->id();
            $table->integer("coli");
            $table->integer("quantity");
            $table->foreignId("product_id")->constrained("products")->onDelete("cascade");
            $table->foreignId("restock_id")->constrained("restocks")->onDelete("cascade");
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('product_purchase');
    }
};
