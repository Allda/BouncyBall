<?php
$output = array();
$output['ip'] = $_SERVER['REMOTE_ADDR'];
$output['browser'] = $_SERVER['HTTP_USER_AGENT'];

echo json_encode($output);

?>