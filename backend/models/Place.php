<?php

class Place
{
    private $conn;
    private $table = "diadiem";

    public function __construct($db)
    {
        $this->conn = $db;
    }

    // Lấy tất cả địa điểm
    public function getAll($category = 0)
    {
        if ($category > 0) {

            $sql = "
                SELECT d.*
                FROM diadiem d
                INNER JOIN danhmuc_diadiem dd
                    ON d.id = dd.diadiemid
                WHERE dd.danhmucid = $category
            ";

        } else {

            $sql = "
                SELECT *
                FROM diadiem
            ";

        }

        return $this->conn->query($sql);
    }

    // Lấy địa điểm theo danh mục
    public function getByCategory($categoryId)
    {
        $sql = "
            SELECT d.*
            FROM diadiem d
            INNER JOIN danhmuc_diadiem dm
                ON d.id = dm.diadiemid
            WHERE dm.danhmucid = ?
        ";

        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("i", $categoryId);
        $stmt->execute();

        return $stmt->get_result();
    }
}