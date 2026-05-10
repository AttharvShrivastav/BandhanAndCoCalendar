-- MariaDB dump 10.19  Distrib 10.4.28-MariaDB, for osx10.10 (x86_64)
--
-- Host: localhost    Database: bandhan_dev
-- ------------------------------------------------------
-- Server version	10.4.28-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `booking_events`
--

DROP TABLE IF EXISTS `booking_events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `booking_events` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `org_id` int(11) NOT NULL,
  `client_id` int(11) NOT NULL,
  `event_type` varchar(100) NOT NULL,
  `event_date` varchar(50) NOT NULL,
  `venue_name` varchar(255) NOT NULL,
  `guest_count` int(11) DEFAULT NULL,
  `start_time` varchar(50) DEFAULT NULL,
  `end_time` varchar(50) DEFAULT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'confirmed',
  `notes` text DEFAULT NULL,
  `color` varchar(50) DEFAULT NULL,
  `category` varchar(100) DEFAULT 'wedding',
  PRIMARY KEY (`id`),
  KEY `booking_events_org_id_organizations_id_fk` (`org_id`),
  CONSTRAINT `booking_events_org_id_organizations_id_fk` FOREIGN KEY (`org_id`) REFERENCES `organizations` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `booking_events`
--

LOCK TABLES `booking_events` WRITE;
/*!40000 ALTER TABLE `booking_events` DISABLE KEYS */;
INSERT INTO `booking_events` VALUES (1,2,1,'wedding','2026-05-02','Sheraton Grand Ballroom',800,'21:00','23:06','confirmed',NULL,'#e74c3c','wedding'),(2,2,1,'engagement','2026-05-10','Sheraton Grand Ballroom',800,'21:07','23:07','confirmed',NULL,'#e74c3c','social'),(3,1,2,'wedding','2026-05-04','Something',800,'23:11','12:11','confirmed',NULL,'#f39c12','social'),(4,2,3,'wedding','2026-05-28','Sheraton Grand Ballroom',500,'12:40',NULL,'tentative',NULL,'#e74c3c','wedding'),(5,2,4,'sangeet','2026-05-14','Sheraton Grand Ballroom',700,'07:45','00:45','confirmed',NULL,'#e74c3c','wedding'),(6,2,5,'wedding','2026-05-27','Sheraton Grand Ballroom',800,'21:07','22:33','confirmed',NULL,'#e74c3c','wedding'),(7,2,6,'mehendi','2026-05-14','Banquet Hall',1900,'11:44','14:44','confirmed',NULL,'#ca6f1e','wedding');
/*!40000 ALTER TABLE `booking_events` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `clients`
--

DROP TABLE IF EXISTS `clients`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `clients` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `org_id` int(11) NOT NULL,
  `client_name` varchar(255) NOT NULL,
  `bride_name` varchar(255) DEFAULT NULL,
  `groom_name` varchar(255) DEFAULT NULL,
  `contact_phone` varchar(50) NOT NULL,
  `contact_email` varchar(255) NOT NULL,
  `alternate_phone` varchar(50) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `overall_status` varchar(50) NOT NULL DEFAULT 'confirmed',
  `notes` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `clients_org_id_organizations_id_fk` (`org_id`),
  CONSTRAINT `clients_org_id_organizations_id_fk` FOREIGN KEY (`org_id`) REFERENCES `organizations` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clients`
--

