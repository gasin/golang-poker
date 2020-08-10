package main

import (
	"fmt"
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"

	"github.com/jinzhu/gorm"
	_ "github.com/jinzhu/gorm/dialects/mysql"
)

func gormConnect() *gorm.DB {
	DBMS := "mysql"
	USER := "root"
	PASS := "***"
	PROTOCOL := "tcp(localhost:3306)"
	DBNAME := "poker"

	CONNECT := USER + ":" + PASS + "@" + PROTOCOL + "/" + DBNAME + "?parseTime=true"
	db, err := gorm.Open(DBMS, CONNECT)

	if err != nil {
		panic(err.Error())
	}
	return db
}

type Model struct {
	ID        uint `gorm:"primary_key" json:"id"`
	CreatedAt time.Time
	UpdatedAt time.Time
	DeletedAt *time.Time `sql:"index" jsong:"-"`
}

type Hand struct {
	Model
	Card1 int    `json:"card1"`
	Card2 int    `json:"card2"`
	Card3 int    `json:"card3"`
	Card4 int    `json:"card4"`
	Hand  int    `json:"hand"`
	Name  string `json:"name"`
}

type Account struct {
	Model
	Name          string
	Cnt           int
	HighCard      int
	OnePair       int
	TwoPair       int
	ThreeCard     int
	Straight      int
	Flush         int
	FullHouse     int
	FourCard      int
	StraightFlush int
}

func main() {
	db := gormConnect()
	db.LogMode(true)
	defer db.Close()
	db.AutoMigrate(&Hand{})
	db.AutoMigrate(&Account{})

	engine := gin.Default()
	engine.Static("/templates", "./templates")
	engine.LoadHTMLGlob("templates/*")
	engine.GET("/", func(c *gin.Context) {
		c.HTML(http.StatusOK, "top.html", gin.H{})
	})
	engine.GET("/play/", func(c *gin.Context) {
		c.HTML(http.StatusOK, "index.html", gin.H{})
	})
	engine.GET("/ranking/", func(c *gin.Context) {
		rows, err := db.Model(&Account{}).Rows()
		defer rows.Close()
		if err != nil {
			log.Fatal(err)
		}
		var s string = ""
		for rows.Next() {
			var account Account
			db.ScanRows(rows, &account)
			s += fmt.Sprintf("%20s", account.Name) + ": "
			s += fmt.Sprintf("%10s", strconv.Itoa(account.Cnt)) + " "
			s += fmt.Sprintf("%10s", strconv.Itoa(account.HighCard)) + " "
			s += fmt.Sprintf("%10s", strconv.Itoa(account.OnePair)) + " "
			s += fmt.Sprintf("%10s", strconv.Itoa(account.TwoPair)) + " "
			s += fmt.Sprintf("%10s", strconv.Itoa(account.ThreeCard)) + " "
			s += fmt.Sprintf("%10s", strconv.Itoa(account.Straight)) + " "
			s += fmt.Sprintf("%10s", strconv.Itoa(account.Flush)) + " "
			s += fmt.Sprintf("%10s", strconv.Itoa(account.FullHouse)) + " "
			s += fmt.Sprintf("%10s", strconv.Itoa(account.FourCard)) + " "
			s += fmt.Sprintf("%10s", strconv.Itoa(account.StraightFlush)) + "閾"
		}
		c.HTML(http.StatusOK, "ranking.html", gin.H{"data": s})
	})
	engine.POST("/post", func(c *gin.Context) {
		log.Printf("hello")
		var hand Hand
		var account Account
		if err := c.ShouldBindJSON(&hand); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		db.Where(&Account{Name: hand.Name}).First(&account)

		account.Name = hand.Name
		account.Cnt++
		switch hand.Hand {
		case 0:
			account.HighCard++
		case 1:
			account.OnePair++
		case 2:
			account.TwoPair++
		case 3:
			account.ThreeCard++
		case 4:
			account.Straight++
		case 5:
			account.Flush++
		case 6:
			account.FullHouse++
		case 7:
			account.FourCard++
		case 8:
			account.StraightFlush++
		}

		db.Save(&account)
		db.Create(&hand)
		c.JSON(http.StatusOK, gin.H{"message": "ok"})
	})
	engine.Run(":3000")
}
