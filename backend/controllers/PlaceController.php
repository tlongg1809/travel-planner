<?php

require_once "../models/Place.php";

class PlaceController
{
    private $place;

    public function __construct($db)
    {
        $this->place = new Place($db);
    }

    public function index($category)
{
    $category = isset($_GET["category"])
        ? intval($_GET["category"])
        : 0;

    $result = $this->place->getAll($category);

    $data = [];

    while($row = $result->fetch_assoc()){
        $data[] = $row;
    }

    echo json_encode($data);
}
}