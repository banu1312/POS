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
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->integer("numberOfItemsOut");
            $table->integer("total");
            $table->string("paymentStatus");
            $table->string("itemStatus");
            $table->string("information");
            $table->date("transactionDate");
            $table->foreignId("staff_id")->constrained("staffs")->onDelete("cascade");
            $table->foreignId("customer_id")->constrained("customers")->onDelete("cascade");
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
        Schema::dropIfExists('transactions');
    }
};
