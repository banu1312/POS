<?php

namespace App\Imports;

use App\Models\Position;
use App\Models\Staff;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class ImportStaffs implements ToModel, WithHeadingRow
{
    /**
    * @param array $row
    *
    * @return \Illuminate\Database\Eloquent\Model|null
    */
    public function model(array $row)
    {
        $registerDate = $row['registerdate'] ?? $row['register_date'];
        if (!$this->isValidDate($registerDate)) {
            throw new \Exception('Please use format Year-month-day.');
        }
        $position = Position::find($row['position_id']);
        if (!$position) {
            throw new \Exception('position not found for position_id: ' . $row['position_id']);
        }
        $registerDate = date('Y-m-d', strtotime($row['registerdate'] ?? $row['register_date']));

        do {
            $randomNumber = rand(1000, 9999);
            $position = Position::find($row['position_id']); // Assuming you have a Category model
            $positionName = $position->shortname;
            $idStaff = $positionName .'-'. $randomNumber;
            $existingProduct = Staff::where('id_staff', $idStaff)->first();
        } while ($existingProduct);
        return new Staff([
            "id_staff"=>$idStaff,
            "name"=>$row['name'],
            "phone"=>$row['phone'],
            "address"=>$row['address'],
            "registerDate"=>$row['registerdate'] ?? $row['register_date'],
            "information"=>$row['information'],
            "position_id"=>$row['position_id'],
        ]);
    }
    private function isValidDate($date)
    {
        $format = 'Y-m-d';
        $dateTimeObj = \DateTime::createFromFormat($format, $date);
        return $dateTimeObj && $dateTimeObj->format($format) === $date;
    }
}
