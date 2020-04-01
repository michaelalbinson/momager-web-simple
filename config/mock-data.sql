# Mock data

LOCK TABLES `User` WRITE;

INSERT INTO `User` (`id`, `PASSWORD`, `SALT`, `EMAIL`, `VERIFIED`, `FNAME`, `LNAME`, `DATE_OF_BIRTH`, `ADDRESS`)
VALUES
	('6de1b94590ec6af6c611cc9574fb72d3','e10e2c6557ceddd4653d1609fbefd68188a94cf9eec0fdb57c267301f6112a71f16f8ca1f2800270ba1b4fd7f3f5c99b505966f8c6d8a0ffc54f33e7e457d0dc',
	'aaaaaa','admin@admin.com', 1, 'Michael', 'Albinson', '1996-09-04', '{}');

UNLOCK TABLES;
