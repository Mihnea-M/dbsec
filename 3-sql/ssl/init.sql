CREATE DATABASE testdb;

CREATE USER 'ssluser'@'%' IDENTIFIED BY 'sslpass' REQUIRE SSL;
GRANT ALL PRIVILEGES ON testdb.* TO 'ssluser'@'%';
FLUSH PRIVILEGES;


CREATE USER 'ssluser'@'localhost' IDENTIFIED BY 'sslpass' REQUIRE SSL;
GRANT ALL PRIVILEGES ON testdb.* TO 'ssluser'@'localhost';