LOCK TABLES `clients` WRITE;
/*!40000 ALTER TABLE `clients` DISABLE KEYS */;
INSERT INTO `clients` VALUES (1,2,'Sharma Family','Priya Sharma','Rahul Verms','9893037733','shrivastav.atharv@gmail.com',NULL,'Indore, Madhya Pradesh','tentative',NULL),(2,1,'Second Wedding','Bride','Groom','9893137744','atharv@gmail.com',NULL,'Indore, Madhya Pradesh','confirmed','-'),(3,2,'Booking New','Bride','Groom','9893037733','offo@gmail.com',NULL,'Indore, Madhya Pradesh','confirmed','-'),(4,2,'Verma Family','Bride Sharma','Groom Verma','9893037733','vermafamily@gmail.com',NULL,'Indore Madhya Pradesh','confirmed',NULL),(5,2,'Family name','Bride Name','Groom name','9893037733','test@gmail.com',NULL,'Indore, Madhya Pradesh','confirmed',NULL),(6,2,'Family Name','Bride Family','Groom Family','9893137744','atharv@gmail.com',NULL,'Indore, Madhya Pradesh','confirmed','Special Requests');
/*!40000 ALTER TABLE `clients` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hindu_calendar_events`
--

DROP TABLE IF EXISTS `hindu_calendar_events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `hindu_calendar_events` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `date` varchar(50) NOT NULL,
  `name` varchar(255) NOT NULL,
  `type` varchar(100) NOT NULL,
  `nakshatra` varchar(255) DEFAULT NULL,
  `timing` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hindu_calendar_events`
--

LOCK TABLES `hindu_calendar_events` WRITE;
/*!40000 ALTER TABLE `hindu_calendar_events` DISABLE KEYS */;
/*!40000 ALTER TABLE `hindu_calendar_events` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `organizations`
--

DROP TABLE IF EXISTS `organizations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `organizations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `trial_expires` varchar(255) DEFAULT NULL,
  `is_paid` tinyint(1) NOT NULL DEFAULT 0,
  `delete_pin` varchar(10) NOT NULL DEFAULT '123456',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `organizations`
--

LOCK TABLES `organizations` WRITE;
/*!40000 ALTER TABLE `organizations` DISABLE KEYS */;
INSERT INTO `organizations` VALUES (1,'Bandhan & Co. HQ','+275760-09-13T00:00:00.000Z',0,'000000'),(2,'Sheraton','2026-05-13T23:59:59.999Z',0,'999999'),(3,'Taj Hotel','2026-05-07T23:59:59.999Z',0,'888888');
/*!40000 ALTER TABLE `organizations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `support_queries`
--

DROP TABLE IF EXISTS `support_queries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `support_queries` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `org_id` int(11) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `subject` varchar(255) DEFAULT NULL,
  `message` text NOT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'open',
  `created_at` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `support_queries_org_id_organizations_id_fk` (`org_id`),
  CONSTRAINT `support_queries_org_id_organizations_id_fk` FOREIGN KEY (`org_id`) REFERENCES `organizations` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `support_queries`
--

LOCK TABLES `support_queries` WRITE;
/*!40000 ALTER TABLE `support_queries` DISABLE KEYS */;
INSERT INTO `support_queries` VALUES (1,2,'Attharv','shrivastav.atharv@gmail.com','Booking Issue','This is the issue','open','2026-05-02T10:38:43.709Z');
/*!40000 ALTER TABLE `support_queries` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `org_id` int(11) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `role` varchar(50) NOT NULL DEFAULT 'admin',
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`),
  KEY `users_org_id_organizations_id_fk` (`org_id`),
  CONSTRAINT `users_org_id_organizations_id_fk` FOREIGN KEY (`org_id`) REFERENCES `organizations` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,1,'test','test@gmail.com','$2b$10$frZJ2QaHfIjDBLoNj0fhEuC.c3akdfBardeGkjD.ToNeToYOsCOQi','9893037733','superadmin'),(2,2,'sheraton','sheraton20@gmail.com','$2b$10$agBtBYq2e3832WTgz33d5erJ3RXNfOfLAQaDFIWB7fGEsi5dNqLZy','9630000080','admin'),(3,3,'Taj','taj@gmail.com','$2b$10$/42DwM4L7QBg2Eh5BYt4v.iX9yOff8uN.AhQCrAULECJrswi/VNg.','9893037733','admin');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `venues`
--

DROP TABLE IF EXISTS `venues`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `venues` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `org_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `location` text NOT NULL,
  `capacity` int(11) DEFAULT NULL,
  `contact_person` varchar(255) DEFAULT NULL,
  `contact_phone` varchar(50) DEFAULT NULL,
  `color` varchar(50) NOT NULL DEFAULT 'hsl(210,69%,16%)',
  PRIMARY KEY (`id`),
  KEY `venues_org_id_organizations_id_fk` (`org_id`),
  CONSTRAINT `venues_org_id_organizations_id_fk` FOREIGN KEY (`org_id`) REFERENCES `organizations` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `venues`
--

LOCK TABLES `venues` WRITE;
/*!40000 ALTER TABLE `venues` DISABLE KEYS */;
INSERT INTO `venues` VALUES (1,2,'Sheraton Grand Ballroom','Indore, Madhya Pradesh',1000,'Attharv Shrivastav','9630000080','#e74c3c'),(2,1,'Something','Indore, Madhya Pradesh',1000,'Attharv','9893037733','#f39c12'),(3,2,'Banquet Hall','Indore, Madhya Pradesh',2000,'Arun ','9999999999','#ca6f1e');
/*!40000 ALTER TABLE `venues` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-07  3:06:08
