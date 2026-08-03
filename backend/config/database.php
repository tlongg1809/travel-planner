<?php

$conn = new mysqli(
    "localhost",
    "root",
    "",
    "travelplanner"
);

if($conn->connect_error){
    die("Lỗi kết nối");
}