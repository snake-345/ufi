<!DOCTYPE html>
<html>
<head lang="ru">
	<meta charset="UTF-8">
	<title>Заготовка проекта</title>
	<link rel="stylesheet" href="vendor/bower_components/bootstrap/dist/css/bootstrap.min.css"/>
	<link rel="stylesheet" href="vendor/bower_components/bootstrap/dist/css/bootstrap-theme.min.css"/>
	<link rel="stylesheet" href="css/main.css"/>
</head>
<body>
	<div class="container">
		<header>
			<h1>User Friendly Infinity scroll(UFI)</h1>
		</header>
	</div>
	<div class="container">
		<div class="row">
			<div class="col-xs-12 col-sm-3">
				<div class="sidebar">
					<p><a href="#" class="btn btn-default">Button 1</a></p>
					<p><a href="#" class="btn btn-default">Button 2</a></p>
					<p><a href="#" class="btn btn-default">Button 3</a></p>
				</div>
			</div>
<!--			--><?php //usleep(0.3 * 1000 * 1000); ?>
			<div class="col-xs-12 col-sm-9 content">
				<div class="row items" data-page-count="20">
					<?php for ($i = 0; $i < 21; $i++): ?>
					<div class="col-xs-12 col-sm-4 item">
						<div class="image">
							<img src="images/item.jpg" class="img-responsive">
						</div>
						<h4 class="title"><a href="#">Honda NT750 Deauville</a></h4>
						<div class="price">10 000$</div>
					</div>
					<?php endfor; ?>
				</div>
			</div>
		</div>
	</div>
	<script src="vendor/bower_components/jquery/dist/jquery.min.js"></script>
	<script src="js/ufi/jquery.ufi.js"></script>
	<script src="js/main.js"></script>
</body>
</html>