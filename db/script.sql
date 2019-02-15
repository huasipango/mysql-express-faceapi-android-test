-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='TRADITIONAL,ALLOW_INVALID_DATES';

-- -----------------------------------------------------
-- Schema faceemotions
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema faceemotions
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `faceemotions` DEFAULT CHARACTER SET utf8 ;
-- -----------------------------------------------------
-- Schema face_emotions
-- -----------------------------------------------------
USE `faceemotions` ;

-- -----------------------------------------------------
-- Table `faceemotions`.`pictures`
-- ---------------------------------------- -------------
CREATE TABLE IF NOT EXISTS `faceemotions`.`pictures` (
  `picture_id` INT NOT NULL AUTO_INCREMENT,
  `picture_name` VARCHAR(45) NOT NULL,
  `picture_azure_id` VARCHAR(100) NULL,
  PRIMARY KEY (`picture_id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `faceemotions`.`users`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `faceemotions`.`users` (
  `user_id` INT NOT NULL AUTO_INCREMENT,
  `user_username` VARCHAR(30) NOT NULL,
  `user_password` VARCHAR(30) NOT NULL,
  `user_surnames` VARCHAR(50) NOT NULL,
  `user_given_names` VARCHAR(50) NOT NULL,
  `pictures_picture_id` INT NOT NULL,
  PRIMARY KEY (`user_id`, `pictures_picture_id`),
  INDEX `fk_users_pictures1_idx` (`pictures_picture_id` ASC),
  CONSTRAINT `fk_users_pictures1`
    FOREIGN KEY (`pictures_picture_id`)
    REFERENCES `faceemotions`.`pictures` (`picture_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `faceemotions`.`face_emotions`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `faceemotions`.`face_emotions` (
  `face_emotion_id` INT NOT NULL AUTO_INCREMENT,
  `face_emotion_anger` FLOAT NULL,
  `face_emotion_contempt` FLOAT NULL,
  `face_emotion_disgust` FLOAT NULL,
  `face_emotion_fear` FLOAT NULL,
  `face_emotion_happiness` FLOAT NULL,
  `face_emotion_neutral` FLOAT NULL,
  `face_emotion_sadness` FLOAT NULL,
  `face_emotion_surprise` FLOAT NULL,
  `face_emotion_smile` FLOAT NULL,
  `face_emotion_blur` FLOAT NULL,
  `face_emotion_noise` FLOAT NULL,
  `face_emotion_exposure` FLOAT NULL,
  `face_emotionscol` VARCHAR(45) NULL,
  `pictures_picture_id` INT NOT NULL,
  PRIMARY KEY (`face_emotion_id`, `pictures_picture_id`),
  INDEX `fk_face_emotions_pictures_idx` (`pictures_picture_id` ASC),
  CONSTRAINT `fk_face_emotions_pictures`
    FOREIGN KEY (`pictures_picture_id`)
    REFERENCES `faceemotions`.`pictures` (`picture_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
