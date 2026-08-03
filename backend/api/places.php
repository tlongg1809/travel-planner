<?php

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

require_once "../config/database.php";
require_once "../controllers/PlaceController.php";

$controller = new PlaceController($conn);

$category = $_GET["category"] ?? 0;

$controller->index($category);