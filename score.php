<?php



$localhost = '127.0.1.1';

$eva = '147.229.176.14';

if($_SERVER['SERVER_ADDR'] == $localhost){
    $host = 'localhost';
	$dbName = 'root';
	$password = '';
	$db = 'BouncyBall';
}
else if($_SERVER['SERVER_ADDR'] == $eva){
	$host = 'localhost:/var/run/mysql/mysql.sock';
	$dbName = 'xraszk03';
	$password = 'j2fojtar';
	$db = 'xraszk03';
}


$link = mysql_connect($host,$dbName,$password) or die("Error");
mysql_set_charset('utf8', $link);
mysql_select_db($db, $link) or die('Could not select database.');




if(isset($_GET['score'])){
	$sql = "insert into Score (nick, score, ip, resolution) values ('" . $_GET['nick'] . "','" . $_GET['score'] . "','" . $_GET['ip'] ."','" . $_GET['resolution'] ."')";
	$result = mysql_query($sql);
	if (!$result) {
	    echo "DB Error, could not list tables\n";
	    echo 'MySQL Error: ' . mysql_error();
	    exit;
	}
}

$sql = "Select * FROM Score order by score desc limit 8";
$result = mysql_query($sql);

if (!$result) {
    echo "DB Error, could not list tables\n";
    echo 'MySQL Error: ' . mysql_error();
    exit;
}

$output = array();

$i = 0;
$r = array();
while ($row = mysql_fetch_array($result)) {
    $r['nick'] = $row['nick'];
    $r['score'] = $row['score'];
    $output[$i++] = $r;
}


echo json_encode($output);
?>